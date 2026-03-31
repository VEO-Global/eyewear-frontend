import {
  Ban,
  CircleCheckBig,
  ClipboardList,
  Cog,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  TimerReset,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { appToast } from "../utils/appToast";
import { increaseVariantStock } from "../redux/products/producSlice";
import {
  cancelStoredOrder,
  formatCurrency,
  formatRemainingTime,
  ORDER_PHASE,
  ORDER_STATUS,
} from "../utils/orderHistory";

const orderTabContent = {
  [ORDER_STATUS.ALL]: {
    title: "Tất cả đơn hàng",
    description:
      "Khu vực này luôn hiển thị toàn bộ đơn hàng đã thanh toán của bạn, bất kể đơn đang ở trạng thái nào.",
    icon: ClipboardList,
  },
  [ORDER_STATUS.PROCESSING]: {
    title: "Đơn hàng chờ gia công",
    description:
      "Đơn có đơn thuốc sẽ đi qua bước chờ duyệt đơn thuốc trước, sau đó mới bắt đầu gia công.",
    icon: Cog,
  },
  [ORDER_STATUS.SHIPPING]: {
    title: "Đơn hàng vận chuyển",
    description:
      "Các đơn đã bàn giao cho đơn vị giao nhận và đang trên đường đến địa chỉ của bạn.",
    icon: Truck,
  },
  [ORDER_STATUS.READY_TO_DELIVER]: {
    title: "Đơn hàng chờ giao hàng",
    description:
      "Các đơn đã sẵn sàng giao và đang chờ đơn vị vận chuyển hoặc nhân viên giao hàng tiếp nhận.",
    icon: PackageCheck,
  },
  [ORDER_STATUS.COMPLETED]: {
    title: "Đơn hàng hoàn thành",
    description:
      "Các đơn đã giao thành công để bạn tiện xem lại lịch sử mua hàng và bảo hành.",
    icon: CircleCheckBig,
  },
  [ORDER_STATUS.CANCELED]: {
    title: "Đơn hàng đã hủy",
    description:
      "Các đơn đã hủy sẽ được hiển thị riêng tại đây để bạn theo dõi dễ hơn.",
    icon: Ban,
  },
  [ORDER_STATUS.RETURN_REFUND]: {
    title: "Trả hàng/Hoàn tiền",
    description:
      "Những đơn đã hủy hoặc đang trong quá trình trả hàng, hoàn tiền sẽ được theo dõi tại đây.",
    icon: RotateCcw,
  },
};

const phaseBadgeMap = {
  [ORDER_PHASE.PENDING_CONFIRMATION]: {
    label: "Chờ xác nhận",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  [ORDER_PHASE.PRESCRIPTION_REVIEW]: {
    label: "Chờ duyệt đơn thuốc",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  [ORDER_PHASE.PROCESSING]: {
    label: "Đang gia công",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  [ORDER_PHASE.SHIPPING]: {
    label: "Vận chuyển",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  [ORDER_PHASE.READY_TO_DELIVER]: {
    label: "Chờ giao hàng",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  [ORDER_PHASE.COMPLETED]: {
    label: "Hoàn thành",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  [ORDER_PHASE.CANCELED]: {
    label: "Đã hủy",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  [ORDER_PHASE.RETURN_REFUND]: {
    label: "Trả hàng/Hoàn tiền",
    className: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },
};

function formatOrderDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShippingAddress(address) {
  if (!address || typeof address !== "object") {
    return "Chưa có địa chỉ giao hàng";
  }

  return [
    address.addressDetail,
    address.wardName,
    address.districtName,
    address.provinceName,
  ]
    .filter(Boolean)
    .join(", ");
}

function filterOrdersByTab(orders, activeTab) {
  if (activeTab === ORDER_STATUS.ALL) {
    return orders
      .filter((order) => order.paymentStatus === "paid")
      .sort((left, right) => {
        const leftCanceled = left.phase === ORDER_PHASE.CANCELED;
        const rightCanceled = right.phase === ORDER_PHASE.CANCELED;

        if (leftCanceled === rightCanceled) {
          const leftTime = new Date(left.createdAt || 0).getTime();
          const rightTime = new Date(right.createdAt || 0).getTime();
          return rightTime - leftTime;
        }

        return leftCanceled ? 1 : -1;
      });
  }

  if (activeTab === ORDER_STATUS.PROCESSING) {
    return orders.filter((order) =>
      [ORDER_PHASE.PRESCRIPTION_REVIEW, ORDER_PHASE.PROCESSING].includes(
        order.phase
      )
    );
  }

  if (activeTab === ORDER_STATUS.READY_TO_DELIVER) {
    return orders.filter(
      (order) => order.phase === ORDER_PHASE.READY_TO_DELIVER
    );
  }

  if (activeTab === ORDER_STATUS.SHIPPING) {
    return orders.filter((order) => order.phase === ORDER_PHASE.SHIPPING);
  }

  if (activeTab === ORDER_STATUS.COMPLETED) {
    return orders.filter((order) => order.phase === ORDER_PHASE.COMPLETED);
  }

  if (activeTab === ORDER_STATUS.CANCELED) {
    return orders.filter((order) => order.phase === ORDER_PHASE.CANCELED);
  }

  if (activeTab === ORDER_STATUS.RETURN_REFUND) {
    return orders.filter((order) =>
      [ORDER_PHASE.CANCELED, ORDER_PHASE.RETURN_REFUND].includes(order.phase)
    );
  }

  return orders;
}

function StatusPanel({
  order,
  badge,
  activeTab,
  isConfirming,
  onOpenCancel,
  onConfirmCancel,
  onCloseCancel,
}) {
  return (
    <div className="relative w-full shrink-0 rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 pb-5 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] lg:w-[290px]">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Trạng thái hiện tại
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Tổng thanh toán
          </p>
          <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-900">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      <div className="pt-5">
        {isConfirming ? (
          <div className="rounded-[24px] border border-rose-200 bg-[linear-gradient(180deg,#fff5f5_0%,#ffe9ec_100%)] p-4 shadow-[0_18px_36px_rgba(244,63,94,0.14)]">
            <p className="text-base font-semibold text-slate-900">
              Bạn xác nhận hủy đơn này?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sau khi hủy, đơn hàng sẽ không tiếp tục xử lý nữa.
            </p>
            <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
              Để hoàn tiền cho sản phẩm vui lòng xem ở phần Trả hàng/hoàn tiền
              để hoàn thành việc hoàn tiền.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => onConfirmCancel(order)}
                className="inline-flex w-full items-center justify-center rounded-[18px] bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-600"
              >
                Xác nhận hủy đơn
              </button>
              <button
                type="button"
                onClick={onCloseCancel}
                className="inline-flex w-full items-center justify-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Giữ lại đơn
              </button>
            </div>
          </div>
        ) : order.canCancel ? (
          <button
            type="button"
            onClick={() => onOpenCancel(order)}
            className="inline-flex w-full items-center justify-center rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100"
          >
            Hủy đơn
          </button>
        ) : order.phase === ORDER_PHASE.CANCELED &&
          activeTab !== ORDER_STATUS.RETURN_REFUND ? (
          <div className="rounded-[20px] border border-rose-200 bg-[linear-gradient(180deg,#fff1f2_0%,#ffe4e6_100%)] px-4 py-3 text-sm font-medium text-rose-700">
            Đơn đã được hủy.
          </div>
        ) : (
          <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-500">
            Đơn chỉ được hủy trước khi nhân viên xác nhận và bắt đầu xử lý.
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  now,
  activeTab,
  isConfirming,
  isMuted,
  onOpenCancel,
  onConfirmCancel,
  onCloseCancel,
}) {
  const firstItem = order.items?.[0];
  const badge =
    activeTab === ORDER_STATUS.RETURN_REFUND &&
    order.phase === ORDER_PHASE.CANCELED
      ? {
          label: "Đang chờ hoàn tiền",
          className: "border-amber-200 bg-amber-50 text-amber-700",
        }
      : phaseBadgeMap[order.phase] ||
        phaseBadgeMap[ORDER_PHASE.PENDING_CONFIRMATION];
  const processingRemainingMs =
    order.phase === ORDER_PHASE.PROCESSING && order.processingEndsAt
      ? Math.max(0, order.processingEndsAt - now)
      : 0;

  return (
    <div
      className={`rounded-[30px] border bg-white p-6 transition-all duration-300 lg:p-7 ${
        isConfirming
          ? "relative z-20 scale-[1.02] border-rose-200 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
          : isMuted
            ? "scale-[0.985] border-slate-200 opacity-35 blur-[1.2px] shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
            : "border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.12)]"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-5">
          <div className="flex-shrink-0">
            {firstItem?.imgUrl ? (
              <img
                src={firstItem.imgUrl}
                alt={firstItem.name}
                className="h-24 w-24 rounded-[20px] border border-slate-200 bg-white object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-[20px] border border-slate-200 bg-slate-50 text-xs text-slate-400">
                Không có ảnh
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Đơn hàng #{order.orderNumber}
              </h2>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Đã thanh toán xong
              </span>
              {order.requiresPrescription ? (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  Có đơn thuốc
                </span>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Không cần gia công
                </span>
              )}
            </div>

            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                Người nhận:{" "}
                <span className="font-medium text-slate-900">
                  {order.receiverName || "Chưa cập nhật"}
                </span>
              </p>
              <p>
                Số điện thoại:{" "}
                <span className="font-medium text-slate-900">
                  {order.phoneNumber || "Chưa cập nhật"}
                </span>
              </p>
              <p>
                Thời gian đặt:{" "}
                <span className="font-medium text-slate-900">
                  {formatOrderDate(order.createdAt)}
                </span>
              </p>
              <p>
                Số sản phẩm:{" "}
                <span className="font-medium text-slate-900">
                  {order.items?.length || 0}
                </span>
              </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Địa chỉ giao hàng:{" "}
              <span className="font-medium text-slate-700">
                {formatShippingAddress(order.shippingAddress)}
              </span>
            </p>

            {order.phase === ORDER_PHASE.PRESCRIPTION_REVIEW ? (
              <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-sm leading-6 text-violet-800">
                Đơn hàng này đang chờ nhân viên duyệt đơn thuốc trước khi chuyển
                sang bước gia công.
              </div>
            ) : null}

            {order.phase === ORDER_PHASE.PROCESSING ? (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <TimerReset className="h-4 w-4" />
                    Đơn đang được gia công trong vòng 4 tiếng kể từ lúc xác
                    nhận.
                  </div>
                  <span className="text-lg font-bold tabular-nums">
                    {formatRemainingTime(processingRemainingMs)}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {(order.items || []).map((item) => (
                <div
                  key={item.orderItemId || `${order.id}-${item.variantID}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Hãng: {item.brand || "EyeCare"} • Size:{" "}
                        {item.size || "--"} • Màu: {item.color || "--"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(item.variantPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {order.lensProduct ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {order.lensProduct.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Tròng kính đi kèm đơn hàng
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(order.lensPrice)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <StatusPanel
          order={order}
          badge={badge}
          activeTab={activeTab}
          isConfirming={isConfirming}
          onOpenCancel={onOpenCancel}
          onConfirmCancel={onConfirmCancel}
          onCloseCancel={onCloseCancel}
        />
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?.id);
  const [tick, setTick] = useState(() => Date.now());
  const { myOrder } = useSelector((state) => state.order);

  const [confirmingOrderId, setConfirmingOrderId] = useState(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const activeTab = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("tab") || ORDER_STATUS.ALL;
  }, [location.search]);

  const currentSection =
    orderTabContent[activeTab] || orderTabContent[ORDER_STATUS.ALL];
  const ActiveIcon = currentSection.icon;

  const filteredOrders = useMemo(
    () => filterOrdersByTab(myOrder, activeTab),
    [activeTab, myOrder]
  );
  console.log(filteredOrders);

  function openCancelConfirmation(order) {
    if (!order?.canCancel) {
      appToast.warning("Đơn này đã được xác nhận xử lý nên không thể hủy nữa.");
      return;
    }

    setConfirmingOrderId(order.id);
  }

  function closeCancelConfirmation() {
    setConfirmingOrderId(null);
  }

  function handleCancelOrder(order) {
    if (!userId || !order?.id) {
      appToast.error("Không thể hủy đơn hàng lúc này.");
      return;
    }

    if (!order.canCancel) {
      appToast.warning("Đơn này đã được xác nhận xử lý nên không thể hủy nữa.");
      return;
    }

    cancelStoredOrder(userId, order.id);
    (order.items || []).forEach((item) => {
      dispatch(
        increaseVariantStock({
          productId: item.productID,
          variantId: item.variantID,
          amount: item.quantity,
        })
      );
    });
    setConfirmingOrderId(null);
    appToast.success("Đã hủy đơn hàng thành công.");
  }

  const hasActiveConfirmation = Boolean(confirmingOrderId);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(153,246,228,0.28),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
        <div className="rounded-[28px] bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-6 sm:p-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-600 shadow-sm">
              <ActiveIcon className="h-4 w-4" />
              Theo dõi đơn hàng
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {currentSection.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              {currentSection.description}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Danh sách đơn hàng
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Đơn đã thanh toán sẽ luôn xuất hiện ở mục Tất cả
            </div>
          </div>

          {myOrder.length > 0 ? (
            <div className="mt-6 space-y-6">
              {myOrder.map((order) => {
                const isConfirming = confirmingOrderId === order.id;
                const isMuted = hasActiveConfirmation && !isConfirming;

                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    now={tick}
                    activeTab={activeTab}
                    isConfirming={isConfirming}
                    isMuted={isMuted}
                    onOpenCancel={openCancelConfirmation}
                    onConfirmCancel={handleCancelOrder}
                    onCloseCancel={closeCancelConfirmation}
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm leading-7 text-slate-500">
              {activeTab === ORDER_STATUS.ALL
                ? "Bạn chưa có đơn hàng đã thanh toán nào. Sau khi thanh toán thành công, đơn sẽ xuất hiện ngay tại đây."
                : "Chưa có đơn hàng nào ở trạng thái này."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
