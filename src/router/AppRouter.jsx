import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/Mainlayout";
import HomePages from "../pages/HomePages";
import LoginPage from "../pages/LoginPages";
import RegisterPages from "../pages/RegisterPages";
// import ProductsPage from '../pages/ProductsPage'
// import ProductDetailPage from '../pages/ProductDetailPage'
// import CartPage from '../pages/CartPage'
// import LoginPage from '../pages/LoginPage'
// import NotFound from '../pages/NotFound'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout chính */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePages />} />
          {/* <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} /> */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPages />} />
        </Route>

        {/* 404 */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
