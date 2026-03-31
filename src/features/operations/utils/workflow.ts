import type { OperationOrderResponse, OperationStatus } from "../types";

export function getNextActionStatus(order: OperationOrderResponse): OperationStatus | null {
  if (order.orderType === "PRE_ORDER" && order.status === "WAITING_FOR_STOCK") {
    return "PACKING";
  }

  if (order.status === "MANUFACTURING") {
    return "PACKING";
  }

  if (order.status === "PACKING") {
    return "READY_TO_SHIP";
  }

  if (order.status === "READY_TO_SHIP") {
    return "SHIPPING";
  }

  if (order.status === "SHIPPING") {
    return "COMPLETED";
  }

  return null;
}

export function canReceiveStock(order?: OperationOrderResponse | null) {
  return order?.orderType === "PRE_ORDER" && order?.status === "WAITING_FOR_STOCK";
}

export function canEditLogistics(order?: OperationOrderResponse | null) {
  return order?.status === "PACKING" || order?.status === "READY_TO_SHIP";
}

export function canEditTracking(order?: OperationOrderResponse | null) {
  return order?.status === "PACKING" || order?.status === "READY_TO_SHIP";
}

export function canAdvanceStatus(order?: OperationOrderResponse | null) {
  return Boolean(getNextActionStatus(order as OperationOrderResponse));
}

export function isReadyToShipBlocked(order?: OperationOrderResponse | null) {
  if (!order || order.status !== "PACKING") {
    return false;
  }

  return !order.logisticsProvider || !order.trackingNumber;
}
