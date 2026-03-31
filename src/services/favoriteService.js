import { api } from "./api";

export const favoriteService = {
  getFavorites() {
    return api.get("/user/favorites").then((response) => response.data);
  },
  addFavorite(productId) {
    return api.post(`/user/favorites/${productId}`).then((response) => response.data);
  },
  removeFavorite(productId) {
    return api.delete(`/user/favorites/${productId}`).then((response) => response.data);
  },
};

export default favoriteService;
