import { BriefcaseBusiness } from "lucide-react";

export default function ManagerDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f4f8fc_48%,#eef6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="bg-[linear-gradient(135deg,#ccfbf1_0%,#fff7ed_24%,#f8fafc_52%,#dbeafe_100%)] px-6 py-8 sm:px-8 sm:py-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-semibold text-teal-700">
                <BriefcaseBusiness size={16} />
                Không gian làm việc của quản lý
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Bảng điều khiển quản lý
              </h1>           
            </div>
          </div>
        </section>

        <section>{children}</section>
      </div>
    </div>
  );
}
