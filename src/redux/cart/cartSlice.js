import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  totalProduct: 0,
  totalPrice: 0,
};

function calculateCart(state) {
  state.totalProduct = state.cart.reduce((total, item) => total + item.quantity, 0);

  state.totalPrice = state.cart.reduce((total, item) => total + item.variantPrice * item.quantity, 0);
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action) {
      const product = action.payload;
      const exist = state.cart.find((item) => item.variantID === product.variantID);

      if (exist) {
        exist.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }

      state.totalProduct += 1;
      state.totalPrice += product.price;

      calculateCart(state);
    },

    removeItem(state, action) {
      const variantId = action.payload;

      const item = state.cart.find((i) => i.variantID === variantId);

      if (item) {
        state.totalProduct -= item.quantity;
        state.totalPrice -= item.variantPrice * item.quantity;
      }

      state.cart = state.cart.filter((item) => item.variantID !== variantId);
    },

    updateQuantity(state, action) {
      const { variantId, type } = action.payload;

      const item = state.cart.find((i) => i.variantID === variantId);

      if (!item) return;

      if (type === "+") item.quantity += 1;
      if (type === "-" && item.quantity > 1) item.quantity -= 1;

      calculateCart(state);
    },

    clearCart(state) {
      state.cart = [];
      state.totalProduct = 0;
      state.totalPrice = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
