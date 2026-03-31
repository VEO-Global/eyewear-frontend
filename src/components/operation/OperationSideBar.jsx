import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Clock, Glasses, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/auth/authSlice";
const { Sider } = Layout;
export default function OperationSideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const menuItems = [
    {
      key: "/operation",
      icon: <LayoutDashboard size={18} />,
      label: "Tổng quan",
    },
    {
      key: "/operation/orders",
      icon: <Package size={18} />,
      label: "Tất cả đơn hàng",
    },
    {
      key: "/operation/pre-orders",
      icon: <Clock size={18} />,
      label: "Đơn đạt trước",
    },
    {
      key: "/operation/prescription-orders",
      icon: <Glasses size={18} />,
      label: "Đơn có thuốc",
    },
  ];
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <Sider
      width={240}
      theme="dark"
      className="min-h-screen fixed left-0 top-0 bottom-0 z-10"
      style={{
        background: "#001529",
      }}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <Glasses className="text-blue-500 mr-2" size={24} />
        <span className="text-white text-lg font-bold tracking-wide">
          EyeCare Operation
        </span>
      </div>

      <div className="flex flex-col h-[calc(100vh-64px)] justify-between">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="mt-4 border-r-0"
          style={{
            background: "#001529",
          }}
        />

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </Sider>
  );
}
