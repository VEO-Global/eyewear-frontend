import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { staffTaskItems } from "../../utils/staffTasks";

function StaffStatCard({ label, value, hint }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p>
    </div>
  );
}

function StaffQuickNav({ currentPath }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white/90 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-500">
            Điều hướng nghiệp vụ
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            4 không gian làm việc cho Sales Staff
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
          <Clock3 size={14} />
          Giữ nguyên header và footer toàn site
        </div>
      </div>

      <div className="mt-6 grid gap-y-6 gap-x-5 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-8">
        {staffTaskItems.map((item, index) => {
          const isActive = currentPath === item.href;

          return (
            <Link
              key={item.id}
              to={item.href}
              className={`group block rounded-[24px] border px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition ${
                isActive
                  ? "border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-[0_16px_40px_rgba(13,148,136,0.12)]"
                  : "border-slate-200 bg-slate-50/80 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    isActive ? "bg-teal-600 text-white" : "bg-white text-slate-500"
                  }`}
                >
                  0{index + 1}
                </span>
                <ArrowRight
                  size={16}
                  className={isActive ? "text-teal-600" : "text-slate-300 transition group-hover:text-slate-500"}
                />
              </div>

              <h3 className="mt-3 text-base font-semibold leading-6 text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function StaffWorkspaceLayout({
  eyebrow,
  title,
  description,
  stats,
  currentPath,
  leftColumn,
  rightColumn,
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="bg-[linear-gradient(135deg,#ccfbf1_0%,#f8fafc_35%,#dbeafe_100%)] px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/75 px-4 py-2 text-sm font-semibold text-teal-700">
                  <Sparkles size={16} />
                  {eyebrow}
                </div>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  {description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[560px]">
                {stats.map((item) => (
                  <StaffStatCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    hint={item.hint}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <StaffQuickNav currentPath={currentPath} />

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">{leftColumn}</div>
          <div className="space-y-6">{rightColumn}</div>
        </section>
      </div>
    </div>
  );
}
