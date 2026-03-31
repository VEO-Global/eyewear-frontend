import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import productReducer from "./products/producSlice";
import cartReducer from "./cart/cartSlice";
import categoriesReducer from "./category/categorySlice";
import adminReducer from "./admin/adminSlice";
import favoritesReducer from "./favorites/favoriteSlice";
import locationReducer from "./location/locationSlice";
import lenReducer from "./lens/lensSlice";
import paymentReducer from "./payment/paymentSlice";
import orderReducer from "./order/orderSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    category: categoriesReducer,
    admin: adminReducer,
    favorites: favoritesReducer,
    location: locationReducer,
    lens: lenReducer,
    payment: paymentReducer,
    order: orderReducer,
  },
});

export default store;
