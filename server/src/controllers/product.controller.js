import { parseProductData } from "../utils/csvParser.js";
import {
  saveProductBatch,
  saveProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  getProducts,
} from "../services/product.service.js";

export const uploadProductData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload a valid CSV file." });
  }
  const result = await parseProductData(req.file.buffer, saveProductBatch);
  return res.status(200).json({ success: true, ...result });
};

export const uploadSingleProduct = async (req, res) => {
  const product = await saveProduct(req.body);
  return res.status(201).json({
    success: true,
    message: "Product added successfully.",
    data: product,
  });
};

export const updateSingleProduct = async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);
  return res.status(200).json({
    success: true,
    message: "Product updated successfully.",
    data: product,
  });
};

export const getSingleProduct = async (req, res) => {
  const product = await getProduct(req.params.id);
  return res.status(200).json({ success: true, data: product });
};

export const deleteSingleProduct = async (req, res) => {
  const product = await deleteProduct(req.params.id);
  return res.status(200).json({ success: true, data: product });
};

export const getAllProducts = async (req, res) => {
  const { page, limit, sortField, sortOrder } = req.query;
  const options = { page, limit };
  if (sortField) {
    const allowedSortFields = ["sku", "name", "category", "costPrice", "sellingPrice", "shelfLife"];
    if (!allowedSortFields.includes(sortField))
      return res.status(400).json({ success: false, message: "Invalid sort field" });
    options.sort = { [sortField]: sortOrder === "desc" ? -1 : 1 };
  }
  const result = await getProducts({}, options);
  return res.status(200).json({ success: true, ...result });
};
