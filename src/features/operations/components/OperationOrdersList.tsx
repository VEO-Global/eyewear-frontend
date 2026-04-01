import { ArrowRight, ChevronRight, Eye, PackageCheck } from "lucide-react";
import type { OperationOrderResponse } from "../types";
import { formatCurrency, formatDateTime } from "../utils/format";
import { getNextActionStatus, isReadyToShipBlocked } from "../utils/workflow";
import { OPERATION_STATUS_LABELS } from "../utils/constants";
import { OperationOrderTypeBadge, OperationStatusBadge } from "./OperationBadges";
import { ActionButton, EmptyBlock, SkeletonBlock, SurfaceCard } from "./OperationPrimitives";

function OrderRow({
  order,
  selected,
  onSelect,
  onAdvance,
  advancing,
}: {
  order: OperationOrderResponse;
  selected?: boolean;
  onSelect: (orderId: number) => void;
  onAdvance?: (order: OperationOrderResponse) => void;
  advancing?: boolean;
}) {
  const nextStatus = getNextActionStatus(order);
  const blocked = isReadyToShipBlocked(order);

  return (
    <tr
      className={`cursor-pointer border-b border-slate-200/80 transition hover:bg-slate-50 ${selected ? "bg-cyan-50/70" : "bg-white"}`}
      onClick={() => onSelect(order.orderId)}
    >
      <td className="px-4 py-4 font-semibold text-slate-900">{order.orderCode}</td>
      <td className="px-4 py-4 text-slate-600">{order.customerEmail || "--"}</td>
      <td className="px-4 py-4 text-slate-700">{order.receiverName || "--"}</td>
      <td className="px-4 py-4 text-slate-600">{order.phoneNumber || "--"}</td>
      <td className="px-4 py-4"><OperationOrderTypeBadge orderType={order.orderType} /></td>
      <td className="px-4 py-4"><OperationStatusBadge status={order.status} /></td>
      <td className="px-4 py-4 text-slate-600">{order.logisticsProvider || "--"}</td>
      <td className="px-4 py-4 text-slate-600">{order.trackingNumber || "--"}</td>
      <td className="px-4 py-4 text-slate-600">{formatDateTime(order.createdAt)}</td>
      <td className="px-4 py-4 text-slate-600">{formatDateTime(order.updatedAt)}</td>
      <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {nextStatus ? (
            <ActionButton
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onAdvance?.(order);
              }}
              disabled={blocked || advancing}
            >
              <ArrowRight className="h-4 w-4" />
              {advancing ? "Đang chuyển..." : `Sang ${OPERATION_STATUS_LABELS[nextStatus]}`}
            </ActionButton>
          ) : null}
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(order.orderId);
            }}
          >
            <Eye className="h-4 w-4" />
            Chi tiết
          </ActionButton>
        </div>
        {blocked ? (
          <p className="mt-2 text-xs text-rose-600">Cần logistics và tracking trước khi chuyển bước.</p>
        ) : null}
      </td>
    </tr>
  );
}

export function OperationOrdersTable({
  orders,
  loading,
  selectedOrderId,
  onSelect,
  onAdvance,
  advancingOrderId,
}: {
  orders?: OperationOrderResponse[];
  loading?: boolean;
  selectedOrderId?: number | null;
  onSelect: (orderId: number) => void;
  onAdvance?: (order: OperationOrderResponse) => void;
  advancingOrderId?: number | null;
}) {
  if (loading) {
    return (
      <SurfaceCard className="overflow-hidden border-slate-200/80 p-4">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-14 rounded-2xl" />
          ))}
        </div>
      </SurfaceCard>
    );
  }

  if (!orders?.length) {
    return (
      <EmptyBlock
        title="Không có đơn phù hợp"
        description="Thử đổi bộ lọc, tìm từ khóa khác hoặc làm mới để lấy dữ liệu mới nhất từ backend."
      />
    );
  }

  return (
    <SurfaceCard className="overflow-hidden border-slate-200/80 p-0">
      <div className="overflow-x-auto">
        <table className="min-w-[1380px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-4">Order code</th>
              <th className="px-4 py-4">Email khách</th>
              <th className="px-4 py-4">Người nhận</th>
              <th className="px-4 py-4">Số điện thoại</th>
              <th className="px-4 py-4">Loại đơn</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-4 py-4">Logistics</th>
              <th className="px-4 py-4">Tracking</th>
              <th className="px-4 py-4">Ngày tạo</th>
              <th className="px-4 py-4">Cập nhật</th>
              <th className="px-4 py-4">Tổng tiền</th>
              <th className="px-4 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow
                key={order.orderId}
                order={order}
                selected={selectedOrderId === order.orderId}
                onSelect={onSelect}
                onAdvance={onAdvance}
                advancing={advancingOrderId === order.orderId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}

export function OperationOrderCards({
  orders,
  loading,
  onSelect,
  onAdvance,
  advancingOrderId,
}: {
  orders?: OperationOrderResponse[];
  loading?: boolean;
  onSelect: (orderId: number) => void;
  onAdvance?: (order: OperationOrderResponse) => void;
  advancingOrderId?: number | null;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-44 rounded-[26px]" />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <EmptyBlock
        title="Không có đơn phù hợp"
        description="Danh sách hiện đang trống. Thử bộ lọc khác để kiểm tra khối lượng công việc ở trạng thái khác."
      />
    );
  }

  return (
    <div className="space-y-3 lg:hidden">
      {orders.map((order) => {
        const nextStatus = getNextActionStatus(order);
        const blocked = isReadyToShipBlocked(order);

        return (
          <SurfaceCard key={order.orderId} className="border-slate-200/80 p-4">
            <button type="button" className="w-full text-left" onClick={() => onSelect(order.orderId)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-950">{order.orderCode}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.customerEmail || order.receiverName || "--"}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <OperationOrderTypeBadge orderType={order.orderType} />
                <OperationStatusBadge status={order.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Tracking</p>
                  <p className="mt-1 font-medium text-slate-700">{order.trackingNumber || "--"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Tổng tiền</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </button>
            <div className="mt-4 flex flex-wrap gap-2">
              {nextStatus ? (
                <ActionButton
                  size="sm"
                  onClick={() => onAdvance?.(order)}
                  disabled={blocked || advancingOrderId === order.orderId}
                >
                  <ArrowRight className="h-4 w-4" />
                  {advancingOrderId === order.orderId ? "Đang chuyển..." : `Sang ${OPERATION_STATUS_LABELS[nextStatus]}`}
                </ActionButton>
              ) : null}
              <ActionButton variant="secondary" size="sm" onClick={() => onSelect(order.orderId)}>
                <PackageCheck className="h-4 w-4" />
                Mở chi tiết
              </ActionButton>
            </div>
            {blocked ? (
              <p className="mt-3 text-xs text-rose-600">Cần logistics và tracking trước khi chuyển bước.</p>
            ) : null}
          </SurfaceCard>
        );
      })}
    </div>
  );
}
