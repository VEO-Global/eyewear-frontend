import { api, publicApi } from "./api";

export const authService = {
  login(payload) {
    return publicApi.post("/auth/login", payload).then((response) => response.data);
  },
  register(payload) {
    return publicApi.post("/auth/register", payload).then((response) => response.data);
  },
  logout() {
    return api.post("/auth/logout").then((response) => response.data);
  },
};

export default authService;
