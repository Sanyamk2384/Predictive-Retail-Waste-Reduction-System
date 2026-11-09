import { apiClient } from "./client.js";

export const registerAccount = (payload) => apiClient.post("/auth/register", payload).then((r) => r.data.data);
export const loginAccount = (payload) => apiClient.post("/auth/login", payload).then((r) => r.data.data);
export const fetchCurrentUser = () => apiClient.get("/auth/me").then((r) => r.data.data.user);
