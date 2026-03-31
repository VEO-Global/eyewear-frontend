import { api } from "./api";

export const cartService = {
  getCart() {
    return api.get("/cart").then((response) => response.data);
  },
  addItem(payload) {
    return api.post("/cart/items", payload).then((response) => response.data);
  },
  removeItem(itemId) {
    return api.delete(`/cart/items/${itemId}`).then((response) => response.data);
  },
};

export default cartService;
