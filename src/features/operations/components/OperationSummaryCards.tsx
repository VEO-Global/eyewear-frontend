import { ArrowRight, Boxes, CheckCircle2, ClipboardList, Cog, Package, RefreshCw, Truck } from "lucide-react";
import type { OperationOrderFilters, OperationSummaryResponse } from "../types";
import { OPERATION_SUMMARY_CARDS } from "../utils/constants";
import { cn } from "../utils/format";
import { ActionButton, SkeletonBlock, SurfaceCard } from "./OperationPrimitives";

const icons = [ClipboardList, Boxes, Cog, Package, Truck, Truck, CheckCircle2, ClipboardList, Cog, Boxes];
const accentStyles: Record<string, string> = {
  sky: "from-sky-500/15 to-sky-100 text-sky-700 ring-sky-200",
  amber: "from-amber-500/15 to-amber-100 text-amber-700 ring-amber-200",
  violet: "from-violet-500/15 to-violet-100 text-violet-700 ring-violet-200",
  orange: "from-orange-500/15 to-orange-100 text-orange-700 ring-orange-200",
  cyan: "from-cyan-500/15 to-cyan-100 text-cyan-700 ring-cyan-200",
  blue: "from-blue-500/15 to-blue-100 text-blue-700 ring-blue-200",
  emerald: "from-emerald-500/15 to-emerald-100 text-emerald-700 ring-emerald-200",
  slate: "from-slate-500/15 to-slate-100 text-slate-700 ring-slate-200",
  fuchsia: "from-fuchsia-500/15 to-fuchsia-100 text-fuchsia-700 ring-fuchsia-200",
  rose: "from-rose-500/15 to-rose-100 text-rose-700 ring-rose-200",
};

export function OperationSummaryCards({
  summary,
  activeFilters,
  loading,
  onSelect,
  onRefresh,
  refreshing,
}: {
  summary?: OperationSummaryResponse;
  activeFilters: OperationOrderFilters;
  loading?: boolean;
  onSelect: (filters: OperationOrderFilters) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}) {
  return (
    <SurfaceCard className="overflow-hidden border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(255,255,255,0.96)_100%)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Trung tâm điều phối</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Toàn cảnh khối lượng công việc</h2>
          <p className="mt-2 text-sm text-slate-500">Bấm vào từng thẻ để lọc ngay danh sách và theo dõi điểm nghẽn trong quy trình.</p>
        </div>
        <ActionButton variant="secondary" onClick={onRefresh} loading={refreshing}>
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </ActionButton>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-32 rounded-[26px]" />
            ))
          : OPERATION_SUMMARY_CARDS.map((card, index) => {
              const Icon = icons[index];
              const isActive =
                (card.status && activeFilters.status === card.status) ||
                (card.orderType && activeFilters.orderType === card.orderType) ||
                (!card.status &&
                  !card.orderType &&
                  !activeFilters.status &&
                  !activeFilters.orderType);

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() =>
                    onSelect({
                      status: (card.status as OperationOrderFilters["status"]) || "",
                      orderType: (card.orderType as OperationOrderFilters["orderType"]) || "",
                      keyword: activeFilters.keyword || "",
                    })
                  }
                  className={cn(
                    "group rounded-[26px] border border-white/70 bg-white/85 p-4 text-left transition hover:-translate-y-1 hover:shadow-xl",
                    isActive ? "ring-2 ring-slate-900/80 shadow-lg" : "hover:ring-2 hover:ring-slate-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
                        accentStyles[card.accent]
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {summary?.[card.key as keyof OperationSummaryResponse] ?? 0}
                  </p>
                </button>
              );
            })}
      </div>
    </SurfaceCard>
  );
}
