import React from "react";
import { Search, ShoppingCart, Menu, X, Glasses, User } from "lucide-react";
import { Link } from "react-router-dom";
export function Header() {
  const navItems = [
    {
      label: "Trang chủ",
      href: "#",
    },
    {
      label: "Kính có sẵn",
      href: "#",
    },
    {
      label: "Đặt trước",
      href: "#",
    },
    {
      label: "Làm kính theo yêu cầu",
      href: "#",
    },
    {
      label: "Kiểm tra thị lực",
      href: "#",
    },
    {
      label: "Liên hệ",
      href: "#",
    },
  ];
  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-br  from-teal-50 via-white to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Glasses className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                EyeCare Store
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Tìm kính theo tên, mã, thương hiệu..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
              <User className="h-5 w-5" />
              <Link to={"/auth/login"} className="font-medium">
                Đăng nhập
              </Link>
            </div>
            <div className="relative p-2 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-5 w-5 bg-amber-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                2
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center  justify-between gap-8 py-3 border-t border-gray-100 border-none ">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xl font-sans font-medium text-gray-700   hover:text-teal-600 transition-colors relative group"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-3 h-0.5 bg-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
