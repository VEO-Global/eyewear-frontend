export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  token: string;
  message: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  addressLine?: string | null;
  addressDetail?: string | null;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean | null;
  role: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  address: string;
}

export interface CartItemResponse {
  itemId: number;
  productVariantId: number;
  lensProductId: number | null;
  quantity: number;
  productName: string;
  variantSku: string;
  color: string;
  size: string;
  lensName: string | null;
}

export interface CartResponse {
  cartId: number;
  userId: number;
  items: CartItemResponse[];
}

export interface CartItemRequest {
  productVariantId: number;
  lensProductId: number | null;
  quantity: number;
}

export interface PromotionValidationRequest {
  code: string;
}

export interface PromotionValidationResponse {
  id: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  quantity: number;
  isActive: boolean;
  validNow: boolean;
}

export interface ShippingAddressRequest {
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  addressDetail: string;
}

export interface PrescriptionRequest {
  prescriptionImageUrl: string | null;
  sphereOd: number | null;
  sphereOs: number | null;
  cylinderOd: number | null;
  cylinderOs: number | null;
  axisOd: number | null;
  axisOs: number | null;
  pd: number | null;
}

export interface OrderCheckoutItemRequest {
  productVariantId: number;
  lensProductId: number | null;
  quantity: number;
}

export interface OrderCheckoutRequest {
  paymentMethod: "COD" | "BANK_TRANSFER" | "MOMO" | "VNPAY" | "PAYOS";
  prescriptionOption: "WITHOUT_PRESCRIPTION" | "WITH_PRESCRIPTION";
  shippingAddress: ShippingAddressRequest;
  phoneNumber: string;
  receiverName: string;
  note: string | null;
  items: OrderCheckoutItemRequest[];
  prescription: PrescriptionRequest | null;
}

export interface OrderCheckoutResponse {
  orderId: number;
  orderCode: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  prescriptionOption: string;
  prescriptionReviewStatus: string | null;
  items: unknown[];
  lens: unknown;
  prescription: unknown;
  priceSummary: unknown;
  createdAt: string;
  message: string;
  checkoutUrl?: string | null;
}

export interface PaymentQrResponse {
  orderId: number;
  orderCode: string;
  paymentStatus: "PENDING" | "PAID" | "UNPAID";
  qrCodeUrl: string;
  qrRawData: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  transferContent: string;
  amountToPay: number;
  expiredAt: string;
}

export interface PaymentStatusResponse {
  paymentId: number;
  orderId: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  method: "COD" | "BANK_TRANSFER" | "MOMO" | "VNPAY" | "PAYOS";
  status: "PENDING" | "PAID" | "UNPAID";
  amount: number;
  transactionCode: string | null;
  paymentProofImg: string | null;
  createdAt: string | null;
  expiredAt: string | null;
  paidAt: string | null;
}

export interface NotificationResponse {
  id: number | string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
}
