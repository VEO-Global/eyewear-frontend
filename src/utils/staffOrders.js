import {
  ORDER_PHASE,
  enrichOrder,
  formatCurrency,
  readStoredOrders,
  writeStoredOrders,
} from "./orderHistory";

const ORDER_HISTORY_STORAGE_PREFIX = "order-history:";

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

function readAllStoredOrderBuckets() {
  const buckets = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith(ORDER_HISTORY_STORAGE_PREFIX)) {
      continue;
    }

    const userId = key.slice(ORDER_HISTORY_STORAGE_PREFIX.length);
    const orders = readStoredOrders(userId);

    buckets.push({ userId, orders });
  }

  return buckets;
}

function getOrderPrimaryItem(order) {
  return Array.isArray(order?.items) && order.items.length > 0 ? order.items[0] : null;
}

function getOrderDisplayType(order) {
  const firstItem = getOrderPrimaryItem(order);

  if (!firstItem) {
    return "Đơn hàng mới";
  }

  const itemName = firstItem.name || firstItem.productName || "Sản phẩm";
  const lensName = order?.lensProduct?.name;

  return lensName ? `${itemName} + ${lensName}` : itemName;
}

function getOrderChannel(order) {
  if (order?.sourceChannel) {
    return order.sourceChannel;
  }

  if (order?.isPreorder) {
    return "Pre-order";
  }

  return "Website";
}

function getOrderPriority(order) {
  const createdAtMs = parseApiDateTime(order?.createdAt);
  const ageMinutes = Math.max(0, Math.round((Date.now() - createdAtMs) / 60000));

  if (ageMinutes >= 30) {
    return "Cao";
  }

  if (ageMinutes >= 10) {
    return "Thường";
  }

  return null;
}

function getQueueStatus(order) {
  if (order?.phase === ORDER_PHASE.PRESCRIPTION_REVIEW) {
    return "Chờ kiểm tra đơn thuốc";
  }

  if (order?.phase === ORDER_PHASE.PROCESSING) {
    return "Chờ bàn giao đơn hàng";
  }

  return "Chờ xác nhận đơn";
}

function formatWaitTime(createdAt) {
  const createdAtMs = parseApiDateTime(createdAt);
  const ageMinutes = Math.max(0, Math.round((Date.now() - createdAtMs) / 60000));

  return `${String(ageMinutes).padStart(2, "0")} phút`;
}

function mapStaffOrder(order) {
  const firstItem = getOrderPrimaryItem(order);
  const fallbackName = order?.customerProfile?.fullName || order?.receiverName || "Khách hàng";
  const fallbackPhone = order?.customerProfile?.phone || order?.phoneNumber || "";
  const fallbackEmail = order?.customerProfile?.email || "";

  return {
    ...order,
    code: order.orderCode || order.orderNumber || order.id,
    customer: fallbackName,
    customerPhone: fallbackPhone,
    customerEmail: fallbackEmail,
    channel: getOrderChannel(order),
    type: getOrderDisplayType(order),
    statusLabel: getQueueStatus(order),
    eta: formatWaitTime(order.createdAt),
    priority: getOrderPriority(order),
    itemCount: Array.isArray(order.items) ? order.items.length : 0,
    firstItem,
    totalText: formatCurrency(order.totalAmount),
  };
}

export function readAllStaffOrders() {
  const now = Date.now();

  return readAllStoredOrderBuckets()
    .flatMap(({ userId, orders }) =>
      orders.map((order) => ({
        ...enrichOrder(order, now),
        storageUserId: userId,
      }))
    )
    .sort((left, right) => parseApiDateTime(left.createdAt) - parseApiDateTime(right.createdAt))
    .map(mapStaffOrder);
}

export function readStaffOrdersByPhase(phases) {
  const phaseList = Array.isArray(phases) ? phases : [phases];
  return readAllStaffOrders().filter((order) => phaseList.includes(order.phase));
}

export function readStaffIntakeOrders() {
  return readStaffOrdersByPhase(ORDER_PHASE.PENDING_CONFIRMATION);
}

export function updateStoredOrderForStaff({ storageUserId, orderId, updater }) {
  if (!storageUserId || !orderId || typeof updater !== "function") {
    return null;
  }

  const currentOrders = readStoredOrders(storageUserId);
  let updatedOrder = null;

  const nextOrders = currentOrders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    updatedOrder = updater(order);
    return updatedOrder;
  });

  if (!updatedOrder) {
    return null;
  }

  writeStoredOrders(storageUserId, nextOrders);
  return updatedOrder;
}
