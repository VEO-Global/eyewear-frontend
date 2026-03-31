import { api } from "./api";

export const paymentService = {
  getOrderQr(orderId) {
    return api.get(`/payments/order/${orderId}/qr`).then((response) => response.data);
  },
  getOrderStatus(orderId) {
    return api.get(`/payments/order/${orderId}/status`).then((response) => response.data);
  },
  getMyHistory() {
    return api.get("/payments/my-history").then((response) => response.data);
  },
};

export default paymentService;
