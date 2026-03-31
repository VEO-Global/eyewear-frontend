import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

// ================= STATE =================
const initialState = {
  provinces: [],
  districts: [],
  wards: [],

  loading: false,
  error: null,
};

// ================= THUNKS =================

// 👉 Lấy tỉnh/thành
export const fetchProvinces = createAsyncThunk("location/fetchProvinces", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/locations/provinces");
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Fetch provinces failed");
  }
});

// 👉 Lấy quận/huyện theo provinceId
export const fetchDistricts = createAsyncThunk("location/fetchDistricts", async (provinceCode, { rejectWithValue }) => {
  try {
    const res = await api.get("/locations/districts", {
      params: { provinceCode },
    });

    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Fetch districts failed");
  }
});

// 👉 Lấy phường/xã theo districtId
export const fetchWards = createAsyncThunk("location/fetchWards", async (districtCode, { rejectWithValue }) => {
  try {
    const res = await api.get(`/locations/wards`, { params: { districtCode } });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Fetch wards failed");
  }
});

// ================= SLICE =================

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearDistricts: (state) => {
      state.districts = [];
    },
    clearWards: (state) => {
      state.wards = [];
    },
  },
  extraReducers: (builder) => {
    builder

      // ===== PROVINCES =====
      .addCase(fetchProvinces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loading = false;
        state.provinces = action.payload;
      })

      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== DISTRICTS =====
      .addCase(fetchDistricts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.loading = false;
        state.districts = action.payload;
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== WARDS =====
      .addCase(fetchWards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.loading = false;
        state.wards = action.payload;
      })
      .addCase(fetchWards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ================= EXPORT =================

export const { clearDistricts, clearWards } = locationSlice.actions;
export default locationSlice.reducer;
