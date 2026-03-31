import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout, softLogout } from "../auth/authSlice";
import { productService } from "../../services/productService";
import { isPreorderProduct, normalizeCatalogType } from "../../utils/productCatalog";
import { extractProductImages, getPrimaryProductImage } from "../../utils/productImages";
import { getApiErrorMessage } from "../../utils/apiError";

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

function normalizeProduct(product) {
  if (!product || typeof product !== "object") {
    return product;
  }

  const normalizedCatalogType = isPreorderProduct(product)
    ? "NEW"
    : normalizeCatalogType(product.catalogType);

  return {
    ...product,
    catalogType: normalizedCatalogType,
    images: extractProductImages(product),
    imageUrl: getPrimaryProductImage(product),
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => ({
          ...variant,
          stockQuantity: Number(variant?.stockQuantity ?? variant?.quantity ?? 0),
        }))
      : [],
  };
}

const initialState = {
  products: [],
  preorderProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return extractProducts(await productService.getProducts()).map(normalizeProduct);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Không thể lấy danh sách sản phẩm."));
    }
  }
);

export const fetchPreorderProducts = createAsyncThunk(
  "products/fetchPreorder",
  async (_, { rejectWithValue }) => {
    try {
      const payload = await productService.getPreorderProducts();
      const products = extractProducts(payload).map(normalizeProduct);

      return products.length ? products : extractProducts(await productService.getProducts())
        .map(normalizeProduct)
        .filter((product) => isPreorderProduct(product));
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Không thể lấy danh sách sản phẩm đặt trước.")
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return normalizeProduct(await productService.getProductById(Number(id)));
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Không thể lấy sản phẩm."));
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
    decreaseVariantStock(state, action) {
      const { productId, variantId, amount = 1 } = action.payload;

      const updateVariants = (product) => {
        if (!product || Number(product.id) !== Number(productId)) {
          return product;
        }

        return {
          ...product,
          variants: Array.isArray(product.variants)
            ? product.variants.map((variant) =>
                Number(variant.id) === Number(variantId)
                  ? {
                      ...variant,
                      stockQuantity: Math.max(
                        0,
                        Number(variant.stockQuantity || 0) - Number(amount || 1)
                      ),
                    }
                  : variant
              )
            : [],
        };
      };

      state.selectedProduct = updateVariants(state.selectedProduct);
      state.products = state.products.map(updateVariants);
      state.preorderProducts = state.preorderProducts.map(updateVariants);
    },
    increaseVariantStock(state, action) {
      const { productId, variantId, amount = 1 } = action.payload;

      const updateVariants = (product) => {
        if (!product || Number(product.id) !== Number(productId)) {
          return product;
        }

        return {
          ...product,
          variants: Array.isArray(product.variants)
            ? product.variants.map((variant) =>
                Number(variant.id) === Number(variantId)
                  ? {
                      ...variant,
                      stockQuantity: Math.max(
                        0,
                        Number(variant.stockQuantity || 0) + Number(amount || 1)
                      ),
                    }
                  : variant
              )
            : [],
        };
      };

      state.selectedProduct = updateVariants(state.selectedProduct);
      state.products = state.products.map(updateVariants);
      state.preorderProducts = state.preorderProducts.map(updateVariants);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPreorderProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPreorderProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.preorderProducts = action.payload;
      })
      .addCase(fetchPreorderProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout, (state) => {
        state.selectedProduct = null;
        state.preorderProducts = [];
      })
      .addCase(softLogout.fulfilled, () => initialState);
  },
});

export const { clearSelectedProduct, decreaseVariantStock, increaseVariantStock } =
  productSlice.actions;

export default productSlice.reducer;
