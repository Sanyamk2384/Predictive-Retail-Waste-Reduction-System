import mongoose from "mongoose";

const batchRiskItemSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    storeId: { type: String, required: true },
    quantityRemaining: { type: Number, required: true },
    daysToExpire: { type: Number, required: true },
    daysNeededToSell: { type: Number, required: true },
    riskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "CRITICAL", "CRITICAL_EXPIRED"],
      required: true,
    },
    riskFactor: { type: Number, required: true },
    suggestedDiscountPercentage: { type: Number, required: true },
  },
  { _id: false },
);

const discountRiskReportSchema = new mongoose.Schema(
  {
    storeId: { type: String, default: null },
    generatedAt: { type: Date, default: Date.now },
    totalBatchesEvaluated: { type: Number, required: true },
    highRiskItemsCount: { type: Number, required: true },
    highRiskBatches: [batchRiskItemSchema],
  },
  { timestamps: true },
);

export const DiscountRiskReport = mongoose.model(
  "DiscountRiskReport",
  discountRiskReportSchema,
  "discount_risk_reports",
);
