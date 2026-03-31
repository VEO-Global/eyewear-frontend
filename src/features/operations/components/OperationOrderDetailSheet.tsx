import {
  Archive,
  CheckCircle2,
  CircleDot,
  Glasses,
  Loader2,
  PackageSearch,
  Pencil,
  ReceiptText,
  ScanSearch,
  Truck,
} from "lucide-react";
import { useMemo } from "react";
import type { OperationOrderResponse, OperationStatus } from "../types";
import { OPERATION_STATUS_LABELS } from "../utils/constants";
import { buildFullAddress, formatCurrency, formatDate, formatDateTime } from "../utils/format";
import {
  canEditLogistics,
  canEditTracking,
  canReceiveStock,
  getNextActionStatus,
  isReadyToShipBlocked,
} from "../utils/workflow";
import { OperationOrderTypeBadge, OperationStatusBadge } from "./OperationBadges";
import { ActionButton, SideSheet, SkeletonBlock, SurfaceCard } from "./OperationPrimitives";

function DetailGrid({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
          <div className="mt-2 text-sm font-medium text-slate-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function Timeline({ order }: { order: OperationOrderResponse }) {
  return (
    <div className="space-y-3">
      {order.statusHistory?.length ? (
        order.statusHistory.map((entry, index) => (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
                {index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
              </span>
              {index < order.statusHistory.length - 1 ? <span className="mt-2 h-full w-px bg-slate-200" /> : null}
            </div>
            <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">
                    {entry.statusLabel || OPERATION_STATUS_LABELS[entry.status as OperationStatus] || entry.status}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{entry.note || "Không có ghi chú nội bộ."}</p>
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {formatDateTime(entry.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Chưa có lịch sử trạng thái.
        </div>
      )}
    </div>
  );
}

export function OperationOrderDetailSheet({
  open,
  order,
  loading,
  onClose,
  onOpenLogistics,
  onOpenTracking,
  onOpenReceiveStock,
  onOpenStatusUpdate,
}: {
  open: boolean;
  order?: OperationOrderResponse | null;
  loading?: boolean;
  onClose: () => void;
  onOpenLogistics: () => void;
  onOpenTracking: () => void;
  onOpenReceiveStock: () => void;
  onOpenStatusUpdate: (targetStatus: OperationStatus) => void;
}) {
  const nextStatus = useMemo(() => (order ? getNextActionStatus(order) : null), [order]);
  const readyToShipBlocked = isReadyToShipBlocked(order);

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      title={order?.orderCode || "Đang tải đơn hàng"}
      description={
        order
          ? `${order.receiverName || "Khách hàng"} • ${order.customerEmail || "Chưa có email"}`
          : "Đang lấy dữ liệu chi tiết"
      }
    >
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-32 rounded-[28px]" />
          ))}
        </div>
      ) : !order ? (
        <SurfaceCard className="border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Không tìm thấy thông tin đơn hàng.
        </SurfaceCard>
      ) : (
        <div className="space-y-5">
          <SurfaceCard className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_40%,#1e293b_100%)] p-5 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Tổng quan đơn vận hành</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">{order.orderCode}</h3>
                <p className="mt-2 max-w-2xl text-sm text-slate-200">
                  Tạo lúc {formatDateTime(order.createdAt)} • Cập nhật lúc {formatDateTime(order.updatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <OperationOrderTypeBadge orderType={order.orderType} />
                <OperationStatusBadge status={order.status} />
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="border-slate-200 p-5">
            <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
              <PackageSearch className="h-5 w-5 text-cyan-700" />
              Thao tác vận hành
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {canReceiveStock(order) ? (
                <ActionButton onClick={onOpenReceiveStock}>
                  <Archive className="h-4 w-4" />
                  Xác nhận nhận hàng
                </ActionButton>
              ) : null}
              {canEditLogistics(order) ? (
                <ActionButton variant="secondary" onClick={onOpenLogistics}>
                  <Truck className="h-4 w-4" />
                  Cập nhật logistics
                </ActionButton>
              ) : null}
              {canEditTracking(order) ? (
                <ActionButton variant="secondary" onClick={onOpenTracking}>
                  <ScanSearch className="h-4 w-4" />
                  Cập nhật tracking
                </ActionButton>
              ) : null}
              {nextStatus ? (
                <div className="flex flex-col gap-2">
                  <ActionButton onClick={() => onOpenStatusUpdate(nextStatus)} disabled={readyToShipBlocked}>
                    {readyToShipBlocked ? <Loader2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    Chuyển sang {OPERATION_STATUS_LABELS[nextStatus]}
                  </ActionButton>
                  {readyToShipBlocked ? (
                    <p className="text-xs text-rose-600">
                      Cần có đơn vị vận chuyển và mã tracking trước khi chuyển sang trạng thái sẵn sàng giao.
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Đơn hàng đã ở trạng thái cuối hoặc không còn thao tác tiếp theo.</p>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
              <PackageSearch className="h-5 w-5 text-cyan-700" />
              Tổng quan đơn hàng
            </div>
            <DetailGrid
              items={[
                { label: "Người nhận", value: order.receiverName || "--" },
                { label: "Số điện thoại", value: order.phoneNumber || "--" },
                { label: "Email khách", value: order.customerEmail || "--" },
                { label: "Phương thức thanh toán", value: order.paymentMethod || "--" },
                { label: "Trạng thái thanh toán", value: order.paymentStatus || "--" },
                { label: "Thành tiền", value: formatCurrency(order.finalAmount || order.totalAmount) },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard className="border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
              <Truck className="h-5 w-5 text-cyan-700" />
              Giao hàng và logistics
            </div>
            <DetailGrid
              items={[
                {
                  label: "Địa chỉ giao hàng",
                  value: buildFullAddress(order.addressDetail, order.ward, order.district, order.city),
                },
                { label: "Đơn vị vận chuyển", value: order.logisticsProvider || "--" },
                { label: "Hình thức giao hàng", value: order.shippingMethod || "--" },
                { label: "Mã vận đơn", value: order.trackingNumber || "--" },
                { label: "Ngày giao dự kiến", value: formatDate(order.estimatedDeliveryDate) },
                { label: "Phí giao hàng", value: formatCurrency(order.shippingFee) },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard className="border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
              <ReceiptText className="h-5 w-5 text-cyan-700" />
              Thông tin thanh toán
            </div>
            <DetailGrid
              items={[
                { label: "Mã giao dịch", value: order.payment?.transactionCode || "--" },
                { label: "Số tiền thanh toán", value: formatCurrency(order.payment?.amount || order.finalAmount) },
                { label: "Thanh toán lúc", value: formatDateTime(order.payment?.paidAt || null) },
                { label: "Hết hạn lúc", value: formatDateTime(order.payment?.expiredAt || null) },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard className="border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
              <Archive className="h-5 w-5 text-cyan-700" />
              Sản phẩm trong đơn
            </div>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={`${item.orderItemId}-${item.id}`} className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName || "Ảnh sản phẩm"}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-950">{item.productName || "Sản phẩm chưa đặt tên"}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.variantName || item.productVariantName || `Phân loại #${item.productVariantId || "--"}`}
                      </p>
                      {item.lensProductName ? (
                        <p className="mt-1 text-sm text-fuchsia-700">Tròng kính: {item.lensProductName}</p>
                      ) : null}
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-400">Số lượng: {item.quantity}</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(item.lineTotal || item.price || item.unitPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          {order.lens ? (
            <SurfaceCard className="border-slate-200 p-5">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
                <Glasses className="h-5 w-5 text-fuchsia-700" />
                Thông tin tròng kính
              </div>
              <DetailGrid
                items={[
                  { label: "Tên tròng kính", value: order.lens.name || "--" },
                  { label: "Giá", value: formatCurrency(order.lens.price) },
                  { label: "Mô tả", value: order.lens.description || "--" },
                  { label: "Tùy chọn đơn kính", value: order.prescriptionOption || "--" },
                ]}
              />
            </SurfaceCard>
          ) : null}

          {order.prescription ? (
            <SurfaceCard className="border-slate-200 p-5">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
                <Pencil className="h-5 w-5 text-fuchsia-700" />
                Thông tin đơn kính
              </div>
              <DetailGrid
                items={[
                  { label: "Trạng thái duyệt", value: order.prescription.reviewStatus || order.prescriptionReviewStatus || "--" },
                  { label: "Ghi chú duyệt", value: order.prescription.reviewNote || "--" },
                  { label: "Sphere OD", value: String(order.prescription.sphereOd ?? "--") },
                  { label: "Sphere OS", value: String(order.prescription.sphereOs ?? "--") },
                  { label: "Cylinder OD", value: String(order.prescription.cylinderOd ?? "--") },
                  { label: "Cylinder OS", value: String(order.prescription.cylinderOs ?? "--") },
                  { label: "Axis OD", value: String(order.prescription.axisOd ?? "--") },
                  { label: "Axis OS", value: String(order.prescription.axisOs ?? "--") },
                  { label: "PD", value: String(order.prescription.pd ?? "--") },
                  {
                    label: "Ảnh đơn kính",
                    value: order.prescription.prescriptionImageUrl ? (
                      <a
                        className="text-cyan-700 underline"
                        href={order.prescription.prescriptionImageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Mở ảnh
                      </a>
                    ) : (
                      "--"
                    ),
                  },
                ]}
              />
            </SurfaceCard>
          ) : null}

          <SurfaceCard className="border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
              <CheckCircle2 className="h-5 w-5 text-cyan-700" />
              Lịch sử trạng thái
            </div>
            <Timeline order={order} />
          </SurfaceCard>
        </div>
      )}
    </SideSheet>
  );
}
