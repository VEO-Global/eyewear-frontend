import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOperationOrders, useOperationSummary } from "../hooks/useOperationQueries";
import type { OperationOrderFilters } from "../types";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ActionButton, EmptyBlock, SectionHeader, SurfaceCard } from "../components/OperationPrimitives";
import { OperationOrdersTable } from "../components/OperationOrdersList";
import { OperationSummaryCards } from "../components/OperationSummaryCards";

export default function OperationsDashboardPage() {
  const [filters, setFilters] = useState<OperationOrderFilters>({});
  const summaryQuery = useOperationSummary();
  const ordersQuery = useOperationOrders(filters);

  const hasAnyOrders = useMemo(
    () => Boolean(summaryQuery.data && summaryQuery.data.totalOrders > 0),
    [summaryQuery.data]
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Khu vực vận hành"
        title="Bảng điều khiển vận hành"
        description="Bức tranh tổng quan cho quy trình đóng gói, logistics và giao hàng. Chọn từng thẻ để soi nhanh backlog theo loại đơn và trạng thái."
        action={
          <Link to="/operation/orders">
            <ActionButton>
              <RefreshCw className="h-4 w-4" />
              Mở trang xử lý đơn
            </ActionButton>
          </Link>
        }
      />

      <OperationSummaryCards
        summary={summaryQuery.data}
        loading={summaryQuery.isLoading}
        activeFilters={filters}
        onSelect={(nextFilters) => setFilters(nextFilters)}
        onRefresh={() => {
          summaryQuery.refetch();
          ordersQuery.refetch();
        }}
        refreshing={summaryQuery.isRefetching || ordersQuery.isRefetching}
      />

      <SurfaceCard className="border-slate-200/80 p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Xem nhanh hàng chờ</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Danh sách đơn theo bộ lọc dashboard</h2>
            <p className="mt-2 text-sm text-slate-500">Bạn xem nhanh queue hiện tại ngay tại dashboard trước khi vào trang thao tác chi tiết.</p>
          </div>
          <Link
            to={`/operation/orders${
              filters.status || filters.orderType
                ? `?${new URLSearchParams({
                    ...(filters.status ? { status: filters.status } : {}),
                    ...(filters.orderType ? { orderType: filters.orderType } : {}),
                  }).toString()}`
                : ""
            }`}
          >
            <ActionButton variant="secondary">Xem đầy đủ</ActionButton>
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
            description="Khi staff bàn giao đơn, dashboard sẽ cập nhật các thẻ và danh sách queue xử lý tại đây."
          />
        ) : (
          <OperationOrdersTable orders={ordersQuery.data} loading={ordersQuery.isLoading} onSelect={() => {}} />
        )}
      </SurfaceCard>
    </div>
  );
}
