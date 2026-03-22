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
  selectedVariantIds: [],
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

function isSelectableCartItem(item) {
  return !item?.isPreorder || item?.isPreorderReady;
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

      if (
        isSelectableCartItem(product) &&
        !state.selectedVariantIds.includes(product.variantID)
      ) {
        state.selectedVariantIds.push(product.variantID);
      }

      calculateCart(state);
    },

    removeItem(state, action) {
      const productID = action.payload;

      const item = state.cart.find((i) => i.productID === productID);

      if (item) {
        state.totalProduct -= item.quantity;
        state.totalPrice -= item.variantPrice * item.quantity;
      }

      state.cart = state.cart.filter((item) => item.productID !== productID);
    },

    updateQuantity(state, action) {
      const { variantId, type } = action.payload;
      const item = state.cart.find((i) => i.variantID === variantId);

      if (!item) return;

      if (type === "+") item.quantity += 1;
      if (type === "-" && item.quantity > 1) item.quantity -= 1;

      calculateCart(state);
    },

    toggleSelectedItem(state, action) {
      const variantId = action.payload;

      if (state.selectedVariantIds.includes(variantId)) {
        state.selectedVariantIds = state.selectedVariantIds.filter((id) => id !== variantId);
      } else if (
        state.cart.some(
          (item) => item.variantID === variantId && isSelectableCartItem(item)
        )
      ) {
        state.selectedVariantIds.push(variantId);
      }
    },

    toggleSelectAllItems(state) {
      const selectableVariantIds = state.cart
        .filter((item) => isSelectableCartItem(item))
        .map((item) => item.variantID);

      if (
        selectableVariantIds.length > 0 &&
        state.selectedVariantIds.length === selectableVariantIds.length
      ) {
        state.selectedVariantIds = [];
      } else {
        state.selectedVariantIds = selectableVariantIds;
      }
    },

    updatePreorderReadyStatus(state, action) {
      const { variantId, isReady } = action.payload || {};
      const item = state.cart.find((cartItem) => cartItem.variantID === variantId);

      if (!item) return;

      item.isPreorderReady = Boolean(isReady);

      if (!isSelectableCartItem(item)) {
        state.selectedVariantIds = state.selectedVariantIds.filter((id) => id !== variantId);
      }
    },

    removeSelectedItems(state, action) {
      const variantIds = Array.isArray(action.payload) ? action.payload : [];

      state.cart = state.cart.filter((item) => !variantIds.includes(item.variantID));
      state.selectedVariantIds = state.selectedVariantIds.filter(
        (id) => !variantIds.includes(id)
      );
      calculateCart(state);
    },

    clearCart(state) {
      state.cart = [];
      state.selectedVariantIds = [];
      state.totalProduct = 0;
      state.totalPrice = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        if (!state.cart.length) {
          state.cart = getStoredCart(action.payload?.id);
          state.selectedVariantIds = state.cart
            .filter((item) => isSelectableCartItem(item))
            .map((item) => item.variantID);
        }

        calculateCart(state);
      })
      .addCase(logout, () => initialState);
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  toggleSelectedItem,
  toggleSelectAllItems,
  updatePreorderReadyStatus,
  removeSelectedItems,
  clearCart,
} = cartSlice.actions;

export { getCartStorageKey };

export default cartSlice.reducer;
