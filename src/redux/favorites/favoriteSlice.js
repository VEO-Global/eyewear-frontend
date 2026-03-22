import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";

const FAVORITES_STORAGE_PREFIX = "favorite-products";

function getFavoritesStorageKey(userId) {
  return `${FAVORITES_STORAGE_PREFIX}:${userId || "guest"}`;
}

function normalizeFavoriteProduct(product) {
  if (!product || typeof product !== "object" || !product.id) {
    return null;
  }

  return {
    id: Number(product.id),
    name: product.name || "",
    brand: product.brand || "",
    description: product.description || "",
    basePrice: Number(product.basePrice || 0),
    imageUrl: product.imageUrl || product.image || "",
    image: product.image || product.imageUrl || "",
    catalogType: product.catalogType || "",
    stockQuantity: product.stockQuantity,
    createdAt: product.createdAt || null,
  };
}

function readStoredFavorites(userId) {
  try {
    const storedValue = localStorage.getItem(getFavoritesStorageKey(userId));

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue)
      ? parsedValue
          .map(normalizeFavoriteProduct)
          .filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

const initialState = {
  items: readStoredFavorites(undefined),
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    replaceFavorites(state, action) {
      state.items = Array.isArray(action.payload)
        ? action.payload.map(normalizeFavoriteProduct).filter(Boolean)
        : [];
    },
    toggleFavorite(state, action) {
      const normalizedProduct = normalizeFavoriteProduct(action.payload);

      if (!normalizedProduct) {
        return;
      }

      const existingIndex = state.items.findIndex(
        (item) => Number(item.id) === Number(normalizedProduct.id)
      );

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
        return;
      }

      state.items.unshift(normalizedProduct);
    },
    removeFavorite(state, action) {
      state.items = state.items.filter(
        (item) => Number(item.id) !== Number(action.payload)
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.items = readStoredFavorites(undefined);
    });
  },
});

export const { replaceFavorites, toggleFavorite, removeFavorite } =
  favoriteSlice.actions;

export { getFavoritesStorageKey, readStoredFavorites };

export default favoriteSlice.reducer;
