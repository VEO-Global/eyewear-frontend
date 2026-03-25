const ORDER_HISTORY_STORAGE_PREFIX = "order-history";

export const ORDER_STATUS = {
  ALL: "tat-ca",
  PROCESSING: "cho-gia-cong",
  SHIPPING: "van-chuyen",
  READY_TO_DELIVER: "cho-giao-hang",
  COMPLETED: "hoan-thanh",
  CANCELED: "da-huy",
  RETURN_REFUND: "tra-hang-hoan-tien",
};

export const ORDER_PHASE = {
  PENDING_CONFIRMATION: "pending_confirmation",
  PRESCRIPTION_REVIEW: "prescription_review",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  READY_TO_DELIVER: "ready_to_deliver",
  COMPLETED: "completed",
  CANCELED: "canceled",
  RETURN_REFUND: "return_refund",
};

export const ORDER_CONFIRMATION_WINDOW_MS = 30 * 60 * 1000;
export const PRESCRIPTION_REVIEW_WINDOW_MS = 60 * 60 * 1000;
export const PROCESSING_WINDOW_MS = 4 * 60 * 60 * 1000;

export function getOrderHistoryStorageKey(userId) {
  return `${ORDER_HISTORY_STORAGE_PREFIX}:${userId || "guest"}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

export function readStoredOrders(userId) {
  if (!userId) {
    return [];
  }

  try {
    const raw = localStorage.getItem(getOrderHistoryStorageKey(userId));

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStoredOrders(userId, orders) {
  if (!userId) {
    return;
  }

  try {
    localStorage.setItem(getOrderHistoryStorageKey(userId), JSON.stringify(orders));
  } catch {
    // ignore storage failures
  }
}

export function createStoredOrder({
  userId,
  user,
  checkoutValues,
  selectedCartItems,
  selectedLensProduct,
  lensPrice = 0,
  shippingCost = 0,
  totalAmount = 0,
}) {
  const safeItems = Array.isArray(selectedCartItems) ? selectedCartItems : [];
  const createdAt = new Date().toISOString();
  const orderNumber = `EC${Date.now().toString().slice(-8)}`;
  const requiresPrescription =
    checkoutValues?.prescriptionOption === "with_prescription";

  return {
    id: orderNumber,
    userId,
    orderNumber,
    createdAt,
    paymentStatus: "paid",
    phase: ORDER_PHASE.PENDING_CONFIRMATION,
    customerProfile: user
      ? {
          id: user.id ?? userId ?? null,
          fullName: user.fullName ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          role: user.role ?? "",
        }
      : null,
    receiverName: checkoutValues?.receiverName || "",
    phoneNumber: checkoutValues?.phoneNumber || "",
    shippingAddress: checkoutValues?.shippingAddress || null,
    note: checkoutValues?.note || "",
    prescriptionOption: checkoutValues?.prescriptionOption || "without_prescription",
    prescriptionMethod:
      checkoutValues?.prescriptionOption === "with_prescription"
        ? checkoutValues?.prescriptionMethod || "image"
        : undefined,
    prescription:
      checkoutValues?.prescriptionOption === "with_prescription"
        ? checkoutValues?.prescription || null
        : null,
    requiresPrescription,
    lensProduct: selectedLensProduct || null,
    lensPrice: Number(lensPrice || 0),
    shippingCost: Number(shippingCost || 0),
    totalAmount: Number(totalAmount || 0),
    items: safeItems.map((item) => ({
      ...item,
      orderItemId: `${orderNumber}-${item.variantID}`,
    })),
  };
}

export function appendStoredOrder(userId, order) {
  const currentOrders = readStoredOrders(userId);
  writeStoredOrders(userId, [order, ...currentOrders]);
}

export function resolveOrderPhase(order, now = Date.now()) {
  if (!order || typeof order !== "object") {
    return ORDER_PHASE.PENDING_CONFIRMATION;
  }

  const explicitPhase = order.phase || order.status;

  if (
    [
      ORDER_PHASE.PENDING_CONFIRMATION,
      ORDER_PHASE.CANCELED,
      ORDER_PHASE.PROCESSING,
      ORDER_PHASE.PRESCRIPTION_REVIEW,
      ORDER_PHASE.SHIPPING,
      ORDER_PHASE.READY_TO_DELIVER,
      ORDER_PHASE.COMPLETED,
      ORDER_PHASE.RETURN_REFUND,
    ].includes(explicitPhase)
  ) {
    return explicitPhase;
  }

  const createdAtMs = new Date(order.createdAt || Date.now()).getTime();
  const safeCreatedAtMs = Number.isFinite(createdAtMs) ? createdAtMs : Date.now();
  const requiresPrescription =
    order.requiresPrescription || order.prescriptionOption === "with_prescription";

  if (requiresPrescription) {
    const reviewEndsAt = safeCreatedAtMs + PRESCRIPTION_REVIEW_WINDOW_MS;
    const processingEndsAt = reviewEndsAt + PROCESSING_WINDOW_MS;

    if (now < reviewEndsAt) {
      return ORDER_PHASE.PRESCRIPTION_REVIEW;
    }

    if (now < processingEndsAt) {
      return ORDER_PHASE.PROCESSING;
    }

    return ORDER_PHASE.READY_TO_DELIVER;
  }

  const confirmationEndsAt = safeCreatedAtMs + ORDER_CONFIRMATION_WINDOW_MS;

  if (now < confirmationEndsAt) {
    return ORDER_PHASE.PENDING_CONFIRMATION;
  }

  return ORDER_PHASE.SHIPPING;
}

export function enrichOrder(order, now = Date.now()) {
  const createdAtMs = new Date(order?.createdAt || Date.now()).getTime();
  const safeCreatedAtMs = Number.isFinite(createdAtMs) ? createdAtMs : Date.now();
  const requiresPrescription =
    order?.requiresPrescription || order?.prescriptionOption === "with_prescription";
  const phase = resolveOrderPhase(order, now);
  const confirmationEndsAt = safeCreatedAtMs + ORDER_CONFIRMATION_WINDOW_MS;
  const reviewEndsAt = safeCreatedAtMs + PRESCRIPTION_REVIEW_WINDOW_MS;
  const processingStartedAt = requiresPrescription ? reviewEndsAt : null;
  const processingEndsAt = requiresPrescription
    ? reviewEndsAt + PROCESSING_WINDOW_MS
    : null;

  return {
    ...order,
    requiresPrescription,
    phase,
    confirmationEndsAt,
    reviewEndsAt,
    processingStartedAt,
    processingEndsAt,
    canCancel: [
      ORDER_PHASE.PENDING_CONFIRMATION,
      ORDER_PHASE.PRESCRIPTION_REVIEW,
    ].includes(phase),
  };
}

export function cancelStoredOrder(userId, orderId) {
  const currentOrders = readStoredOrders(userId);
  const now = Date.now();

  const nextOrders = currentOrders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    const resolvedOrder = enrichOrder(order, now);

    if (!resolvedOrder.canCancel) {
      return order;
    }

    return {
      ...order,
      phase: ORDER_PHASE.CANCELED,
      canceledAt: new Date(now).toISOString(),
    };
  });

  writeStoredOrders(userId, nextOrders);
  return nextOrders;
}

export function formatRemainingTime(ms) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
