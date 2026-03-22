import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile, logout } from "../auth/authSlice";

function getCartStorageKey(userId) {
  return `cart:${userId}`;
}

function getStoredCart(userId) {
  if (!userId) {
    return [];
  }

  try {
    const storedCart = localStorage.getItem(getCartStorageKey(userId));

    if (!storedCart) {
      return [];
    }

    const parsedCart = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

const initialState = {
  cart: [],
  totalProduct: 0,
  totalPrice: 0,
};

function calculateCart(state) {
  state.totalProduct = state.cart.reduce((total, item) => total + item.quantity, 0);
  state.totalPrice = state.cart.reduce(
    (total, item) => total + item.variantPrice * item.quantity,
    0
  );
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action) {
      const product = action.payload;
      const exist = state.cart.find((item) => item.variantID === product.variantID);
      const quantityToAdd = Math.max(1, Number(product.cartQuantity) || 1);

      if (exist) {
        exist.quantity += quantityToAdd;
      } else {
        state.cart.push({ ...product, quantity: quantityToAdd });
      }

      calculateCart(state);
    },

    removeItem(state, action) {
      const variantId = action.payload;
      state.cart = state.cart.filter((item) => item.variantID !== variantId);
      calculateCart(state);
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.cart = getStoredCart(action.payload?.id);
        calculateCart(state);
      })
      .addCase(logout, () => initialState);
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

export { getCartStorageKey };

export default cartSlice.reducer;
