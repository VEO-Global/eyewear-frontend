import { CheckCircle2, Clock3, Glasses, Package, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../utils/apiError";
import { OperationOrderTypeBadge, OperationStatusBadge } from "../components/OperationBadges";
import { ActionButton, EmptyBlock, SurfaceCard } from "../components/OperationPrimitives";
import { useOperationOrders, useOperationSummary } from "../hooks/useOperationQueries";
import type { OperationOrderFilters, OperationSummaryResponse } from "../types";

const overviewCards: Array<{
  key: keyof OperationSummaryResponse;
  label: string;
  icon: typeof ShoppingBag;
  iconClassName: string;
  filters: OperationOrderFilters;
}> = [
  {
    key: "totalOrders",
    label: "Tổng đơn hàng",
    icon: ShoppingBag,
    iconClassName: "text-blue-500",
    filters: {},
  },
  {
    key: "manufacturing",
    label: "Đang gia công",
    icon: Package,
    iconClassName: "text-violet-500",
    filters: { status: "MANUFACTURING" },
  },
  {
    key: "packing",
    label: "Đang đóng gói",
    icon: Package,
    iconClassName: "text-orange-500",
    filters: { status: "PACKING" },
  },
  {
    key: "prescriptionOrders",
    label: "Đơn kính theo toa",
    icon: Glasses,
    iconClassName: "text-teal-500",
    filters: { orderType: "PRESCRIPTION" },
  },
  {
    key: "completed",
    label: "Đã hoàn thành / Đã giao",
    icon: CheckCircle2,
    iconClassName: "text-emerald-500",
    filters: { status: "COMPLETED" },
  },
];

export default function OperationsDashboardPage() {
  const [filters, setFilters] = useState<OperationOrderFilters>({});
  const summaryQuery = useOperationSummary();
  const ordersQuery = useOperationOrders(filters);

  const hasAnyOrders = useMemo(
    () => Boolean(summaryQuery.data && summaryQuery.data.totalOrders > 0),
    [summaryQuery.data]
  );
  const recentOrders = useMemo(() => (ordersQuery.data || []).slice(0, 5), [ordersQuery.data]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#0f2747]">Tổng quan hệ thống</h1>
        <p className="mt-3 text-lg text-slate-500">Chào mừng bạn quay lại! Đây là tình hình hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilters(card.filters)}
              className="rounded-[22px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-[15px] font-medium text-slate-500">{card.label}</p>
              <div className="mt-4 flex items-center gap-3">
                <Icon className={card.iconClassName} size={22} />
                <span className="text-3xl font-semibold text-[#0f2747]">
                  {summaryQuery.isLoading ? "--" : summaryQuery.data?.[card.key] ?? 0}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <SurfaceCard className="overflow-hidden border border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-[30px] font-semibold text-slate-900">Recent Orders</h2>
          <Link
            to={`/operation/orders${
              filters.status || filters.orderType
                ? `?${new URLSearchParams({
                    ...(filters.status ? { status: filters.status } : {}),
                    ...(filters.orderType ? { orderType: filters.orderType } : {}),
                  }).toString()}`
                : ""
            }`}
            className="text-lg font-medium text-[#2f7cf6] transition hover:text-[#1e66d0]"
          >
            View All
          </Link>
        </div>

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
        ) : ordersQuery.isLoading ? (
          <div className="px-6 py-7">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : recentOrders.length ? (
          <div className="overflow-x-auto px-6 py-7">
            <table className="min-w-[720px] w-full text-left">
              <thead className="bg-[#f7f8fa] text-[15px] font-semibold text-slate-900">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">{order.orderCode}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {order.receiverName || order.customerEmail || "--"}
                    </td>
                    <td className="px-5 py-4">
                      <OperationOrderTypeBadge orderType={order.orderType} />
                    </td>
                    <td className="px-5 py-4">
                      <OperationStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center text-center text-slate-400">
            No data
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
