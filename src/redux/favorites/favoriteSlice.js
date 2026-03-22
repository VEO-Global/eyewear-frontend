import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";
import { logout } from "../auth/authSlice";
import { extractProductImages, getPrimaryProductImage } from "../../utils/productImages";

function resolveFavoritePayload(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  return (
    item.product ||
    item.favoriteProduct ||
    item.productResponse ||
    item.productDto ||
    item.productDTO ||
    item.glass ||
    item.eyeglass ||
    item
  );
}

function normalizeFavoriteProduct(item) {
  const product = resolveFavoritePayload(item);
  const productId =
    product?.id ??
    product?.productId ??
    item?.productId ??
    item?.favoriteProductId;

  if (!product || typeof product !== "object" || !productId) {
    return null;
  }

  return {
    id: Number(productId),
    name: product.name || "",
    brand: product.brand || "",
    description: product.description || "",
    basePrice: Number(product.basePrice || 0),
    images: extractProductImages(product),
    imageUrl: getPrimaryProductImage(product),
    image: getPrimaryProductImage(product),
    catalogType: product.catalogType || "",
    stockQuantity: product.stockQuantity,
    createdAt: product.createdAt || null,
    variants: Array.isArray(product.variants) ? product.variants : [],
  };
}

function looksLikeFavoriteArray(items) {
  return (
    Array.isArray(items) &&
    items.some((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      return Boolean(
        item.id ||
          item.productId ||
          item.favoriteProductId ||
          item.product?.id ||
          item.favoriteProduct?.id ||
          item.productResponse?.id ||
          item.productDto?.id ||
          item.productDTO?.id
      );
    })
  );
}

function extractFavoriteItems(payload) {
  if (looksLikeFavoriteArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidateKeys = [
    "data",
    "favorites",
    "content",
    "result",
    "payload",
    "items",
    "rows",
    "list",
  ];

  for (const key of candidateKeys) {
    const value = payload[key];

    if (looksLikeFavoriteArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nestedItems = extractFavoriteItems(value);

      if (nestedItems.length > 0) {
        return nestedItems;
      }
    }
  }

  for (const value of Object.values(payload)) {
    if (looksLikeFavoriteArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nestedItems = extractFavoriteItems(value);

      if (nestedItems.length > 0) {
        return nestedItems;
      }
    }
  }

  return [];
}

function getErrorMessage(error, fallbackMessage) {
  const responseData = error.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData.trim().toLowerCase() === "something went wrong"
      ? "Có lỗi xảy ra khi cập nhật danh sách yêu thích."
      : responseData;
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message.trim().toLowerCase() === "something went wrong"
      ? "Có lỗi xảy ra khi cập nhật danh sách yêu thích."
      : responseData.message;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }

    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  return fallbackMessage;
}

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/favorites");
      return extractFavoriteItems(response.data)
        .map(normalizeFavoriteProduct)
        .filter(Boolean);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Không thể tải danh sách yêu thích.")
      );
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async (product, { getState, rejectWithValue }) => {
    const normalizedProduct = normalizeFavoriteProduct(product);

    if (!normalizedProduct) {
      return rejectWithValue("Sản phẩm không hợp lệ.");
    }

    const favoriteItems = getState().favorites.items || [];
    const isFavorite = favoriteItems.some(
      (item) => Number(item.id) === Number(normalizedProduct.id)
    );

    try {
      if (isFavorite) {
        await api.delete(`/user/favorites/${normalizedProduct.id}`);
      } else {
        await api.post(`/user/favorites/${normalizedProduct.id}`);
      }

      try {
        const refreshedFavorites = await api.get("/user/favorites");

        return {
          items: extractFavoriteItems(refreshedFavorites.data)
            .map(normalizeFavoriteProduct)
            .filter(Boolean),
        };
      } catch {
        if (isFavorite) {
          return {
            items: favoriteItems.filter(
              (item) => Number(item.id) !== Number(normalizedProduct.id)
            ),
          };
        }

        return {
          items: [
            normalizedProduct,
            ...favoriteItems.filter(
              (item) => Number(item.id) !== Number(normalizedProduct.id)
            ),
          ],
        };
      }
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Không thể cập nhật sản phẩm yêu thích.")
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải danh sách yêu thích.";
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload || "Không thể cập nhật sản phẩm yêu thích.";
      })
      .addCase(logout, () => initialState);
  },
});

export default favoriteSlice.reducer;
