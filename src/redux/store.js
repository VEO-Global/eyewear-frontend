import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import productReducer from "./products/producSlice";
import cartReducer, { getCartStorageKey } from "./cart/cartSlice";
import categoriesReducer from "./category/categorySlice";
import adminReducer from "./admin/adminSlice";
import notificationReducer, {
  getNotificationStorageKey,
  readStoredNotifications,
  replaceNotifications,
} from "./notification/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    category: categoriesReducer,
    admin: adminReducer,
    notifications: notificationReducer,
  },
});

let previousUserId;

store.dispatch(replaceNotifications(readStoredNotifications(undefined)));

store.subscribe(() => {
  const state = store.getState();
  const userId = state.auth.user?.id;
  const notificationStorageKey = getNotificationStorageKey(userId);

  if (userId !== previousUserId) {
    previousUserId = userId;
    store.dispatch(replaceNotifications(readStoredNotifications(userId)));
    return;
  }

  if (userId) {
    localStorage.setItem(
      getCartStorageKey(userId),
      JSON.stringify(state.cart.cart)
    );
  }

  localStorage.setItem(
    notificationStorageKey,
    JSON.stringify(state.notifications.items)
  );
});

export default store;
