import api from "./api";

export const registerUser = (data) => api.post("/users/register", data);
export const loginUser = (data) => api.post("/users/login", data);
export const getProfile = () => api.get("/users/me");
