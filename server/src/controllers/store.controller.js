import { parseStoreData } from "../utils/csvParser.js";
import {
  saveStoreBatch,
  addStore,
  updateStore,
  getStore,
  deleteStore,
  getStores,
} from "../services/store.service.js";

export const uploadStoreData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload a valid CSV file." });
  }
  const result = await parseStoreData(req.file.buffer, saveStoreBatch);
  return res.status(200).json({ success: true, ...result });
};

export const addSingleStore = async (req, res) => {
  const store = await addStore(req.body);
  return res.status(201).json({
    success: true,
    message: "Store added successfully.",
    data: store,
  });
};

export const updateSingleStore = async (req, res) => {
  const store = await updateStore(req.params.id, req.body);
  return res.status(200).json({
    success: true,
    message: "Store updated successfully.",
    data: store,
  });
};

export const getSingleStore = async (req, res) => {
  const store = await getStore(req.params.id);
  return res.status(200).json({ success: true, data: store });
};

export const deleteSingleStore = async (req, res) => {
  const store = await deleteStore(req.params.id);
  return res.status(200).json({ success: true, data: store });
};

export const getAllStores = async (req, res) => {
  const { page, limit, sortField, sortOrder } = req.query;
  const options = { page, limit };
  if (sortField) {
    const allowedSortFields = ["storeCode", "name", "location"];
    if (!allowedSortFields.includes(sortField))
      return res.status(400).json({ success: false, message: "Invalid sort field" });
    options.sort = { [sortField]: sortOrder === "desc" ? -1 : 1 };
  }
  const result = await getStores({}, options);
  return res.status(200).json({ success: true, ...result });
};
