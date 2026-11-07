import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    batchId: { type: String, required: true, trim: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    quantityRemaining: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    initialQuantity: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    expirationDate: { type: Date, required: true, index: true },
    receivedDate: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

batchSchema.index({
  productId: 1,
  storeId: 1,
  expirationDate: 1,
  quantityRemaining: 1,
});

export const Batch = mongoose.model("Batch", batchSchema);
