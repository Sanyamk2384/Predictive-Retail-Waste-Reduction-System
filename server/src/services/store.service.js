import mongoose from "mongoose";
import { Store } from "../models/Store.model.js";

const invalidRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = (message) => Object.assign(new Error(message), { status: 404 });

export const saveStoreBatch = async (storeBatch) => {
  if (!storeBatch.length) return;
  return Store.insertMany(storeBatch, { ordered: true });
};

export const addStore = async (storeData) => Store.create(storeData);

export const updateStore = async (id, storeData) => {
  if (!mongoose.isValidObjectId(id)) throw invalidRequest("Invalid store ID");
  if (!storeData || typeof storeData !== "object" || Array.isArray(storeData))
    throw invalidRequest("Invalid store update");
  const allowedFields = ["name", "storeCode", "location"];
  const filteredUpdates = Object.fromEntries(
    Object.entries(storeData).filter(([key]) => allowedFields.includes(key)),
  );
  if (Object.keys(filteredUpdates).length === 0)
    throw invalidRequest("No valid fields to update");

  const updatedStore = await Store.findByIdAndUpdate(
    id,
    { $set: filteredUpdates },
    { new: true, runValidators: true },
  );
  if (!updatedStore) throw notFound("Store not found");
  return updatedStore;
};

export const deleteStore = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw invalidRequest("Invalid store ID");
  const deletedStore = await Store.findByIdAndDelete(id);
  if (!deletedStore) throw notFound("Store not found");
  return deletedStore;
};

export const getStore = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw invalidRequest("Invalid store ID");
  const store = await Store.findById(id);
  if (!store) throw notFound("Store not found");
  return store;
};

export const getStores = async (filters = {}, options = {}) => {
  const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = options.sort || { name: 1 };
  const [stores, total] = await Promise.all([
    Store.find(filters).sort(sort).skip(skip).limit(limit).lean(),
    Store.countDocuments(filters),
  ]);
  return { stores, pagination: { total, page, pages: Math.ceil(total / limit), limit } };
};
