import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "./router/AppRouter";
<<<<<<< HEAD

import { fetchProfile } from "./redux/auth/authSlice";
import { useEffect } from "react";
import { fetchProducts } from "./redux/products/producSlice";
import { fetchAllCategories } from "./redux/category/categorySlice";
import { fetchUsers } from "./redux/admin/adminSlice";
=======
import { fetchProfile, restoreSessionFromToken } from "./redux/auth/authSlice";
>>>>>>> bba5136de0ccd791eebf6942d13ab61497df7893

function App() {
  const dispatch = useDispatch();

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
