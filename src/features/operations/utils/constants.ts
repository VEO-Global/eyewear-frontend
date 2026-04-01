import type { OperationOrderType, OperationStatus } from "../types";

export const OPERATION_ORDER_TYPE_LABELS: Record<OperationOrderType, string> = {
  NORMAL: "Đơn thường",
  PRE_ORDER: "Đơn đặt trước",
  PRESCRIPTION: "Đơn kính thuốc",
};

export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  MANUFACTURING: "Đang gia công",
  PACKING: "Đang đóng gói",
  READY_TO_SHIP: "Sẵn sàng giao",
  SHIPPING: "Đang vận chuyển",
  COMPLETED: "Hoàn tất",
};

export const OPERATION_ORDER_TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại đơn" },
  { value: "NORMAL", label: OPERATION_ORDER_TYPE_LABELS.NORMAL },
  { value: "PRE_ORDER", label: OPERATION_ORDER_TYPE_LABELS.PRE_ORDER },
  { value: "PRESCRIPTION", label: OPERATION_ORDER_TYPE_LABELS.PRESCRIPTION },
] as const;

export const OPERATION_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "MANUFACTURING", label: OPERATION_STATUS_LABELS.MANUFACTURING },
  { value: "PACKING", label: OPERATION_STATUS_LABELS.PACKING },
  { value: "READY_TO_SHIP", label: OPERATION_STATUS_LABELS.READY_TO_SHIP },
  { value: "SHIPPING", label: OPERATION_STATUS_LABELS.SHIPPING },
  { value: "COMPLETED", label: OPERATION_STATUS_LABELS.COMPLETED },
] as const;

export const OPERATION_SUMMARY_CARDS = [
  { key: "totalOrders", label: "Tổng đơn", accent: "sky", description: "Tất cả đơn đang theo dõi" },
  { key: "manufacturing", label: "Gia công", accent: "violet", status: "MANUFACTURING" },
  { key: "packing", label: "Đóng gói", accent: "orange", status: "PACKING" },
  { key: "readyToShip", label: "Sẵn sàng giao", accent: "cyan", status: "READY_TO_SHIP" },
  { key: "shipping", label: "Đang giao", accent: "blue", status: "SHIPPING" },
  { key: "completed", label: "Hoàn tất", accent: "emerald", status: "COMPLETED" },
  { key: "normalOrders", label: "Đơn thường", accent: "slate", orderType: "NORMAL" },
  { key: "prescriptionOrders", label: "Kính thuốc", accent: "fuchsia", orderType: "PRESCRIPTION" },
  { key: "preorderOrders", label: "Đơn đặt trước", accent: "rose", orderType: "PRE_ORDER" },
] as const;
