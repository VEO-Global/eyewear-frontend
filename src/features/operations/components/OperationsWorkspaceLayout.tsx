import {
  ClipboardList,
  Clock3,
  Glasses,
  LayoutDashboard,
  Package,
  Truck,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "../utils/format";

const navItems = [
  {
    to: "/operation/orders",
    label: "Tất cả trạng thái",
    icon: LayoutDashboard,
    status: "",
  },
  {
    to: "/operation/orders?status=MANUFACTURING",
    label: "Đang gia công",
    icon: Package,
    status: "MANUFACTURING",
  },
  {
    to: "/operation/orders?status=PACKING",
    label: "Đang đóng gói",
    icon: ClipboardList,
    status: "PACKING",
  },
  {
    to: "/operation/orders?status=READY_TO_SHIP",
    label: "Sẵn sàng giao",
    icon: Clock3,
    status: "READY_TO_SHIP",
  },
  {
    to: "/operation/orders?status=SHIPPING",
    label: "Đang vận chuyển",
    icon: Truck,
    status: "SHIPPING",
  },
  {
    to: "/operation/orders?status=COMPLETED",
    label: "Hoàn tất",
    icon: Glasses,
    status: "COMPLETED",
  },
];

export function OperationsWorkspaceLayout() {
  const location = useLocation();
  const activeStatus = new URLSearchParams(location.search).get("status") || "";
  const isOrdersPage = location.pathname === "/operation/orders";

  return (
    <div className="bg-[#eef0f3] px-2 py-3 text-slate-900 sm:px-3 lg:px-4 lg:py-4">
      <div className="flex min-h-[calc(100vh-120px)] flex-col gap-3 lg:flex-row">
        <aside className="w-full rounded-[24px] border border-slate-200/90 bg-white px-4 py-5 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-4 lg:min-h-[calc(100vh-152px)] lg:w-[248px] lg:flex-shrink-0">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Glasses className="h-5 w-5" />
            </div>
            <p className="text-[15px] font-semibold">EyeCare Operation</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isOrdersPage && activeStatus === item.status;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition",
                      isActive
                        ? "bg-[linear-gradient(135deg,#38bdf8_0%,#2563eb_100%)] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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

        <main className="min-w-0 flex-1 rounded-[24px] bg-[#f6f7f9] px-4 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-5 lg:min-h-[calc(100vh-152px)] lg:px-7 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
