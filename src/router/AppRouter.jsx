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
import ManagerDashboard from "../pages/Manager/ManagerDashboardRevenue";
import ManagerLayout from "../components/layout/MangerLayOut";
import ManagerDashboardRevenue from "../pages/Manager/ManagerDashboardRevenue";
import ManagerProductPage from "../pages/Manager/ManagerProductPage";
import ManagerPromotionPage from "../pages/Manager/ManagerPromotionsPage";
import PolicyTable from "../pages/Manager/ManagerPolicesPage";
import UsersTable from "../components/adminDashBorad/UsersTable";

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
            <Route
              path="/user/profile/:id"
              element={<UserProfilePage />}
            ></Route>
            <Route path="/user/cart" element={<CartPage />}></Route>
            <Route path="/user/cart/payment" element={<PaymentPage />}></Route>
            <Route path="/user/preorder" element={<PreOrderPage />} />

            {/* Admin Route */}
            <Route path="/admin/dashboard" element={<AdminDashBoard />}></Route>

            {/* Manager Route */}
            <Route path="/manager" element={<ManagerLayout />}>
              {/* default */}
              <Route index element={<ManagerDashboardRevenue />} />

              {/* các page */}
              <Route path="revenue" element={<ManagerDashboardRevenue />} />
              <Route path="products" element={<ManagerProductPage />} />
              {/* <Route path="pricing" element={<ManagerPromotionPage />} /> */}
              <Route path="promotions" element={<ManagerPromotionPage />} />
              <Route path="policies" element={<PolicyTable />} />
              <Route path="users" element={<UsersTable />} />
            </Route>
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
