import api from "./api";

export const getCharities = () => api.get("/charity");
export const getCharityById = (id) => api.get(`/charity/${id}`);
