import { api } from "./api";

function unwrapPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  if (payload.data !== undefined) {
    return unwrapPayload(payload.data);
  }

  if (payload.result !== undefined) {
    return unwrapPayload(payload.result);
  }

  if (payload.content !== undefined && !Array.isArray(payload.content)) {
    return unwrapPayload(payload.content);
  }

  return payload;
}

function extractList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
}

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
  confirmPayosPayment(orderId) {
    return api
      .post("/payments/payos/confirm", { orderId })
      .then((response) => unwrapPayload(response.data));
  },
  approvePayosPayment(orderId) {
    return api
      .post("/payments/payos/approve", { orderId })
      .then((response) => unwrapPayload(response.data));
  },
  rejectPayosPayment(orderId) {
    return api
      .post("/payments/payos/reject", { orderId })
      .then((response) => unwrapPayload(response.data));
  },
  getPendingPayosConfirmations() {
    return api
      .get("/payments/payos/pending")
      .then((response) => extractList(response.data).map((item) => unwrapPayload(item)));
  },
};

export default paymentService;
