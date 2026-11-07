import mongoose from "mongoose";
import { DiscountRiskReport } from "../models/DiscountRiskReport.model.js";
import PredictionReport from "../models/PredictionReport.model.js";
import { Batch } from "../models/Batch.model.js";
import { Product } from "../models/Product.model.js";

function evaluateRisk(daysToExpire, daysNeededToSell) {
  if (daysToExpire <= 0) {
    return {
      riskLevel: "CRITICAL_EXPIRED",
      riskFactor: 1,
      suggestedDiscountPercentage: 100,
    };
  }

  const riskFactor = Number((daysNeededToSell / daysToExpire).toFixed(2));
  if (riskFactor >= 2)
    return { riskLevel: "CRITICAL", riskFactor, suggestedDiscountPercentage: 50 };
  if (riskFactor >= 1.5)
    return { riskLevel: "HIGH", riskFactor, suggestedDiscountPercentage: 30 };
  if (riskFactor >= 1.1)
    return { riskLevel: "MODERATE", riskFactor, suggestedDiscountPercentage: 15 };
  return { riskLevel: "LOW", riskFactor, suggestedDiscountPercentage: 0 };
}

export async function generateDiscountRiskReport(storeId = null) {
  const storeObjectId = storeId ? new mongoose.Types.ObjectId(storeId) : null;
  const predictionQuery = storeObjectId ? { storeId: storeObjectId } : {};
  const latestPrediction = await PredictionReport.findOne(predictionQuery).sort({
    createdAt: -1,
  });
  if (!latestPrediction) {
    throw Object.assign(new Error("No prediction report found"), { status: 404 });
  }

  const velocityMap = new Map(
    latestPrediction.productForecasts.map((item) => [
      item.productId.toString(),
      item.dailyAverageQuantity,
    ]),
  );
  const batchQuery = { quantityRemaining: { $gt: 0 } };
  if (storeObjectId) batchQuery.storeId = storeObjectId;
  const activeBatches = await Batch.find(batchQuery).sort({
    expirationDate: 1,
    receivedDate: 1,
  });
  const productIds = [...new Set(activeBatches.map((batch) => batch.productId.toString()))];
  const products = await Product.find({ _id: { $in: productIds } }).select("sku name");
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const now = Date.now();
  const highRiskBatches = [];

  for (const batch of activeBatches) {
    const productId = batch.productId.toString();
    const product = productMap.get(productId);
    if (!product) continue;

    const daysToExpire = Math.ceil(
      (batch.expirationDate.getTime() - now) / (1000 * 60 * 60 * 24),
    );
    const dailyVelocity = velocityMap.get(productId) || 0;
    const daysNeededToSell =
      dailyVelocity > 0 ? Math.ceil(batch.quantityRemaining / dailyVelocity) : 999;
    const risk = evaluateRisk(daysToExpire, daysNeededToSell);

    if (risk.riskLevel !== "LOW") {
      highRiskBatches.push({
        batchId: batch.batchId,
        productId: product._id,
        sku: product.sku,
        name: product.name,
        storeId: batch.storeId.toString(),
        quantityRemaining: batch.quantityRemaining,
        daysToExpire,
        daysNeededToSell,
        ...risk,
      });
    }
  }

  return DiscountRiskReport.create({
    storeId: storeObjectId?.toString() ?? null,
    generatedAt: new Date(),
    totalBatchesEvaluated: activeBatches.length,
    highRiskItemsCount: highRiskBatches.length,
    highRiskBatches,
  });
}
