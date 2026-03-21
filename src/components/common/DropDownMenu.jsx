import { LogOut, UserCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function DropDownMenu({ openMenu, setOpenMenu, handleLogout }) {
  const { user } = useSelector((state) => state.auth);

  if (!openMenu) return null;
  return (
    <div
      className="abs right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg py-2 z-50"
      onMouseLeave={() => setOpenMenu(false)}
    >
      <Link
        to={`/user/profile/${user.id}`}
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
      >
        <UserCircle className="w-4 h-4" />
        Xem thông tin cá nhân
      </Link>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Đăng xuất
      </button>
    </div>
  );
}
