import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/config-axios";

const initialState = {
  totalUser: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// 🔥 GET ALL USERS
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const response = await api.get("/user");
    console.log(response.data);

    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Lỗi lấy user");
  }
});

// 🔥 CREATE USER
export const createUser = createAsyncThunk("admin/createUser", async (values, { rejectWithValue }) => {
  console.log(values);

  try {
    const res = await api.post(`/user`, values);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// 🔥 UPDATE USER
export const updateUser = createAsyncThunk("admin/updateUser", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/user/${(Number(id), data)}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// 🔥 DELETE USER
export const deleteUser = createAsyncThunk("admin/deleteUser", async (id, { rejectWithValue }) => {
  try {
    const response = api.delete(`/user/${Number(id)}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = state.totalUser.find((u) => u.id === action.payload);
    },
  },

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
export const { setSelectedUser, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;
