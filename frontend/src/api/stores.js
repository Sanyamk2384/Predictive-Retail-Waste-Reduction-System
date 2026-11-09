import { apiClient } from "./client.js";

export const listStores = (params = {}) => apiClient.get("/store", { params }).then((r) => r.data);
export const createStore = (payload) => apiClient.post("/store/add", payload).then((r) => r.data.data);
export const updateStore = (id, payload) => apiClient.patch(`/store/update/${id}`, payload).then((r) => r.data.data);
export const deleteStore = (id) => apiClient.delete(`/store/delete/${id}`).then((r) => r.data);
export const uploadStoresCsv = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return apiClient
    .post("/store/upload", form, {
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    })
    .then((r) => r.data);
};
