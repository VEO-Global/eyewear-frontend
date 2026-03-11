import { useDispatch } from "react-redux";
import AppRouter from "./router/AppRouter";
import { useEffect } from "react";
import { fetchProducts } from "./redux/products/producSlice";
import { fetchProfile } from "./redux/auth/authSlice";

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  if (token) {
    dispatch(fetchProfile());
  }
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <AppRouter />
    </div>
  );
}

export default App;
