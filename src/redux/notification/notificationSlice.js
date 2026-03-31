import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notificationService } from "../../services/notificationService";
import { logout, softLogout } from "../auth/authSlice";
import { getApiErrorMessage } from "../../utils/apiError";

const notificationMessageMap = new Map([
  ["create order successfully", "Đặt hàng thành công"],
  ["order created successfully", "Đặt hàng thành công"],
  ["preorder created successfully", "Đặt trước thành công"],
  ["add to cart successfully", "Đã thêm sản phẩm vào giỏ hàng"],
  ["added to cart successfully", "Đã thêm sản phẩm vào giỏ hàng"],
  ["login successfully", "Đăng nhập thành công"],
  ["register successfully", "Đăng ký thành công"],
  ["update profile successfully", "Cập nhật hồ sơ thành công"],
  ["unauthorized", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."],
]);

export function normalizeNotificationMessage(message) {
  if (typeof message !== "string") {
    return "";
  }

  const normalizedKey = message.trim().toLowerCase();
  return notificationMessageMap.get(normalizedKey) || message;
}

function normalizeNotification(item) {
  return {
    ...item,
    message: normalizeNotificationMessage(item?.message),
    read: Boolean(item?.read),
  };
}

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();

      return {
        items: Array.isArray(response?.notifications)
          ? response.notifications.map(normalizeNotification)
          : [],
        unreadCount: Number(response?.unreadCount || 0),
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Không thể tải thông báo."));
    }
  }
);

export const fetchUnreadNotificationCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return Number(response?.unreadCount ?? response?.count ?? response ?? 0);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Không thể tải số thông báo mới."));
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Không thể cập nhật thông báo."));
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Không thể cập nhật tất cả thông báo."));
    }
  }
);

export const removeNotification = createAsyncThunk(
  "notifications/remove",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.removeNotification(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Không thể xóa thông báo."));
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action) {
      const item = normalizeNotification({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: action.payload?.type || "info",
        message: action.payload?.message || "",
        createdAt: action.payload?.createdAt || new Date().toISOString(),
        read: false,
      });

      state.items = [item, ...state.items].slice(0, 50);
      state.unreadCount = state.items.filter((entry) => !entry.read).length;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload ? { ...item, read: true } : item
        );
        state.unreadCount = state.items.filter((item) => !item.read).length;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, read: true }));
        state.unreadCount = 0;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.unreadCount = state.items.filter((item) => !item.read).length;
      })
      .addCase(logout, () => initialState)
      .addCase(softLogout.fulfilled, () => initialState);
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
