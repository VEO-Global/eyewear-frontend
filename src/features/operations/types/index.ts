export type OperationOrderType = "NORMAL" | "PRE_ORDER" | "PRESCRIPTION";

export type OperationStatus =
  | "WAITING_FOR_STOCK"
  | "MANUFACTURING"
  | "PACKING"
  | "READY_TO_SHIP"
  | "SHIPPING"
  | "COMPLETED";

export interface OperationOrderFilters {
  orderType?: OperationOrderType | "";
  status?: OperationStatus | "";
  keyword?: string;
}

export interface OperationSummaryResponse {
  totalOrders: number;
  waitingForStock: number;
  manufacturing: number;
  packing: number;
  readyToShip: number;
  shipping: number;
  completed: number;
  normalOrders: number;
  prescriptionOrders: number;
  preorderOrders: number;
}

export interface OperationPayment {
  paymentId: number;
  method: string;
  status: string;
  amount: number;
  transactionCode: string | null;
  paymentProofImg: string | null;
  createdAt: string;
  expiredAt: string | null;
  paidAt: string | null;
}

export interface OperationLens {
  id: number | null;
  name: string | null;
  price: number | null;
  description: string | null;
}

export interface OperationPrescription {
  prescriptionImageUrl: string | null;
  sphereOd: number | null;
  sphereOs: number | null;
  cylinderOd: number | null;
  cylinderOs: number | null;
  axisOd: number | null;
  axisOs: number | null;
  pd: number | null;
  reviewStatus: string | null;
  reviewNote: string | null;
}

export interface OperationPriceSummary {
  itemsSubtotal: number;
  lensPrice: number;
  shippingFee: number;
  total: number;
}

export interface OperationStatusHistoryItem {
  id: number;
  status: OperationStatus | string;
  statusLabel: string | null;
  note: string | null;
  createdAt: string;
}

export interface OperationOrderItem {
  id: number;
  orderItemId: number;
  productVariantId: number | null;
  productId: number | null;
  productName: string | null;
  productVariantName: string | null;
  variantName: string | null;
  lensProductId: number | null;
  lensProductName: string | null;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
  price: number | null;
  thumbnailUrl: string | null;
}

export interface OperationOrderResponse {
  orderId: number;
  orderCode: string;
  paymentMethod: string | null;
  customerEmail: string | null;
  status: OperationStatus | string;
  orderStatus: string;
  statusLabel: string | null;
  customerTab: string | null;
  orderType: OperationOrderType;
  prescriptionOption: string | null;
  prescriptionReviewStatus: string | null;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: string | null;
  shippingAddress: string | null;
  city: string | null;
  district: string | null;
  ward: string | null;
  addressDetail: string | null;
  phoneNumber: string | null;
  receiverName: string | null;
  note: string | null;
  cancelReason: string | null;
  logisticsProvider: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  payment: OperationPayment | null;
  lens: OperationLens | null;
  prescription: OperationPrescription | null;
  priceSummary: OperationPriceSummary | null;
  statusHistory: OperationStatusHistoryItem[];
  items: OperationOrderItem[];
}

export interface UpdateOperationStatusPayload {
  status: Exclude<OperationStatus, "WAITING_FOR_STOCK">;
  note?: string;
}

export interface UpdateOperationLogisticsPayload {
  carrier?: string;
  shippingMethod?: string;
  estimatedDeliveryDate?: string;
}

export interface UpdateOperationTrackingPayload {
  trackingNumber: string;
  provider: string;
}

export interface ReceiveOperationStockItem {
  variantId: number;
  receivedQuantity: number;
}

export interface ReceiveOperationStockPayload {
  items: ReceiveOperationStockItem[];
  note?: string;
}
