import api from "../../../services/api";
import type {
  OperationOrderFilters,
  OperationOrderResponse,
  OperationSummaryResponse,
  ReceiveOperationStockPayload,
  UpdateOperationLogisticsPayload,
  UpdateOperationStatusPayload,
  UpdateOperationTrackingPayload,
} from "../types";
import { readLocalOperationOrders, removeLocalOperationOrder } from "../../../utils/staffOperationTransfer";

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

function applyLocalFilters(items: OperationOrderResponse[], filters?: OperationOrderFilters) {
  const keyword = normalizeKeyword(filters?.keyword);

  return (Array.isArray(items) ? items : []).filter((item) => {
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

  [...(Array.isArray(primary) ? primary : []), ...(Array.isArray(secondary) ? secondary : [])].forEach((item) => {
    const key = String(item?.orderId ?? "");

    if (!key) {
      return;
    }

    map.set(key, item);
  });

  return Array.from(map.values());
}

function buildSummaryFromOrders(orders: OperationOrderResponse[]): OperationSummaryResponse {
  const items = Array.isArray(orders) ? orders : [];

  return {
    totalOrders: items.length,
    waitingForStock: items.filter((item) => item.status === "WAITING_FOR_STOCK").length,
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

export async function getOperationOrders(params?: OperationOrderFilters) {
  const localOrders = applyLocalFilters(readLocalOperationOrders(), params);

  try {
    const response = await api.get<OperationOrderResponse[]>(BASE_PATH, {
      params: cleanParams(params),
    });

    return mergeOperationOrders(response.data, localOrders);
  } catch (error) {
    if (localOrders.length > 0) {
      return localOrders;
    }

    throw error;
  }
}

export async function getOperationSummary() {
  const localOrders = readLocalOperationOrders();

  try {
    const response = await api.get<OperationSummaryResponse>(`${BASE_PATH}/summary`);
    const localSummary = buildSummaryFromOrders(localOrders);

    return {
      totalOrders: response.data.totalOrders + localSummary.totalOrders,
      waitingForStock: response.data.waitingForStock + localSummary.waitingForStock,
      manufacturing: response.data.manufacturing + localSummary.manufacturing,
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
    return response.data;
  } catch (error) {
    const localOrder = readLocalOperationOrders().find(
      (item) => String(item?.orderId) === String(orderId)
    );

    if (localOrder) {
      return localOrder;
    }

    throw error;
  }
}

export async function updateOperationOrderStatus(
  orderId: number | string,
  payload: UpdateOperationStatusPayload
) {
  const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/status`, payload);
  if (String(payload.status) === "COMPLETED") {
    removeLocalOperationOrder(orderId);
  }
  return response.data;
}

export async function assignOperationLogistics(
  orderId: number | string,
  payload: UpdateOperationLogisticsPayload
) {
  const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/logistics`, payload);
  return response.data;
}

export async function updateOperationTracking(
  orderId: number | string,
  payload: UpdateOperationTrackingPayload
) {
  const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/tracking`, payload);
  return response.data;
}

export async function receiveOperationStock(
  orderId: number | string,
  payload: ReceiveOperationStockPayload
) {
  const response = await api.patch<OperationOrderResponse>(`${BASE_PATH}/${orderId}/receive-stock`, payload);
  return response.data;
}
