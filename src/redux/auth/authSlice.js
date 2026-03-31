/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";
import { useSelector } from "react-redux";

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

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenParts = token.split(".");

  if (tokenParts.length < 2) {
    return null;
  }

  try {
    const normalizedPayload = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

function normalizeIsActive(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const candidateValues = [user.isActive, user.is_active, user.active];

  for (const value of candidateValues) {
    if (typeof value === "boolean") {
      return value;
    }

    if (value === 1 || value === "1" || value === "true") {
      return true;
    }

    if (value === 0 || value === "0" || value === "false") {
      return false;
    }
  }

  return null;
}

function normalizeUserProfile(user) {
  if (!user || typeof user !== "object") {
    return user;
  }

  return {
    ...user,
    fullName: user.fullName ?? user.full_name ?? user.name ?? "",
    email: user.email ?? user.username ?? "",
    phone: user.phone ?? user.phoneNumber ?? user.phone_number ?? "",
    isActive: normalizeIsActive(user),
  };
}

function extractTokenFromLoginResponse(data) {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.token === "string" && data.token.trim()) {
    return data.token;
  }

  if (typeof data.accessToken === "string" && data.accessToken.trim()) {
    return data.accessToken;
  }

  if (typeof data.jwt === "string" && data.jwt.trim()) {
    return data.jwt;
  }

  return null;
}

function persistStructuredAddress(userId, payload) {
  if (!userId || !payload || typeof payload !== "object") {
    return;
  }

  const hasStructuredAddress =
    payload.provinceName || payload.districtName || payload.wardName || payload.addressDetail;

  if (!hasStructuredAddress) {
    return;
  }
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
  const normalizedProfile = normalizeUserProfile(profile);

  if (!payload || typeof payload !== "object") {
    return normalizedProfile;
  }

  const hasStructuredAddress =
    payload.provinceName || payload.districtName || payload.wardName || payload.addressDetail;

  if (!hasStructuredAddress) {
    return {
      ...normalizedProfile,
      address: payload.address ?? normalizedProfile?.address,
    };
  }

  return {
    ...normalizedProfile,
    address: payload.address ?? normalizedProfile?.address,
    addressDetail: payload.addressDetail ?? normalizedProfile?.addressDetail,
    province: payload.provinceName ?? normalizedProfile?.province,
    district: payload.districtName ?? normalizedProfile?.district,
    ward: payload.wardName ?? normalizedProfile?.ward,
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
    return response.data;
  } catch (error) {
    if (error.response?.status === 500) {
      return rejectWithValue("Sai email hoặc mật khẩu. Vui lòng thử lại.");
    }
  }
});

export const registerUser = createAsyncThunk("/auth/register", async (values, { rejectWithValue }) => {
  try {
    const response = await api.post("auth/register", values);
    return response.data;
  } catch (error) {
    if (error.status === 409) {
      return rejectWithValue("Email đã tồn tại");
    }
  }
});

export const fetchProfile = createAsyncThunk("/user/profile", async (_, { rejectWithValue }) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const res = await api.get("/user/profile");

    return res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Không thể lấy thông tin người dùng."));
  }
});

export const updateProfile = createAsyncThunk("/user/update_profiles", async (payload, { rejectWithValue }) => {
  console.log(payload);

  try {
    const res = await api.put("/user/profile", payload);
    return res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Không thể lấy thông tin người dùng."));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      const userId = state.user?.id;
      localStorage.removeItem("token");
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
        state.isAuthenticated = true;
        state.error = null;
        state.notificationMessage = "Đăng nhập thành công";
        state.notificationType = "success";
        localStorage.setItem("token", action.payload.token);
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

        // localStorage.setItem(`cart:${action.payload.id}`, JSON.stringify(cart));
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload && typeof action.payload === "object" ? action.payload.message : action.payload;

        if (localStorage.getItem("token")) {
          state.isAuthenticated = true;
        }
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

export const { logout, restoreSessionFromToken } = authSlice.actions;
export default authSlice.reducer;
