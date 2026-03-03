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
    console.log("Login response:", response);
    return response.data;
  } catch (error) {
    console.log("Login error:", error);

    return rejectWithValue(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
  }
});

export const registerUser = createAsyncThunk("/auth/register", async (values, { rejectWithValue }) => {
  try {
    console.log("Register values:", values);

    const response = await api.post("auth/register", values);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Đăng kí thất bại vui lòng thử lại");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
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
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.notificationMessage = "Đăng nhập thành công";
        state.notificationType = "success";
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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
