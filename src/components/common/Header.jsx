/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingCart, Glasses, User, Bell, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "antd";
import { logout } from "../../redux/auth/authSlice";
import DropDownMenu from "./DropDownMenu";
import {
  markAllNotificationsAsRead,
  removeNotification,
} from "../../redux/notification/notificationSlice";
import { appToast } from "../../utils/appToast";

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
      label: "Kiểm tra thị lực sơ bộ",
      href: "/vision-test",
      requiresAuth: false,
    },
  ];

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { totalProduct } = useSelector((state) => state.cart);
  const { items: notifications } = useSelector((state) => state.notifications);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [dropDownMenu, setDropDownMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const recentNotifications = useMemo(() => notifications.slice(0, 10), [notifications]);

  function toogleDropDownMeni(curr) {
    setDropDownMenu(!curr);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    dispatch(logout());
    appToast.success("Đăng xuất thành công");
    navigate("/");
  }

  function handleNavigateItem(item) {
    if (item.requiresAuth && !isAuthenticated) {
      appToast.warning("Vui lòng đăng nhập để tiếp tục!");
      navigate("/auth/login");
      return;
    }

    navigate(item.href);
  }

  function handleCartClick() {
    if (!isAuthenticated) {
      appToast.warning("Vui lòng đăng nhập để tiếp tục!");
      navigate("/auth/login");
      return;
    }

    navigate("/user/cart");
  }

  function handleToggleNotifications() {
    setOpenNotifications((prev) => {
      const next = !prev;

      if (next) {
        dispatch(markAllNotificationsAsRead());
      }

      return next;
    });
  }

  function handleMarkAllAsRead() {
    dispatch(markAllNotificationsAsRead());
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpenNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function formatNotificationTime(createdAt) {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <header className="sticky top-0 z-[200] w-full bg-linear-to-br from-teal-50 via-white to-blue-50">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex shrink-0 items-center gap-2 cursor-pointer">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-teal-600 p-2">
                <Glasses className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                EyeCare Store
              </span>
            </Link>
          </div>

          <div className="mx-8 hidden max-w-lg flex-1 lg:flex">
            <div className="group relative w-full">
              <input
                type="text"
                placeholder="Tìm kính theo tên, mã, thương hiệu..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 outline-none transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200"
              />
              <Search className="absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-teal-500" />
            </div>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-teal-600">
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
                      {user.role === "CUSTOMER" ? "Khách hàng" : "Quản trị viên"}
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

            <div className="relative z-[220]" ref={notificationRef}>
              <Tooltip title="Thông báo">
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className="relative cursor-pointer rounded-full p-2 text-gray-600 transition-colors hover:bg-white hover:text-teal-600"
                >
                  <Bell className="h-6 w-6" />

                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-teal-600 px-1 text-[11px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </Tooltip>

              {openNotifications && (
                <div
                  className="absolute right-0 top-full z-[300] mt-4 w-[390px] overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50 via-white to-sky-50 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Thông báo
                          </h3>
                          {unreadCount > 0 && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Mới đây và chỉ lưu trong 30 ngày
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50"
                      >
                        Đánh dấu đã đọc
                      </button>
                    </div>
                  </div>

                  {recentNotifications.length === 0 ? (
                    <div className="px-5 py-8 text-sm text-slate-500">
                      Chưa có thông báo nào.
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto bg-white">
                      <div className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Mới đây
                      </div>

                      {recentNotifications.map((item) => (
                        <div
                          key={item.id}
                          className={`mx-3 mb-2 flex gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                            item.read
                              ? "border-slate-100 bg-white"
                              : "border-teal-100 bg-teal-50/60"
                          }`}
                        >
                          <div
                            className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                              item.read
                                ? "bg-slate-300"
                                : item.type === "success"
                                  ? "bg-emerald-500"
                                  : item.type === "error"
                                    ? "bg-red-500"
                                    : item.type === "warning"
                                      ? "bg-amber-500"
                                      : "bg-sky-500"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-slate-800">
                              {item.message}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {formatNotificationTime(item.createdAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dispatch(removeNotification(item.id))}
                            className="mt-0.5 text-slate-400 transition-colors hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Tooltip
              title="Xem tất cả sản phẩm trong giỏ hàng"
              onClick={handleCartClick}
            >
              <div className="relative cursor-pointer p-2 text-gray-600 transition-colors hover:text-teal-600">
                <ShoppingCart className="h-6 w-6" />

                {isAuthenticated && totalProduct > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-xs font-bold text-white">
                    {totalProduct}
                  </span>
                )}
              </div>
            </Tooltip>
          </div>
        </div>

        <nav className="hidden items-center justify-between gap-8 py-3 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigateItem(item)}
              className="group relative cursor-pointer font-sans text-3xl font-medium text-gray-700 transition-colors hover:text-teal-600"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-3 h-0.5 origin-left scale-x-0 bg-teal-600 transition-transform duration-200 group-hover:scale-x-100" />
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
