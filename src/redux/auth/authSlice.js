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

export const loginUser = createAsyncThunk("auth/login", async (values, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", values);
    return response.data.token;
  } catch (error) {
    if (error.response?.status === 500) {
      return rejectWithValue("Sai email hoặc mật khẩu. Vui lòng thử lại.");
    } else {
      return rejectWithValue(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  }
});

export const registerUser = createAsyncThunk("/auth/register", async (values, { rejectWithValue }) => {
  try {
    const response = await api.post("auth/register", values);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Đăng kí thất bại vui lòng thử lại");
  }
});

export const fetchProfile = createAsyncThunk("/user/profile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Không thể lấy thông tin user");
  }
});

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
      // LOGIN
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

      // REGISTER
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

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
