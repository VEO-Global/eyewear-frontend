import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  manufacturingOrders: [],
  loading: false,
  error: null,
};

export  const getAllOperationOrder = createAsyncThunk(
  "operation/getAllOperationOrder",
  async (_, { rejectWithValue }) => {   
    try {
      const response = await api.get("/api/operation/orders");                  
        console.log(response);
        
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);