import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    quantitySold: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isSafeInteger,
    },
    totalAmount: { type: Number, required: true, min: 0 },
    batchId: { type: String, trim: true },
    date: { type: Date, default: Date.now, index: true },
    discountAppliedPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

saleSchema.index({ storeId: 1, productId: 1, date: -1 });

export const Sale = mongoose.model("Sale", saleSchema);
