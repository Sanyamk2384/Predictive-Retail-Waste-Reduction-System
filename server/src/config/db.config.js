import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
  if (!env.mongo_uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const conn = await mongoose.connect(env.mongo_uri);
  console.log("MongoDB connected:", conn.connection.host);
  return conn;
};
