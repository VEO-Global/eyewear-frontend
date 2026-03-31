import type { OperationOrderType, OperationStatus } from "../types";
import {
  OPERATION_ORDER_TYPE_LABELS,
  OPERATION_STATUS_LABELS,
} from "../utils/constants";
import { cn } from "../utils/format";

const statusStyles: Record<string, string> = {
  WAITING_FOR_STOCK: "border-amber-200 bg-amber-50 text-amber-800",
  MANUFACTURING: "border-violet-200 bg-violet-50 text-violet-800",
  PACKING: "border-orange-200 bg-orange-50 text-orange-800",
  READY_TO_SHIP: "border-cyan-200 bg-cyan-50 text-cyan-800",
  SHIPPING: "border-blue-200 bg-blue-50 text-blue-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const orderTypeStyles: Record<string, string> = {
  NORMAL: "border-slate-200 bg-slate-100 text-slate-700",
  PRE_ORDER: "border-rose-200 bg-rose-50 text-rose-700",
  PRESCRIPTION: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
};

function BaseBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

export function OperationStatusBadge({ status }: { status?: OperationStatus | string | null }) {
  if (!status) {
    return <BaseBadge className="border-slate-200 bg-slate-100 text-slate-600">--</BaseBadge>;
  }

  return (
    <BaseBadge className={statusStyles[status] || "border-slate-200 bg-slate-100 text-slate-700"}>
      {OPERATION_STATUS_LABELS[status as OperationStatus] || status}
    </BaseBadge>
  );
}

export function OperationOrderTypeBadge({
  orderType,
}: {
  orderType?: OperationOrderType | string | null;
}) {
  if (!orderType) {
    return <BaseBadge className="border-slate-200 bg-slate-100 text-slate-600">--</BaseBadge>;
  }

  return (
    <BaseBadge className={orderTypeStyles[orderType] || "border-slate-200 bg-slate-100 text-slate-700"}>
      {OPERATION_ORDER_TYPE_LABELS[orderType as OperationOrderType] || orderType}
    </BaseBadge>
  );
}
