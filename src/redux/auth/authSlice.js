import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { profileService } from "../../services/profileService";
import { clearAccessToken, getAccessToken, setAccessToken } from "../../services/api";
import { getApiErrorMessage, mapValidationErrors } from "../../utils/apiError";
import { normalizeRoleName } from "../../utils/authRole";

const FALLBACK_AUTH_ERROR_MESSAGE = "Đăng nhập thất bại. Vui lòng thử lại.";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  notificationMessage: null,
  notificationType: null,
  validationErrors: {},
};

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

    return JSON.parse(atob(paddedPayload));
  } catch {
    return null;
  }
}

function normalizeIsActive(user) {
  const candidateValues = [user?.isActive, user?.is_active, user?.active];

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
    return null;
  }

  const cityName = user.city ?? user.cityName ?? user.province ?? user.provinceName ?? "";
  const districtName = user.district ?? user.districtName ?? "";
  const wardName = user.ward ?? user.wardName ?? "";
  const addressDetail =
    user.addressDetail ?? user.address_detail ?? user.address ?? user.addressLine ?? "";

  return {
    ...user,
    id: user.id ?? user.userId ?? user.user_id ?? user.userID ?? null,
    fullName: user.fullName ?? user.full_name ?? user.name ?? "",
    email: user.email ?? user.username ?? "",
    phone: user.phone ?? user.phoneNumber ?? user.phone_number ?? "",
    address: user.address ?? user.addressLine ?? addressDetail,
    addressLine: user.addressLine ?? addressDetail,
    addressDetail,
    city: cityName,
    cityName,
    province: cityName,
    provinceName: cityName,
    district: districtName,
    districtName,
    ward: wardName,
    wardName,
    latestShippingAddress:
      cityName || districtName || wardName || addressDetail
        ? {
            provinceName: cityName,
            districtName,
            wardName,
            addressDetail,
          }
        : null,
    isActive: normalizeIsActive(user),
    role: normalizeRoleName(user.role ?? user.roleName ?? user.authority ?? user.userRole),
  };
}

function buildSessionUserFromToken(token) {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const email = payload.sub ?? null;
  const emailName = typeof email === "string" ? email.split("@")[0] : "";
  const displayName = emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    id:
      payload.id ??
      payload.userId ??
      payload.user_id ??
      payload.nameid ??
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
      null,
    email,
    role: normalizeRoleName(payload.role ?? payload.authority ?? payload.userRole),
    fullName: displayName || email || "Tài khoản",
  };
}

function extractToken(data) {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  return data.token || data.accessToken || data.jwt || null;
}

export const loginUser = createAsyncThunk("auth/login", async (values, { rejectWithValue }) => {
  try {
    const response = await authService.login({
      email: values?.email ?? "",
      password: values?.password ?? "",
    });
    const token = extractToken(response);

    if (!token) {
      return rejectWithValue("Đăng nhập thất bại do không đọc được token từ backend.");
    }

    setAccessToken(token);

    return {
      token,
      message: response?.message || "Đăng nhập thành công",
      sessionUser: buildSessionUserFromToken(token),
    };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, FALLBACK_AUTH_ERROR_MESSAGE));
  }
});

export const registerUser = createAsyncThunk(
  "auth/register",
  async (values, { rejectWithValue }) => {
    try {
      return await authService.register(values);
    } catch (error) {
      return rejectWithValue({
        message: getApiErrorMessage(error, "Đăng ký thất bại. Vui lòng thử lại."),
        validationErrors: mapValidationErrors(error),
      });
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return normalizeUserProfile(await profileService.getProfile());
    } catch (error) {
      return rejectWithValue({
        status: error?.response?.status,
        message: getApiErrorMessage(error, "Không thể lấy thông tin người dùng."),
      });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ data }, { rejectWithValue }) => {
    try {
      const updatedProfile = await profileService.updateProfile({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
      });

      return {
        ...normalizeUserProfile(updatedProfile),
        address: data.address,
        addressLine: data.address,
        addressDetail: data.addressDetail ?? data.address,
        provinceCode: data.provinceCode,
        provinceName: data.provinceName,
        province: data.provinceName,
        districtCode: data.districtCode,
        districtName: data.districtName,
        district: data.districtName,
        wardCode: data.wardCode,
        wardName: data.wardName,
        ward: data.wardName,
        latestShippingAddress: {
          provinceCode: data.provinceCode,
          provinceName: data.provinceName,
          districtCode: data.districtCode,
          districtName: data.districtName,
          wardCode: data.wardCode,
          wardName: data.wardName,
          addressDetail: data.addressDetail ?? data.address,
        },
      };
    } catch (error) {
      return rejectWithValue({
        message: getApiErrorMessage(error, "Cập nhật thông tin thất bại. Vui lòng thử lại."),
        validationErrors: mapValidationErrors(error),
      });
    }
  }
);

export const softLogout = createAsyncThunk("auth/softLogout", async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (error) {
    if (error?.response?.status && error.response.status !== 401) {
      return rejectWithValue(getApiErrorMessage(error, "Đăng xuất thất bại."));
    }
  } finally {
    clearAccessToken();
  }

  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreSessionFromToken(state, action) {
      const token = action.payload || getAccessToken();
      const sessionUser = buildSessionUserFromToken(token);

      if (!token) {
        return;
      }

      state.isAuthenticated = true;
      state.user = state.user ? { ...sessionUser, ...state.user } : sessionUser;
    },
    logout(state) {
      clearAccessToken();
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.notificationMessage = null;
      state.notificationType = null;
      state.validationErrors = {};
    },
    clearAuthNotifications(state) {
      state.notificationMessage = null;
      state.notificationType = null;
      state.validationErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = state.user
          ? { ...action.payload.sessionUser, ...state.user }
          : action.payload.sessionUser;
        state.notificationMessage = action.payload.message || "Đăng nhập thành công";
        state.notificationType = "success";
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
        state.validationErrors = {};
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.notificationMessage = action.payload?.message || "Đăng ký thành công";
        state.notificationType = "success";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        state.notificationMessage = action.payload?.message || action.payload;
        state.notificationType = "error";
        state.validationErrors = action.payload?.validationErrors || {};
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.notificationMessage = "Cập nhật thông tin cá nhân thành công";
        state.notificationType = "success";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        state.notificationMessage = action.payload?.message || action.payload;
        state.notificationType = "error";
        state.validationErrors = action.payload?.validationErrors || {};
      })
      .addCase(softLogout.fulfilled, () => initialState)
      .addCase(softLogout.rejected, () => initialState);
  },
});

export const { restoreSessionFromToken, logout, clearAuthNotifications } = authSlice.actions;
export default authSlice.reducer;
