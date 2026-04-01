import React, { useEffect, useMemo, useState } from "react";
import {
  CircleCheckBig,
  ClipboardList,
  Cog,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import orderService from "../services/orderService";
import { getApiErrorMessage } from "../utils/apiError";
import { ORDER_STATUS } from "../utils/orderHistory";

const orderTabContent = {
  [ORDER_STATUS.ALL]: {
    title: "Tất cả đơn hàng",
    description: "Theo dõi toàn bộ tiến độ đơn hàng của bạn theo đúng trạng thái vận hành hiện tại.",
    icon: ClipboardList,
  },
  [ORDER_STATUS.PROCESSING]: {
    title: "Chờ gia công",
    description: "Đơn đang ở giai đoạn gia công hoặc đóng gói tại bộ phận vận hành.",
    icon: Cog,
  },
  [ORDER_STATUS.SHIPPING]: {
    title: "Vận chuyển",
    description: "Đơn đã sẵn sàng giao hàng và đang chờ bàn giao cho đơn vị vận chuyển.",
    icon: PackageCheck,
  },
  [ORDER_STATUS.READY_TO_DELIVER]: {
    title: "Chờ giao hàng",
    description: "Đơn đang trên đường vận chuyển tới bạn.",
    icon: Truck,
  },
  [ORDER_STATUS.COMPLETED]: {
    title: "Hoàn thành",
    description: "Đơn đã hoàn tất và giao thành công.",
    icon: CircleCheckBig,
  },
  [ORDER_STATUS.CANCELED]: {
    title: "Đã hủy",
    description: "Đơn đã bị hủy trước khi hoàn tất.",
    icon: RotateCcw,
  },
  [ORDER_STATUS.RETURN_REFUND]: {
    title: "Trả hàng/Hoàn tiền",
    description: "Đơn đang trong quy trình trả hàng hoặc hoàn tiền.",
    icon: RotateCcw,
  },
};

function extractOrderList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.orders)) {
    return payload.orders;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShippingAddress(address) {
  if (!address) {
    return "--";
  }

  if (typeof address === "string") {
    return address.trim() || "--";
  }

  const parts = [
    address.addressDetail,
    address.wardName,
    address.districtName,
    address.cityName || address.provinceName,
  ].filter(Boolean);

  return parts.join(", ") || "--";
}

function getPaymentStatusLabel(status) {
  const normalized = String(status || "").trim().toUpperCase();

  switch (normalized) {
    case "PAID":
    case "SUCCESS":
    case "COMPLETED":
      return "Đã thanh toán";
    case "PENDING":
    case "UNPAID":
      return "Chờ thanh toán";
    case "FAILED":
      return "Thanh toán thất bại";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return normalized || "--";
  }
}

function getPaymentStatusClassName(status) {
  const normalized = String(status || "").trim().toUpperCase();

  switch (normalized) {
    case "PAID":
    case "SUCCESS":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "PENDING":
    case "UNPAID":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "FAILED":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "REFUNDED":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

function normalizePrescription(prescription) {
  if (!prescription || typeof prescription !== "object") {
    return null;
  }

  return prescription;
}

function formatPrescriptionValue(value) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return String(value);
}

function getItemLens(item) {
  return (
    item?.lensName ||
    item?.lensProduct?.name ||
    item?.lens?.name ||
    item?.lensType ||
    null
  );
}

function resolveDisplayStatus(order) {
  return order?.status ?? order?.orderStatus ?? order?.phase ?? order?.orderPhase ?? "";
}

function resolveCustomerStatusTab(order) {
  const normalized = String(resolveDisplayStatus(order) || "")
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "MANUFACTURING":
    case "PACKING":
    case "PROCESSING":
    case "PRESCRIPTION_REVIEW":
    case "PENDING_CONFIRMATION":
      return ORDER_STATUS.PROCESSING;
    case "READY_TO_SHIP":
      return ORDER_STATUS.SHIPPING;
    case "SHIPPING":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "READY_TO_DELIVER":
      return ORDER_STATUS.READY_TO_DELIVER;
    case "COMPLETED":
    case "DELIVERED":
      return ORDER_STATUS.COMPLETED;
    case "CANCELED":
    case "CANCELLED":
      return ORDER_STATUS.CANCELED;
    case "RETURN_REFUND":
    case "RETURNED":
    case "REFUNDED":
      return ORDER_STATUS.RETURN_REFUND;
    default:
      return ORDER_STATUS.ALL;
  }
}

function getOrderStatusLabel(status) {
  const normalized = String(status || "").trim().toUpperCase();

  switch (normalized) {
    case "MANUFACTURING":
    case "PACKING":
    case "PROCESSING":
    case "PRESCRIPTION_REVIEW":
    case "PENDING_CONFIRMATION":
      return "Chờ gia công";
    case "READY_TO_SHIP":
      return "Vận chuyển";
    case "SHIPPING":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "READY_TO_DELIVER":
      return "Chờ giao hàng";
    case "COMPLETED":
    case "DELIVERED":
      return "Hoàn tất đơn hàng";
    case "CANCELED":
    case "CANCELLED":
      return "Đã hủy";
    case "RETURN_REFUND":
    case "RETURNED":
    case "REFUNDED":
      return "Trả hàng/Hoàn tiền";
    default:
      return normalized || "Đang xử lý";
  }
}

function getStatusBadgeClassName(status) {
  const normalized = String(status || "").trim().toUpperCase();

  switch (normalized) {
    case "MANUFACTURING":
    case "PACKING":
    case "PROCESSING":
    case "PRESCRIPTION_REVIEW":
    case "PENDING_CONFIRMATION":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
    case "READY_TO_SHIP":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    case "SHIPPING":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "READY_TO_DELIVER":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "COMPLETED":
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "CANCELED":
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "RETURN_REFUND":
    case "RETURNED":
    case "REFUNDED":
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

function OrderCard({ order }) {
  const displayStatus = resolveDisplayStatus(order);
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.orderItems)
      ? order.orderItems
      : [];
  const prescription = normalizePrescription(order?.prescription);
  const receiverName =
    order?.receiverName || order?.shippingName || order?.customerName || order?.customerProfile?.fullName;
  const phoneNumber = order?.phoneNumber || order?.receiverPhone || order?.customerPhone;
  const orderCode = order?.orderCode || order?.code || order?.orderNumber || `ORD-${order?.id ?? "--"}`;

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-bold tracking-[0.14em] text-white">
              {orderCode}
            </span>
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusBadgeClassName(displayStatus)}`}
            >
              {getOrderStatusLabel(displayStatus)}
            </span>
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${getPaymentStatusClassName(
                order?.paymentStatus
              )}`}
            >
              {getPaymentStatusLabel(order?.paymentStatus)}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-slate-900">{receiverName || "Khách hàng"}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Đặt lúc {formatDateTime(order?.createdAt)} • Cập nhật {formatDateTime(order?.updatedAt)}
            </p>
          </div>
        </div>

        <div className="grid min-w-[220px] gap-3 rounded-[24px] bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tổng tiền</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(order?.totalAmount ?? order?.totalPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Phương thức</p>
            <p className="mt-1 font-medium text-slate-900">{order?.paymentMethod || "--"}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Người nhận</p>
          <p className="mt-2 text-base font-medium text-slate-900">{receiverName || "--"}</p>
          <p className="mt-2 text-sm text-slate-600">{phoneNumber || "--"}</p>
          <p className="mt-2 text-sm text-slate-600">{formatShippingAddress(order?.shippingAddress)}</p>
        </div>

        <div className="rounded-[24px] border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sản phẩm</p>
          <div className="mt-3 space-y-3">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div
                  key={item?.orderItemId || item?.id || `${orderCode}-item-${index}`}
                  className="rounded-2xl bg-slate-50 p-3"
                >
                  <p className="font-medium text-slate-900">{item?.productName || item?.name || "Tròng kính"}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Số lượng: {item?.quantity || 1}
                    {getItemLens(item) ? ` • Gói tròng: ${getItemLens(item)}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Chưa có thông tin sản phẩm.</p>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Đơn thuốc</p>
          {prescription ? (
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-400">Mắt phải SPH</p>
                <p className="mt-1 font-medium">{formatPrescriptionValue(prescription?.sphereOd)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-400">Mắt trái SPH</p>
                <p className="mt-1 font-medium">{formatPrescriptionValue(prescription?.sphereOs)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-400">Mắt phải CYL</p>
                <p className="mt-1 font-medium">{formatPrescriptionValue(prescription?.cylinderOd)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-400">Mắt trái CYL</p>
                <p className="mt-1 font-medium">{formatPrescriptionValue(prescription?.cylinderOs)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-400">Axis phải</p>
                <p className="mt-1 font-medium">{formatPrescriptionValue(prescription?.axisOd)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-400">Axis trái</p>
                <p className="mt-1 font-medium">{formatPrescriptionValue(prescription?.axisOs)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 col-span-2">
                <p className="text-slate-400">PD</p>
                <p className="mt-1 font-medium">{formatPrescriptionValue(prescription?.pd)}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Đơn này không yêu cầu đơn thuốc.</p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function OrderTrackingPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeTab = useMemo(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    return orderTabContent[tab] ? tab : ORDER_STATUS.ALL;
  }, [location.search]);

  const activeTabMeta = orderTabContent[activeTab] || orderTabContent[ORDER_STATUS.ALL];

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");
        const response = await orderService.getMyOrders();

        if (!mounted) {
          return;
        }

        setOrders(extractOrderList(response));
      } catch (nextError) {
        if (!mounted) {
          return;
        }

        setError(getApiErrorMessage(nextError, "Không thể tải danh sách đơn hàng của bạn."));
        setOrders([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeTab === ORDER_STATUS.ALL) {
      return orders;
    }

    return orders.filter((order) => resolveCustomerStatusTab(order) === activeTab);
  }, [activeTab, orders]);

  const ActiveIcon = activeTabMeta.icon;

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.08),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                    Theo dõi đơn hàng
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold text-slate-900">{activeTabMeta.title}</h1>
                </div>
              </div>
              <p className="mt-4 text-base leading-7 text-slate-600">{activeTabMeta.description}</p>
            </div>

            <div className="rounded-[24px] bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tổng số đơn đang hiển thị
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{filteredOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              Đang tải đơn hàng...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && filteredOrders.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <p className="text-lg font-semibold text-slate-900">Chưa có đơn hàng phù hợp</p>
              <p className="mt-2 text-sm text-slate-500">
                Khi bộ phận vận hành cập nhật tiến độ, trạng thái ở đây sẽ tự chạy theo đúng bước tương ứng.
              </p>
            </div>
          ) : null}

          {!loading && !error
            ? filteredOrders.map((order) => (
                <OrderCard
                  key={order?.id || order?.orderId || order?.orderCode || order?.orderNumber}
                  order={order}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
