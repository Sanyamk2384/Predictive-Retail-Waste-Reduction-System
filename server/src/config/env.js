import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_PATH || ".env" });

export const env = {
  port: Number(process.env.PORT) || 5010,
  client_url: process.env.CLIENT_URL || "http://localhost:5111",
  mongo_uri: process.env.MONGODB_URI || "",
  jwt_secret: process.env.JWT_SECRET || "",
};

export default env;
