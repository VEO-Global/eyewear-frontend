import {
  CircleCheckBig,
  ClipboardList,
  Cog,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { orderService } from "../services/orderService";
import { getApiErrorMessage } from "../utils/apiError";

const ORDER_STATUS = {
  ALL: "tat-ca",
  PROCESSING: "cho-gia-cong",
  SHIPPING: "van-chuyen",
  READY_TO_DELIVER: "cho-giao-hang",
  COMPLETED: "hoan-thanh",
  CANCELED: "da-huy",
  RETURN_REFUND: "tra-hang-hoan-tien",
};

const orderTabContent = {
  [ORDER_STATUS.ALL]: {
    title: "Tất cả đơn hàng",
    description: "Danh sách đơn hàng của bạn.",
    icon: ClipboardList,
  },
  [ORDER_STATUS.PROCESSING]: {
    title: "Đơn hàng chờ gia công",
    description: "Các đơn đang chờ duyệt toa hoặc đang xử lý.",
    icon: Cog,
  },
  [ORDER_STATUS.SHIPPING]: {
    title: "Đơn hàng vận chuyển",
    description: "Các đơn đang trên đường giao đến bạn.",
    icon: Truck,
  },
  [ORDER_STATUS.READY_TO_DELIVER]: {
    title: "Đơn hàng chờ giao hàng",
    description: "Đơn đã sẵn sàng để giao.",
    icon: PackageCheck,
  },
  [ORDER_STATUS.COMPLETED]: {
    title: "Đơn hàng hoàn thành",
    description: "Lịch sử các đơn hoàn tất.",
    icon: CircleCheckBig,
  },
  [ORDER_STATUS.CANCELED]: {
    title: "Đơn hàng đã hủy",
    description: "Các đơn đã bị hủy hoặc không tiếp tục xử lý.",
    icon: RotateCcw,
  },
  [ORDER_STATUS.RETURN_REFUND]: {
    title: "Trả hàng/Hoàn tiền",
    description: "Các đơn đang ở trạng thái trả hàng hoặc hoàn tiền.",
    icon: RotateCcw,
  },
};

function extractOrderList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatDateTime(value) {
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
    address.wardName || address.ward,
    address.districtName || address.district,
    address.cityName || address.provinceName || address.city,
  ]
    .filter(Boolean)
    .join(", ");
}

function getPaymentStatusLabel(status) {
  const normalizedStatus = String(status || "").toUpperCase();
  const labelMap = {
    PAID: "Đã thanh toán",
    PENDING: "Chờ thanh toán",
    UNPAID: "Chưa thanh toán",
  };

  return labelMap[normalizedStatus] || "Chưa rõ";
}

function getPaymentStatusClassName(status) {
  const normalizedStatus = String(status || "").toUpperCase();
  const styleMap = {
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    UNPAID: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return styleMap[normalizedStatus] || "border-slate-200 bg-slate-50 text-slate-700";
}

function getOrderStatusLabel(status) {
  const normalizedStatus = String(status || "").toUpperCase();
  const labelMap = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELED: "Đã hủy",
    CANCELLED: "Đã hủy",
    RETURN_REFUND: "Trả hàng/Hoàn tiền",
    READY_TO_DELIVER: "Chờ giao hàng",
  };

  return labelMap[normalizedStatus] || status || "Chờ xử lý";
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
  return value === undefined || value === null || value === "" ? "ChÆ°a cĂ³" : value;
}

function getItemLens(item) {
  return item?.lensProduct ?? item?.lens ?? null;
}

function OrderCard({ order }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const prescription = normalizePrescription(order?.prescription);
  const orderLens = order?.lensProduct ?? order?.lens ?? null;

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Đơn hàng #{order?.orderCode || order?.id || "--"}
            </h2>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStatusClassName(
                order?.paymentStatus
              )}`}
            >
              {getPaymentStatusLabel(order?.paymentStatus)}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {getOrderStatusLabel(order?.orderStatus)}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              Người nhận:{" "}
              <span className="font-medium text-slate-900">
                {order?.receiverName || "Chưa cập nhật"}
              </span>
            </p>
            <p>
              Số điện thoại:{" "}
              <span className="font-medium text-slate-900">
                {order?.phoneNumber || "Chưa cập nhật"}
              </span>
            </p>
            <p>
              Thời gian đặt:{" "}
              <span className="font-medium text-slate-900">{formatDateTime(order?.createdAt)}</span>
            </p>
            <p>
              Tổng tiền:{" "}
              <span className="font-medium text-slate-900">
                {formatCurrency(order?.finalAmount ?? order?.totalAmount)}
              </span>
            </p>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Địa chỉ giao hàng:{" "}
            <span className="font-medium text-slate-700">
              {formatShippingAddress(order?.shippingAddress)}
            </span>
          </p>

          <div className="mt-4 space-y-3">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div
                  key={item?.orderItemId || item?.id || `${order?.id}-${index}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item?.productName || item?.name || "Sản phẩm"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        SKU: {item?.variantSku || "--"} • Size: {item?.size || "--"} • Màu:{" "}
                        {item?.color || "--"}
                      </p>
                      {getItemLens(item) ? (
                        <p className="mt-1 text-sm text-sky-700">
                          TrĂ²ng: {getItemLens(item)?.name || "Tròng kính"}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Số lượng: {item?.quantity || 0}</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(item?.lineAmount ?? item?.totalAmount ?? item?.price ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Chưa có chi tiết sản phẩm cho đơn hàng này.
              </div>
            )}
          </div>

          {orderLens ? (
            <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700">
              Tròng kính: <span className="font-semibold text-slate-900">{orderLens.name}</span>
            </div>
          ) : null}

          {prescription ? (
            <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">Thông tin toa thuốc</p>
                {prescription.reviewStatus ? (
                  <span className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold text-teal-700">
                    {prescription.reviewStatus}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                <p>Ảnh toa thuốc: <span className="font-medium text-slate-900">{prescription.prescriptionImageUrl ? "Có" : "Không"}</span></p>
                <p>SPH OD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.sphereOd)}</span></p>
                <p>SPH OS: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.sphereOs)}</span></p>
                <p>CYL OD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.cylinderOd)}</span></p>
                <p>CYL OS: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.cylinderOs)}</span></p>
                <p>AXIS OD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.axisOd)}</span></p>
                <p>AXIS OS: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.axisOs)}</span></p>
                <p>PD: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.pd)}</span></p>
                <p className="sm:col-span-2 lg:col-span-3">
                  Ghi chĂº review: <span className="font-medium text-slate-900">{formatPrescriptionValue(prescription.reviewNote)}</span>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeTab = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("tab") || ORDER_STATUS.ALL;
  }, [location.search]);

  const currentSection = orderTabContent[activeTab] || orderTabContent[ORDER_STATUS.ALL];
  const ActiveIcon = currentSection.icon;

  useEffect(() => {
    let mounted = true;

    async function fetchMyOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await orderService.getMyOrders({
          tab: activeTab,
          page: 0,
          size: 10,
        });

        if (mounted) {
          setOrders(extractOrderList(response));
        }
      } catch (nextError) {
        if (mounted) {
          setError(getApiErrorMessage(nextError, "Không thể tải danh sách đơn hàng."));
          setOrders([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMyOrders();

    return () => {
      mounted = false;
    };
  }, [activeTab]);

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
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Danh sách đơn hàng
            </h2>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              Đang tải đơn hàng...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm leading-7 text-rose-700">
              {error}
            </div>
          ) : orders.length > 0 ? (
            <div className="mt-6 space-y-6">
              {orders.map((order, index) => (
                <OrderCard key={order?.orderId || order?.id || index} order={order} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm leading-7 text-slate-500">
              Chưa có đơn hàng nào ở trạng thái này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
