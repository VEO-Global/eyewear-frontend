import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";
import { addNotification } from "../notification/notificationSlice";
import { fetchProfile, logout } from "../auth/authSlice";
import {
  getProductAvailability,
  getVariantStock,
  isPreorderProduct,
} from "../../utils/productCatalog";

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
  state.totalProduct = state.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
  state.totalPrice = state.cart.reduce(
    (total, item) => total + item.variantPrice * item.quantity,
    0
  );
}

function isSelectableCartItem(item) {
  return !item?.isPreorder || item?.isPreorderReady;
}

function syncSelectedVariantIds(state) {
  state.selectedVariantIds = state.cart
    .filter((item) => isSelectableCartItem(item))
    .map((item) => item.variantID)
    .filter((variantId, index, items) => items.indexOf(variantId) === index);
}

function applyCartItemAvailability(state, variantId, nextAvailability = {}) {
  const item = state.cart.find((cartItem) => cartItem.variantID === variantId);

  if (!item) {
    return;
  }

  item.isPreorder = Boolean(nextAvailability.isPreorder);
  item.isPreorderReady = Boolean(nextAvailability.isPreorderReady);
}

function extractProducts(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}

function resolveMatchingVariant(product, cartItem) {
  if (!Array.isArray(product?.variants) || !product.variants.length) {
    return null;
  }

  return (
    product.variants.find(
      (variant) => Number(variant?.id) === Number(cartItem?.variantID)
    ) ||
    product.variants.find(
      (variant) =>
        String(variant?.color || "").trim().toLowerCase() ===
          String(cartItem?.color || "").trim().toLowerCase() &&
        String(variant?.size || "").trim().toLowerCase() ===
          String(cartItem?.size || "").trim().toLowerCase()
    ) ||
    null
  );
}

export const syncPreorderCartAvailability = createAsyncThunk(
  "cart/syncPreorderCartAvailability",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const cartItems = getState()?.cart?.cart || [];

    if (!cartItems.length) {
      return [];
    }

    try {
      const response = await api.get("/products");
      const products = extractProducts(response.data);
      const productMap = new Map(
        products.map((product) => [
          Number(product?.id ?? product?.productId ?? product?.productID),
          product,
        ])
      );

      const syncedItems = cartItems
        .map((cartItem) => {
          const product = productMap.get(Number(cartItem?.productID));

          if (!product) {
            return null;
          }

          const matchingVariant = resolveMatchingVariant(product, cartItem);
          const hasVariantStock = matchingVariant
            ? getVariantStock(matchingVariant) > 0
            : false;
          const isProductPreorder = isPreorderProduct(product);
          const isProductNowAvailable =
            !isProductPreorder ||
            getProductAvailability(product) === "in_stock";
          const isPreorderReady =
            !isProductPreorder || hasVariantStock || isProductNowAvailable;

          return {
            variantId: cartItem.variantID,
            productName: cartItem.name,
            isPreorder: isProductPreorder,
            isPreorderReady,
            wasPreorder: Boolean(cartItem?.isPreorder),
            wasPreorderReady: Boolean(cartItem?.isPreorderReady),
          };
        })
        .filter(Boolean);

      syncedItems
        .filter(
          (item) =>
            item.wasPreorder &&
            !item.wasPreorderReady &&
            (!item.isPreorder || item.isPreorderReady)
        )
        .forEach((item) => {
          const message = item.isPreorder
            ? `Sản phẩm đặt trước "${item.productName}" đã có hàng trong giỏ và có thể chọn để thanh toán.`
            : `Sản phẩm "${item.productName}" đã được mở bán và sẵn sàng để thanh toán trong giỏ hàng.`;

          dispatch(
            addNotification({
              type: "success",
              message,
            })
          );
        });

      return syncedItems;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Khong the dong bo gio hang"
      );
    }
  }
);

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

      if (!item) {
        return;
      }

      if (type === "+") item.quantity += 1;
      if (type === "-" && item.quantity > 1) item.quantity -= 1;

      calculateCart(state);
    },

    toggleSelectedItem(state, action) {
      const variantId = action.payload;

      if (state.selectedVariantIds.includes(variantId)) {
        state.selectedVariantIds = state.selectedVariantIds.filter(
          (id) => id !== variantId
        );
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
      applyCartItemAvailability(state, variantId, {
        isPreorder: true,
        isPreorderReady: isReady,
      });
      syncSelectedVariantIds(state);
    },

    removeSelectedItems(state, action) {
      const variantIds = Array.isArray(action.payload) ? action.payload : [];

      state.cart = state.cart.filter(
        (item) => !variantIds.includes(item.variantID)
      );
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
          syncSelectedVariantIds(state);
        }

        calculateCart(state);
      })
      .addCase(syncPreorderCartAvailability.fulfilled, (state, action) => {
        (action.payload || []).forEach((item) => {
          applyCartItemAvailability(state, item.variantId, {
            isPreorder: item.isPreorder,
            isPreorderReady: item.isPreorderReady,
          });
        });

        syncSelectedVariantIds(state);
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
