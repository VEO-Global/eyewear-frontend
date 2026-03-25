import { LogOut, PackageSearch, UserCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { isStaffRole } from "../../utils/authRole";

export default function DropDownMenu({ openMenu, setOpenMenu, handleLogout }) {
  const { user } = useSelector((state) => state.auth);
  const staffOnly = isStaffRole(user?.role);

  if (!openMenu) return null;

  return (
    <div
      className="absolute right-0 z-50 mt-2 w-52 rounded-xl border bg-white py-2 shadow-lg"
      onMouseLeave={() => setOpenMenu(false)}
    >
      <Link
        to="/user/profile"
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
      >
        <UserCircle className="h-4 w-4" />
        Xem thông tin cá nhân
      </Link>

      {!staffOnly && (
        <Link
          to="/user/orders"
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
        >
          <PackageSearch className="h-4 w-4" />
          Theo dõi đơn hàng
        </Link>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </div>
  );
}
