import { Router } from "express";
import saleRoute from "./sale.route.js";
import reportRouter from "./riskReport.route.js";
import inventoryRoute from "./inventory.route.js";
import storeRouter from "./store.route.js";
import productRouter from "./product.route.js";
import inventoryAnalysisRouter from "./invenotryAnalysis.route.js";
import authRouter from "./auth.route.js";
import predictionRouter from "./prediction.route.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use("/auth", authRouter);

router.use("/sale", requireAuth, saleRoute);
router.use("/riskReport", requireAuth, reportRouter);
router.use("/inventory", requireAuth, inventoryRoute);
router.use("/product", requireAuth, productRouter);
router.use("/store", requireAuth, storeRouter);
router.use("/inventoryAnalysis", requireAuth, inventoryAnalysisRouter);
router.use("/predict", requireAuth, predictionRouter);

export default router;
