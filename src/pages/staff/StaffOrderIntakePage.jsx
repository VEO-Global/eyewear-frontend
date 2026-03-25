import { useEffect, useRef, useState } from "react";
import { ClipboardList, PackageSearch, PhoneCall, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import StaffWorkspaceLayout from "../../components/staff/StaffWorkspaceLayout";
import { addNotification } from "../../redux/notification/notificationSlice";
import { ORDER_PHASE, formatCurrency } from "../../utils/orderHistory";
import { readStaffIntakeOrders, updateStoredOrderForStaff } from "../../utils/staffOrders";

const STAFF_HIGHLIGHTED_ORDER_KEY = "staff-highlighted-order";

function getPriorityClass(priority) {
  if (priority === "Cao") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (priority === "Thuong") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function QueueCard({ item, onPrimaryAction, onShowDetails }) {
  const primaryLabel = item.requiresPrescription ? "Kiểm tra đơn thuốc" : "Xác nhận đơn hàng";
  const secondaryLabel = item.requiresPrescription
    ? "Xem chi tiết sản phẩm"
    : "Xem chi tiết đơn hàng";

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {item.code}
            </span>
            {item.priority ? (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClass(item.priority)}`}
              >
                Ưu tiên {item.priority === "Thuong" ? "thường" : "cao"}
              </span>
            ) : null}
            {item.requiresPrescription ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Có đơn thuốc
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 text-xl font-bold text-slate-900">{item.customer}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {item.type} • Kênh tiếp nhận: {item.channel}
          </p>
        </div>

        <div className="rounded-[22px] bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{item.statusLabel}</p>
          <p className="mt-1">Đang chờ: {item.eta}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onPrimaryAction(item)}
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={() => onShowDetails(item)}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function EmptyQueue() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center text-slate-500">
      Chưa có đơn hàng nào cần staff xử lý.
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  if (!order) {
    return null;
  }

  const shippingAddress = order.shippingAddress;
  const addressLine = [
    shippingAddress?.addressDetail,
    shippingAddress?.wardName || shippingAddress?.ward,
    shippingAddress?.districtName || shippingAddress?.district,
    shippingAddress?.provinceName || shippingAddress?.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500">
              Chi tiết đơn hàng
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

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-lg font-bold text-slate-900">Thông tin người đặt</h3>
              <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Họ tên:</span> {order.customer}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Email:</span>{" "}
                  {order.customerEmail || "Chưa có"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Số điện thoại:</span>{" "}
                  {order.customerPhone || "Chưa có"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Người nhận:</span>{" "}
                  {order.receiverName || order.customer}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-lg font-bold text-slate-900">Thông tin đơn hàng</h3>
              <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                <p>
                  <span className="font-semibold text-slate-900">Tổng tiền:</span> {order.totalText}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Kênh:</span> {order.channel}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Đơn thuốc:</span>{" "}
                  {order.requiresPrescription ? "Có" : "Không"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Ghi chú:</span>{" "}
                  {order.note || "Không có"}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Địa chỉ giao hàng:</span>{" "}
                  {addressLine || "Chưa có"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-lg font-bold text-slate-900">Sản phẩm trong đơn</h3>
            <div className="mt-4 space-y-3">
              {(order.items || []).map((entry) => (
                <div key={entry.orderItemId || entry.variantID} className="rounded-[20px] bg-white px-4 py-4">
                  <p className="font-semibold text-slate-900">{entry.name || entry.productName || "Sản phẩm"}</p>
                  <p className="mt-1 text-sm text-slate-500">Số lượng: {entry.quantity || 1}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Đơn giá: {formatCurrency((entry.variantPrice || entry.price || 0) * (entry.quantity || 1))}
                  </p>
                </div>
              ))}

              {order.lensProduct ? (
                <div className="rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-4">
                  <p className="font-semibold text-slate-900">{order.lensProduct.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.lensProduct.description || "Tròng kính"}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffOrderIntakePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [orders, setOrders] = useState(() => readStaffIntakeOrders());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const seenOrderIdsRef = useRef(new Set(orders.map((item) => item.id)));

  useEffect(() => {
    function syncOrders() {
      const nextOrders = readStaffIntakeOrders();

      setOrders(nextOrders);

      const previousIds = seenOrderIdsRef.current;
      const nextIds = new Set(nextOrders.map((item) => item.id));
      const incomingOrders = nextOrders.filter((item) => !previousIds.has(item.id));

      incomingOrders.forEach((item) => {
        dispatch(
          addNotification({
            type: "info",
            message: `Đơn hàng mới cho staff: ${item.code} - ${item.customer}`,
          })
        );
      });

      seenOrderIdsRef.current = nextIds;
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
  }, [dispatch]);

  const todayFlow = [
    {
      label: "Đơn chờ xử lý",
      value: `${orders.length} đơn`,
      icon: ClipboardList,
      tone: "teal",
    },
    {
      label: "Cần kiểm tra đơn thuốc",
      value: `${orders.filter((item) => item.requiresPrescription).length} đơn`,
      icon: PackageSearch,
      tone: "amber",
    },
    {
      label: "Cần gọi lại khách",
      value: `${orders.filter((item) => item.priority === "Cao").length} đơn`,
      icon: PhoneCall,
      tone: "rose",
    },
  ];

  function handlePrimaryAction(order) {
    const targetPath = order.requiresPrescription
      ? "/staff/prescription-support"
      : "/staff/operations-handoff";

    sessionStorage.setItem(
      STAFF_HIGHLIGHTED_ORDER_KEY,
      JSON.stringify({
        highlightedOrderId: order.id,
        highlightedOrderCode: order.code,
        targetPath,
      })
    );

    updateStoredOrderForStaff({
      storageUserId: order.storageUserId,
      orderId: order.id,
      updater: (currentOrder) => ({
        ...currentOrder,
        phase: order.requiresPrescription ? ORDER_PHASE.PRESCRIPTION_REVIEW : ORDER_PHASE.PROCESSING,
        updatedAt: new Date().toISOString(),
      }),
    });

    navigate(targetPath, {
      state: {
        highlightedOrderId: order.id,
        highlightedOrderCode: order.code,
      },
    });

    window.setTimeout(() => {
      if (window.location.pathname !== targetPath) {
        window.location.assign(targetPath);
      }
    }, 0);
  }

  return (
    <>
      <StaffWorkspaceLayout
        eyebrow="Workspace 01"
        title="Tiếp nhận và xử lý đơn hàng"
        description="Màn hình staff nhận đơn mới theo thời gian thực, tách nhanh luồng có đơn thuốc và không có đơn thuốc để đẩy sang bước xử lý tiếp theo."
        currentPath="/staff/orders-intake"
        stats={[]}
        leftColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500">
                  Đơn hàng chờ xử lý
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Toàn bộ đơn hàng</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {orders.length > 0 ? (
                orders.map((item) => (
                  <QueueCard
                    key={item.id}
                    item={item}
                    onPrimaryAction={handlePrimaryAction}
                    onShowDetails={setSelectedOrder}
                  />
                ))
              ) : (
                <EmptyQueue />
              )}
            </div>
          </div>
        }
        rightColumn={
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Tổng quan ca làm</h2>
            <div className="mt-5 space-y-3">
              {todayFlow.map((item) => {
                const Icon = item.icon;
                const toneClass =
                  item.tone === "amber"
                    ? "bg-amber-50 text-amber-700"
                    : item.tone === "rose"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-teal-50 text-teal-700";

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl p-3 ${toneClass}`}>
                        <Icon size={18} />
                      </div>
                      <p className="max-w-[220px] text-sm font-medium leading-6 text-slate-700">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        }
      />

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}
