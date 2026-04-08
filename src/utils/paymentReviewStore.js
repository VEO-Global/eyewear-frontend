const PAYMENT_REVIEW_KEY = "payos-payment-review-store";

function safeRead() {
  try {
    const raw = localStorage.getItem(PAYMENT_REVIEW_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(items) {
  try {
    localStorage.setItem(PAYMENT_REVIEW_KEY, JSON.stringify(Array.isArray(items) ? items : []));
  } catch {
    // ignore storage write failures
  }
}

function normalizeId(value) {
  return String(value ?? "").trim();
}

function upsertRecord(record) {
  const orderId = normalizeId(record?.orderId);

  if (!orderId) {
    return null;
  }

  const now = new Date().toISOString();
  const current = safeRead();
  let found = false;

  const next = current.map((item) => {
    if (normalizeId(item?.orderId) !== orderId) {
      return item;
    }

    found = true;
    return {
      ...item,
      ...record,
      updatedAt: now,
    };
  });

  if (!found) {
    next.unshift({
      createdAt: now,
      updatedAt: now,
      status: "PENDING_CUSTOMER_CONFIRMATION",
      paymentMethod: "PAYOS",
      ...record,
      orderId,
    });
  }

  safeWrite(next);
  return next.find((item) => normalizeId(item?.orderId) === orderId) || null;
}

export function getPaymentReviewRecord(orderId) {
  const normalizedId = normalizeId(orderId);
  return safeRead().find((item) => normalizeId(item?.orderId) === normalizedId) || null;
}

export function ensurePayosPaymentReviewRecord(payload) {
  return upsertRecord({
    paymentMethod: "PAYOS",
    status: "PENDING_CUSTOMER_CONFIRMATION",
    ...payload,
  });
}

export function markCustomerPaid(orderId, payload = {}) {
  return upsertRecord({
    ...payload,
    orderId,
    status: "CUSTOMER_CONFIRMED",
    customerConfirmedAt: new Date().toISOString(),
  });
}

export function markSaleApproved(orderId, payload = {}) {
  return upsertRecord({
    ...payload,
    orderId,
    status: "SALE_APPROVED",
    saleApprovedAt: new Date().toISOString(),
  });
}

export function markSaleRejected(orderId, payload = {}) {
  return upsertRecord({
    ...payload,
    orderId,
    status: "SALE_REJECTED",
    saleRejectedAt: new Date().toISOString(),
  });
}

export function listSalePendingPaymentReviews() {
  return safeRead().filter((item) =>
    ["CUSTOMER_CONFIRMED", "PENDING_CONFIRMATION"].includes(
      String(item?.status || "").trim().toUpperCase()
    )
  );
}

export function listSaleApprovedPaymentReviews() {
  return safeRead().filter((item) =>
    ["PAID", "SALE_APPROVED"].includes(String(item?.status || "").trim().toUpperCase())
  );
}

export function removePaymentReviewRecord(orderId) {
  const normalizedId = normalizeId(orderId);

  if (!normalizedId) {
    return;
  }

  safeWrite(safeRead().filter((item) => normalizeId(item?.orderId) !== normalizedId));
}

export function getPaymentReviewStatusLabel(status) {
  switch (String(status || "").trim().toUpperCase()) {
    case "UNPAID":
    case "PENDING_CUSTOMER_CONFIRMATION":
      return "Chờ khách xác nhận chuyển khoản";
    case "PENDING_CONFIRMATION":
    case "CUSTOMER_CONFIRMED":
      return "Khách đã chuyển khoản";
    case "PAID":
    case "SALE_APPROVED":
      return "Sale đã xác nhận";
    case "FAILED":
    case "SALE_REJECTED":
      return "Sale từ chối xác nhận";
    default:
      return "Chờ xử lý";
  }
}
