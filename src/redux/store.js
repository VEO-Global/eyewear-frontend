import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import productReducer, {
  PRODUCT_STOCK_OVERRIDES_STORAGE_KEY,
} from "./products/producSlice";
import cartReducer, { getCartStorageKey } from "./cart/cartSlice";
import categoriesReducer from "./category/categorySlice";
import adminReducer from "./admin/adminSlice";
import favoritesReducer, {
  getFavoritesStorageKey,
  readStoredFavorites,
  replaceFavorites as replaceStoredFavorites,
} from "./favorites/favoriteSlice";
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
    favorites: favoritesReducer,
  },
});

let previousUserId;

store.dispatch(replaceNotifications(readStoredNotifications(undefined)));

store.subscribe(() => {
  const state = store.getState();
  const userId = state.auth.user?.id;
  const notificationStorageKey = getNotificationStorageKey(userId);
  const favoritesStorageKey = getFavoritesStorageKey(userId);

  if (userId !== previousUserId) {
    previousUserId = userId;
    store.dispatch(replaceNotifications(readStoredNotifications(userId)));
    store.dispatch(replaceStoredFavorites(readStoredFavorites(userId)));
    return;
  }

  if (userId) {
    localStorage.setItem(
      getCartStorageKey(userId),
      JSON.stringify(state.cart.cart)
    );
  }

  localStorage.setItem(
    PRODUCT_STOCK_OVERRIDES_STORAGE_KEY,
    JSON.stringify(state.products.stockOverrides)
  );

  localStorage.setItem(
    notificationStorageKey,
    JSON.stringify(state.notifications.items)
  );

  localStorage.setItem(favoritesStorageKey, JSON.stringify(state.favorites.items));
});

export default store;
