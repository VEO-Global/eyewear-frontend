import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  manufacturingOrders: [],
  loading: false,
  error: null,
};
export const getAllManufacturingOrder = createAsyncThunk(
  "order/getAllManufacturingOrder",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/operaion/orders/manufacturing");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi lấy danh sách đơn sản xuất");
    }
  }
);

export const updateToManufacturing = createAsyncThunk(
  "order/updateToManufacturing",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/operaion/orders/${Number(orderId)}/manufacture`);
      console.log(response);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi lấy danh sách đơn sản xuất");
    }
  }
);

const operationSlice = createSlice({
  name: "operation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllManufacturingOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllManufacturingOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.manufacturingOrders = action.payload;
      })
      .addCase(getAllManufacturingOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default operationSlice.reducer;
