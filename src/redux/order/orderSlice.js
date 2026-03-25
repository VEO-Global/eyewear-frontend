import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

// ================= STATE =================
const initialState = {
  orders: [],
  loading: false,
  error: null,
  message: "",
};

// ================= THUNKS =================

// 👉 Fetch orders
export const fetchAllOrder = createAsyncThunk("order/fetchAllOrder", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/api/orders");
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Fetch orders failed");
  }
});

// 👉 Create order (checkout)
export const createOrder = createAsyncThunk("order/createOrder", async (payload, { rejectWithValue }) => {
  console.log(payload);

  try {
    const res = await api.post("/orders/checkout", payload);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Create order failed");
  }
});

// ================= SLICE =================

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // ===== FETCH =====
      .addCase(fetchAllOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.payload;
      })

      // ===== CREATE =====
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.message = "Order created successfully";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.message = action.payload;
      });
  },
});

export default orderSlice.reducer;
