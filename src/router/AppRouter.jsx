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
import PoliciesPage from "../pages/PoliciesPage";
import UserProfilePage from "../pages/UserProfilePage";
import PreOrderPage from "../pages/PreOrderPage";
import AdminDashBoard from "../pages/AdminDashBoard";
import ManagerDashboard from "../pages/ManagerDashboard";
import ManagerProductUpdatePage from "../pages/ManagerProductUpdatePage";
import ManagerWorkspacePage from "../pages/ManagerWorkspacePage";
import CustomGlassesPage from "../pages/CustomGlassesPage";
import VisionTestPage from "../pages/VisionTestPage";
import OrderTrackingPage from "../pages/OrderTrackingPage";
import StaffOrderIntakePage from "../pages/staff/StaffOrderIntakePage";
import StaffPrescriptionSupportPage from "../pages/staff/StaffPrescriptionSupportPage";
import StaffOperationsHandoffPage from "../pages/staff/StaffOperationsHandoffPage";
import StaffAfterSalesPage from "../pages/staff/StaffAfterSalesPage";
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";

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
              path="/policies"
              element={
                <PageWrapper>
                  <PoliciesPage />
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
            <Route path="/staff/orders-intake" element={<StaffOrderIntakePage />} />
            <Route
              path="/staff/prescription-support"
              element={<StaffPrescriptionSupportPage />}
            />
            <Route
              path="/staff/operations-handoff"
              element={<StaffOperationsHandoffPage />}
            />
            <Route path="/staff/after-sales" element={<StaffAfterSalesPage />} />

            {/* Admin Route */}
            <Route path="/admin/dashboard" element={<AdminDashBoard />}></Route>
          </Route>

          <Route
            path="/manager/dashboard"
            element={
              <>
                <Header />
                <PageWrapper>
                  <ManagerDashboard />
                </PageWrapper>
                <Footer />
              </>
            }
          ></Route>
          <Route
            path="/manager/workspace"
            element={
              <>
                <Header />
                <PageWrapper>
                  <ManagerWorkspacePage />
                </PageWrapper>
                <Footer />
              </>
            }
          ></Route>
          <Route
            path="/manager/products/new"
            element={
              <>
                <Header />
                <PageWrapper>
                  <ManagerProductUpdatePage />
                </PageWrapper>
                <Footer />
              </>
            }
          ></Route>
          <Route
            path="/manager/products/:id/edit"
            element={
              <>
                <Header />
                <PageWrapper>
                  <ManagerProductUpdatePage />
                </PageWrapper>
                <Footer />
              </>
            }
          ></Route>
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
