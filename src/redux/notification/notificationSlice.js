import { createSlice } from "@reduxjs/toolkit";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export function getNotificationStorageKey(userId) {
  return userId ? `notifications:${userId}` : "notifications:guest";
}

function pruneExpiredNotifications(items = []) {
  const cutoff = Date.now() - THIRTY_DAYS_IN_MS;

  return items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= cutoff;
  });
}

export function readStoredNotifications(userId) {
  try {
    const raw = localStorage.getItem(getNotificationStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return pruneExpiredNotifications(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
  },
  reducers: {
    replaceNotifications(state, action) {
      state.items = pruneExpiredNotifications(action.payload || []);
    },
    addNotification(state, action) {
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: action.payload.type || "info",
        message: action.payload.message || "",
        createdAt: action.payload.createdAt || new Date().toISOString(),
        read: false,
      };

      state.items = pruneExpiredNotifications([item, ...state.items]);
    },
    markAllNotificationsAsRead(state) {
      state.items = state.items.map((item) => ({
        ...item,
        read: true,
      }));
    },
    markNotificationAsRead(state, action) {
      state.items = state.items.map((item) =>
        item.id === action.payload ? { ...item, read: true } : item
      );
    },
    removeNotification(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const {
  replaceNotifications,
  addNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
