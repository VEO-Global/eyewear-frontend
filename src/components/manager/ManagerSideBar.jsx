import React from "react";
import { GlassesIcon, XIcon, LogOutIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const ManagerSidebar = ({ isOpen, setIsOpen, navItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-gray-300 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 bg-gray-950 text-white">
          <GlassesIcon className="w-8 h-8 text-amber-500 mr-3" />
          <span className="text-xl font-bold tracking-wide">Quản Lý</span>

          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive = location.pathname.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                  navigate(`/manager/${item.id}`);
                }}
                className={`
                  w-full flex items-center px-3 py-3 rounded-lg transition-colors duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-blue-500 text-white font-medium shadow-md"
                      : "hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-4 px-2">Phiên bản 1.0.0</div>

          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <LogOutIcon className="w-4 h-4 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};
