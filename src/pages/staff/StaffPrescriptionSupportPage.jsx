import { useEffect, useState } from "react";
import { Eye, FileSearch, Phone, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";
import { appToast } from "../../utils/appToast";
import { ORDER_PHASE } from "../../utils/orderHistory";
import { readStaffOrdersByPhase, updateStoredOrderForStaff } from "../../utils/staffOrders";

const STAFF_HIGHLIGHTED_ORDER_KEY = "staff-highlighted-order";
const REQUIRED_MANUAL_FIELDS = ["sphereOd", "sphereOs", "pd"];

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center text-slate-500">
      Chưa có đơn thuốc nào cần kiểm tra.
    </div>
  );
}

function normalizePrescriptionEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return {
      sphereOd: "",
      cylinderOd: "",
      axisOd: "",
      sphereOs: "",
      cylinderOs: "",
      axisOs: "",
      pd: "",
      note: "",
    };
  }

  return {
    sphereOd: entry.sphereOd ?? "",
    cylinderOd: entry.cylinderOd ?? "",
    axisOd: entry.axisOd ?? "",
    sphereOs: entry.sphereOs ?? "",
    cylinderOs: entry.cylinderOs ?? "",
    axisOs: entry.axisOs ?? "",
    pd: entry.pd ?? "",
    note: entry.note ?? "",
  };
}

function hasManualPrescriptionData(entry) {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  return REQUIRED_MANUAL_FIELDS.every((field) => String(entry[field] ?? "").trim() !== "");
}

function getCustomerManualPrescription(order) {
  return normalizePrescriptionEntry(order?.prescription);
}

function canCompletePrescriptionReview(order) {
  return Boolean(
    order?.prescription?.prescriptionImageUrl || hasManualPrescriptionData(getCustomerManualPrescription(order))
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

function OrderPrescriptionModal({
  order,
  onClose,
}) {
  if (!order) {
    return null;
  }

  const uploadedImageUrl = order.prescription?.prescriptionImageUrl;
  const customerManualEntry = getCustomerManualPrescription(order);
  const hasCustomerManual = hasManualPrescriptionData(customerManualEntry);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4 rounded-[28px] border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Chi tiết đơn thuốc
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{order.code}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {order.customer} • {order.customerPhone || "Chưa có số điện thoại"}
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-sky-50/70 p-5 shadow-[0_12px_36px_rgba(34,211,238,0.08)]">
              <h3 className="text-lg font-bold text-slate-900">Thông tin đơn cần kiểm tra</h3>
              <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                <p><span className="font-semibold text-slate-900">Khách hàng:</span> {order.customer}</p>
                <p><span className="font-semibold text-slate-900">Kênh:</span> {order.channel}</p>
                <p><span className="font-semibold text-slate-900">Tổng tiền:</span> {order.totalText}</p>
                <p><span className="font-semibold text-slate-900">Loại đơn:</span> {order.type}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-fuchsia-50/60 p-5 shadow-[0_12px_36px_rgba(168,85,247,0.08)]">
              <h3 className="text-lg font-bold text-slate-900">Ảnh đơn thuốc khách gửi</h3>
              {uploadedImageUrl ? (
                <div className="mt-4 overflow-hidden rounded-[24px] border border-violet-100 bg-white shadow-[0_10px_30px_rgba(168,85,247,0.08)]">
                  <img
                    src={uploadedImageUrl}
                    alt="Ảnh đơn thuốc khách hàng tải lên"
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
                  <PrescriptionField
                    label="Mắt phải SPH"
                    value={customerManualEntry.sphereOd}
                  />
                  <PrescriptionField
                    label="Mắt phải CYL"
                    value={customerManualEntry.cylinderOd}
                  />
                  <PrescriptionField
                    label="Mắt phải AXIS"
                    value={customerManualEntry.axisOd}
                  />
                  <PrescriptionField
                    label="Mắt trái SPH"
                    value={customerManualEntry.sphereOs}
                  />
                  <PrescriptionField
                    label="Mắt trái CYL"
                    value={customerManualEntry.cylinderOs}
                  />
                  <PrescriptionField
                    label="Mắt trái AXIS"
                    value={customerManualEntry.axisOs}
                  />
                  <PrescriptionField
                    label="PD"
                    value={customerManualEntry.pd}
                  />
                  <PrescriptionField
                    label="Ghi chú"
                    value={customerManualEntry.note}
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-[22px] border border-dashed border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-4 text-sm leading-6 text-amber-900">
                  Khách chưa nhập tay số liệu đơn thuốc. Staff vẫn có thể hoàn tất kiểm tra nếu khách đã gửi ảnh đơn thuốc.
                </div>
              )}
            </div>
          </div>
        </div>
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

  const [orders, setOrders] = useState(() => readStaffOrdersByPhase(ORDER_PHASE.PRESCRIPTION_REVIEW));
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    function syncOrders() {
      setOrders(readStaffOrdersByPhase(ORDER_PHASE.PRESCRIPTION_REVIEW));
    }

    syncOrders();

    const intervalId = window.setInterval(syncOrders, 1500);

    function handleStorage(event) {
      if (!event.key || event.key.startsWith("order-history:")) {
        syncOrders();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function openPrescriptionDetail(order) {
    setSelectedOrder(order);
  }

  function handleCompleteReview(order) {
    if (!canCompletePrescriptionReview(order)) {
      appToast.warning("Đơn này chưa có ảnh hoặc số liệu đơn thuốc từ khách nên chưa thể hoàn tất kiểm tra.");
      return;
    }

    updateStoredOrderForStaff({
      storageUserId: order.storageUserId,
      orderId: order.id,
      updater: (currentOrder) => ({
        ...currentOrder,
        phase: ORDER_PHASE.PROCESSING,
        updatedAt: new Date().toISOString(),
      }),
    });

    sessionStorage.setItem(
      STAFF_HIGHLIGHTED_ORDER_KEY,
      JSON.stringify({
        highlightedOrderId: order.id,
        highlightedOrderCode: order.code,
        targetPath: "/staff/operations-handoff",
      })
    );

    navigate("/staff/operations-handoff", {
      state: {
        highlightedOrderId: order.id,
        highlightedOrderCode: order.code,
      },
    });
  }

  return (
    <>
      <StaffWorkspaceLayout
        eyebrow="Workspace 02"
        title="Kiểm tra đơn thuốc và hỗ trợ khách hàng"
        description="Chỉ các đơn đã được staff bấm từ màn Đơn hàng chờ xử lý mới chuyển qua đây để rà lại đơn thuốc trước khi bàn giao."
        currentPath="/staff/prescription-support"
        stats={[]}
        leftColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <FileSearch size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách đơn cần kiểm tra</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Với đơn có ảnh toa nhưng chưa có số liệu nhập tay, staff phải nhập lại rồi mới được hoàn tất kiểm tra.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {orders.length > 0 ? (
                orders.map((item) => {
                  const hasManualData = hasManualPrescriptionData(getCustomerManualPrescription(item));
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
                            {item.prescription?.prescriptionImageUrl ? (
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
                          <p className="mt-2 text-sm leading-7 text-slate-600">{item.type}</p>
                        </div>

                        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                          Chờ kiểm đơn thuốc
                        </span>
                      </div>

                      <div className="mt-4 rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                        Khách: {item.customerPhone || "Chưa có số điện thoại"} • Kênh: {item.channel} • Đã chờ: {item.eta}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleCompleteReview(item)}
                          disabled={!canComplete}
                          className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Hoàn tất kiểm tra
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
          <div className="rounded-[32px] border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <Phone size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan đơn thuốc</h2>
                <p className="mt-1 text-sm text-slate-500">Chỉ còn các đơn đang ở bước kiểm tra đơn thuốc.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[22px] border border-rose-200 bg-white/90 px-4 py-4 text-sm text-slate-600">
                Số đơn cần kiểm tra: <span className="font-semibold text-slate-900">{orders.length}</span>
              </div>
              <div className="rounded-[22px] border border-rose-200 bg-white/90 px-4 py-4 text-sm text-slate-600">
                Đơn đã có ảnh hoặc số liệu từ khách:{" "}
                <span className="font-semibold text-slate-900">
                  {orders.filter((item) => canCompletePrescriptionReview(item)).length}
                </span>
              </div>
              <div className="rounded-[22px] border border-rose-200 bg-white/90 px-4 py-4 text-sm text-slate-600">
                Khi hoàn tất kiểm tra, đơn sẽ được chuyển thẳng sang màn bàn giao đơn hàng.
              </div>
            </div>
          </div>
        }
      />

      <OrderPrescriptionModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
