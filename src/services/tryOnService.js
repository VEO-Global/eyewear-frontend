import { api } from "./api";

export const tryOnService = {
  createTryOn(payload) {
    return api.post("/try-on", payload).then((response) => response.data);
  },
  getMyTryOns() {
    return api.get("/try-on/my").then((response) => response.data);
  },
};

export default tryOnService;
