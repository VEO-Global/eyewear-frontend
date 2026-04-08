import { OPERATION_STATUS_LABELS } from "../features/operations/utils/constants";
import { getInitialOperationStatus } from "../features/operations/utils/workflow";
import { ORDER_PHASE, formatCurrency } from "./orderHistory";

const STAFF_HANDOFF_QUEUE_KEY = "staff-handoff-local-queue";
const OPERATION_QUEUE_KEY = "operation-local-queue";
const STAFF_COMPLETED_PRESCRIPTION_IDS_KEY = "staff-completed-prescription-order-ids";
const STAFF_HANDED_OFF_OPERATION_IDS_KEY = "staff-handed-off-operation-order-ids";
export const LOCAL_STORAGE_QUEUE_UPDATED_EVENT = "app:local-storage-queue-updated";

function safeRead(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(key, items) {
  try {
    const normalizedItems = Array.isArray(items) ? items : [];
    localStorage.setItem(key, JSON.stringify(normalizedItems));
    window.dispatchEvent(
      new CustomEvent(LOCAL_STORAGE_QUEUE_UPDATED_EVENT, {
        detail: {
          key,
          size: normalizedItems.length,
        },
      })
    );
  } catch {
    // ignore storage failures
  }
}

function normalizeId(value) {
  return String(value ?? "").trim();
}

function normalizeStatusValue(value) {
  return String(value ?? "").trim().toUpperCase();
}

function toTimestamp(value) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function uniqueById(items) {
  const map = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const id = normalizeId(item?.id ?? item?.orderId);

    if (!id) {
      return;
    }

    map.set(id, item);
  });

  return Array.from(map.values());
}

export function readLocalReadyForHandoffOrders() {
  return safeRead(STAFF_HANDOFF_QUEUE_KEY);
}

export function writeLocalReadyForHandoffOrders(items) {
  safeWrite(STAFF_HANDOFF_QUEUE_KEY, uniqueById(items));
}

export function upsertLocalReadyForHandoffOrder(order) {
  const nextOrders = uniqueById([order, ...readLocalReadyForHandoffOrders()]);
  writeLocalReadyForHandoffOrders(nextOrders);
}

export function removeLocalReadyForHandoffOrder(orderId) {
  const normalizedId = normalizeId(orderId);
  writeLocalReadyForHandoffOrders(
    readLocalReadyForHandoffOrders().filter(
      (item) => normalizeId(item?.id ?? item?.orderId) !== normalizedId
    )
  );
}

export function pruneLocalReadyForHandoffOrders(orderIds = []) {
  const idsToRemove = new Set(
    (Array.isArray(orderIds) ? orderIds : []).map((item) => normalizeId(item)).filter(Boolean)
  );

  if (!idsToRemove.size) {
    return;
  }

  writeLocalReadyForHandoffOrders(
    readLocalReadyForHandoffOrders().filter(
      (item) => !idsToRemove.has(normalizeId(item?.id ?? item?.orderId))
    )
  );
}

export function readCompletedPrescriptionOrderIds() {
  return new Set(safeRead(STAFF_COMPLETED_PRESCRIPTION_IDS_KEY).map((item) => normalizeId(item)));
}

export function markCompletedPrescriptionOrder(orderId) {
  const ids = readCompletedPrescriptionOrderIds();
  ids.add(normalizeId(orderId));
  safeWrite(STAFF_COMPLETED_PRESCRIPTION_IDS_KEY, Array.from(ids));
}

export function unmarkCompletedPrescriptionOrder(orderId) {
  const ids = readCompletedPrescriptionOrderIds();
  ids.delete(normalizeId(orderId));
  safeWrite(STAFF_COMPLETED_PRESCRIPTION_IDS_KEY, Array.from(ids));
}

export function readHandedOffOperationOrderIds() {
  return new Set(safeRead(STAFF_HANDED_OFF_OPERATION_IDS_KEY).map((item) => normalizeId(item)));
}

export function markHandedOffOperationOrder(orderId) {
  const ids = readHandedOffOperationOrderIds();
  ids.add(normalizeId(orderId));
  safeWrite(STAFF_HANDED_OFF_OPERATION_IDS_KEY, Array.from(ids));
}

export function isPrescriptionOrderStillVisible(order) {
  const id = normalizeId(order?.id ?? order?.orderId);
  return Boolean(id) && !readCompletedPrescriptionOrderIds().has(id);
}

export function isHandoffOrderStillVisible(order) {
  const id = normalizeId(order?.id ?? order?.orderId);
  return Boolean(id) && !readHandedOffOperationOrderIds().has(id) && !hasOrderEnteredOperations(id);
}

export function getPrescriptionReviewStatus(order) {
  return normalizeStatusValue(
    order?.prescription?.reviewStatus ??
      order?.prescriptionReviewStatus ??
      order?.reviewStatus
  );
}

export function canOrderBeHandedOff(order) {
  const phase = normalizeStatusValue(order?.phase);
  const status = normalizeStatusValue(order?.status);
  const hasPrescription = Boolean(order?.requiresPrescription || order?.prescription);
  const prescriptionReviewStatus = getPrescriptionReviewStatus(order);

  const isReadyForHandoff =
    phase === "PROCESSING" ||
    phase === "READY_TO_DELIVER";

  if (!isReadyForHandoff) {
    return false;
  }

  if (hasPrescription && prescriptionReviewStatus !== "APPROVED") {
    return false;
  }

  return true;
}

export function canUseLocalHandoffFallback(order) {
  const hasPrescription = Boolean(order?.requiresPrescription || order?.prescription);

  if (!hasPrescription) {
    return true;
  }

  return getPrescriptionReviewStatus(order) === "APPROVED";
}

export function sortOrdersNewestFirst(orders) {
  return [...(Array.isArray(orders) ? orders : [])].sort((left, right) => {
    const rightTime = toTimestamp(right?.updatedAt ?? right?.createdAt);
    const leftTime = toTimestamp(left?.updatedAt ?? left?.createdAt);

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return normalizeId(right?.id ?? right?.orderId).localeCompare(
      normalizeId(left?.id ?? left?.orderId)
    );
  });
}

export function getHandoffBlockReason(order) {
  if (canOrderBeHandedOff(order)) {
    return "";
  }

  const hasPrescription = Boolean(order?.requiresPrescription || order?.prescription);

  if (hasPrescription) {
    return "Chờ duyệt đơn thuốc";
  }

  return "Chưa đủ điều kiện bàn giao";
}

export function readLocalOperationOrders() {
  return safeRead(OPERATION_QUEUE_KEY);
}

export function hasOrderEnteredOperations(orderId) {
  const normalizedId = normalizeId(orderId);

  if (!normalizedId) {
    return false;
  }

  return readLocalOperationOrders().some(
    (item) => normalizeId(item?.orderId ?? item?.id) === normalizedId
  );
}

export function writeLocalOperationOrders(items) {
  safeWrite(OPERATION_QUEUE_KEY, uniqueById(items));
}

export function upsertLocalOperationOrder(order) {
  const nextOrders = uniqueById([order, ...readLocalOperationOrders()]);
  writeLocalOperationOrders(nextOrders);
}

export function removeLocalOperationOrder(orderId) {
  const normalizedId = normalizeId(orderId);
  writeLocalOperationOrders(
    readLocalOperationOrders().filter(
      (item) => normalizeId(item?.orderId ?? item?.id) !== normalizedId
    )
  );
}

export function createLocalReadyForHandoffOrder(order) {
  const approvedPrescription = order?.prescription
    ? {
        ...order.prescription,
        reviewStatus:
          order.prescription?.reviewStatus ??
          order?.prescriptionReviewStatus ??
          "APPROVED",
        reviewNote:
          order.prescription?.reviewNote ?? order.prescription?.note ?? "Đã kiểm tra đơn thuốc",
      }
    : null;

  return {
    ...order,
    id: order?.id ?? order?.orderId,
    orderId: order?.id ?? order?.orderId,
    phase: ORDER_PHASE.PROCESSING,
    status: "PENDING_VERIFICATION",
    statusLabel: "Chờ bàn giao đơn hàng",
    phaseLabel: "Chờ bàn giao đơn hàng",
    prescriptionReviewStatus:
      order?.prescriptionReviewStatus ?? approvedPrescription?.reviewStatus ?? null,
    prescription: approvedPrescription,
  };
}

export function createLocalOperationOrder(order) {
  const orderId = order?.orderId ?? order?.id;
  const createdAt = order?.createdAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const requiresPrescription = Boolean(order?.requiresPrescription);
  const orderType = requiresPrescription ? "PRESCRIPTION" : "NORMAL";
  const prescriptionOption = order?.prescriptionOption ?? (requiresPrescription ? "WITH_PRESCRIPTION" : "WITHOUT_PRESCRIPTION");
  const initialStatus = getInitialOperationStatus({
    orderType,
    prescriptionOption,
  });
  const receiverName = order?.receiverName ?? order?.customer ?? "Khách hàng";
  const phoneNumber = order?.phoneNumber ?? order?.customerPhone ?? "";
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

  return {
    orderId,
    orderCode: order?.orderCode ?? order?.code ?? `ORD-${orderId}`,
    paymentMethod: order?.paymentMethod ?? null,
    customerEmail: order?.customerEmail ?? "",
    status: initialStatus,
    orderStatus: "PENDING_VERIFICATION",
    statusLabel: OPERATION_STATUS_LABELS[initialStatus],
    customerTab: null,
    orderType,
    prescriptionOption,
    prescriptionReviewStatus: order?.prescription?.reviewStatus ?? order?.prescriptionReviewStatus ?? null,
    totalAmount: Number(order?.totalAmount ?? 0),
    subtotal: Number(order?.totalAmount ?? 0),
    shippingFee: Number(order?.shippingFee ?? order?.shippingCost ?? 0),
    discountAmount: Number(order?.discountAmount ?? 0),
    finalAmount: Number(order?.totalAmount ?? 0),
    paymentStatus: order?.paymentStatus ?? null,
    shippingAddress,
    city: order?.city ?? order?.shippingAddress?.provinceName ?? order?.shippingAddress?.province ?? null,
    district: order?.district ?? order?.shippingAddress?.districtName ?? order?.shippingAddress?.district ?? null,
    ward: order?.ward ?? order?.shippingAddress?.wardName ?? order?.shippingAddress?.ward ?? null,
    addressDetail: order?.addressDetail ?? order?.shippingAddress?.addressDetail ?? null,
    phoneNumber,
    receiverName,
    note: order?.note ?? null,
    cancelReason: null,
    logisticsProvider: order?.logisticsProvider ?? null,
    shippingMethod: order?.shippingMethod ?? null,
    trackingNumber: order?.trackingNumber ?? null,
    estimatedDeliveryDate: order?.estimatedDeliveryDate ?? null,
    createdAt,
    updatedAt,
    payment: order?.payment ?? null,
    lens: order?.lensProduct
      ? {
          id: order.lensProduct?.id ?? null,
          name: order.lensProduct?.name ?? null,
          price: order.lensProduct?.price ?? null,
          description: order.lensProduct?.description ?? null,
        }
      : null,
    prescription: order?.prescription
      ? {
          prescriptionImageUrl: order.prescription?.prescriptionImageUrl ?? null,
          sphereOd: order.prescription?.sphereOd ?? null,
          sphereOs: order.prescription?.sphereOs ?? null,
          cylinderOd: order.prescription?.cylinderOd ?? null,
          cylinderOs: order.prescription?.cylinderOs ?? null,
          axisOd: order.prescription?.axisOd ?? null,
          axisOs: order.prescription?.axisOs ?? null,
          pd: order.prescription?.pd ?? null,
          reviewStatus: order.prescription?.reviewStatus ?? "APPROVED",
          reviewNote: order.prescription?.reviewNote ?? "Đã kiểm tra đơn thuốc",
        }
      : null,
    priceSummary: {
      itemsSubtotal: Number(order?.totalAmount ?? 0),
      lensPrice: Number(order?.lensPrice ?? 0),
      shippingFee: Number(order?.shippingFee ?? order?.shippingCost ?? 0),
      total: Number(order?.totalAmount ?? 0),
    },
    statusHistory: [
      {
        id: Date.now(),
        status: initialStatus,
        statusLabel: OPERATION_STATUS_LABELS[initialStatus],
        note:
          initialStatus === "MANUFACTURING"
            ? "Đơn có toa được staff bàn giao sang vận hành và chuyển vào giai đoạn gia công."
            : "Đơn không có toa được staff bàn giao sang vận hành và chuyển thẳng vào giai đoạn đóng gói.",
        createdAt: updatedAt,
      },
    ],
    items: (Array.isArray(order?.items) ? order.items : []).map((item, index) => ({
      id: item?.id ?? index + 1,
      orderItemId: item?.orderItemId ?? item?.id ?? index + 1,
      productVariantId: item?.productVariantId ?? item?.variantId ?? item?.variantID ?? null,
      productId: item?.productId ?? null,
      productName: item?.productName ?? item?.name ?? null,
      productVariantName: item?.productVariantName ?? item?.variantName ?? null,
      variantName: item?.variantName ?? item?.productVariantName ?? null,
      lensProductId: item?.lensProductId ?? item?.lensProduct?.id ?? null,
      lensProductName: item?.lensProductName ?? item?.lensProduct?.name ?? null,
      quantity: Number(item?.quantity ?? 1),
      unitPrice: Number(item?.unitPrice ?? item?.variantPrice ?? item?.price ?? 0),
      lineTotal: Number(
        item?.lineTotal ??
          Number(item?.quantity ?? 1) * Number(item?.variantPrice ?? item?.price ?? 0)
      ),
      price: Number(item?.price ?? item?.variantPrice ?? 0),
      thumbnailUrl: item?.thumbnailUrl ?? null,
    })),
    totalText: formatCurrency(Number(order?.totalAmount ?? 0)),
  };
}

export function mergeOrdersById(primaryOrders, secondaryOrders, getId) {
  const map = new Map();
  const resolveId = typeof getId === "function" ? getId : (item) => item?.id ?? item?.orderId;

  [...(Array.isArray(primaryOrders) ? primaryOrders : []), ...(Array.isArray(secondaryOrders) ? secondaryOrders : [])].forEach((item) => {
    const id = normalizeId(resolveId(item));

    if (!id) {
      return;
    }

    map.set(id, item);
  });

  return Array.from(map.values());
}
