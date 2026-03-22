import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";
import { logout } from "../auth/authSlice";
import { isPreorderProduct, normalizeCatalogType } from "../../utils/productCatalog";
import { extractProductImages, getPrimaryProductImage } from "../../utils/productImages";

const PRODUCT_STOCK_OVERRIDES_STORAGE_KEY = "product-stock-overrides";

function readStoredStockOverrides() {
  try {
    const storedOverrides = localStorage.getItem(PRODUCT_STOCK_OVERRIDES_STORAGE_KEY);

    if (!storedOverrides) {
      return {};
    }

    const parsedOverrides = JSON.parse(storedOverrides);
    return parsedOverrides && typeof parsedOverrides === "object" ? parsedOverrides : {};
  } catch {
    return {};
  }
}

function getVariantOverrideKey(productId, variantId) {
  return `${Number(productId)}:${Number(variantId)}`;
}

function getProductOverrideKey(productId) {
  return `${Number(productId)}`;
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
      : product.variants,
  };
}

function applyStockOverridesToProduct(product, stockOverrides) {
  if (!product) {
    return product;
  }

  if (Array.isArray(product.variants) && product.variants.length) {
    return {
      ...product,
      variants: product.variants.map((variant) => {
        const variantOverride = stockOverrides[
          getVariantOverrideKey(product.id, variant.id)
        ];

        if (variantOverride === undefined) {
          return variant;
        }

        return {
          ...variant,
          stockQuantity: variantOverride,
        };
      }),
    };
  }

  const productOverride = stockOverrides[getProductOverrideKey(product.id)];

  if (productOverride === undefined) {
    return product;
  }

  return {
    ...product,
    stockQuantity: productOverride,
  };
}

const initialState = {
  products: [],
  preorderProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  stockOverrides: readStoredStockOverrides(),
};

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products");
      return Array.isArray(response.data) ? response.data.map(normalizeProduct) : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách sản phẩm"
      );
    }
  }
);

export const fetchPreorderProducts = createAsyncThunk(
  "products/fetchPreorder",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products/preorder");
      return Array.isArray(response.data)
        ? response.data.map(normalizeProduct).filter((product) => isPreorderProduct(product))
        : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách sản phẩm đặt trước"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${Number(id)}`);
      const variants = await api.get(`/variants/product/${Number(id)}`);

      return normalizeProduct({
        ...response.data,
        variants: variants.data,
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Không thể lấy sản phẩm");
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

        if (!product?.variants?.length) {
          const currentStock = Number(
            product.stockQuantity ?? product.quantity ?? product.stock ?? 0
          );
          const nextStock = Math.max(0, currentStock - amount);

          state.stockOverrides[getProductOverrideKey(productId)] = nextStock;

          return {
            ...product,
            stockQuantity: nextStock,
          };
        }

        return {
          ...product,
          variants: product.variants.map((variant) => {
            if (Number(variant.id) !== Number(variantId)) {
              return variant;
            }

            const nextStock = Math.max(0, Number(variant.stockQuantity || 0) - amount);
            state.stockOverrides[getVariantOverrideKey(productId, variantId)] = nextStock;

            return {
              ...variant,
              stockQuantity: nextStock,
            };
          }),
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

        if (!product?.variants?.length) {
          const currentStock = Number(
            product.stockQuantity ?? product.quantity ?? product.stock ?? 0
          );
          const nextStock = Math.max(0, currentStock + amount);

          state.stockOverrides[getProductOverrideKey(productId)] = nextStock;

          return {
            ...product,
            stockQuantity: nextStock,
          };
        }

        return {
          ...product,
          variants: product.variants.map((variant) => {
            if (Number(variant.id) !== Number(variantId)) {
              return variant;
            }

            const nextStock = Math.max(0, Number(variant.stockQuantity || 0) + amount);
            state.stockOverrides[getVariantOverrideKey(productId, variantId)] = nextStock;

            return {
              ...variant,
              stockQuantity: nextStock,
            };
          }),
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
        state.products = action.payload.map((product) =>
          applyStockOverridesToProduct(product, state.stockOverrides)
        );
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
        state.preorderProducts = action.payload.map((product) =>
          applyStockOverridesToProduct(product, state.stockOverrides)
        );
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
        state.selectedProduct = applyStockOverridesToProduct(
          action.payload,
          state.stockOverrides
        );
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout, (state) => {
        state.selectedProduct = null;
        state.preorderProducts = [];
      });
  },
});

export const { clearSelectedProduct, decreaseVariantStock, increaseVariantStock } =
  productSlice.actions;

export { PRODUCT_STOCK_OVERRIDES_STORAGE_KEY };

export default productSlice.reducer;
