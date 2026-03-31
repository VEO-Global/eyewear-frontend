import { Boxes, ClipboardList, ShieldCheck, Truck } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { cn } from "../utils/format";

const navItems = [
  {
    to: "/operation",
    label: "Tổng quan",
    description: "Toàn cảnh khối lượng công việc",
    icon: Boxes,
    end: true,
  },
  {
    to: "/operation/orders",
    label: "Đơn hàng",
    description: "Danh sách và xử lý đơn",
    icon: ClipboardList,
  },
];

export function OperationsWorkspaceLayout() {
  const user = useSelector((state: any) => state.auth.user);

  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,#f3fbff_0%,#edf7fb_100%)]">
      <div className="mx-auto max-w-[1720px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <section className="rounded-[32px] border border-cyan-100 bg-[linear-gradient(180deg,#f8fdff_0%,#eff8ff_100%)] p-4 text-slate-900 shadow-[0_24px_60px_rgba(14,116,144,0.10)] sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
            <div className="rounded-[28px] border border-cyan-100 bg-white/90 p-5 shadow-[0_12px_30px_rgba(148,163,184,0.10)] xl:min-w-[360px] xl:max-w-[420px]">
              <div className="inline-flex rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <Truck className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">Vận hành</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Trung tâm điều phối</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Theo dõi và đẩy đơn hàng đúng quy trình cho đơn thường, đơn đặt trước và đơn có kính thuốc.
              </p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                <div className="rounded-[28px] border border-cyan-100 bg-white/90 p-4 shadow-[0_12px_30px_rgba(148,163,184,0.10)] lg:min-w-[280px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{user?.fullName || "Nhân viên vận hành"}</p>
                      <p className="truncate text-sm text-slate-500">{user?.email || "Chưa có email"}</p>
                    </div>
                  </div>
                </div>

                <nav className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            "flex items-start gap-3 rounded-[24px] border px-4 py-4 transition shadow-[0_10px_24px_rgba(148,163,184,0.08)]",
                            isActive
                              ? "border-cyan-200 bg-[linear-gradient(180deg,#ecfeff_0%,#dff7ff_100%)] text-slate-900"
                              : "border-slate-200 bg-white/90 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/70 hover:text-slate-900"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div
                              className={cn(
                                "mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl",
                                isActive ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-600"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{item.label}</p>
                              <p className={cn("mt-1 text-sm leading-6", isActive ? "text-cyan-800" : "text-slate-500")}>
                                {item.description}
                              </p>
                            </div>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </section>

        <main className="min-w-0 py-5 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
