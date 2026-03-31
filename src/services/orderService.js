import { api } from "./api";

export const orderService = {
  getMyOrders(params = {}) {
    return api.get("/orders/my", { params }).then((response) => response.data);
  },
  getOrderById(id) {
    return api.get(`/orders/${id}`).then((response) => response.data);
  },
  createOrder(payload) {
    return api.post("/orders", payload).then((response) => response.data);
  },
  checkout(payload) {
    return api.post("/orders/checkout", payload).then((response) => response.data);
  },
};

export default orderService;
