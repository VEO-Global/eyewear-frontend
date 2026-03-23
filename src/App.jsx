import { useDispatch } from "react-redux";
import AppRouter from "./router/AppRouter";

import { fetchProfile } from "./redux/auth/authSlice";
import { useEffect } from "react";
import { fetchProducts } from "./redux/products/producSlice";
import { fetchAllCategories } from "./redux/category/categorySlice";
import { fetchUsers } from "./redux/admin/adminSlice";

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  if (token) {
    dispatch(fetchProfile());
  }
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchAllCategories());
    dispatch(fetchUsers());
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <AppRouter />
    </div>
  );
}

export default App;
