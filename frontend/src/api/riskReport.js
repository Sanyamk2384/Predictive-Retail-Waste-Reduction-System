import { apiClient } from "./client.js";

export const generateRiskReport = (storeId) =>
  apiClient.post("/riskReport/generate", storeId ? { storeId } : {}).then((r) => r.data.data);
export const getLatestRiskReport = (storeId) =>
  apiClient.get("/riskReport/latestReport", { params: storeId ? { storeId } : {} }).then((r) => r.data.data);
