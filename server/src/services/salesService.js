import mongoose from "mongoose";
import { Sale } from "../models/Sale.model.js";
import { Batch } from "../models/Batch.model.js";
import { Product } from "../models/Product.model.js";
import { Store } from "../models/Store.model.js";

const invalidRequest = (message) => Object.assign(new Error(message), { status: 400 });
const pagination = (options = {}) => {
  const page = Math.max(1, Number.parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(options.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

export const allocateFifoStock = (availableBatches, requestedQuantity, deductions) => {
  let unfulfilled = requestedQuantity;
  for (const batch of availableBatches) {
    if (unfulfilled === 0) break;
    const quantity = Math.min(batch.remaining, unfulfilled);
    if (quantity === 0) continue;
    batch.remaining -= quantity;
    unfulfilled -= quantity;
    const key = batch.id.toString();
    deductions.set(key, {
      id: batch.id,
      quantity: (deductions.get(key)?.quantity || 0) + quantity,
    });
  }
  return unfulfilled;
};

export const saveSalesBatch = async (records) => {
  if (!records.length) return;

  const skus = [...new Set(records.map(({ sku }) => sku))];
  const storeCodes = [...new Set(records.map(({ storeCode }) => storeCode))];
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Sequential, not Promise.all: concurrent operations on the same transaction
      // session are rejected outside a sharded cluster ("active transaction number"
      // conflict) - a single session can only run one op at a time.
      const products = await Product.find({ sku: { $in: skus } }).select("_id sku").session(session);
      const stores = await Store.find({ storeCode: { $in: storeCodes } }).select("_id storeCode").session(session);
      const productsBySku = new Map(products.map((product) => [product.sku, product._id]));
      const storesByCode = new Map(stores.map((store) => [store.storeCode, store._id]));
      const batchesByInventoryKey = new Map();
      const saleDocuments = [];
      const deductions = new Map();

      for (const record of records) {
        const productId = productsBySku.get(record.sku);
        const storeId = storesByCode.get(record.storeCode);
        if (!productId || !storeId) {
          throw invalidRequest(`Unknown product SKU or store code in sales row`);
        }

        const inventoryKey = `${productId}:${storeId}`;
        if (!batchesByInventoryKey.has(inventoryKey)) {
          const batches = await Batch.find({
            productId,
            storeId,
            quantityRemaining: { $gt: 0 },
            expirationDate: { $gt: new Date() },
          })
            .sort({ receivedDate: 1, expirationDate: 1, _id: 1 })
            .session(session);
          batchesByInventoryKey.set(
            inventoryKey,
            batches.map((batch) => ({
              id: batch._id,
              remaining: batch.quantityRemaining,
            })),
          );
        }

        const availableBatches = batchesByInventoryKey.get(inventoryKey);
        const unfulfilled = allocateFifoStock(
          availableBatches,
          record.quantitySold,
          deductions,
        );
        if (unfulfilled > 0) {
          throw invalidRequest(
            `Insufficient stock for SKU ${record.sku} at store ${record.storeCode}`,
          );
        }

        saleDocuments.push({
          productId,
          storeId,
          quantitySold: record.quantitySold,
          totalAmount: record.totalAmount,
          date: record.date,
          discountAppliedPercentage: record.discountAppliedPercentage,
          batchId: record.batchId,
        });
      }

      await Sale.insertMany(saleDocuments, { session, ordered: true });
      const operations = [...deductions.values()].map(({ id, quantity }) => ({
        updateOne: {
          filter: { _id: id, quantityRemaining: { $gte: quantity } },
          update: { $inc: { quantityRemaining: -quantity } },
        },
      }));
      if (operations.length > 0) {
        const result = await Batch.bulkWrite(operations, { session, ordered: true });
        if (result.modifiedCount !== operations.length) {
          throw new Error("Inventory changed during sale processing; transaction aborted");
        }
      }
    });
  } finally {
    await session.endSession();
  }
};

export const getSales = async (filters = {}, options = {}) => {
  if (filters.storeId && !mongoose.isValidObjectId(filters.storeId))
    throw invalidRequest("Invalid store ID");
  if (filters.productId && !mongoose.isValidObjectId(filters.productId))
    throw invalidRequest("Invalid product ID");

  const { page, limit, skip } = pagination(options);
  const sort = options.sort || { date: -1 };
  const [sales, total] = await Promise.all([
    Sale.find(filters)
      .populate("productId", "sku name")
      .populate("storeId", "storeCode name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Sale.countDocuments(filters),
  ]);

  return { sales, pagination: { total, page, pages: Math.ceil(total / limit), limit } };
};
