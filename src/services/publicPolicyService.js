import { publicApi } from "./api";

export const publicPolicyService = {
  getPolicyByType(type) {
    return publicApi.get(`/public/policies/${type}`).then((response) => response.data);
  },
};

export default publicPolicyService;
