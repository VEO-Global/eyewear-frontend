import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import api from "../../configs/config-axios";

const initialState = {
  categories: [],
  loading: true,
  error: false,
};

export const fetchAllCategories = createAsyncThunk("products/fetchAllCategories", async (_, { rejectWithValue }) => {
  try {
    const respone = await api.get("/categories");
    return respone.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Không thể lấy danh sách các loại sản phẩm");
  }
});

const categoriesSlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
