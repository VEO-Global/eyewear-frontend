import { ArrowRight, Clock3, Glasses, Package, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ActionButton, EmptyBlock, SurfaceCard } from "../components/OperationPrimitives";
import { useOperationSummary } from "../hooks/useOperationQueries";
import { OPERATION_STATUS_LABELS } from "../utils/constants";

const statusCards = [
  {
    key: "all",
    label: "Tất cả trạng thái",
    icon: ShoppingBag,
    iconClassName: "text-sky-500",
    href: "/operation/orders",
  },
  {
    key: "manufacturing",
    label: OPERATION_STATUS_LABELS.MANUFACTURING,
    icon: Package,
    iconClassName: "text-violet-500",
    href: "/operation/orders?status=MANUFACTURING",
  },
  {
    key: "packing",
    label: OPERATION_STATUS_LABELS.PACKING,
    icon: Package,
    iconClassName: "text-orange-500",
    href: "/operation/orders?status=PACKING",
  },
  {
    key: "readyToShip",
    label: OPERATION_STATUS_LABELS.READY_TO_SHIP,
    icon: Clock3,
    iconClassName: "text-cyan-500",
    href: "/operation/orders?status=READY_TO_SHIP",
  },
  {
    key: "shipping",
    label: OPERATION_STATUS_LABELS.SHIPPING,
    icon: Clock3,
    iconClassName: "text-blue-500",
    href: "/operation/orders?status=SHIPPING",
  },
  {
    key: "completed",
    label: OPERATION_STATUS_LABELS.COMPLETED,
    icon: Glasses,
    iconClassName: "text-emerald-500",
    href: "/operation/orders?status=COMPLETED",
  },
] as const;

export default function OperationsDashboardPage() {
  const summaryQuery = useOperationSummary();

  const hasAnyOrders = useMemo(
    () => Boolean(summaryQuery.data && summaryQuery.data.totalOrders > 0),
    [summaryQuery.data]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#0f2747]">Tổng quan hệ thống</h1>
        <p className="mt-3 text-lg text-slate-500">Chào mừng bạn quay lại! Đây là tình hình hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statusCards.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "all"
              ? summaryQuery.data?.totalOrders ?? 0
              : summaryQuery.data?.[card.key] ?? 0;

          return (
            <Link
              key={card.key}
              to={card.href}
              className="rounded-[22px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-[15px] font-medium text-slate-500">{card.label}</p>
              <div className="mt-4 flex items-center gap-3">
                <Icon className={card.iconClassName} size={22} />
                <span className="text-3xl font-semibold text-[#0f2747]">
                  {summaryQuery.isLoading ? "--" : value}
                </span>
              </div>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-700">
                Xem đơn
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <SurfaceCard className="overflow-hidden border border-slate-200 bg-white p-0 shadow-sm">
        {summaryQuery.isError ? (
          <EmptyBlock
            title="Không tải được dashboard"
            description={getApiErrorMessage(summaryQuery.error, "Không thể lấy dữ liệu tổng quan từ backend.")}
            action={<ActionButton onClick={() => summaryQuery.refetch()}>Thử lại</ActionButton>}
          />
        ) : !summaryQuery.isLoading && !hasAnyOrders ? (
          <EmptyBlock
            title="Chưa có đơn bàn giao sang vận hành"
            description="Khi staff bàn giao đơn, danh sách gần đây sẽ hiển thị ngay tại đây."
          />
        ) : (
          <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
            {statusCards.map((card) => (
              <Link
                key={card.key}
                to={card.href}
                className="rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-5 transition hover:border-sky-200 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">{card.label}</p>
                <p className="mt-2 text-sm text-slate-500">Mở nhanh danh sách đơn theo trạng thái này.</p>
              </Link>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
