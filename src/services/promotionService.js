import { api } from "./api";

export const promotionService = {
  validateCode(payload) {
    return api.post("/promotions/validate-code", payload).then((response) => response.data);
  },
};

export default promotionService;
