import express from "express";
import env from "./config/env.js";
import cors from "cors";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import router from "./routes/index.js";

export const app = express();

app.use(cors({ origin: env.client_url }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use("/", router);

app.use(notFound);
app.use(errorHandler);

export default app;
