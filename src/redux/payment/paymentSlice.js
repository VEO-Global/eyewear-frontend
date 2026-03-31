import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  loading: false,
  error: null,
  message: null,
  paymentMethod: "COD", // Default payment method
  paymentInfor: [],
};

export const getOrderQr = createAsyncThunk("payment/getQr", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/payments/order/${Number(orderId)}/qr`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Không thể lấy sản phẩm");
  }
});

export const payMyOrder = createAsyncThunk("payment/payMyOrder", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.post("/payments/customer-pay");
    console.log(response);

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Không thể lấy sản phẩm");
  }
});

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getOrderQr.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(getOrderQr.fulfilled, (state, action) => {
      state.paymentInfor = action.payload;
      state.loading = false;
    });
  },
});

export const { setLoading, setError, setMessage, setPaymentMethod } = paymentSlice.actions;

export default paymentSlice.reducer;
