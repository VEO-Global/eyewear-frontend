import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchProfile, logout } from "../auth/authSlice";
import api from "../../configs/config-axios";
import { toast } from "react-toastify";

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
  userId: null,
  cart: [],
  selectedProductForPrescription: null,
  selectedVariantIds: [],
  totalProduct: 0,
  totalPrice: 0,
};

function saveCart(userId, cart) {
  try {
    localStorage.setItem(`cart:${userId}`, JSON.stringify(cart));
  } catch (error) {
    // Handle storage errors if needed
    toast.error("Failed to save cart to localStorage", error);
  }
}
function calculateCart(state) {
  state.totalProduct = state.cart.reduce((total, item) => total + item.quantity, 0);
  state.totalPrice = state.cart.reduce((total, item) => total + item.variantPrice * item.quantity, 0);
}

function isSelectableCartItem(item) {
  return !item?.isPreorder || item?.isPreorderReady;
}

export const getMyCart = createAsyncThunk("cart/getMyCart", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/cart");
    return res.data.items;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const addToCart = createAsyncThunk("cart/addToCart", async (values, { rejectWithValue }) => {
  try {
    const res = await api.post("/cart/items", values);

    return res.data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const removeCartItem = createAsyncThunk("cart/removeCartItem", async (variantId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/items/${variantId}`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setSelectedProductForPrescription(state, action) {
      state.selectedProductForPrescription = state.cart.find((item) => item.variantID === action.payload) || null;
    },

    addItem(state, action) {
      const product = action.payload;
      const exist = state.cart.find((item) => item.variantID === product.variantID);
      const quantityToAdd = Math.max(1, Number(product.cartQuantity) || 1);

      if (exist) {
        exist.quantity += quantityToAdd;
      } else {
        state.cart.push({ ...product, quantity: quantityToAdd });
      }

      if (isSelectableCartItem(product) && !state.selectedVariantIds.includes(product.variantID)) {
        state.selectedVariantIds.push(product.variantID);
      }

      calculateCart(state);
      saveCart(state.userId, state.cart);
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
      } else if (state.cart.some((item) => item.variantID === variantId && isSelectableCartItem(item))) {
        state.selectedVariantIds.push(variantId);
      }
    },

    toggleSelectAllItems(state) {
      const selectableVariantIds = state.cart
        .filter((item) => isSelectableCartItem(item))
        .map((item) => item.variantID);

      if (selectableVariantIds.length > 0 && state.selectedVariantIds.length === selectableVariantIds.length) {
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
      state.selectedVariantIds = state.selectedVariantIds.filter((id) => !variantIds.includes(id));
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
        state.userId = action.payload.id;
        if (!state.cart.length) {
          state.cart = getStoredCart(state.userId);
          state.selectedVariantIds = state.cart
            .filter((item) => isSelectableCartItem(item))
            .map((item) => item.variantID);
        }

        calculateCart(state);
      })

      .addCase(getMyCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        calculateCart(state);
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        const newItem = action.payload;
        const exist = state.cart.find((item) => item.variantID === newItem.variantID);
        if (exist) {
          exist.quantity += newItem.quantity;
        } else {
          state.cart.push(newItem);
        }
        calculateCart(state);
        toast.success(`Đã thêm sản phẩm ${newItem?.productName} vào giỏ hàng`); // You can customize the message as needed
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
  setSelectedProductForPrescription,
  clearCart,
} = cartSlice.actions;

export { getCartStorageKey };

export default cartSlice.reducer;
