import api from "./api";

// Create/update calls take FormData so images can be uploaded alongside fields.

// Charities (admins see their own, super admins see all)
export const getAdminCharities = () => api.get("/charity/admin");
export const getAdminCharity = (id) => api.get(`/charity/admin/${id}`);
export const createCharity = (formData) => api.post("/charity", formData);
export const updateCharity = (id, formData) => api.put(`/charity/${id}`, formData);

// Products
export const getCharityProducts = (charityId) => api.get(`/product/admin/charity/${charityId}`);
export const getProduct = (id) => api.get(`/product/${id}`);
export const createProduct = (formData) => api.post("/product", formData);
export const updateProduct = (id, formData) => api.put(`/product/${id}`, formData);
export const updateProductStatus = (id, status) => api.patch(`/product/${id}`, { status });

// Categories
export const getAdminCategories = () => api.get("/category/admin");
export const createCategory = (formData) => api.post("/category", formData);
export const updateCategory = (id, formData) => api.patch(`/category/${id}`, formData);

// Orders
export const getCharityOrders = (charityId) => api.get(`/order/charity/${charityId}`);
