import { Router } from "express";
import saleRoute from "./sale.route.js";
import reportRouter from "./riskReport.route.js";
import inventoryRoute from "./inventory.route.js";
import storeRouter from "./store.route.js";
import productRouter from "./product.route.js";
import inventoryAnalysisRouter from "./invenotryAnalysis.route.js";

const router = Router();

router.use("/sale", saleRoute);
router.use("/riskReport", reportRouter);
router.use("/inventory", inventoryRoute);
router.use("/product", productRouter);
router.use("/store", storeRouter);
router.use("/inventoryAnalysis", inventoryAnalysisRouter);
export default router;
