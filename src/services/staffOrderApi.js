import api from "../configs/config-axios";
import { normalizePagedResponse } from "./managerApi";

function extractNestedPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && typeof payload.data === "object") {
    return extractNestedPayload(payload.data);
  }

  if (payload.result && typeof payload.result === "object") {
    return extractNestedPayload(payload.result);
  }

  return payload;
}

function unwrapEntity(payload) {
  const normalizedPayload = extractNestedPayload(payload);

  if (normalizedPayload && typeof normalizedPayload === "object" && !Array.isArray(normalizedPayload)) {
    if (normalizedPayload.item && typeof normalizedPayload.item === "object") {
      return normalizedPayload.item;
    }

    if (
      normalizedPayload.content &&
      typeof normalizedPayload.content === "object" &&
      !Array.isArray(normalizedPayload.content)
    ) {
      return normalizedPayload.content;
    }
  }

  return normalizedPayload;
}

function cleanPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

const STAFF_PHASE_ENUMS = new Set([
  "PENDING_CONFIRMATION",
  "PRESCRIPTION_REVIEW",
  "READY_TO_DELIVER",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "CANCELED",
]);

const PRESCRIPTION_REVIEW_ENUMS = new Set(["APPROVED", "REJECTED"]);

function normalizeStaffPhaseValue(value) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return "";
  }

  return rawValue.toUpperCase();
}

function denormalizeStaffPhaseValue(value) {
  const rawValue = String(value ?? "").trim().toUpperCase();

  switch (rawValue) {
    case "PENDING_CONFIRMATION":
      return "pending_confirmation";
    case "PRESCRIPTION_REVIEW":
      return "prescription_review";
    case "READY_TO_DELIVER":
      return "ready_to_deliver";
    case "PROCESSING":
      return "processing";
    case "SHIPPING":
      return "shipping";
    case "COMPLETED":
      return "completed";
    case "CANCELED":
      return "canceled";
    case "RETURN_REFUND":
      return "return_refund";
    default:
      return String(value ?? "").trim();
  }
}

function parseApiDateTime(value) {
  if (!value) {
    return Date.now();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return Date.now();
  }

  const hasExplicitTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(rawValue);
  const normalizedValue = hasExplicitTimezone ? rawValue : `${rawValue}Z`;
  const timestamp = new Date(normalizedValue).getTime();

  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function formatWaitTime(createdAt) {
  const createdAtMs = parseApiDateTime(createdAt);
  const ageMinutes = Math.max(0, Math.round((Date.now() - createdAtMs) / 60000));

  return `${String(ageMinutes).padStart(2, "0")} phút`;
}

function getOrderDisplayType(order) {
  const firstItem = Array.isArray(order?.items) && order.items.length > 0 ? order.items[0] : null;
  const itemName = firstItem?.productName || firstItem?.name || "Đơn hàng";
  const lensName = order?.lensProduct?.name;

  return lensName ? `${itemName} + ${lensName}` : itemName;
}

function getPhaseLabel(phase, fallbackLabel) {
  const labels = {
    PENDING_CONFIRMATION: "Chờ xác nhận đơn",
    PRESCRIPTION_REVIEW: "Chờ kiểm tra đơn thuốc",
    PROCESSING: "Đang xử lý",
    READY_TO_DELIVER: "Chờ bàn giao đơn hàng",
    SHIPPING: "Đang giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELED: "Đã hủy",
    RETURN_REFUND: "Trả hàng / hoàn tiền",
  };

  return labels[String(phase ?? "").trim().toUpperCase()] || fallbackLabel || phase || "Đang xử lý";
}

function normalizeOrderItem(item, index) {
  const lens = item?.lensProduct ?? item?.lens ?? null;

  return {
    ...item,
    id: item?.id ?? item?.orderItemId ?? `${item?.variantId || item?.productId || "item"}-${index}`,
    orderItemId: item?.orderItemId ?? item?.id ?? `${item?.variantId || item?.productId || "item"}-${index}`,
    name: item?.name ?? item?.productName ?? item?.product?.name ?? "Sản phẩm",
    productName: item?.productName ?? item?.name ?? item?.product?.name ?? "Sản phẩm",
    quantity: Number(item?.quantity ?? 1),
    price: Number(item?.price ?? item?.variantPrice ?? 0),
    variantPrice: Number(item?.variantPrice ?? item?.price ?? 0),
    lensProductId: item?.lensProductId ?? lens?.id ?? null,
    lens,
    lensProduct: lens,
  };
}

function normalizePrescription(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    ...item,
    id: item?.id ?? item?.prescriptionId ?? null,
    orderId: item?.orderId ?? item?.order?.id ?? item?.order?.orderId ?? null,
    prescriptionImageUrl:
      item?.prescriptionImageUrl ?? item?.imageUrl ?? item?.image ?? item?.fileUrl ?? null,
    sphereOd: item?.sphereOd ?? "",
    cylinderOd: item?.cylinderOd ?? "",
    axisOd: item?.axisOd ?? "",
    sphereOs: item?.sphereOs ?? "",
    cylinderOs: item?.cylinderOs ?? "",
    axisOs: item?.axisOs ?? "",
    pd: item?.pd ?? "",
    note: item?.note ?? item?.reviewNote ?? "",
    reviewStatus: item?.reviewStatus ?? item?.status ?? "PENDING",
    reviewNote: item?.reviewNote ?? item?.note ?? "",
  };
}

export function normalizeStaffOrder(item) {
  const normalizedItems = Array.isArray(item?.items) ? item.items.map(normalizeOrderItem) : [];
  const rawPhase = item?.phase ?? item?.orderPhase ?? item?.status ?? "";
  const normalizedPhase = denormalizeStaffPhaseValue(rawPhase);
  const customerProfile = item?.customerProfile || item?.customer || {};
  const firstItemLens = normalizedItems.find((entry) => entry?.lensProduct || entry?.lens)?.lensProduct || null;

  return {
    ...item,
    id: item?.id ?? item?.orderId,
    code: item?.orderCode ?? item?.orderNumber ?? item?.code ?? `ORD-${item?.id ?? ""}`,
    orderNumber: item?.orderCode ?? item?.orderNumber ?? item?.code ?? `ORD-${item?.id ?? ""}`,
    customer: customerProfile?.fullName ?? item?.customerName ?? item?.receiverName ?? "Khách hàng",
    customerPhone: customerProfile?.phone ?? item?.phoneNumber ?? "",
    customerEmail: customerProfile?.email ?? item?.email ?? "",
    receiverName: item?.receiverName ?? customerProfile?.fullName ?? "Khách hàng",
    channel: item?.sourceChannel ?? item?.channel ?? "ONLINE",
    sourceChannel: item?.sourceChannel ?? item?.channel ?? "ONLINE",
    phase: normalizedPhase,
    status: item?.status ?? normalizedPhase,
    statusLabel: getPhaseLabel(rawPhase, item?.phaseLabel),
    phaseLabel: item?.phaseLabel ?? getPhaseLabel(rawPhase),
    eta: formatWaitTime(item?.createdAt),
    type: getOrderDisplayType({ ...item, items: normalizedItems }),
    totalAmount: Number(item?.totalAmount ?? 0),
    totalText: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(Number(item?.totalAmount ?? 0)),
    requiresPrescription: Boolean(
      item?.requiresPrescription || String(item?.prescriptionOption || "").toUpperCase() === "WITH_PRESCRIPTION"
    ),
    prescriptionOption: item?.prescriptionOption ?? "",
    prescriptionReviewStatus: item?.prescriptionReviewStatus ?? "",
    createdAt: item?.createdAt ?? "",
    updatedAt: item?.updatedAt ?? "",
    note: item?.note ?? "",
    shippingAddress: item?.shippingAddress ?? null,
    customerProfile,
    items: normalizedItems,
    lensProduct: item?.lensProduct ?? item?.lens ?? firstItemLens,
    paymentStatus: item?.paymentStatus ?? "",
    priority: null,
    prescription: normalizePrescription(item?.prescription),
  };
}

export const staffOrderApi = {
  async fetchStaffOrders(params = {}) {
    const normalizedParams = {
      ...params,
      phase: params?.phase ? normalizeStaffPhaseValue(params.phase) : params?.phase,
    };

    const response = await api.get("/staff/orders", { params: cleanPayload(normalizedParams) });
    const payload = extractNestedPayload(response.data);
    const items = Array.isArray(payload) ? payload : normalizePagedResponse(payload).items;
    return items.map(normalizeStaffOrder);
  },

  async fetchStaffOrderDetail(id) {
    const response = await api.get(`/staff/orders/${id}`);
    return normalizeStaffOrder(unwrapEntity(response.data));
  },

  async updateStaffOrderPhase(id, payload) {
    const normalizedPayload = {
      phase: normalizeStaffPhaseValue(payload?.phase),
      note: payload?.note,
    };

    if (!id) {
      throw new Error("Missing orderId for updateStaffOrderPhase.");
    }

    if (!STAFF_PHASE_ENUMS.has(normalizedPayload.phase)) {
      throw new Error(`Invalid staff order phase: ${normalizedPayload.phase || "(empty)"}`);
    }

    console.log("complete prescription check request", {
      url: `/api/staff/orders/${id}/phase`,
      method: "PATCH",
      payload: cleanPayload(normalizedPayload),
    });

    const response = await api.patch(`/staff/orders/${id}/phase`, cleanPayload(normalizedPayload));
    return normalizeStaffOrder(unwrapEntity(response.data));
  },

  async confirmStaffOrder(id) {
    const response = await api.patch(`/staff/orders/${id}/confirm`);
    return normalizeStaffOrder(unwrapEntity(response.data));
  },

  async handoffStaffOrder(id) {
    const response = await api.patch(`/staff/orders/${id}/handoff`);
    return normalizeStaffOrder(unwrapEntity(response.data));
  },

  async fetchReadyForHandoffOrders() {
    const [phaseOrders, statusOrders] = await Promise.all([
      this.fetchStaffOrders({ phase: "READY_TO_DELIVER" }),
      this.fetchStaffOrders({ status: "PENDING_VERIFICATION" }),
    ]);

    const mergedOrders = new Map();

    [...phaseOrders, ...statusOrders].forEach((item) => {
      if (!item?.id) {
        return;
      }

      mergedOrders.set(String(item.id), item);
    });

    return Array.from(mergedOrders.values());
  },

  async completeStaffOrder(id) {
    const response = await api.patch(`/staff/orders/${id}/complete`);
    return normalizeStaffOrder(unwrapEntity(response.data));
  },

  async fetchPendingPrescriptions() {
    const response = await api.get("/staff/prescriptions/pending");
    const payload = extractNestedPayload(response.data);
    const items = Array.isArray(payload) ? payload : normalizePagedResponse(payload).items;
    return items.map(normalizePrescription).filter(Boolean);
  },

  async fetchOrderPrescription(orderId) {
    const response = await api.get(`/staff/orders/${orderId}/prescription`);
    return normalizePrescription(unwrapEntity(response.data));
  },

  async reviewPrescription(id, payload) {
    const normalizedPayload = {
      reviewStatus: String(payload?.reviewStatus ?? "").trim().toUpperCase(),
      reviewNote: payload?.reviewNote,
    };

    if (!id) {
      throw new Error("Missing prescriptionId for reviewPrescription.");
    }

    if (!PRESCRIPTION_REVIEW_ENUMS.has(normalizedPayload.reviewStatus)) {
      throw new Error(
        `Invalid prescription reviewStatus: ${normalizedPayload.reviewStatus || "(empty)"}`
      );
    }

    console.log("complete prescription check request", {
      url: `/api/staff/prescriptions/${id}/review`,
      method: "PATCH",
      payload: cleanPayload(normalizedPayload),
    });

    const response = await api.patch(
      `/staff/prescriptions/${id}/review`,
      cleanPayload(normalizedPayload)
    );
    return normalizePrescription(unwrapEntity(response.data));
  },
};


