import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  glasses: [],
  loading: false,
  error: null,
};

/* =========================
   ASYNC THUNK
========================= */

export const fetchGlasses = createAsyncThunk("glass/fetchGlasses", async (_, thunkAPI) => {
  try {
    const response = await axios.get("/api/glasses");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || "Error");
  }
});

/* =========================
   SLICE
========================= */

const glassSlice = createSlice({
  name: "glass",
  initialState,
  reducers: {
    clearGlasses(state) {
      state.glasses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlasses.fulfilled, (state, action) => {
        state.loading = false;
        state.glasses = action.payload;
      })
      .addCase(fetchGlasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGlasses } = glassSlice.actions;
export default glassSlice.reducer;
