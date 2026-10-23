import api from "./api";

export const getOrders = () => api.get("/order");
export const getOrderById = (id) => api.get(`/order/${id}`);
// The API places one order per product: { product_id, charity_id, quantity, address_id }
export const placeOrder = (data) => api.post("/order", data);
