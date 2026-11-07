import mongoose from "mongoose";

const productInventoryStatusSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    currentStock: { type: Number, required: true },
    dailyAverageQuantity: { type: Number, required: true },
    predictedMonthlySales: { type: Number, required: true },
    monthsOfSupplyRemaining: { type: Number, required: true }, // currentStock / predictedMonthlySales
    status: {
      type: String,
      enum: ["OUT_OF_STOCK", "UNDERSTOCKED", "ADEQUATE", "OVERSTOCKED"],
      required: true,
    },
    suggestedAction: { type: String, required: true },
    recommendedReorderQuantity: { type: Number, default: 0 },
  },
  { _id: false },
);

const inventoryAnalysisReportSchema = new mongoose.Schema(
  {
    storeId: { type: String, default: null },
    generatedAt: { type: Date, default: Date.now },
    totalProductsAnalyzed: { type: Number, required: true },
    outOfStockCount: { type: Number, default: 0 },
    understockedCount: { type: Number, default: 0 },
    adequateCount: { type: Number, default: 0 },
    overstockedCount: { type: Number, default: 0 },
    productStatuses: [productInventoryStatusSchema],
  },
  { timestamps: true },
);

export const InventoryAnalysisReport = mongoose.model(
  "InventoryAnalysisReport",
  inventoryAnalysisReportSchema,
  "inventory_analysis_reports",
);
