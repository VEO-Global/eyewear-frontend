import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import productReducer from "./products/producSlice";
import cartReducer from "./cart/cartSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
  },
});

export default store;
