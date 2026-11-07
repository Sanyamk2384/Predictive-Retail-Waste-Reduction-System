import mongoose from "mongoose";
import { Batch } from "../models/Batch.model.js";
import { Product } from "../models/Product.model.js";
import { Store } from "../models/Store.model.js";
import { validateInventoryRow } from "../validations/inventoryValidator.js";

const invalidRequest = (message) =>
  Object.assign(new Error(message), { status: 400 });
const notFound = (message) =>
  Object.assign(new Error(message), { status: 404 });
const parseQuantity = (value) => {
  if (value == null || String(value).trim() === "") return Number.NaN;
  return Number(value);
};

export const saveInventoryBatch = async (records) => {
  if (!records.length) return;

  const skus = [...new Set(records.map(({ sku }) => sku))];
  const storeCodes = [...new Set(records.map(({ storeCode }) => storeCode))];
  const [products, stores] = await Promise.all([
    Product.find({ sku: { $in: skus } })
      .select("_id sku")
      .lean(),
    Store.find({ storeCode: { $in: storeCodes } })
      .select("_id storeCode")
      .lean(),
  ]);
  const productsBySku = new Map(
    products.map((product) => [product.sku, product._id]),
  );
  const storesByCode = new Map(
    stores.map((store) => [store.storeCode, store._id]),
  );

  const batches = records.map((record) => {
    const productId = productsBySku.get(record.sku);
    const storeId = storesByCode.get(record.storeCode);
    if (!productId || !storeId) {
      throw invalidRequest(
        `Unknown product SKU or store code for batch ${record.batchId}`,
      );
    }

    return {
      batchId: record.batchId,
      productId,
      storeId,
      quantityRemaining: record.quantityRemaining,
      initialQuantity: record.initialQuantity,
      expirationDate: record.expirationDate,
      receivedDate: record.receivedDate,
    };
  });

  return Batch.insertMany(batches, { ordered: true });
};

export const addBatches = async (input = {}) => {
  input ??= {};
  const validation = validateInventoryRow({
    batch_id: input.batchId ?? input.batch_id,
    sku: input.sku,
    store_code: input.storeCode ?? input.store_code,
    quantity_current: input.quantityRemaining ?? input.quantity_current,
    quantity_received: input.initialQuantity ?? input.quantity_received,
    expiry_date: input.expirationDate ?? input.expiry_date,
    received_date: input.receivedDate ?? input.received_date,
  });

  if (!validation.isValid) throw invalidRequest(validation.errors.join(", "));
  const [product, store] = await Promise.all([
    Product.findOne({ sku: validation.data.sku }).select("_id"),
    Store.findOne({ storeCode: validation.data.storeCode }).select("_id"),
  ]);
  if (!product || !store)
    throw invalidRequest("Unknown product SKU or store code");

  return Batch.create({
    ...validation.data,
    productId: product._id,
    storeId: store._id,
  });
};

export const deleteBatch = async (batchId) => {
  if (!mongoose.isValidObjectId(batchId))
    throw invalidRequest("Invalid batch ID");
  const deletedBatch = await Batch.findByIdAndDelete(batchId);
  if (!deletedBatch) throw notFound("Batch not found");
  return { message: "Batch successfully deleted", deletedBatch };
};

export const updateBatch = async (batchId, input) => {
  input ??= {};
  if (!mongoose.isValidObjectId(batchId))
    throw invalidRequest("Invalid batch ID");
  const existingBatch = await Batch.findById(batchId);
  if (!existingBatch) throw notFound("Batch not found");

  const allowedFields = [
    "batchId",
    "quantityRemaining",
    "initialQuantity",
    "expirationDate",
    "receivedDate",
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (input[field] !== undefined) updates[field] = input[field];
  }
  if (input.sku !== undefined) {
    const product = await Product.findOne({ sku: input.sku }).select("_id");
    if (!product) throw invalidRequest("Unknown product SKU");
    updates.productId = product._id;
  }
  if (input.storeCode !== undefined) {
    const store = await Store.findOne({ storeCode: input.storeCode }).select(
      "_id",
    );
    if (!store) throw invalidRequest("Unknown store code");
    updates.storeId = store._id;
  }
  if (input.quantity_current !== undefined)
    updates.quantityRemaining = input.quantity_current;
  if (input.quantity_received !== undefined)
    updates.initialQuantity = input.quantity_received;
  if (input.expiry_date !== undefined)
    updates.expirationDate = input.expiry_date;
  if (input.received_date !== undefined)
    updates.receivedDate = input.received_date;

  if (Object.keys(updates).length === 0)
    throw invalidRequest("No valid fields to update");
  const nextRemaining = parseQuantity(
    updates.quantityRemaining ?? existingBatch.quantityRemaining,
  );
  const nextInitial = parseQuantity(
    updates.initialQuantity ?? existingBatch.initialQuantity,
  );
  if (!Number.isSafeInteger(nextRemaining) || nextRemaining < 0)
    throw invalidRequest("Invalid quantityRemaining");
  if (!Number.isSafeInteger(nextInitial) || nextInitial < nextRemaining)
    throw invalidRequest(
      "initialQuantity must be an integer at least as large as quantityRemaining",
    );
  updates.quantityRemaining = nextRemaining;
  updates.initialQuantity = nextInitial;

  const updatedBatch = await Batch.findByIdAndUpdate(
    batchId,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!updatedBatch) throw notFound("Batch not found");
  return updatedBatch;
};

export const getBatches = async (filters = {}, options = {}) => {
  const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(options.limit, 10) || 10),
  );
  const skip = (page - 1) * limit;
  const sort = options.sort || { expirationDate: 1 };
  const [batches, total] = await Promise.all([
    Batch.find(filters)
      .populate("productId", "sku name")
      .populate("storeId", "storeCode name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Batch.countDocuments(filters),
  ]);

  return {
    batches,
    pagination: { total, page, pages: Math.ceil(total / limit), limit },
  };
};
