import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  products: [],
  selectedProduct: null,
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
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Không thể lấy sản phẩm");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    decreaseVariantStock(state, action) {
      const { productId, variantId, amount = 1 } = action.payload;

      const updateVariants = (product) => {
        if (!product?.variants?.length || Number(product.id) !== Number(productId)) {
          return product;
        }

        return {
          ...product,
          variants: product.variants.map((variant) => {
            if (Number(variant.id) !== Number(variantId)) {
              return variant;
            }

            return {
              ...variant,
              stockQuantity: Math.max(0, (variant.stockQuantity || 0) - amount),
            };
          }),
        };
      };

      state.selectedProduct = updateVariants(state.selectedProduct);
      state.products = state.products.map(updateVariants);
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
      });
  },
});

export const { decreaseVariantStock } = productSlice.actions;

export default productSlice.reducer;
