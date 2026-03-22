/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  notificationMessage: null,
  notificationType: null,
};

function getErrorMessage(error, fallbackMessage) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }

    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  return fallbackMessage;
}

async function persistProfileUpdate(id, payload) {
  const requests = [
    () => api.put("/user/profile", payload),
    () => api.patch("/user/profile", payload),
    () => api.put(`/users/${id}`, payload),
    () => api.patch(`/users/${id}`, payload),
  ];

  let lastError;

  for (const request of requests) {
    try {
      await request();
      const refreshedProfile = await api.get("/user/profile");
      return refreshedProfile.data;
    } catch (error) {
      lastError = error;

      if (![404, 405].includes(error.response?.status)) {
        throw error;
      }
    }
  }

  throw lastError;
}

function mergeSubmittedAddress(profile, payload) {
  if (!payload || typeof payload !== "object") {
    return profile;
  }

  const hasStructuredAddress =
    payload.provinceName || payload.districtName || payload.wardName || payload.addressDetail;

  if (!hasStructuredAddress) {
    return {
      ...profile,
      address: payload.address ?? profile?.address,
    };
  }

  return {
    ...profile,
    address: payload.address ?? profile?.address,
    addressDetail: payload.addressDetail ?? profile?.addressDetail,
    province: payload.provinceName ?? profile?.province,
    district: payload.districtName ?? profile?.district,
    ward: payload.wardName ?? profile?.ward,
    latestShippingAddress: {
      provinceCode: payload.provinceCode,
      provinceName: payload.provinceName,
      districtCode: payload.districtCode,
      districtName: payload.districtName,
      wardCode: payload.wardCode,
      wardName: payload.wardName,
      addressDetail: payload.addressDetail,
      isLatest: true,
      updatedAt: new Date().toISOString(),
    },
  };
}

export const loginUser = createAsyncThunk("auth/login", async (values, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", values);
    return response.data.token;
  } catch (error) {
    if (error.response?.status === 500) {
      return rejectWithValue("Sai email hoặc mật khẩu. Vui lòng thử lại.");
    }

    return rejectWithValue(getErrorMessage(error, "Đăng nhập thất bại. Vui lòng thử lại."));
  }
});

export const registerUser = createAsyncThunk("/auth/register", async (values, { rejectWithValue }) => {
  try {
    const response = await api.post("auth/register", values);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Đăng ký thất bại. Vui lòng thử lại."));
  }
});

export const fetchProfile = createAsyncThunk("/user/profile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Không thể lấy thông tin người dùng."));
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        addressDetail: data.addressDetail,
        provinceCode: data.provinceCode,
        provinceName: data.provinceName,
        districtCode: data.districtCode,
        districtName: data.districtName,
        wardCode: data.wardCode,
        wardName: data.wardName,
      };

      const updatedProfile = await persistProfileUpdate(id, payload);
      return mergeSubmittedAddress(updatedProfile, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Cập nhật thông tin thất bại. Vui lòng thử lại."));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.notificationMessage = "";
      state.notificationType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.notificationMessage = "Đăng nhập thành công";
        state.notificationType = "success";
        localStorage.setItem("token", action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notificationMessage = action.payload;
        state.notificationType = "error";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.notificationMessage = "Đăng ký thành công";
        state.notificationType = "success";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notificationMessage = action.payload;
        state.notificationType = "error";
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.notificationMessage = "Cập nhật thông tin cá nhân thành công";
        state.notificationType = "success";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notificationMessage = action.payload;
        state.notificationType = "error";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
