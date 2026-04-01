import {
  ClipboardList,
  Clock3,
  Glasses,
  LayoutDashboard,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../utils/format";

const navItems = [
  {
    to: "/operation",
    label: "Tổng quan",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/operation/orders",
    label: "Tất cả đơn hàng",
    icon: ClipboardList,
  },
  {
    to: "/operation/orders?orderType=PRE_ORDER",
    label: "Đơn đặt trước",
    icon: Clock3,
  },
  {
    to: "/operation/orders?orderType=PRESCRIPTION",
    label: "Đơn có thuốc",
    icon: Glasses,
  },
];

export function OperationsWorkspaceLayout() {
  return (
    <div className="bg-[#eef0f3] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1880px] flex-col lg:flex-row">
        <aside className="w-full rounded-t-[28px] rounded-b-none bg-[#071b31] px-5 py-6 text-white shadow-[0_18px_40px_rgba(2,6,23,0.18)] lg:min-h-[calc(100vh-220px)] lg:w-[300px] lg:rounded-l-[28px] lg:rounded-r-none">
          <div className="flex items-center gap-3 border-b border-white/10 pb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d2a49] text-[#3b82f6]">
              <Glasses className="h-5 w-5" />
            </div>
            <p className="text-[15px] font-semibold">EyeCare Operation</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition",
                      isActive
                        ? "bg-[#2f7cf6] text-white shadow-[0_12px_24px_rgba(47,124,246,0.35)]"
                        : "text-slate-200 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 rounded-b-[28px] rounded-t-none bg-[#f6f7f9] px-4 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-6 lg:min-h-[calc(100vh-220px)] lg:rounded-l-none lg:rounded-r-[28px] lg:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
