import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { cartService } from "../../services/cartService";
import { productService } from "../../services/productService";
import { getAccessToken } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { extractProductImages, getPrimaryProductImage } from "../../utils/productImages";
import {
  getProductAvailability,
  getVariantStock,
  isPreorderProduct,
} from "../../utils/productCatalog";
import { logout, softLogout } from "../auth/authSlice";

function extractList(payload) {
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

function unwrapEntity(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return unwrapEntity(payload.data);
  }

  if (payload.result && typeof payload.result === "object" && !Array.isArray(payload.result)) {
    return unwrapEntity(payload.result);
  }

  if (payload.content && typeof payload.content === "object" && !Array.isArray(payload.content)) {
    return unwrapEntity(payload.content);
  }

  return payload;
}

function normalizeProduct(product) {
  return {
    ...product,
    images: extractProductImages(product),
    imageUrl: getPrimaryProductImage(product),
    variants: Array.isArray(product?.variants)
      ? product.variants.map((variant) => ({
          ...variant,
          stockQuantity: Number(variant?.stockQuantity ?? variant?.quantity ?? 0),
        }))
      : [],
  };
}

function buildVariantLookup(products) {
  const lookup = new Map();

  products.forEach((product) => {
    product?.variants?.forEach((variant) => {
      lookup.set(Number(variant.id), {
        product,
        variant,
      });
    });
  });

  return lookup;
}

function normalizeCartItem(item, variantLookup) {
  const variantId = Number(item?.productVariantId ?? item?.variantId ?? 0);
  const matchedVariant = variantLookup.get(variantId);
  const product = matchedVariant?.product;
  const variant = matchedVariant?.variant;
  const isPreorder = isPreorderProduct(product);
  const variantPrice = Number(variant?.price ?? product?.basePrice ?? 0);
  const isPreorderReady =
    !isPreorder ||
    getVariantStock(variant) > 0 ||
    getProductAvailability(product) === "in_stock";

  return {
    itemId: Number(item?.itemId ?? item?.id ?? 0),
    productID: Number(product?.id ?? item?.productId ?? 0),
    variantID: variantId,
    lensProductId: item?.lensProductId ?? null,
    lensName: item?.lensName ?? null,
    variantPrice,
    quantity: Math.max(1, Number(item?.quantity || 1)),
    name: item?.productName || product?.name || "",
    brand: product?.brand || "",
    description: product?.description || "",
    material: product?.material || "",
    imgUrl: getPrimaryProductImage(product),
    gender: product?.gender || "",
    color: item?.color || variant?.color || "",
    size: item?.size || variant?.size || "",
    variantSku: item?.variantSku || variant?.sku || "",
    isPreorder,
    isPreorderReady,
  };
}

function calculateCart(state) {
  state.totalProduct = state.cart.reduce((total, item) => total + item.quantity, 0);
  state.totalPrice = state.cart.reduce(
    (total, item) => total + Number(item.variantPrice || 0) * item.quantity,
    0
  );
}

function isSelectableCartItem(item) {
  return !item?.isPreorder || item?.isPreorderReady;
}

function syncSelectedVariantIds(state, preferredVariantIds) {
  const selectableVariantIds = state.cart
    .filter((item) => isSelectableCartItem(item))
    .map((item) => item.variantID)
    .filter((variantId, index, items) => items.indexOf(variantId) === index);

  if (Array.isArray(preferredVariantIds) && preferredVariantIds.length) {
    state.selectedVariantIds = preferredVariantIds.filter((variantId) =>
      selectableVariantIds.includes(variantId)
    );
  } else {
    state.selectedVariantIds = selectableVariantIds;
  }
}

async function loadEnrichedCart() {
  const [cartPayload, productsPayload] = await Promise.all([
    cartService.getCart(),
    productService.getProducts(),
  ]);

  const normalizedCartPayload = unwrapEntity(cartPayload) || {};
  const products = extractList(productsPayload).map(normalizeProduct);
  const variantLookup = buildVariantLookup(products);
  const rawItems = extractList(normalizedCartPayload);

  return {
    cartId: normalizedCartPayload?.cartId ?? normalizedCartPayload?.id ?? null,
    items: rawItems.map((item) => normalizeCartItem(item, variantLookup)),
  };
}

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  if (!getAccessToken()) {
    return {
      cartId: null,
      items: [],
    };
  }

  try {
    return await loadEnrichedCart();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Khong the tai gio hang."));
  }
});

export const addItem = createAsyncThunk("cart/addItem", async (payload, { rejectWithValue }) => {
  try {
    await cartService.addItem({
      productVariantId: payload?.productVariantId ?? payload?.variantID,
      lensProductId: payload?.lensProductId ?? null,
      quantity: Math.max(1, Number(payload?.quantity ?? payload?.cartQuantity ?? 1)),
    });

    return await loadEnrichedCart();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Khong the them san pham vao gio hang."));
  }
});

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (identifier, { getState, rejectWithValue }) => {
    const cartItems = getState()?.cart?.cart || [];
    const matchedItem = cartItems.find(
      (item) => Number(item.variantID) === Number(identifier) || Number(item.itemId) === Number(identifier)
    );

    if (!matchedItem?.itemId) {
      return rejectWithValue("Khong tim thay san pham trong gio hang.");
    }

    try {
      await cartService.removeItem(matchedItem.itemId);
      return await loadEnrichedCart();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Khong the xoa san pham khoi gio hang."));
    }
  }
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ variantId, type }, { getState, rejectWithValue }) => {
    const cartItems = getState()?.cart?.cart || [];
    const matchedItem = cartItems.find((item) => Number(item.variantID) === Number(variantId));

    if (!matchedItem?.itemId) {
      return rejectWithValue("Khong tim thay san pham trong gio hang.");
    }

    const nextQuantity =
      type === "+"
        ? matchedItem.quantity + 1
        : Math.max(1, matchedItem.quantity - 1);

    try {
      await cartService.removeItem(matchedItem.itemId);
      await cartService.addItem({
        productVariantId: matchedItem.variantID,
        lensProductId: matchedItem.lensProductId ?? null,
        quantity: nextQuantity,
      });

      return await loadEnrichedCart();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Khong the cap nhat so luong."));
    }
  }
);

export const syncPreorderCartAvailability = createAsyncThunk(
  "cart/syncPreorderCartAvailability",
  async (_, { dispatch }) => dispatch(fetchCart())
);

const initialState = {
  cartId: null,
  cart: [],
  selectedVariantIds: [],
  totalProduct: 0,
  totalPrice: 0,
  loading: false,
  mutating: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleSelectedItem(state, action) {
      const variantId = action.payload;

      if (state.selectedVariantIds.includes(variantId)) {
        state.selectedVariantIds = state.selectedVariantIds.filter((id) => id !== variantId);
      } else if (
        state.cart.some((item) => item.variantID === variantId && isSelectableCartItem(item))
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
    removeSelectedItems(state, action) {
      const variantIds = Array.isArray(action.payload) ? action.payload : [];

      state.cart = state.cart.filter((item) => !variantIds.includes(item.variantID));
      state.selectedVariantIds = state.selectedVariantIds.filter((id) => !variantIds.includes(id));
      calculateCart(state);
    },
    clearCartState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartId = action.payload?.cartId ?? null;
        state.cart = Array.isArray(action.payload?.items) ? action.payload.items : [];
        syncSelectedVariantIds(state, state.selectedVariantIds);
        calculateCart(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItem.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.mutating = false;
        state.cartId = action.payload?.cartId ?? null;
        state.cart = Array.isArray(action.payload?.items) ? action.payload.items : [];
        syncSelectedVariantIds(state);
        calculateCart(state);
      })
      .addCase(addItem.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(removeItem.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.mutating = false;
        state.cartId = action.payload?.cartId ?? null;
        state.cart = Array.isArray(action.payload?.items) ? action.payload.items : [];
        syncSelectedVariantIds(state, state.selectedVariantIds);
        calculateCart(state);
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(updateQuantity.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.mutating = false;
        state.cartId = action.payload?.cartId ?? null;
        state.cart = Array.isArray(action.payload?.items) ? action.payload.items : [];
        syncSelectedVariantIds(state, state.selectedVariantIds);
        calculateCart(state);
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(syncPreorderCartAvailability.fulfilled, (state) => state)
      .addCase(logout, () => initialState)
      .addCase(softLogout.fulfilled, () => initialState);
  },
});

export const { toggleSelectedItem, toggleSelectAllItems, removeSelectedItems, clearCartState } =
  cartSlice.actions;

export default cartSlice.reducer;
