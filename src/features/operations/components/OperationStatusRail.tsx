import type { OperationStatus } from "../types";
import { OPERATION_STATUS_OPTIONS } from "../utils/constants";
import { cn } from "../utils/format";
import { SurfaceCard } from "./OperationPrimitives";

export function OperationStatusRail({
  value,
  onChange,
}: {
  value: OperationStatus | "" | string;
  onChange: (value: OperationStatus | "") => void;
}) {
  return (
    <SurfaceCard className="border-slate-200/80 p-4">
      <p className="text-sm font-semibold text-slate-900">Trạng thái xử lý</p>
      <div className="mt-4 space-y-2">
        {OPERATION_STATUS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value || "all"}
              type="button"
              onClick={() => onChange(option.value as OperationStatus | "")}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                active
                  ? "bg-slate-950 !text-white shadow-lg ring-1 ring-cyan-400/30"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <span className={cn("transition", active ? "!text-white" : "text-inherit")}>{option.label}</span>
              {active ? <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> : null}
            </button>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
