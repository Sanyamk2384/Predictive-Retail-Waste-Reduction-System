import { apiClient } from "./client.js";

export const generateInventoryAnalysis = (storeId) =>
  apiClient.post("/inventoryAnalysis/generate", storeId ? { storeId } : {}).then((r) => r.data.data);
export const getLatestInventoryAnalysis = (storeId) =>
  apiClient.get("/inventoryAnalysis/latest", { params: storeId ? { storeId } : {} }).then((r) => r.data.data);
