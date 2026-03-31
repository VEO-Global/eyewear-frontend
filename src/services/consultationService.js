import { publicApi } from "./api";

export const consultationService = {
  createAppointment(payload) {
    return publicApi
      .post("/consultation-appointments", payload)
      .then((response) => response.data);
  },
};

export default consultationService;
