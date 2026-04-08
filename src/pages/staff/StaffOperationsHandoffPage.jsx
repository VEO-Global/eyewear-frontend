import { Alert, Spin } from "antd";
import { PackageCheck, Send, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";
import { operationQueryKeys } from "../../features/operations/hooks/useOperationQueries";
import { getOperationOrders } from "../../features/operations/api/operationApi";
import { extractErrorMessage } from "../../services/managerApi";
import { staffOrderApi } from "../../services/staffOrderApi";
import { formatCurrency } from "../../utils/orderHistory";
import { appToast } from "../../utils/appToast";
import {
  listSaleApprovedPaymentReviews,
  listSalePendingPaymentReviews,
} from "../../utils/paymentReviewStore";
import {
  canOrderBeHandedOff,
  canUseLocalHandoffFallback,
  getHandoffBlockReason,
  isHandoffOrderStillVisible,
  markHandedOffOperationOrder,
  mergeOrdersById,
  pruneLocalReadyForHandoffOrders,
  readLocalReadyForHandoffOrders,
  removeLocalReadyForHandoffOrder,
  sortOrdersNewestFirst,
} from "../../utils/staffOperationTransfer";

const STAFF_HIGHLIGHTED_ORDER_KEY = "staff-highlighted-order";
const POLLING_INTERVAL_MS = 15000;

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center text-slate-500">
      Chưa có đơn nào sẵn sàng để bàn giao.
    </div>
  );
}

function normalizePrescription(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  return {
    prescriptionImageUrl: entry?.prescriptionImageUrl ?? null,
    sphereOd: entry?.sphereOd ?? null,
    sphereOs: entry?.sphereOs ?? null,
    cylinderOd: entry?.cylinderOd ?? null,
    cylinderOs: entry?.cylinderOs ?? null,
    axisOd: entry?.axisOd ?? null,
    axisOs: entry?.axisOs ?? null,
    pd: entry?.pd ?? null,
    reviewStatus: entry?.reviewStatus ?? null,
    reviewNote: entry?.reviewNote ?? entry?.note ?? null,
  };
}

function formatPrescriptionValue(value) {
  return value === undefined || value === null || value === "" ? "Chưa có" : value;
}

function getItemLens(item) {
  return item?.lensProduct ?? item?.lens ?? null;
}

function OrderDetailModal({ order, loading, onClose }) {
  if (!order && !loading) {
    return null;
  }

  const prescription = normalizePrescription(order?.prescription);
  const orderLens = order?.lensProduct ?? order?.lens ?? null;
  const shippingAddress =
    typeof order?.shippingAddress === "string"
      ? order.shippingAddress
      : [
          order?.shippingAddress?.addressDetail,
          order?.shippingAddress?.wardName || order?.shippingAddress?.ward,
          order?.shippingAddress?.districtName || order?.shippingAddress?.district,
          order?.shippingAddress?.provinceName || order?.shippingAddress?.province,
        ]
          .filter(Boolean)
          .join(", ");

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              Chi tiết đơn hàng
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {order?.code || "Đang tải..."}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {order?.customer || "Đang tải"} • {order?.customerPhone || "Chưa có số điện thoại"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-lg font-bold text-slate-900">Thông tin người đặt</h3>
                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Họ tên:</span> {order?.customer}</p>
                  <p><span className="font-semibold text-slate-900">Email:</span> {order?.customerEmail || "Chưa có"}</p>
                  <p><span className="font-semibold text-slate-900">Số điện thoại:</span> {order?.customerPhone || "Chưa có"}</p>
                  <p><span className="font-semibold text-slate-900">Người nhận:</span> {order?.receiverName || order?.customer}</p>
                  <p><span className="font-semibold text-slate-900">Kênh:</span> {order?.channel}</p>
                  <p><span className="font-semibold text-slate-900">Địa chỉ:</span> {shippingAddress || "Chưa có"}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-lg font-bold text-slate-900">Thông tin xử lý</h3>
                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Tổng tiền:</span> {order?.totalText}</p>
                  <p><span className="font-semibold text-slate-900">Trạng thái:</span> {order?.statusLabel}</p>
                  <p><span className="font-semibold text-slate-900">Đơn thuốc:</span> {order?.requiresPrescription ? "Có" : "Không"}</p>
                  <p><span className="font-semibold text-slate-900">Ghi chú:</span> {order?.note || "Không có"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-lg font-bold text-slate-900">Sản phẩm trong đơn</h3>
              <div className="mt-4 space-y-3">
                {(order?.items || []).map((entry) => (
                  <div key={entry.orderItemId || entry.id} className="rounded-[20px] bg-white px-4 py-4">
                    <p className="font-semibold text-slate-900">{entry.name || entry.productName || "Sản phẩm"}</p>
                    <p className="mt-1 text-sm text-slate-500">Số lượng: {entry.quantity || 1}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Đơn giá: {formatCurrency((entry.variantPrice || entry.price || 0) * (entry.quantity || 1))}
                    </p>
                    {getItemLens(entry) ? (
                      <p className="mt-1 text-sm text-sky-700">
                        Tròng: {getItemLens(entry)?.name || "Tròng kính"}
                      </p>
                    ) : null}
                  </div>
                ))}

                {orderLens ? (
                  <div className="rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-4">
                    <p className="font-semibold text-slate-900">{orderLens.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{orderLens.description || "Tròng kính"}</p>
                  </div>
                ) : null}

                {prescription ? (
                  <div className="rounded-[20px] border border-teal-200 bg-teal-50 px-4 py-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Toa thuốc</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p>Ảnh toa: <span className="font-medium text-slate-900">{prescription.prescriptionImageUrl ? "Có" : "Không"}</span></p>
                      <p>Trạng thái duyệt: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.reviewStatus)}</span></p>
                      <p>SPH OD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.sphereOd)}</span></p>
                      <p>SPH OS: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.sphereOs)}</span></p>
                      <p>CYL OD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.cylinderOd)}</span></p>
                      <p>CYL OS: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.cylinderOs)}</span></p>
                      <p>AXIS OD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.axisOd)}</span></p>
                      <p>AXIS OS: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.axisOs)}</span></p>
                      <p>PD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.pd)}</span></p>
                      <p className="sm:col-span-2">
                        Ghi chú duyệt: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.reviewNote)}</span>
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaffOperationsHandoffPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const storedHighlight = (() => {
    try {
      const raw = sessionStorage.getItem(STAFF_HIGHLIGHTED_ORDER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const highlightedOrderId =
    location.state?.highlightedOrderId ||
    (storedHighlight?.targetPath === "/staff/operations-handoff"
      ? storedHighlight.highlightedOrderId
      : null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingOrderId, setActingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadOrders({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    const blockedPayosOrderIds = new Set(
      [...listSalePendingPaymentReviews(), ...listSaleApprovedPaymentReviews()]
        .map((item) => String(item?.orderId ?? "").trim())
        .filter(Boolean)
    );

    try {
      const [apiOrders, operationOrders] = await Promise.all([
        staffOrderApi.fetchReadyForHandoffOrders(),
        getOperationOrders(),
      ]);
      pruneLocalReadyForHandoffOrders(
        operationOrders.map((item) => item?.orderId ?? item?.id)
      );
      const localFallbackOrders = readLocalReadyForHandoffOrders().filter((item) =>
        canUseLocalHandoffFallback(item)
      );
      setOrders(
        sortOrdersNewestFirst(
          mergeOrdersById(apiOrders, localFallbackOrders).filter(
            (item) =>
              !blockedPayosOrderIds.has(String(item?.id ?? item?.orderId ?? "").trim()) &&
              isHandoffOrderStillVisible(item) &&
              canOrderBeHandedOff(item)
          )
        )
      );
      setError("");
    } catch (apiError) {
      setOrders(
        sortOrdersNewestFirst(
          readLocalReadyForHandoffOrders().filter(
            (item) =>
              !blockedPayosOrderIds.has(String(item?.id ?? item?.orderId ?? "").trim()) &&
              canUseLocalHandoffFallback(item) &&
              isHandoffOrderStillVisible(item) &&
              canOrderBeHandedOff(item)
          )
        )
      );
      setError(extractErrorMessage(apiError, "Không thể tải danh sách đơn chờ bàn giao."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const intervalId = window.setInterval(() => {
      loadOrders({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  async function openOrderDetails(order) {
    setSelectedOrder(order);
    setDetailLoading(true);

    try {
      const detail = await staffOrderApi.fetchStaffOrderDetail(order.id);
      setSelectedOrder(detail);
    } catch (apiError) {
      appToast.warning(extractErrorMessage(apiError, "Không thể tải chi tiết đơn hàng."));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleHandoff(order) {
    if (!canOrderBeHandedOff(order)) {
      appToast.warning(getHandoffBlockReason(order) || "Đơn hàng chưa đủ điều kiện bàn giao.");
      return;
    }

    setActingOrderId(order.id);

    try {
      if (order?.requiresPrescription || order?.prescription) {
        const detail = await staffOrderApi.fetchStaffOrderDetail(order.id).catch(() => null);
        const prescription =
          (await staffOrderApi.fetchOrderPrescription(order.id).catch(() => null)) ||
          detail?.prescription ||
          order?.prescription ||
          null;

        const prescriptionId = prescription?.id ?? prescription?.prescriptionId ?? null;
        const reviewStatus = String(
          prescription?.reviewStatus ?? detail?.prescriptionReviewStatus ?? order?.prescriptionReviewStatus ?? ""
        )
          .trim()
          .toUpperCase();

        if (prescriptionId && reviewStatus !== "APPROVED") {
          await staffOrderApi.reviewPrescription(prescriptionId, {
            reviewStatus: "APPROVED",
            reviewNote: "Prescription approved before operations handoff",
          });
        }

        setOrders((currentOrders) =>
          currentOrders.map((item) =>
            String(item.id) === String(order.id)
              ? {
                  ...item,
                  prescriptionReviewStatus: "APPROVED",
                  prescription: item?.prescription
                    ? {
                        ...item.prescription,
                        reviewStatus: "APPROVED",
                        reviewNote:
                          item?.prescription?.reviewNote || "Prescription approved before operations handoff",
                      }
                    : item?.prescription,
                }
              : item
          )
        );
      }

      await staffOrderApi.handoffStaffOrder(order.id);
      markHandedOffOperationOrder(order.id);
      removeLocalReadyForHandoffOrder(order.id);
      queryClient.invalidateQueries({ queryKey: operationQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: operationQueryKeys.summary() });
      queryClient.invalidateQueries({ queryKey: ["operation-order"] });
      setOrders((currentOrders) => currentOrders.filter((item) => String(item.id) !== String(order.id)));
      appToast.success(`Đã bàn giao đơn ${order.code} cho Operation`);
    } catch (apiError) {
      console.error("handoffStaffOrder failed", {
        orderId: order?.id,
        apiError,
      });

      const message = extractErrorMessage(apiError, `Không thể bàn giao đơn ${order.code} cho Operation.`);
      appToast.warning(message);
    } finally {
      setActingOrderId(null);
    }
  }

  return (
    <>
      <StaffWorkspaceLayout
        eyebrow="Workspace 03"
        title="Bàn giao đơn hàng"
        stats={[]}
        leftColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <PackageCheck size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách chờ bàn giao</h2>
              </div>
            </div>

            {error ? (
              <Alert
                type="error"
                showIcon
                message="Không thể tải danh sách chờ bàn giao"
                description={error}
                className="mt-6"
              />
            ) : null}

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spin size="large" />
                </div>
              ) : orders.length > 0 ? (
                orders.map((item) => {
                  const handoffBlockedReason = getHandoffBlockReason(item);
                  const isHandoffDisabled =
                    actingOrderId === item.id || Boolean(handoffBlockedReason);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-[28px] border p-5 ${
                        item.id === highlightedOrderId
                          ? "border-sky-200 bg-sky-50/60"
                          : "border-slate-200 bg-slate-50/70"
                      }`}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                              {item.code}
                            </span>
                            {item.requiresPrescription ? (
                              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                Có đơn thuốc
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            {item.type} • Tổng tiền: {item.totalText}
                          </p>
                        </div>

                        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                          Chờ bàn giao đơn hàng
                        </span>
                      </div>

                      <div className="mt-4 rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                        Người nhận: {item.receiverName || item.customer} • Kênh: {item.channel} • Đã chờ: {item.eta}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleHandoff(item)}
                          disabled={isHandoffDisabled}
                          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Bàn giao cho Operation
                        </button>
                        <button
                          type="button"
                          onClick={() => openOrderDetails(item)}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Xem chi tiết
                        </button>
                      </div>

                      {handoffBlockedReason ? (
                        <p className="mt-3 text-sm font-medium text-amber-700">{handoffBlockedReason}</p>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        }
        rightColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Send size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan bàn giao</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                Đơn sẵn sàng bàn giao: <span className="font-semibold text-slate-900">{orders.length}</span>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-600">
                Đơn có đơn thuốc:{" "}
                <span className="font-semibold text-slate-900">
                  {orders.filter((item) => item.requiresPrescription).length}
                </span>
              </div>
            </div>
          </div>
        }
      />

      <OrderDetailModal order={selectedOrder} loading={detailLoading} onClose={() => setSelectedOrder(null)} />
    </>
  );
}
