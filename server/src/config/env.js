import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_PATH || ".env" });

export const env = {
  port: Number(process.env.PORT) || 5010,
  client_url: process.env.CLIENT_URL || "http://localhost:5173",
  mongo_uri: process.env.MONGODB_URI || "",
  jwt_secret: process.env.JWT_SECRET || "",
  jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d",
  ai_service_url: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
};

export default env;
