import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import productReducer from "./products/producSlice";
import cartReducer from "./cart/cartSlice";
import categoriesReducer from "./category/categorySlice";
import adminReducer from "./admin/adminSlice";
import favoritesReducer from "./favorites/favoriteSlice";
import notificationReducer from "./notification/notificationSlice";

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

export default store;
