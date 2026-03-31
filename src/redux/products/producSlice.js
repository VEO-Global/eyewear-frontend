import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";
import { logout } from "../auth/authSlice";

const initialState = {
  products: [],
  preorderProducts: [],
  selectedProduct: null,
  needLenProduct: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk("products/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/products");

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Không thể lấy danh sách sản phẩm");
  }
});

export const fetchProductById = createAsyncThunk("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/products/${Number(id)}`);
    console.log(response);

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Không thể lấy sản phẩm");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
    // decreaseVariantStock(state, action) {
    //   const { productId, variantId, amount = 1 } = action.payload;

    //   const updateVariants = (product) => {
    //     if (!product || Number(product.id) !== Number(productId)) {
    //       return product;
    //     }

    //     if (!product?.variants?.length) {
    //       const currentStock = Number(product.stockQuantity ?? product.quantity ?? product.stock ?? 0);
    //       const nextStock = Math.max(0, currentStock - amount);

    //       state.stockOverrides[getProductOverrideKey(productId)] = nextStock;

    //       return {
    //         ...product,
    //         stockQuantity: nextStock,
    //       };
    //     }

    //     return {
    //       ...product,
    //       variants: product.variants.map((variant) => {
    //         if (Number(variant.id) !== Number(variantId)) {
    //           return variant;
    //         }

    //         const nextStock = Math.max(0, Number(variant.stockQuantity || 0) - amount);
    //         state.stockOverrides[getVariantOverrideKey(productId, variantId)] = nextStock;

    //         return {
    //           ...variant,
    //           stockQuantity: nextStock,
    //         };
    //       }),
    //     };
    //   };

    //   state.selectedProduct = updateVariants(state.selectedProduct);
    //   state.products = state.products.map(updateVariants);
    //   state.preorderProducts = state.preorderProducts.map(updateVariants);
    // },
    // increaseVariantStock(state, action) {
    //   const { productId, variantId, amount = 1 } = action.payload;

    //   const updateVariants = (product) => {
    //     if (!product || Number(product.id) !== Number(productId)) {
    //       return product;
    //     }

    //     if (!product?.variants?.length) {
    //       const currentStock = Number(product.stockQuantity ?? product.quantity ?? product.stock ?? 0);
    //       const nextStock = Math.max(0, currentStock + amount);

    //       state.stockOverrides[getProductOverrideKey(productId)] = nextStock;

    //       return {
    //         ...product,
    //         stockQuantity: nextStock,
    //       };
    //     }

    //     return {
    //       ...product,
    //       variants: product.variants.map((variant) => {
    //         if (Number(variant.id) !== Number(variantId)) {
    //           return variant;
    //         }

    //         const nextStock = Math.max(0, Number(variant.stockQuantity || 0) + amount);
    //         state.stockOverrides[getVariantOverrideKey(productId, variantId)] = nextStock;

    //         return {
    //           ...variant,
    //           stockQuantity: nextStock,
    //         };
    //       }),
    //     };
    //   };

    //   state.selectedProduct = updateVariants(state.selectedProduct);
    //   state.products = state.products.map(updateVariants);
    //   state.preorderProducts = state.preorderProducts.map(updateVariants);
    // },
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
        state.preorderProducts = action.payload.filter((p) => p.catalogType === "NEW");
      })
      .addCase(fetchProducts.rejected, (state, action) => {
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
      });
  },
});

export const { clearSelectedProduct, decreaseVariantStock, increaseVariantStock } = productSlice.actions;

export default productSlice.reducer;
