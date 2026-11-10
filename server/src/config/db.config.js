import mongoose from "mongoose";
import env from "./env.js";

// Cached so serverless invocations (Vercel) reuse one connection per warm instance
// instead of reconnecting on every request.
let connectionPromise = null;

export const connectDB = async () => {
  if (!env.mongo_uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongo_uri, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log("MongoDB connected:", conn.connection.host);
        return conn;
      })
      .catch((err) => {
        connectionPromise = null; // allow a retry on the next request
        throw err;
      });
  }

  return connectionPromise;
};
