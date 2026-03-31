import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../utils/apiError";
import { appToast } from "../../../utils/appToast";
import type {
  OperationOrderResponse,
  OperationStatus,
  ReceiveOperationStockPayload,
  UpdateOperationLogisticsPayload,
  UpdateOperationStatusPayload,
  UpdateOperationTrackingPayload,
} from "../types";
import { OPERATION_STATUS_LABELS } from "../utils/constants";
import { formatDate } from "../utils/format";
import {
  ActionButton,
  OverlayModal,
  SelectInput,
  TextArea,
  TextInput,
} from "./OperationPrimitives";

export function LogisticsModal({
  open,
  order,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  order?: OperationOrderResponse | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateOperationLogisticsPayload) => Promise<void>;
}) {
  const [carrier, setCarrier] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  useEffect(() => {
    setCarrier(order?.logisticsProvider || "");
    setShippingMethod(order?.shippingMethod || "");
    setEstimatedDeliveryDate(order?.estimatedDeliveryDate?.slice(0, 10) || "");
  }, [order, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (carrier.trim() && carrier.trim().length > 100) {
      appToast.error("Tên đơn vị vận chuyển quá dài. Vui lòng nhập tối đa 100 ký tự.");
      return;
    }

    if (shippingMethod.trim() && shippingMethod.trim().length > 100) {
      appToast.error("Hình thức giao hàng quá dài. Vui lòng nhập tối đa 100 ký tự.");
      return;
    }

    if (estimatedDeliveryDate) {
      const date = new Date(estimatedDeliveryDate);
      if (Number.isNaN(date.getTime())) {
        appToast.error("Ngày giao dự kiến không hợp lệ.");
        return;
      }
    }

    try {
      await onSubmit({
        carrier: carrier.trim() || undefined,
        shippingMethod: shippingMethod.trim() || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      });
      onClose();
    } catch (error) {
      appToast.error(getApiErrorMessage(error, "Cập nhật logistics thất bại."));
    }
  }

  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title="Cập nhật logistics"
      description="Gán đơn vị vận chuyển, hình thức giao và ngày dự kiến cho đơn hàng."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Đơn vị vận chuyển</label>
          <TextInput value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="GHN, GHTK..." />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Hình thức giao hàng</label>
          <TextInput
            value={shippingMethod}
            onChange={(event) => setShippingMethod(event.target.value)}
            placeholder="STANDARD, EXPRESS..."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Ngày giao dự kiến</label>
          <TextInput type="date" value={estimatedDeliveryDate} onChange={(event) => setEstimatedDeliveryDate(event.target.value)} />
        </div>
        <div className="flex justify-end gap-3">
          <ActionButton type="button" variant="secondary" onClick={onClose}>
            Hủy
          </ActionButton>
          <ActionButton type="submit" loading={submitting}>
            Lưu logistics
          </ActionButton>
        </div>
      </form>
    </OverlayModal>
  );
}

export function TrackingModal({
  open,
  order,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  order?: OperationOrderResponse | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateOperationTrackingPayload) => Promise<void>;
}) {
  const [provider, setProvider] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    setProvider(order?.logisticsProvider || "");
    setTrackingNumber(order?.trackingNumber || "");
  }, [order, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!provider.trim()) {
      appToast.error("Đơn vị vận chuyển là bắt buộc.");
      return;
    }

    if (!trackingNumber.trim()) {
      appToast.error("Mã tracking là bắt buộc.");
      return;
    }

    try {
      await onSubmit({
        provider: provider.trim(),
        trackingNumber: trackingNumber.trim(),
      });
      onClose();
    } catch (error) {
      appToast.error(getApiErrorMessage(error, "Cập nhật tracking thất bại."));
    }
  }

  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title="Cập nhật tracking"
      description="Nhập đơn vị vận chuyển và mã vận đơn để cho phép chuyển sang trạng thái sẵn sàng giao."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Đơn vị vận chuyển</label>
          <TextInput value={provider} onChange={(event) => setProvider(event.target.value)} placeholder="GHN" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Mã vận đơn</label>
          <TextInput value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="TRACK123456" />
        </div>
        <div className="flex justify-end gap-3">
          <ActionButton type="button" variant="secondary" onClick={onClose}>
            Hủy
          </ActionButton>
          <ActionButton type="submit" loading={submitting}>
            Lưu tracking
          </ActionButton>
        </div>
      </form>
    </OverlayModal>
  );
}

export function ReceiveStockModal({
  open,
  order,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  order?: OperationOrderResponse | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: ReceiveOperationStockPayload) => Promise<void>;
}) {
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");

  useEffect(() => {
    const next: Record<number, string> = {};
    order?.items?.forEach((item) => {
      if (item.productVariantId) {
        next[item.productVariantId] = "";
      }
    });
    setQuantities(next);
    setNote(order?.note || "");
  }, [order, open]);

  const variantEntries = useMemo(
    () =>
      order?.items
        ?.filter((item) => item.productVariantId)
        .map((item) => ({
          variantId: item.productVariantId as number,
          productName: item.productName || "Phân loại",
          variantName: item.variantName || item.productVariantName || `Phân loại #${item.productVariantId}`,
          quantity: item.quantity,
        })) || [],
    [order]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const items = variantEntries
      .map((entry) => ({
        variantId: entry.variantId,
        receivedQuantity: Number(quantities[entry.variantId] || 0),
      }))
      .filter((item) => Number.isFinite(item.receivedQuantity) && item.receivedQuantity > 0);

    if (!items.length) {
      appToast.error("Cần nhập ít nhất một số lượng nhận lớn hơn 0.");
      return;
    }

    try {
      await onSubmit({
        items,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (error) {
      appToast.error(getApiErrorMessage(error, "Nhận hàng thất bại."));
    }
  }

  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title="Xác nhận nhận hàng"
      description="Xác nhận hàng đã về kho cho đơn đặt trước. Sau khi thành công, đơn sẽ chuyển sang trạng thái đóng gói."
      widthClassName="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          {variantEntries.map((entry) => (
            <div key={entry.variantId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{entry.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">{entry.variantName}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    Số lượng đặt: {entry.quantity}
                  </p>
                </div>
                <div className="w-full sm:w-40">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Số lượng nhận</label>
                  <TextInput
                    type="number"
                    min="1"
                    value={quantities[entry.variantId] || ""}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [entry.variantId]: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Ghi chú</label>
          <TextArea rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: Hàng đã nhận đủ từ nhà cung cấp" />
        </div>
        <div className="flex justify-end gap-3">
          <ActionButton type="button" variant="secondary" onClick={onClose}>
            Hủy
          </ActionButton>
          <ActionButton type="submit" loading={submitting}>
            Xác nhận nhận hàng
          </ActionButton>
        </div>
      </form>
    </OverlayModal>
  );
}

export function UpdateStatusModal({
  open,
  order,
  targetStatus,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  order?: OperationOrderResponse | null;
  targetStatus?: OperationStatus | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateOperationStatusPayload) => Promise<void>;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("");
  }, [open, targetStatus]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!targetStatus || targetStatus === "WAITING_FOR_STOCK") {
      appToast.error("Trạng thái đích không hợp lệ.");
      return;
    }

    try {
      await onSubmit({
        status: targetStatus,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (error) {
      appToast.error(getApiErrorMessage(error, "Cập nhật trạng thái thất bại."));
    }
  }

  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title="Xác nhận chuyển trạng thái"
      description="Kiểm tra thông tin logistics và tracking trước khi đẩy đơn sang bước tiếp theo."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Trạng thái hiện tại</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{order?.status ? OPERATION_STATUS_LABELS[order.status as OperationStatus] || order.status : "--"}</p>
          </div>
          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm text-cyan-700">Trạng thái đích</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{targetStatus ? OPERATION_STATUS_LABELS[targetStatus] : "--"}</p>
          </div>
        </div>

        {order?.estimatedDeliveryDate ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Ngày giao dự kiến: <span className="font-semibold text-slate-900">{formatDate(order.estimatedDeliveryDate)}</span>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Ghi chú nội bộ</label>
          <TextArea
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ghi chú nội bộ về handoff hoặc tình trạng xử lý"
          />
        </div>
        <div className="flex justify-end gap-3">
          <ActionButton type="button" variant="secondary" onClick={onClose}>
            Hủy
          </ActionButton>
          <ActionButton type="submit" loading={submitting}>
            Xác nhận
          </ActionButton>
        </div>
      </form>
    </OverlayModal>
  );
}
