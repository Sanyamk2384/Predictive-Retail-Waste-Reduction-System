import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["pcs", "kg", "g", "pack"], default: "pcs" },
    shelfLife: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isSafeInteger,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
