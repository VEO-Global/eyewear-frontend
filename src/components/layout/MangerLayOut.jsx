import { Outlet } from "react-router-dom";
import { ManagerSidebar } from "../manager/ManagerSideBar";
import {
  BarChart3Icon,
  FileTextIcon,
  GiftIcon,
  PackageIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import ManagerHeader from "../manager/ManagerHeader";

function ManagerLayout() {
  const navItems = [
    { id: "revenue", label: "Tổng quan doanh thu", icon: BarChart3Icon },
    { id: "products", label: "Sản phẩm tồn kho", icon: PackageIcon },
    { id: "pricing", label: "Giá & Combo", icon: TagIcon },
    { id: "promotions", label: "Chương trình khuyến mãi", icon: GiftIcon },
    { id: "policies", label: "Chính sách", icon: FileTextIcon },
    { id: "users", label: "Người dùng", icon: UsersIcon },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <ManagerSidebar navItems={navItems} />

      {/* Right side (Header + Content) */}
      <div className="flex-1 flex flex-col">
        {/* Header */}

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ManagerLayout;
