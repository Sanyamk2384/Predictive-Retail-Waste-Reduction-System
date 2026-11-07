import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    storeCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Store = mongoose.model("Store", storeSchema);
