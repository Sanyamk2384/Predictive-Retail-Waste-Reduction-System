import mongoose from "mongoose";
import { InventoryAnalysisReport } from "../models/inventoryAnalysisReport.js";
import PredictionReport from "../models/PredictionReport.model.js";
import { Batch } from "../models/Batch.model.js";
import { Product } from "../models/Product.model.js";

function classifyInventoryStatus(currentStock, predictedMonthlySales) {
  if (currentStock <= 0) {
    return {
      status: "OUT_OF_STOCK",
      monthsOfSupplyRemaining: 0,
      suggestedAction: "CRITICAL: Reorder immediately to avoid lost revenue.",
      recommendedReorderQuantity: Math.ceil(predictedMonthlySales * 1.5),
    };
  }
  if (predictedMonthlySales <= 0) {
    return {
      status: "OVERSTOCKED",
      monthsOfSupplyRemaining: 99,
      suggestedAction:
        "Zero forecasted demand. Consider stopping purchases and running clearance promotions.",
      recommendedReorderQuantity: 0,
    };
  }

  const monthsOfSupplyRemaining = Number(
    (currentStock / predictedMonthlySales).toFixed(2),
  );
  if (monthsOfSupplyRemaining < 0.75) {
    return {
      status: "UNDERSTOCKED",
      monthsOfSupplyRemaining,
      suggestedAction: "Stock levels low. Place purchase order to restock target inventory.",
      recommendedReorderQuantity: Math.max(
        0,
        Math.ceil(predictedMonthlySales * 1.5) - currentStock,
      ),
    };
  }
  if (monthsOfSupplyRemaining <= 1.5) {
    return {
      status: "ADEQUATE",
      monthsOfSupplyRemaining,
      suggestedAction: "Stock level optimal. Maintain regular monitor schedule.",
      recommendedReorderQuantity: 0,
    };
  }
  return {
    status: "OVERSTOCKED",
    monthsOfSupplyRemaining,
    suggestedAction:
      "Excess stock detected. Pause reorders and schedule bundle deals or discounts.",
    recommendedReorderQuantity: 0,
  };
}

export async function generateInventoryAnalysisReport(storeId = null) {
  const storeObjectId = storeId ? new mongoose.Types.ObjectId(storeId) : null;
  const predictionQuery = storeObjectId ? { storeId: storeObjectId } : {};
  const latestPrediction = await PredictionReport.findOne(predictionQuery).sort({
    createdAt: -1,
  });
  if (!latestPrediction) {
    throw Object.assign(
      new Error("No prediction report found to compute monthly sales."),
      { status: 404 },
    );
  }

  const velocityMap = new Map(
    latestPrediction.productForecasts.map((item) => [
      item.productId.toString(),
      item.dailyAverageQuantity,
    ]),
  );
  const matchStage = { quantityRemaining: { $gt: 0 } };
  if (storeObjectId) matchStage.storeId = storeObjectId;
  const stockAggregations = await Batch.aggregate([
    { $match: matchStage },
    { $group: { _id: "$productId", totalStock: { $sum: "$quantityRemaining" } } },
  ]);
  const stockMap = new Map(
    stockAggregations.map((item) => [item._id.toString(), item.totalStock]),
  );
  const productIds = [
    ...new Set([...velocityMap.keys(), ...stockMap.keys()]),
  ];
  const products = await Product.find({ _id: { $in: productIds } }).select("sku name");
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const productStatuses = [];
  const counts = {
    OUT_OF_STOCK: 0,
    UNDERSTOCKED: 0,
    ADEQUATE: 0,
    OVERSTOCKED: 0,
  };

  for (const productId of productIds) {
    const product = productMap.get(productId);
    if (!product) continue;
    const dailyAverageQuantity = velocityMap.get(productId) || 0;
    const currentStock = stockMap.get(productId) || 0;
    const predictedMonthlySales = Number((dailyAverageQuantity * 30).toFixed(2));
    const status = classifyInventoryStatus(currentStock, predictedMonthlySales);
    counts[status.status] += 1;
    productStatuses.push({
      productId: product._id,
      sku: product.sku,
      name: product.name,
      currentStock,
      dailyAverageQuantity,
      predictedMonthlySales,
      ...status,
    });
  }

  return InventoryAnalysisReport.create({
    storeId: storeObjectId?.toString() ?? null,
    generatedAt: new Date(),
    totalProductsAnalyzed: productStatuses.length,
    outOfStockCount: counts.OUT_OF_STOCK,
    understockedCount: counts.UNDERSTOCKED,
    adequateCount: counts.ADEQUATE,
    overstockedCount: counts.OVERSTOCKED,
    productStatuses,
  });
}
