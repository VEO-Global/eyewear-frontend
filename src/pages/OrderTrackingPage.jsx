import React, { useEffect, useMemo, useState } from "react";
import {
  CircleCheckBig,
  ClipboardList,
  Cog,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOperationOrders } from "../features/operations/api/operationApi";
import orderService from "../services/orderService";
import { getApiErrorMessage } from "../utils/apiError";
import { ORDER_STATUS, normalizeOrderStatusTab } from "../utils/orderHistory";
import {
  LOCAL_STORAGE_QUEUE_UPDATED_EVENT,
  readLocalOperationOrders,
} from "../utils/staffOperationTransfer";

const CUSTOMER_ORDER_POLLING_INTERVAL_MS = 15000;

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

function normalizeOrderTabParam(tab) {
  const normalized = decodeURIComponent(String(tab || "").trim()).toLowerCase();

  switch (normalized) {
    case "":
    case "tat-ca":
    case "tất cả":
      return ORDER_STATUS.ALL;
    case "cho-gia-cong":
    case "chờ gia công":
      return ORDER_STATUS.PROCESSING;
    case "van-chuyen":
    case "vận chuyển":
      return ORDER_STATUS.SHIPPING;
    case "cho-giao-hang":
    case "chờ giao hàng":
      return ORDER_STATUS.READY_TO_DELIVER;
    case "hoan-thanh":
    case "hoàn thành":
      return ORDER_STATUS.COMPLETED;
    case "da-huy":
    case "đã hủy":
      return ORDER_STATUS.CANCELED;
    case "tra-hang-hoan-tien":
    case "trả hàng/hoàn tiền":
      return ORDER_STATUS.RETURN_REFUND;
    default:
      return orderTabContent[tab] ? tab : ORDER_STATUS.ALL;
  }
}

function getNormalizedActiveTab(tab) {
  return normalizeOrderStatusTab(tab);
}

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

function toPositiveNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

function extractOrderPagination(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      totalPages: 1,
      pageNumber: 0,
      pageSize: 0,
    };
  }

  return {
    totalPages: toPositiveNumber(payload?.totalPages ?? payload?.pages, 1),
    pageNumber: Math.max(
      0,
      Number(payload?.number ?? payload?.page ?? payload?.pageNumber ?? 0) || 0
    ),
    pageSize: toPositiveNumber(
      payload?.size ?? payload?.pageSize ?? payload?.limit ?? extractOrderList(payload).length,
      0
    ),
  };
}

async function fetchAllCustomerOrders() {
  const pageSize = 100;
  const firstResponse = await orderService.getMyOrders({ page: 0, size: pageSize });
  const firstItems = extractOrderList(firstResponse);
  const pagination = extractOrderPagination(firstResponse);
  const totalPages = Math.max(1, pagination.totalPages);

  if (totalPages <= 1) {
    return firstItems;
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      orderService.getMyOrders({ page: index + 1, size: pageSize })
    )
  );

  return [firstItems, ...remainingResponses.map((response) => extractOrderList(response))].flat();
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

function getOrderStatusSignals(order) {
  return [
    order?.operationStatus,
    order?.currentOperationStatus,
    order?.operation?.status,
    order?.latestOperationStatus,
    order?.status,
    order?.orderStatus,
    order?.deliveryStatus,
    order?.phase,
    order?.orderPhase,
    order?.customerTab,
  ]
    .map((value) => String(value || "").trim().toUpperCase())
    .filter(Boolean);
}

function getOperationWorkflowStatus(order) {
  const statuses = [
    order?.operationStatus,
    order?.currentOperationStatus,
    order?.operation?.status,
    order?.latestOperationStatus,
  ]
    .map((value) => String(value || "").trim().toUpperCase())
    .filter(Boolean);

  return (
    statuses.find((status) =>
      ["MANUFACTURING", "PACKING", "READY_TO_SHIP", "SHIPPING", "COMPLETED"].includes(status)
    ) || ""
  );
}

function normalizeLookupValue(value) {
  return String(value || "").trim().toUpperCase();
}

function createCustomerOrderFromOperationOrder(operationOrder) {
  if (!operationOrder || typeof operationOrder !== "object") {
    return null;
  }

  const orderId = operationOrder?.orderId ?? operationOrder?.id ?? null;
  const orderCode = operationOrder?.orderCode ?? operationOrder?.code ?? (orderId ? `ORD-${orderId}` : "--");

  return {
    id: orderId,
    orderId,
    code: orderCode,
    orderCode,
    orderNumber: orderCode,
    operationStatus: operationOrder?.status ?? null,
    currentOperationStatus: operationOrder?.status ?? null,
    latestOperationStatus: operationOrder?.status ?? null,
    status: operationOrder?.orderStatus ?? operationOrder?.status ?? null,
    orderStatus: operationOrder?.orderStatus ?? operationOrder?.status ?? null,
    paymentMethod: operationOrder?.paymentMethod ?? "--",
    totalAmount: operationOrder?.totalAmount ?? operationOrder?.finalAmount ?? 0,
    totalPrice: operationOrder?.totalAmount ?? operationOrder?.finalAmount ?? 0,
    createdAt: operationOrder?.createdAt ?? null,
    updatedAt: operationOrder?.updatedAt ?? operationOrder?.createdAt ?? null,
    receiverName: operationOrder?.receiverName ?? "Khach hang",
    shippingName: operationOrder?.receiverName ?? "Khach hang",
    customerName: operationOrder?.receiverName ?? "Khach hang",
    phoneNumber: operationOrder?.phoneNumber ?? null,
    receiverPhone: operationOrder?.phoneNumber ?? null,
    customerPhone: operationOrder?.phoneNumber ?? null,
    customerEmail: operationOrder?.customerEmail ?? null,
    shippingAddress: operationOrder?.shippingAddress ?? null,
    logisticsProvider: operationOrder?.logisticsProvider ?? null,
    shippingMethod: operationOrder?.shippingMethod ?? null,
    trackingNumber: operationOrder?.trackingNumber ?? null,
    requiresPrescription:
      operationOrder?.orderType === "PRESCRIPTION" ||
      Boolean(operationOrder?.prescription) ||
      String(operationOrder?.prescriptionOption || "").toUpperCase() === "WITH_PRESCRIPTION",
    prescription: operationOrder?.prescription ?? null,
    items: Array.isArray(operationOrder?.items)
      ? operationOrder.items.map((item) => ({
          ...item,
          name: item?.name ?? item?.productName ?? "San pham",
          productName: item?.productName ?? item?.name ?? "San pham",
          quantity: item?.quantity ?? 1,
          price: item?.price ?? item?.unitPrice ?? 0,
          variantPrice: item?.variantPrice ?? item?.unitPrice ?? item?.price ?? 0,
        }))
      : [],
  };
}

function mergeCustomerOrdersWithOperationOrders(items, operationItems = readLocalOperationOrders()) {
  const customerOrders = Array.isArray(items) ? items : [];
  const operationOrders = Array.isArray(operationItems) ? operationItems : [];

  if (!operationOrders.length) {
    return customerOrders;
  }

  const byId = new Map();
  const byCode = new Map();

  operationOrders.forEach((item) => {
    const orderId = normalizeLookupValue(item?.orderId ?? item?.id);
    const orderCode = normalizeLookupValue(item?.orderCode ?? item?.code);

    if (orderId) {
      byId.set(orderId, item);
    }

    if (orderCode) {
      byCode.set(orderCode, item);
    }
  });

  const mergedOrders = customerOrders.map((order) => {
    const orderId = normalizeLookupValue(order?.orderId ?? order?.id);
    const orderCode = normalizeLookupValue(order?.orderCode ?? order?.code ?? order?.orderNumber);
    const operationOrder = byId.get(orderId) || byCode.get(orderCode);

    if (!operationOrder) {
      return order;
    }

    return {
      ...order,
      operationStatus: operationOrder?.status ?? order?.operationStatus ?? null,
      currentOperationStatus: operationOrder?.status ?? order?.currentOperationStatus ?? null,
      latestOperationStatus: operationOrder?.status ?? order?.latestOperationStatus ?? null,
      receiverName: order?.receiverName || operationOrder?.receiverName || order?.customerName,
      phoneNumber: order?.phoneNumber || operationOrder?.phoneNumber || order?.receiverPhone,
      shippingAddress: order?.shippingAddress || operationOrder?.shippingAddress,
      updatedAt: operationOrder?.updatedAt || order?.updatedAt,
      trackingNumber: order?.trackingNumber || operationOrder?.trackingNumber,
      logisticsProvider: order?.logisticsProvider || operationOrder?.logisticsProvider,
      shippingMethod: order?.shippingMethod || operationOrder?.shippingMethod,
    };
  });

  operationOrders.forEach((operationOrder) => {
    const operationId = normalizeLookupValue(operationOrder?.orderId ?? operationOrder?.id);
    const operationCode = normalizeLookupValue(operationOrder?.orderCode ?? operationOrder?.code);
    const alreadyExists = mergedOrders.some((order) => {
      const orderId = normalizeLookupValue(order?.orderId ?? order?.id);
      const orderCode = normalizeLookupValue(order?.orderCode ?? order?.code ?? order?.orderNumber);
      return (operationId && orderId === operationId) || (operationCode && orderCode === operationCode);
    });

    if (!alreadyExists) {
      const syntheticOrder = createCustomerOrderFromOperationOrder(operationOrder);

      if (syntheticOrder) {
        mergedOrders.push(syntheticOrder);
      }
    }
  });

  return mergedOrders;
}

function resolveDisplayStatus(order) {
  return getOrderStatusSignals(order)[0] || "";
}

function resolveCustomerStatusTab(order) {
  const operationWorkflowStatus = getOperationWorkflowStatus(order);

  if (["MANUFACTURING", "PACKING"].includes(operationWorkflowStatus)) {
    return ORDER_STATUS.PROCESSING;
  }

  if (operationWorkflowStatus === "READY_TO_SHIP") {
    return ORDER_STATUS.SHIPPING;
  }

  if (operationWorkflowStatus === "SHIPPING") {
    return ORDER_STATUS.READY_TO_DELIVER;
  }

  if (operationWorkflowStatus === "COMPLETED") {
    return ORDER_STATUS.COMPLETED;
  }

  const statuses = getOrderStatusSignals(order);

  if (
    statuses.some((status) =>
      [
        ORDER_STATUS.PROCESSING.toUpperCase(),
        "MANUFACTURING",
        "PACKING",
        "PROCESSING",
        "PRESCRIPTION_REVIEW",
        "PENDING_CONFIRMATION",
      ].includes(status)
    )
  ) {
    return ORDER_STATUS.PROCESSING;
  }

  if (
    statuses.some((status) =>
      [ORDER_STATUS.SHIPPING.toUpperCase(), "READY_TO_SHIP"].includes(status)
    )
  ) {
    return ORDER_STATUS.SHIPPING;
  }

  if (
    statuses.some((status) =>
      [
        ORDER_STATUS.READY_TO_DELIVER.toUpperCase(),
        "SHIPPING",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "READY_TO_DELIVER",
      ].includes(status)
    )
  ) {
    return ORDER_STATUS.READY_TO_DELIVER;
  }

  if (
    statuses.some((status) =>
      [ORDER_STATUS.COMPLETED.toUpperCase(), "COMPLETED", "DELIVERED"].includes(status)
    )
  ) {
    return ORDER_STATUS.COMPLETED;
  }

  if (
    statuses.some((status) =>
      [ORDER_STATUS.CANCELED.toUpperCase(), "CANCELED", "CANCELLED"].includes(status)
    )
  ) {
    return ORDER_STATUS.CANCELED;
  }

  if (
    statuses.some((status) =>
      [ORDER_STATUS.RETURN_REFUND.toUpperCase(), "RETURN_REFUND", "RETURNED", "REFUNDED"].includes(status)
    )
  ) {
    return ORDER_STATUS.RETURN_REFUND;
  }

  return ORDER_STATUS.ALL;
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rawTab = useMemo(() => new URLSearchParams(location.search).get("tab"), [location.search]);

  const activeTab = useMemo(() => {
    return getNormalizedActiveTab(rawTab);
  }, [rawTab]);

  const activeTabMeta = orderTabContent[activeTab] || orderTabContent[ORDER_STATUS.ALL];

  useEffect(() => {
    const normalizedTab = getNormalizedActiveTab(rawTab);

    if ((rawTab || "") === normalizedTab) {
      return;
    }

    const nextSearchParams = new URLSearchParams(location.search);
    nextSearchParams.set("tab", normalizedTab);

    navigate(
      {
        pathname: location.pathname,
        search: `?${nextSearchParams.toString()}`,
      },
      { replace: true }
    );
  }, [activeTab, location.pathname, location.search, navigate, rawTab]);

  useEffect(() => {
    let mounted = true;

    async function loadOrders({ silent = false } = {}) {
      try {
        if (!silent) {
          setLoading(true);
        }
        setError("");
        const [response, operationOrders] = await Promise.all([
          fetchAllCustomerOrders(),
          getOperationOrders().catch(() => readLocalOperationOrders()),
        ]);

        if (!mounted) {
          return;
        }

        setOrders(
          mergeCustomerOrdersWithOperationOrders(extractOrderList(response), operationOrders)
        );
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

    const intervalId = window.setInterval(() => {
      loadOrders({ silent: true });
    }, CUSTOMER_ORDER_POLLING_INTERVAL_MS);

    const handleStorage = (event) => {
      if (event?.key && event.key !== "operation-local-queue") {
        return;
      }

      loadOrders({ silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadOrders({ silent: true });
      }
    };

    const handleLocalQueueUpdated = (event) => {
      if (event?.detail?.key && event.detail.key !== "operation-local-queue") {
        return;
      }

      loadOrders({ silent: true });
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LOCAL_STORAGE_QUEUE_UPDATED_EVENT, handleLocalQueueUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LOCAL_STORAGE_QUEUE_UPDATED_EVENT, handleLocalQueueUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeTab]);

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
