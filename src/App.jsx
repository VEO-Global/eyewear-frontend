import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "./router/AppRouter";

import { fetchProfile } from "./redux/auth/authSlice";
import { fetchProducts } from "./redux/products/producSlice";
import { fetchAllCategories } from "./redux/category/categorySlice";
import { fetchUsers } from "./redux/admin/adminSlice";
import { fetchProvinces } from "./redux/location/locationSlice";
import { fetchAllLens } from "./redux/lens/lensSlice";
import { getMyCart } from "./redux/cart/cartSlice";
import { getMyOrder } from "./redux/order/orderSlice";
import {
  getAllManufacturingOrder,
  // updateToManufacturing,
} from "./redux/operation/operationSlice";
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchProfile()).then((res) => {
        const role = res.payload?.role;
        console.log(role);
        if (role === "ADMIN") {
          dispatch(fetchUsers());
        }
        if (role === "OPERATIONS") {
          dispatch(getAllManufacturingOrder());
          // dispatch(updateToManufacturing(5));
        }

        if (role === "CUSTOMER") {
          dispatch(getMyOrder());
        }
      });
    }

    dispatch(fetchProducts());
    dispatch(fetchAllCategories());
    dispatch(fetchProvinces());
    dispatch(fetchAllLens());
    dispatch(getMyCart());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <AppRouter />
    </div>
  );
}

export default App;
