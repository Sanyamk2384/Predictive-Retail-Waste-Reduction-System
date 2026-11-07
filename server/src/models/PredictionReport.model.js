import mongoose from "mongoose";

const productForecastSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  predictedTotalQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  predictedTotalRevenue: {
    type: Number,
    required: true,
    min: 0,
  },
  dailyAverageQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  confidenceNote: {
    type: String,
    default: "ML Predicted",
  },
});

const predictionReportSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    productIdFilter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    modelUsed: {
      type: String,
      required: true,
      enum: ["random_forest", "gradient_boosting"],
    },
    forecastDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    totalProductsAnalyzed: {
      type: Number,
      required: true,
    },
    productForecasts: [productForecastSchema],
  },
  { timestamps: true },
);

export default mongoose.model("PredictionReport", predictionReportSchema);
