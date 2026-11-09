import { apiClient } from "./client.js";

export const generatePrediction = (payload) => apiClient.post("/predict/generate", payload).then((r) => r.data.data);
