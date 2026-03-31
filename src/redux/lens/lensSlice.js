import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  lens: [],
  loading: false,
  error: null,
};

export const fetchAllLens = createAsyncThunk("lens/fetchAllLens", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/lens_products");
    return res.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getLensProductById = createAsyncThunk("lens/getLensProductById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/lens_products/${id}`);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const lenSlice = createSlice({
  name: "lens",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLens.fulfilled, (state, action) => {
        state.loading = false;
        state.lens = action.payload;
      })
      .addCase(fetchAllLens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default lenSlice.reducer;
