import { Router } from "express";
import {
  createInventoryAnalysisReport,
  getLatestInventoryAnalysisReport,
} from "../controllers/inventoryAnalysis.controller.js";

const inventoryAnalysisRouter = Router();

inventoryAnalysisRouter.post("/generate", createInventoryAnalysisReport);

inventoryAnalysisRouter.get("/latest", getLatestInventoryAnalysisReport);

export default inventoryAnalysisRouter;
