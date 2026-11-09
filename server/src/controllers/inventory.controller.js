import mongoose from "mongoose";
import { parseInventoryCsv } from "../utils/csvParser.js";
import {
  saveInventoryBatch,
  addBatches,
  deleteBatch,
  updateBatch,
  getBatches,
} from "../services/inventory.service.js";

export const uploadInventoryCsv = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Please upload a valid CSV file." });
  }

  const result = await parseInventoryCsv(req.file.buffer, saveInventoryBatch);
  return res.status(200).json({ success: true, ...result });
};

export const addInventoryBatch = async (req, res) => {
  try {
    const batch = await addBatches(req.body);
    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ success: false, message: error.message });
  }
};

export const getInventoryBatches = async (req, res) => {
  const { storeId, productId, page, limit, sortField, sortOrder } = req.query;
  const filters = {};
  if (storeId) {
    if (!mongoose.isValidObjectId(storeId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid store ID" });
    filters.storeId = storeId;
  }
  if (productId) {
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    filters.productId = productId;
  }

  const options = { page, limit };
  if (sortField) {
    const allowedSortFields = [
      "expirationDate",
      "receivedDate",
      "quantityRemaining",
      "batchId",
    ];
    if (!allowedSortFields.includes(sortField))
      return res
        .status(400)
        .json({ success: false, message: "Invalid sort field" });
    options.sort = { [sortField]: sortOrder === "desc" ? -1 : 1 };
  }

  const result = await getBatches(filters, options);
  return res.status(200).json({ success: true, ...result });
};

export const updateinventoryBatch = async (req, res) => {
  try {
    const updatedBatch = await updateBatch(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updatedBatch,
    });
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ success: false, message: error.message });
  }
};

export const deleteInventoryBatch = async (req, res) => {
  try {
    const result = await deleteBatch(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ success: false, message: error.message });
  }
};
