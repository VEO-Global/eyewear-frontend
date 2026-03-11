import { User, ShoppingCart, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function DesktopActions({
  isAuthenticated,
  user,
  handleLogout,
}) {
  const [openMenu, setOpenMenu] = useState(false);

  const handleViewDropDown = () => {
    setOpenMenu((prev) => !prev);
  };
  return (
    <div className="hidden lg:flex items-center gap-4 relative">
      {/* USER DROPDOWN */}
      <div className="relative" onClick={handleViewDropDown}>
        <div className="flex items-center gap-2 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
          <User className="h-5 w-5" />

          {isAuthenticated ? (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">
                Xin chào, {user.fullName}
              </span>
              <span className="text-xs text-gray-500">
                {user.role === "CUSTOMER" ? "Khách hàng" : "Quản trị viên"}
              </span>
            </div>
          ) : (
            <Link to="/auth/login" className="text-sm font-medium">
              Đăng nhập
            </Link>
          )}
        </div>

        {/* DROPDOWN MENU */}
        {isAuthenticated && openMenu && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg py-2 z-50 animate-fadeIn"
            onMouseLeave={() => setOpenMenu(false)}
          >
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <UserCircle className="w-4 h-4" />
              Xem thông tin
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <ShoppingCart className="w-4 h-4" />
              Giỏ hàng
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      {/* CART ICON */}
      <Link
        to="/cart"
        className="relative p-2 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors"
      >
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute top-0 right-0 h-5 w-5 bg-amber-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
          2
        </span>
      </Link>
    </div>
  );
}
