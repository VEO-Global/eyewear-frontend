import { Sparkles } from "lucide-react";

function StaffStatCard({ label, value, hint }) {
  return (
    <div className="rounded-[22px] border border-white/80 bg-white/90 px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      </div>
      {hint ? <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function StaffWorkspaceLayout({
  eyebrow,
  title,
  description,
  stats,
  leftColumn,
  rightColumn,
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="bg-[linear-gradient(135deg,#ccfbf1_0%,#f8fafc_35%,#dbeafe_100%)] px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
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

              {stats.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
                  {stats.map((item) => (
                    <StaffStatCard
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      hint={item.hint}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">{leftColumn}</div>
          <div className="space-y-6">{rightColumn}</div>
        </section>
      </div>
    </div>
  );
}
