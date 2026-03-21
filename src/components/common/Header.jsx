/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Glasses,
  User,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../../redux/auth/authSlice";
import { Button, Tooltip } from "antd";
import DropDownMenu from "./DropDownMenu";

export function Header() {
  const navItems = [
    {
      label: "Đặt trước",
      href: "/user/preorder",
      requiresAuth: true,
    },
    {
      label: "Làm kính theo yêu cầu",
      href: "/custom-glasses",
      requiresAuth: false,
    },
    {
      label: "Kiểm tra thị lực",
      href: "/vision-test",
      requiresAuth: false,
    },
  ];

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { totalProduct } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [dropDownMenu, setDropDownMenu] = useState(false);

  function toogleDropDownMeni(curr) {
    setDropDownMenu(!curr);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    dispatch(logout());
    toast.success("Đăng xuất thành công");
    navigate("/");
  }

  function handleNavigateItem(item) {
    if (item.requiresAuth && !isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để tiếp tục!");
      navigate("/auth/login");
      return;
    }

    navigate(item.href);
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-br from-teal-50 via-white to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          <div className="shrink-0 flex items-center gap-2 cursor-pointer">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Glasses className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                EyeCare Store
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Tìm kính theo tên, mã, thương hiệu..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
              <User className="h-5 w-5" />

              {isAuthenticated ? (
                <div className="relative">
                  <div
                    className="flex flex-col leading-tight"
                    onClick={() => toogleDropDownMeni(dropDownMenu)}
                  >
                    <span className="text-sm font-medium">
                      Xin chào, {user.fullName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.role === "CUSTOMER"
                        ? "Khách hàng"
                        : "Quản trị viên"}
                    </span>
                    <DropDownMenu
                      openMenu={dropDownMenu}
                      setOpenMenu={setDropDownMenu}
                      handleLogout={handleLogout}
                    />
                  </div>
                </div>
              ) : (
                <Link to="/auth/login" className="text-sm font-medium">
                  Đăng nhập
                </Link>
              )}
            </div>

            {user?.role === "CUSTOMER" && (
              <Tooltip
                title="Xem tất cả sản phẩm trong giỏ hàng"
                onClick={() => navigate("/user/cart")}
              >
                <div className="relative p-2 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors">
                  <ShoppingCart className="h-6 w-6" />

                  {totalProduct > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-amber-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {totalProduct}
                    </span>
                  )}
                </div>
              </Tooltip>
            )}

            {user?.role === "ADMIN" && (
              <Button
                icon={<LayoutDashboard />}
                onClick={() => navigate("/admin/dashboard")}
              >
                Tổng quan
              </Button>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center justify-between gap-8 py-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigateItem(item)}
              className="text-3xl font-sans font-medium text-gray-700 hover:text-teal-600 transition-colors relative group cursor-pointer"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-3 h-0.5 bg-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
