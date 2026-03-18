import { LogOut, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function DropDownMenu({ openMenu, setOpenMenu, handleLogout }) {
  if (!openMenu) return null;

  return (
    <div
      className="relative  mt-10 w-52 bg-white border rounded-xl shadow-lg py-2  z-[999]"
      onMouseLeave={() => setOpenMenu(false)}
    >
      <Link
        to="/user/profile"
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
      >
        <UserCircle className="w-4 h-4" />
        Xem thông tin cá nhân
      </Link>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-500"
      >
        <LogOut className="w-4 h-4" />
        Đăng xuất
      </button>
    </div>
  );
}
