import { api } from "./api";

export const profileService = {
  getProfile() {
    return api.get("/user/profile").then((response) => response.data);
  },
  updateProfile(payload) {
    return api.put("/user/profile", payload).then((response) => response.data);
  },
};

export default profileService;
