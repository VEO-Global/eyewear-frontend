import { LogOut, PackageSearch, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function DropDownMenu({ openMenu, setOpenMenu, handleLogout }) {
  if (!openMenu) return null;

  return (
    <div
      className="relative mt-10 w-52 rounded-xl border bg-white py-2 shadow-lg z-[999]"
      onMouseLeave={() => setOpenMenu(false)}
    >
      <Link
        to="/user/profile"
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
      >
        <UserCircle className="h-4 w-4" />
        Xem thông tin cá nhân
      </Link>

      <Link
        to="/user/orders"
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
      >
        <PackageSearch className="h-4 w-4" />
        Theo dõi đơn hàng
      </Link>

      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </div>
  );
}
