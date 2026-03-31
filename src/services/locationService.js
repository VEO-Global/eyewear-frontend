import { publicApi } from "./api";

export const locationService = {
  getProvinces() {
    return publicApi.get("/locations/provinces").then((response) => response.data);
  },
  getDistricts(provinceCode) {
    return publicApi
      .get("/locations/districts", {
        params: { provinceCode },
      })
      .then((response) => response.data);
  },
  getWards(districtCode) {
    return publicApi
      .get("/locations/wards", {
        params: { districtCode },
      })
      .then((response) => response.data);
  },
};

export default locationService;
