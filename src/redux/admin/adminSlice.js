import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

const initialState = {
  totalUser: [],
  loading: false,
  error: null,
};

// 🔥 GET ALL USERS
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Lỗi lấy user");
  }
});

// 🔥 CREATE USER
export const createUser = createAsyncThunk("admin/createUser", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// 🔥 UPDATE USER
export const updateUser = createAsyncThunk("admin/updateUser", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// 🔥 DELETE USER
export const deleteUser = createAsyncThunk("admin/deleteUser", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.totalUser = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createUser.fulfilled, (state, action) => {
        state.totalUser.push(action.payload);
      })

      // UPDATE
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.totalUser.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.totalUser[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.totalUser = state.totalUser.filter((user) => user.id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
