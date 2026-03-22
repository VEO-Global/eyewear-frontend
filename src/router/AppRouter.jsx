/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import MainLayout from "../components/layout/Mainlayout";
import HomePages from "../pages/HomePages";
import LoginPage from "../pages/LoginPages";
import RegisterPages from "../pages/RegisterPages";
import StorePage from "../pages/StorePage";
import ProductDetail from "../pages/ProductDetail";
import { Scroll } from "lucide-react";
import ScrollToTop from "../components/common/ScrollToTop";
import CartPage from "../pages/CartPage";
import PaymentPage from "../pages/PaymentPage";
import UserProfilePage from "../pages/UserProfilePage";
import PreOrderPage from "../pages/PreOrderPage";
import AdminDashBoard from "../pages/AdminDashBoard";
import CustomGlassesPage from "../pages/CustomGlassesPage";
import VisionTestPage from "../pages/VisionTestPage";
import OrderTrackingPage from "../pages/OrderTrackingPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="sync">
        <ScrollToTop />
        <Routes location={location} key={location.pathname}>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <HomePages />
                </PageWrapper>
              }
            />
            <Route
              path="/products"
              element={
                <PageWrapper>
                  <StorePage />
                </PageWrapper>
              }
            />

            <Route
              path="/products/:id"
              element={
                <PageWrapper>
                  <ProductDetail />
                </PageWrapper>
              }
            />
            <Route
              path="/auth/login"
              element={
                <PageWrapper>
                  <LoginPage />
                </PageWrapper>
              }
            />
            <Route
              path="/auth/register"
              element={
                <PageWrapper>
                  <RegisterPages />
                </PageWrapper>
              }
            />

            {/* User Route */}
            <Route path="/user/profile" element={<UserProfilePage />}></Route>
            <Route path="/user/orders" element={<OrderTrackingPage />}></Route>
            <Route path="/user/cart" element={<CartPage />}></Route>
            <Route path="/user/cart/payment" element={<PaymentPage />}></Route>
            <Route path="/user/preorder" element={<PreOrderPage />} />
            <Route path="/custom-glasses" element={<CustomGlassesPage />} />
            <Route path="/vision-test" element={<VisionTestPage />} />

            {/* Admin Route */}
            <Route path="/admin/dashboard" element={<AdminDashBoard />}></Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
