import { api, publicApi } from "./api";

export const productService = {
  getProducts() {
    return publicApi.get("/products").then((response) => response.data);
  },
  getProductById(id) {
    return publicApi.get(`/products/${id}`).then((response) => response.data);
  },
  getPreorderProducts() {
    return publicApi.get("/products/preorder").then((response) => response.data);
  },
  getFavoriteStatus(id) {
    return api.get(`/products/${id}/favorite-status`).then((response) => response.data);
  },
  getVariantsByProduct(productId) {
    return publicApi
      .get(`/variants/product/${productId}`, {
        params: { active: true },
      })
      .then((response) => response.data);
  },
  getCategories() {
    return publicApi.get("/categories").then((response) => response.data);
  },
  getLensProducts() {
    return publicApi.get("/lens-products").then((response) => response.data);
  },
  getLensProductById(id) {
    return publicApi.get(`/lens-products/${id}`).then((response) => response.data);
  },
};

export default productService;
