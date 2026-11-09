import { apiClient } from "./client.js";

export const listSales = (params = {}) => apiClient.get("/sale", { params }).then((r) => r.data);
export const uploadSalesCsv = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return apiClient
    .post("/sale/upload", form, {
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    })
    .then((r) => r.data);
};
