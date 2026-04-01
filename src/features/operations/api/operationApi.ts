import api from "../../../services/api";
import {
  readLocalOperationOrders,
  removeLocalOperationOrder,
  writeLocalOperationOrders,
} from "../../../utils/staffOperationTransfer";
import type {
  OperationOrderFilters,
  OperationOrderResponse,
  OperationSummaryResponse,
  ReceiveOperationStockPayload,
  UpdateOperationLogisticsPayload,
  UpdateOperationStatusPayload,
  UpdateOperationTrackingPayload,
} from "../types";
import { OPERATION_STATUS_LABELS } from "../utils/constants";
import { getInitialOperationStatus } from "../utils/workflow";

const BASE_PATH = "/operation/orders";

function cleanParams(filters?: OperationOrderFilters) {
  const params: Record<string, string> = {};

  if (filters?.orderType) {
    params.orderType = filters.orderType;
  }

  if (filters?.status) {
    params.status = filters.status;
  }

  if (filters?.keyword?.trim()) {
    params.keyword = filters.keyword.trim();
  }

  return params;
}

function normalizeKeyword(value?: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeOperationStatus(order: OperationOrderResponse): OperationOrderResponse {
  if (order.status !== "WAITING_FOR_STOCK") {
    return order;
  }

  const status = getInitialOperationStatus(order);

  return {
    ...order,
    status,
    statusLabel: OPERATION_STATUS_LABELS[status],
    statusHistory: Array.isArray(order.statusHistory)
      ? order.statusHistory.map((entry, index) =>
          index === 0 && entry.status === "WAITING_FOR_STOCK"
            ? {
                ...entry,
                status,
                statusLabel: OPERATION_STATUS_LABELS[status],
              }
            : entry
        )
      : [],
  };
}

function normalizeOrders(items: OperationOrderResponse[]) {
  return (Array.isArray(items) ? items : []).map(normalizeOperationStatus);
}

function applyLocalFilters(items: OperationOrderResponse[], filters?: OperationOrderFilters) {
  const keyword = normalizeKeyword(filters?.keyword);

  return normalizeOrders(items).filter((item) => {
    if (filters?.orderType && item.orderType !== filters.orderType) {
      return false;
    }

    if (filters?.status && item.status !== filters.status) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const haystack = normalizeKeyword(
      [
        item.orderCode,
        item.customerEmail,
        item.receiverName,
        item.phoneNumber,
        item.shippingAddress,
      ]
        .filter(Boolean)
        .join(" ")
    );

    return haystack.includes(keyword);
  });
}

function mergeOperationOrders(primary: OperationOrderResponse[], secondary: OperationOrderResponse[]) {
  const map = new Map<string, OperationOrderResponse>();

  [...normalizeOrders(secondary), ...normalizeOrders(primary)].forEach((item) => {
    const key = String(item?.orderId ?? "");

    if (!key) {
      return;
    }

    map.set(key, item);
  });

  return Array.from(map.values());
}

function buildSummaryFromOrders(orders: OperationOrderResponse[]): OperationSummaryResponse {
  const items = normalizeOrders(orders);

  return {
    totalOrders: items.length,
    waitingForStock: 0,
    manufacturing: items.filter((item) => item.status === "MANUFACTURING").length,
    packing: items.filter((item) => item.status === "PACKING").length,
    readyToShip: items.filter((item) => item.status === "READY_TO_SHIP").length,
    shipping: items.filter((item) => item.status === "SHIPPING").length,
    completed: items.filter((item) => item.status === "COMPLETED").length,
    normalOrders: items.filter((item) => item.orderType === "NORMAL").length,
    prescriptionOrders: items.filter((item) => item.orderType === "PRESCRIPTION").length,
    preorderOrders: items.filter((item) => item.orderType === "PRE_ORDER").length,
  };
}

function appendLocalStatusHistory(
  order: OperationOrderResponse,
  status: OperationOrderResponse["status"],
  note?: string
) {
  const createdAt = new Date().toISOString();

  return [
    {
      id: Date.now(),
      status,
      statusLabel: OPERATION_STATUS_LABELS[status as keyof typeof OPERATION_STATUS_LABELS] || String(status),
      note: note || `Chuyển đơn sang ${OPERATION_STATUS_LABELS[status as keyof typeof OPERATION_STATUS_LABELS] || status}.`,
      createdAt,
    },
    ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
  ];
}

function updateLocalOperationOrder(
  orderId: number | string,
  updater: (order: OperationOrderResponse) => OperationOrderResponse | null
) {
  const orders = readLocalOperationOrders();
  let found = false;

  const nextOrders = orders
    .map((order) => {
      if (String(order?.orderId) !== String(orderId)) {
        return order;
      }

      found = true;
      return updater(normalizeOperationStatus(order));
    })
    .filter(Boolean);

  if (!found) {
    return null;
  }

  writeLocalOperationOrders(nextOrders);
  return nextOrders.find((item) => String(item?.orderId) === String(orderId)) || null;
}

function syncLocalOperationOrder(serverOrder: OperationOrderResponse | null) {
  if (!serverOrder?.orderId) {
    return serverOrder;
  }

  const syncedOrder = normalizeOperationStatus(serverOrder);

  updateLocalOperationOrder(syncedOrder.orderId, (order) => ({
    ...order,
    ...syncedOrder,
  }));

  return syncedOrder;
}

export async function getOperationOrders(params?: OperationOrderFilters) {
  const localOrders = normalizeOrders(readLocalOperationOrders());

  try {
    const response = await api.get<OperationOrderResponse[]>(BASE_PATH, {
      params: cleanParams(params),
    });

    return applyLocalFilters(mergeOperationOrders(response.data, localOrders), params);
  } catch (error) {
    if (localOrders.length > 0) {
      return applyLocalFilters(localOrders, params);
    }

    throw error;
  }
}

export async function getOperationSummary() {
  const localOrders = normalizeOrders(readLocalOperationOrders());

  try {
    const response = await api.get<OperationSummaryResponse>(`${BASE_PATH}/summary`);
    const localSummary = buildSummaryFromOrders(localOrders);

    return {
      totalOrders: response.data.totalOrders + localSummary.totalOrders,
      waitingForStock: 0,
      manufacturing: response.data.manufacturing + response.data.waitingForStock + localSummary.manufacturing,
      packing: response.data.packing + localSummary.packing,
      readyToShip: response.data.readyToShip + localSummary.readyToShip,
      shipping: response.data.shipping + localSummary.shipping,
      completed: response.data.completed + localSummary.completed,
      normalOrders: response.data.normalOrders + localSummary.normalOrders,
      prescriptionOrders: response.data.prescriptionOrders + localSummary.prescriptionOrders,
      preorderOrders: response.data.preorderOrders + localSummary.preorderOrders,
    };
  } catch (error) {
    if (localOrders.length > 0) {
      return buildSummaryFromOrders(localOrders);
    }

    throw error;
  }
}

export async function getOperationOrderDetail(orderId: number | string) {
  try {
    const response = await api.get<OperationOrderResponse>(`${BASE_PATH}/${orderId}`);
    return normalizeOperationStatus(response.data);
  } catch (error) {
    const localOrder = readLocalOperationOrders().find(
      (item) => String(item?.orderId) === String(orderId)
    );

    if (localOrder) {
      return normalizeOperationStatus(localOrder);
    }

    throw error;
  }
}

export async function updateOperationOrderStatus(
  orderId: number | string,
  payload: UpdateOperationStatusPayload
) {
  try {
    const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/status`, payload);

    if (String(payload.status) === "COMPLETED") {
      removeLocalOperationOrder(orderId);
      return normalizeOperationStatus(response.data);
    }

    return syncLocalOperationOrder(response.data);
  } catch (error) {
    try {
      const detailResponse = await api.get<OperationOrderResponse>(`${BASE_PATH}/${orderId}`);
      const confirmedOrder = normalizeOperationStatus(detailResponse.data);

      if (String(confirmedOrder?.status) === String(payload.status)) {
        if (String(payload.status) === "COMPLETED") {
          removeLocalOperationOrder(orderId);
        } else {
          syncLocalOperationOrder(confirmedOrder);
        }

        return confirmedOrder;
      }
    } catch {
      // Ignore verification failure and continue with local fallback / throw.
    }

    const localOrder = updateLocalOperationOrder(orderId, (order) => {
      const nextOrder = {
        ...order,
        status: payload.status,
        statusLabel: OPERATION_STATUS_LABELS[payload.status],
        updatedAt: new Date().toISOString(),
        note: payload.note ?? order.note,
        statusHistory: appendLocalStatusHistory(order, payload.status, payload.note),
      };

      return payload.status === "COMPLETED" ? null : nextOrder;
    });

    if (payload.status === "COMPLETED") {
      removeLocalOperationOrder(orderId);
      return null;
    }

    if (localOrder) {
      return localOrder;
    }

    throw error;
  }
}

export async function assignOperationLogistics(
  orderId: number | string,
  payload: UpdateOperationLogisticsPayload
) {
  try {
    const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/logistics`, payload);
    return syncLocalOperationOrder(response.data);
  } catch (error) {
    const localOrder = updateLocalOperationOrder(orderId, (order) => ({
      ...order,
      logisticsProvider: payload.carrier ?? order.logisticsProvider,
      shippingMethod: payload.shippingMethod ?? order.shippingMethod,
      estimatedDeliveryDate: payload.estimatedDeliveryDate ?? order.estimatedDeliveryDate,
      updatedAt: new Date().toISOString(),
    }));

    if (localOrder) {
      return localOrder;
    }

    throw error;
  }
}

export async function updateOperationTracking(
  orderId: number | string,
  payload: UpdateOperationTrackingPayload
) {
  try {
    const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/tracking`, payload);
    return syncLocalOperationOrder(response.data);
  } catch (error) {
    const localOrder = updateLocalOperationOrder(orderId, (order) => ({
      ...order,
      logisticsProvider: payload.provider ?? order.logisticsProvider,
      trackingNumber: payload.trackingNumber ?? order.trackingNumber,
      updatedAt: new Date().toISOString(),
    }));

    if (localOrder) {
      return localOrder;
    }

    throw error;
  }
}

export async function receiveOperationStock(
  orderId: number | string,
  payload: ReceiveOperationStockPayload
) {
  try {
    const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/receive-stock`, payload);
    return syncLocalOperationOrder(response.data);
  } catch (error) {
    const localOrder = updateLocalOperationOrder(orderId, (order) => ({
      ...order,
      status: "PACKING",
      statusLabel: OPERATION_STATUS_LABELS.PACKING,
      updatedAt: new Date().toISOString(),
      note: payload.note ?? order.note,
      statusHistory: appendLocalStatusHistory(order, "PACKING", payload.note),
    }));

    if (localOrder) {
      return localOrder;
    }

    throw error;
  }
}
