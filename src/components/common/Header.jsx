import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingCart, Glasses, User, Bell, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "antd";
import { logout } from "../../redux/auth/authSlice";
import { fetchProducts } from "../../redux/products/producSlice";
import DropDownMenu from "./DropDownMenu";
import {
  markAllNotificationsAsRead,
  removeNotification,
} from "../../redux/notification/notificationSlice";
import { appToast } from "../../utils/appToast";
import { getRoleDisplayLabel, isStaffRole } from "../../utils/authRole";
import { staffTaskItems as sharedStaffTaskItems } from "../../utils/staffTasks";
import { ORDER_PHASE } from "../../utils/orderHistory";
import { readStaffIntakeOrders, readStaffOrdersByPhase } from "../../utils/staffOrders";

function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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

  const featureSearchItems = [
    {
      id: "feature-home",
      type: "feature",
      title: "Trang chủ",
      description: "Khám phá EyeCare Store",
      href: "/",
      keywords: ["home", "trang chủ", "eyecare", "cửa hàng"],
      requiresAuth: false,
    },
    {
      id: "feature-products",
      type: "feature",
      title: "Tất cả sản phẩm",
      description: "Xem toàn bộ kính đang bán",
      href: "/products",
      keywords: ["sản phẩm", "kính", "cửa hàng", "store", "danh sách sản phẩm"],
      requiresAuth: false,
    },
    {
      id: "feature-preorder",
      type: "feature",
      title: "Đặt trước",
      description: "Giữ chỗ sản phẩm mới",
      href: "/user/preorder",
      keywords: ["đặt trước", "preorder", "giữ chỗ", "sản phẩm mới"],
      requiresAuth: true,
    },
    {
      id: "feature-orders",
      type: "feature",
      title: "Theo dõi đơn hàng",
      description: "Xem trạng thái đơn mua của bạn",
      href: "/user/orders",
      keywords: ["theo dõi đơn hàng", "đơn hàng", "order", "vận chuyển", "giao hàng"],
      requiresAuth: true,
    },
    {
      id: "feature-profile",
      type: "feature",
      title: "Hồ sơ cá nhân",
      description: "Quản lý thông tin tài khoản",
      href: "/user/profile",
      keywords: ["hồ sơ", "profile", "tài khoản", "thông tin cá nhân"],
      requiresAuth: true,
    },
    {
      id: "feature-cart",
      type: "feature",
      title: "Giỏ hàng",
      description: "Xem sản phẩm đã thêm vào giỏ",
      href: "/user/cart",
      keywords: ["giỏ hàng", "cart", "thanh toán", "mua hàng"],
      requiresAuth: true,
    },
    {
      id: "feature-custom",
      type: "feature",
      title: "Làm kính theo yêu cầu",
      description: "Tùy chỉnh mẫu kính theo nhu cầu",
      href: "/custom-glasses",
      keywords: ["làm kính theo yêu cầu", "kính custom", "custom glasses"],
      requiresAuth: false,
    },
    {
      id: "feature-vision",
      type: "feature",
      title: "Kiểm tra thị lực sơ bộ",
      description: "Thử công cụ kiểm tra mắt nhanh",
      href: "/vision-test",
      keywords: ["kiểm tra thị lực", "thị lực", "mắt", "vision test"],
      requiresAuth: false,
    },
    {
      id: "feature-login",
      type: "feature",
      title: "Đăng nhập",
      description: "Vào tài khoản EyeCare",
      href: "/auth/login",
      keywords: ["đăng nhập", "login", "sign in"],
      requiresAuth: false,
    },
  ];

  const orderTabs = [
    { label: "Tất cả", value: "tat-ca" },
    { label: "Chờ gia công", value: "cho-gia-cong" },
    { label: "Vận chuyển", value: "van-chuyen" },
    { label: "Chờ giao hàng", value: "cho-giao-hang" },
    { label: "Hoàn thành", value: "hoan-thanh" },
    { label: "Đã hủy", value: "da-huy" },
    { label: "Trả hàng/Hoàn tiền", value: "tra-hang-hoan-tien" },
  ];

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { totalProduct } = useSelector((state) => state.cart);
  const { items: notifications } = useSelector((state) => state.notifications);
  const { products } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [dropDownMenu, setDropDownMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [staffTaskCounts, setStaffTaskCounts] = useState(() => ({
    "order-intake": readStaffIntakeOrders().length,
    "prescription-support": readStaffOrdersByPhase(ORDER_PHASE.PRESCRIPTION_REVIEW).length,
    "operations-handoff": readStaffOrdersByPhase(ORDER_PHASE.PROCESSING).length,
    "after-sales": 0,
  }));
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const recentNotifications = useMemo(() => notifications.slice(0, 10), [notifications]);
  const isOrderTrackingPage = location.pathname === "/user/orders";
  const activeOrderTab = new URLSearchParams(location.search).get("tab") || "tat-ca";
  const staffOnly = isStaffRole(user?.role);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const productSearchItems = useMemo(
    () =>
      products.map((product) => ({
        id: `product-${product.id}`,
        type: "product",
        title: product.name,
        description: `${product.brand || "EyeCare"}${
          product.description ? ` • ${product.description}` : ""
        }`,
        href: `/products/${product.id}`,
        requiresAuth: false,
        rawSearch: `${product.name} ${product.brand || ""} ${product.description || ""} ${
          product.id
        }`.trim(),
      })),
    [products]
  );

  const searchResults = useMemo(() => {
    const normalizedKeyword = normalizeSearchValue(searchKeyword);
    const allItems = [
      ...featureSearchItems.map((item) => ({
        ...item,
        rawSearch: `${item.title} ${item.description} ${(item.keywords || []).join(" ")}`,
      })),
      ...productSearchItems,
    ];

    if (!normalizedKeyword) {
      return allItems.slice(0, 6);
    }

    return allItems
      .filter((item) => normalizeSearchValue(item.rawSearch).includes(normalizedKeyword))
      .slice(0, 8);
  }, [productSearchItems, searchKeyword]);

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

  function handleOrderTabClick(tabValue) {
    navigate(`/user/orders?tab=${tabValue}`);
  }

  function handleStaffTaskNavigate(href) {
    navigate(href);
  }

  function handleSearchSubmit(event) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (!searchResults.length) {
      return;
    }

    handleSearchSelect(searchResults[0]);
  }

  function handleSearchSelect(item) {
    handleNavigateItem(item);
    setSearchKeyword("");
    setIsSearchFocused(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!staffOnly) {
      return undefined;
    }

    function syncStaffTaskCounts() {
      setStaffTaskCounts({
        "order-intake": readStaffIntakeOrders().length,
        "prescription-support": readStaffOrdersByPhase(ORDER_PHASE.PRESCRIPTION_REVIEW).length,
        "operations-handoff": readStaffOrdersByPhase(ORDER_PHASE.PROCESSING).length,
        "after-sales": 0,
      });
    }

    syncStaffTaskCounts();

    const intervalId = window.setInterval(syncStaffTaskCounts, 1500);

    function handleStorage(event) {
      if (!event.key || event.key.startsWith("order-history:")) {
        syncStaffTaskCounts();
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
    };
  }, [staffOnly]);

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
          <div className="flex shrink-0 cursor-pointer items-center gap-2">
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
            <div className="group relative w-full" ref={searchRef}>
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchSubmit}
                placeholder="Tìm sản phẩm, chức năng, đơn hàng..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 outline-none transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200"
              />
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-teal-500" />

              {isSearchFocused && (
                <div className="absolute left-0 right-0 top-full z-[260] mt-3 overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Tìm kiếm toàn cục
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Gõ tên sản phẩm hoặc chức năng như “theo dõi đơn hàng”, “giỏ hàng”, “đặt trước”.
                    </p>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="max-h-[420px] overflow-y-auto p-2">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSearchSelect(item)}
                          className="flex w-full items-start justify-between gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {item.description}
                            </p>
                          </div>

                          <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {item.type === "product" ? "Sản phẩm" : "Chức năng"}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-8 text-sm text-slate-500">
                      Không tìm thấy kết quả phù hợp.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-teal-600">
              <User className="h-5 w-5" />

              {isAuthenticated ? (
                <div className="relative">
                  <div className="flex flex-col leading-tight" onClick={() => toogleDropDownMeni(dropDownMenu)}>
                    <span className="text-sm font-medium">Xin chào, {user.fullName}</span>
                    <span className="text-xs text-gray-500">{getRoleDisplayLabel(user.role)}</span>
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
                    <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-teal-600 px-1 text-[11px] font-bold text-white shadow-sm">
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
                          <h3 className="text-lg font-semibold text-slate-900">Thông báo</h3>
                          {unreadCount > 0 && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Mới đây và chỉ lưu trong 30 ngày</p>
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
                    <div className="px-5 py-8 text-sm text-slate-500">Chưa có thông báo nào.</div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto bg-white">
                      <div className="px-5 pb-2 pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Mới đây
                      </div>

                      {recentNotifications.map((item) => (
                        <div
                          key={item.id}
                          className={`mx-3 mb-2 flex gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                            item.read ? "border-slate-100 bg-white" : "border-teal-100 bg-teal-50/60"
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

            {!staffOnly && (
              <Tooltip title="Xem tất cả sản phẩm trong giỏ hàng" onClick={handleCartClick}>
                <div className="relative cursor-pointer p-2 text-gray-600 transition-colors hover:text-teal-600">
                  <ShoppingCart className="h-6 w-6" />

                  {isAuthenticated && totalProduct > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-xs font-bold text-white">
                      {totalProduct}
                    </span>
                  )}
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        {isOrderTrackingPage && (
          <div className="pb-3 pt-2">
            <div className="overflow-hidden rounded-[24px] border border-sky-100 bg-white shadow-[0_14px_30px_rgba(14,116,144,0.10)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
                {orderTabs.map((tab) => {
                  const isActive = activeOrderTab === tab.value;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => handleOrderTabClick(tab.value)}
                      className={`whitespace-nowrap border-b-2 px-3 py-4 text-center text-sm font-medium transition sm:px-4 sm:text-base ${
                        isActive
                          ? "border-teal-500 bg-gradient-to-b from-cyan-50 to-white text-teal-600"
                          : "border-transparent text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isOrderTrackingPage && !staffOnly && (
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
        )}

        {!isOrderTrackingPage && staffOnly && (
          <nav className="hidden items-center justify-between gap-8 py-3 lg:flex">
            {sharedStaffTaskItems.map((item) => {
              const isActive = location.pathname === item.href;
              const taskCount = staffTaskCounts[item.id] || 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleStaffTaskNavigate(item.href)}
                  className={`group relative cursor-pointer text-3xl font-medium transition-colors ${
                    isActive ? "text-teal-600" : "text-gray-700 hover:text-teal-600"
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span>{item.shortLabel || item.title}</span>
                    {taskCount > 0 ? (
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-rose-500 px-2 text-sm font-bold text-white shadow-sm">
                        {taskCount}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`absolute inset-x-0 -bottom-3 h-0.5 origin-left bg-teal-600 transition-transform duration-200 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
