import api from "./api";

// params: { status, category, charity, search }
export const getProducts = (params) => api.get("/product", { params });
export const getProductById = (id) => api.get(`/product/${id}`);
