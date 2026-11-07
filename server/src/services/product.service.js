import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";

const invalidRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = (message) => Object.assign(new Error(message), { status: 404 });

export const saveProductBatch = async (productBatch) => {
  if (!productBatch.length) return;
  return Product.insertMany(productBatch, { ordered: true });
};

export const saveProduct = async (data) => {
  return Product.create(data);
};

export const updateProduct = async (id, updateData) => {
  if (!mongoose.isValidObjectId(id)) throw invalidRequest("Invalid product ID");
  if (!updateData || typeof updateData !== "object" || Array.isArray(updateData))
    throw invalidRequest("Invalid product update");
  const allowedFields = [
    "sku",
    "name",
    "category",
    "costPrice",
    "sellingPrice",
    "unit",
    "shelfLife",
  ];
  const filteredUpdates = Object.fromEntries(
    Object.entries(updateData).filter(([key]) => allowedFields.includes(key)),
  );
  if (Object.keys(filteredUpdates).length === 0)
    throw invalidRequest("No valid fields to update");

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: filteredUpdates },
    { new: true, runValidators: true },
  );
  if (!updatedProduct) throw notFound("Product not found");
  return updatedProduct;
};

export const deleteProduct = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw invalidRequest("Invalid product ID");
  const deletedProduct = await Product.findByIdAndDelete(id);
  if (!deletedProduct) throw notFound("Product not found");
  return deletedProduct;
};

export const getProduct = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw invalidRequest("Invalid product ID");
  const product = await Product.findById(id);
  if (!product) throw notFound("Product not found");
  return product;
};

export const getProducts = async (filters = {}, options = {}) => {
  const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = options.sort || { name: 1 };
  const [products, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filters),
  ]);
  return { products, pagination: { total, page, pages: Math.ceil(total / limit), limit } };
};
