import { Alert, Spin } from "antd";
import { Eye, FileSearch, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";
import { extractErrorMessage } from "../../services/managerApi";
import { staffOrderApi } from "../../services/staffOrderApi";
import { ORDER_PHASE } from "../../utils/orderHistory";
import { appToast } from "../../utils/appToast";
import { filterVisiblePrescriptionSupportOrders } from "../../utils/staffIntakeVisibility";
import {
  createLocalReadyForHandoffOrder,
  isPrescriptionOrderStillVisible,
  markCompletedPrescriptionOrder,
  upsertLocalReadyForHandoffOrder,
} from "../../utils/staffOperationTransfer";

const STAFF_HIGHLIGHTED_ORDER_KEY = "staff-highlighted-order";
const POLLING_INTERVAL_MS = 15000;
const REQUIRED_MANUAL_FIELDS = ["sphereOd", "sphereOs", "pd"];

function normalizePrescriptionEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return {
      id: null,
      sphereOd: "",
      cylinderOd: "",
      axisOd: "",
      sphereOs: "",
      cylinderOs: "",
      axisOs: "",
      pd: "",
      note: "",
      prescriptionImageUrl: "",
      reviewStatus: "PENDING",
      reviewNote: "",
    };
  }

  return {
    id: entry?.id ?? entry?.prescriptionId ?? null,
    sphereOd: entry?.sphereOd ?? "",
    cylinderOd: entry?.cylinderOd ?? "",
    axisOd: entry?.axisOd ?? "",
    sphereOs: entry?.sphereOs ?? "",
    cylinderOs: entry?.cylinderOs ?? "",
    axisOs: entry?.axisOs ?? "",
    pd: entry?.pd ?? "",
    note: entry?.note ?? "",
    prescriptionImageUrl: entry?.prescriptionImageUrl ?? "",
    reviewStatus: entry?.reviewStatus ?? "PENDING",
    reviewNote: entry?.reviewNote ?? entry?.note ?? "",
  };
}

function mergePrescriptionEntries(...entries) {
  const normalizedEntries = entries
    .map((entry) => (entry && typeof entry === "object" ? normalizePrescriptionEntry(entry) : null))
    .filter(Boolean);

  if (!normalizedEntries.length) {
    return null;
  }

  return normalizedEntries.reduce((merged, current) => ({
    ...merged,
    ...current,
    id: merged?.id ?? current?.id ?? null,
    prescriptionImageUrl: merged?.prescriptionImageUrl || current?.prescriptionImageUrl || "",
    sphereOd: merged?.sphereOd !== "" ? merged.sphereOd : current?.sphereOd ?? "",
    cylinderOd: merged?.cylinderOd !== "" ? merged.cylinderOd : current?.cylinderOd ?? "",
    axisOd: merged?.axisOd !== "" ? merged.axisOd : current?.axisOd ?? "",
    sphereOs: merged?.sphereOs !== "" ? merged.sphereOs : current?.sphereOs ?? "",
    cylinderOs: merged?.cylinderOs !== "" ? merged.cylinderOs : current?.cylinderOs ?? "",
    axisOs: merged?.axisOs !== "" ? merged.axisOs : current?.axisOs ?? "",
    pd: merged?.pd !== "" ? merged.pd : current?.pd ?? "",
    note: merged?.note || current?.note || "",
    reviewStatus: merged?.reviewStatus || current?.reviewStatus || "PENDING",
    reviewNote: merged?.reviewNote || current?.reviewNote || "",
  }), null);
}

function hasManualPrescriptionData(entry) {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  return REQUIRED_MANUAL_FIELDS.every((field) => String(entry[field] ?? "").trim() !== "");
}

function canCompletePrescriptionReview(order) {
  const prescription = normalizePrescriptionEntry(order?.prescription);
  return Boolean(prescription.prescriptionImageUrl || hasManualPrescriptionData(prescription));
}

function getOrderLens(order) {
  return (
    order?.lensProduct ??
    order?.lens ??
    (Array.isArray(order?.items)
      ? order.items.find((item) => item?.lensProduct || item?.lens)?.lensProduct ||
        order.items.find((item) => item?.lensProduct || item?.lens)?.lens
      : null)
  );
}

function PrescriptionField({ label, value }) {
  return (
    <div className="rounded-[22px] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/50 to-sky-50/70 px-4 py-3 shadow-[0_10px_30px_rgba(14,165,233,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value || "Chưa có"}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center text-slate-500">
      Chưa có đơn thuốc nào cần kiểm tra.
    </div>
  );
}

function OrderPrescriptionModal({ order, loading, onClose }) {
  if (!order && !loading) {
    return null;
  }

  const prescription = normalizePrescriptionEntry(order?.prescription);
  const hasCustomerManual = hasManualPrescriptionData(prescription);
  const lens = getOrderLens(order);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4 rounded-[28px] border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Chi tiết đơn thuốc
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
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-sky-50/70 p-5 shadow-[0_12px_36px_rgba(34,211,238,0.08)]">
                <h3 className="text-lg font-bold text-slate-900">Thông tin đơn cần kiểm tra</h3>
                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Khách hàng:</span> {order?.customer}</p>
                  <p><span className="font-semibold text-slate-900">Kênh:</span> {order?.channel}</p>
                  <p><span className="font-semibold text-slate-900">Tổng tiền:</span> {order?.totalText}</p>
                  <p><span className="font-semibold text-slate-900">Loại đơn:</span> {order?.type}</p>
                  {lens ? <p><span className="font-semibold text-slate-900">Tròng:</span> {lens?.name}</p> : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/60 p-5 shadow-[0_12px_36px_rgba(168,85,247,0.08)]">
                <h3 className="text-lg font-bold text-slate-900">Ảnh đơn thuốc khách gửi</h3>
                {prescription.prescriptionImageUrl ? (
                  <div className="mt-4 overflow-hidden rounded-[24px] border border-violet-100 bg-white shadow-[0_10px_30px_rgba(168,85,247,0.08)]">
                    <img
                      src={prescription.prescriptionImageUrl}
                      alt="Ảnh đơn thuốc"
                      className="max-h-[360px] w-full object-contain bg-slate-50"
                    />
                  </div>
                ) : (
                  <div className="mt-4 rounded-[22px] border border-dashed border-violet-200 bg-white/90 px-4 py-8 text-center text-sm text-slate-500">
                    Khách không tải ảnh đơn thuốc.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/60 p-5 shadow-[0_12px_36px_rgba(16,185,129,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">Số liệu đơn thuốc hiện có</h3>
                  {hasCustomerManual ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Khách đã nhập tay
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Khách chưa nhập tay
                    </span>
                  )}
                </div>

                {hasCustomerManual ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <PrescriptionField label="Mắt phải SPH" value={prescription.sphereOd} />
                    <PrescriptionField label="Mắt phải CYL" value={prescription.cylinderOd} />
                    <PrescriptionField label="Mắt phải AXIS" value={prescription.axisOd} />
                    <PrescriptionField label="Mắt trái SPH" value={prescription.sphereOs} />
                    <PrescriptionField label="Mắt trái CYL" value={prescription.cylinderOs} />
                    <PrescriptionField label="Mắt trái AXIS" value={prescription.axisOs} />
                    <PrescriptionField label="PD" value={prescription.pd} />
                    <PrescriptionField label="Review status" value={prescription.reviewStatus} />
                    <PrescriptionField label="Review note" value={prescription.reviewNote} />
                    <PrescriptionField label="Ghi chú" value={prescription.note} />
                  </div>
                ) : (
                  <div className="mt-4 rounded-[22px] border border-dashed border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-4 text-sm leading-6 text-amber-900">
                    Khách chưa nhập tay số liệu. Chỉ cần có ảnh đơn thuốc là staff vẫn duyệt qua được.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaffPrescriptionSupportPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
    (storedHighlight?.targetPath === "/staff/prescription-support"
      ? storedHighlight.highlightedOrderId
      : null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actingOrderId, setActingOrderId] = useState(null);

  async function loadOrders({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    try {
      const orderList = await staffOrderApi.fetchStaffOrders({
        phase: ORDER_PHASE.PRESCRIPTION_REVIEW,
      });

      setOrders(
        filterVisiblePrescriptionSupportOrders(orderList)
          .filter((item) => isPrescriptionOrderStillVisible(item))
          .map((item) => ({
            ...item,
            orderId: item?.id ?? item?.orderId ?? null,
            prescription: item?.prescription || null,
          }))
      );
      setError("");
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Không thể tải danh sách đơn thuốc."));
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

  async function openPrescriptionDetail(order) {
    setSelectedOrder({
      ...order,
      orderId: order?.id ?? order?.orderId ?? null,
      prescription: normalizePrescriptionEntry(order?.prescription),
    });
    setDetailLoading(true);

    try {
      const detail = await staffOrderApi.fetchStaffOrderDetail(order.id);
      let prescriptionDetail = null;

      try {
        prescriptionDetail = await staffOrderApi.fetchOrderPrescription(order.id);
      } catch {
        // keep the embedded prescription data if the dedicated endpoint fails
      }

      const resolvedPrescription = mergePrescriptionEntries(
        prescriptionDetail,
        detail?.prescription,
        order?.prescription
      );

      setSelectedOrder({
        ...detail,
        orderId: detail?.id ?? detail?.orderId ?? order?.id ?? order?.orderId ?? null,
        prescription: resolvedPrescription,
      });
    } catch (apiError) {
      appToast.warning(extractErrorMessage(apiError, "Không thể tải chi tiết đơn thuốc."));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCompleteReview(order) {
    if (!canCompletePrescriptionReview(order)) {
      appToast.warning("Cần có ít nhất ảnh đơn thuốc hoặc dữ liệu nhập tay để duyệt.");
      return;
    }

    const orderId = order?.id ?? order?.orderId ?? null;

    if (!orderId) {
      appToast.error("Không tìm thấy orderId.");
      return;
    }

    setActingOrderId(orderId);

    try {
      const prescription = normalizePrescriptionEntry(
        mergePrescriptionEntries(order?.prescription)
      );

      if (prescription?.id) {
        try {
          await staffOrderApi.reviewPrescription(prescription.id, {
            reviewStatus: "APPROVED",
            reviewNote: "Đã kiểm tra đơn thuốc",
          });
        } catch (reviewError) {
          console.error("Cannot review prescription before phase update", {
            orderId,
            prescriptionId: prescription.id,
            reviewError,
          });
        }
      } else {
        console.warn("Missing prescriptionId, continue phase update for handoff", {
          orderId,
          orderPrescription: order?.prescription,
        });
      }

      try {
        await staffOrderApi.completeStaffOrder(orderId);
      } catch (completeError) {
        console.error("completeStaffOrder failed, fallback to phase update", {
          orderId,
          completeError,
        });

        await staffOrderApi.updateStaffOrderPhase(orderId, {
          phase: "READY_TO_DELIVER",
          note: "Đã hoàn tất kiểm tra đơn thuốc",
        });
      }

      upsertLocalReadyForHandoffOrder(createLocalReadyForHandoffOrder(order));
      markCompletedPrescriptionOrder(orderId);
      setOrders((currentOrders) => currentOrders.filter((item) => String(item.id) !== String(orderId)));

      sessionStorage.setItem(
        STAFF_HIGHLIGHTED_ORDER_KEY,
        JSON.stringify({
          highlightedOrderId: orderId,
          highlightedOrderCode: order.code,
          targetPath: "/staff/operations-handoff",
        })
      );

      await loadOrders({ silent: true });

      navigate("/staff/operations-handoff", {
        state: {
          highlightedOrderId: orderId,
          highlightedOrderCode: order.code,
        },
      });
    } catch (apiError) {
      console.error("Prescription review fallback to local handoff queue", {
        orderId,
        apiError,
      });
      upsertLocalReadyForHandoffOrder(createLocalReadyForHandoffOrder(order));
      markCompletedPrescriptionOrder(orderId);
      setOrders((currentOrders) => currentOrders.filter((item) => String(item.id) !== String(orderId)));
      sessionStorage.setItem(
        STAFF_HIGHLIGHTED_ORDER_KEY,
        JSON.stringify({
          highlightedOrderId: orderId,
          highlightedOrderCode: order.code,
          targetPath: "/staff/operations-handoff",
        })
      );
      appToast.success(`Đã chuyển đơn ${order.code} sang tab bàn giao.`);
      navigate("/staff/operations-handoff", {
        state: {
          highlightedOrderId: orderId,
          highlightedOrderCode: order.code,
        },
      });
    } finally {
      setActingOrderId(null);
    }
  }

  return (
    <>
      <StaffWorkspaceLayout
        eyebrow="Workspace 02"
        title="Kiểm tra đơn thuốc"
        stats={[]}
        leftColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <FileSearch size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách đơn cần kiểm tra</h2>
              </div>
            </div>

            {error ? (
              <Alert
                type="error"
                showIcon
                message="Không thể tải danh sách đơn thuốc"
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
                  const prescription = normalizePrescriptionEntry(item.prescription);
                  const hasManualData = hasManualPrescriptionData(prescription);
                  const canComplete = canCompletePrescriptionReview(item);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-[28px] border p-5 ${
                        item.id === highlightedOrderId
                          ? "border-cyan-200 bg-cyan-50/60"
                          : "border-slate-200 bg-slate-50/70"
                      }`}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                              {item.code}
                            </span>
                            {prescription.prescriptionImageUrl ? (
                              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                Có ảnh đơn thuốc
                              </span>
                            ) : null}
                            {hasManualData ? (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Đã có số liệu nhập tay
                              </span>
                            ) : (
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                Chưa có số liệu nhập tay
                              </span>
                            )}
                          </div>
                          <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.type} • Khách: {item.customerPhone || "Chưa có SĐT"} • Kênh: {item.channel}
                          </p>
                        </div>

                        <div className="rounded-[22px] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                          <p className="font-semibold text-slate-900">{item.statusLabel}</p>
                          <p className="mt-1">Đang chờ: {item.eta}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleCompleteReview(item)}
                          disabled={!canComplete || actingOrderId === item.id}
                          className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Hoàn tất kiểm tra đơn hàng
                        </button>
                        <button
                          type="button"
                          onClick={() => openPrescriptionDetail(item)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={16} />
                          Xem chi tiết đơn thuốc
                        </button>
                      </div>
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
          <div className="rounded-[32px] border border-rose-200 bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_100%)] p-6 shadow-[0_16px_40px_rgba(251,113,133,0.10)]">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan đơn thuốc</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="rounded-[22px] border border-rose-200 bg-white/90 px-4 py-4">
                Số đơn cần kiểm tra: <span className="font-bold">{orders.length}</span>
              </div>
              <div className="rounded-[22px] border border-rose-200 bg-white/90 px-4 py-4">
                Đơn đã có ảnh hoặc dữ liệu từ khách:{" "}
                <span className="font-bold">
                  {orders.filter((item) => canCompletePrescriptionReview(item)).length}
                </span>
              </div>
              <div className="rounded-[22px] border border-rose-200 bg-white/90 px-4 py-4">
                Chỉ cần có 1 trong 2: ảnh đơn thuốc hoặc dữ liệu nhập tay, staff có thể duyệt qua.
              </div>
            </div>
          </div>
        }
      />

      <OrderPrescriptionModal
        order={selectedOrder}
        loading={detailLoading}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
