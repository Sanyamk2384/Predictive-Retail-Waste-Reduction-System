import { Router } from "express";
import {
  generateRiskReport,
  getLatestReport,
  getAllDiscountRiskReports,
} from "../controllers/riskReport.controller.js";

const reportRouter = Router();

reportRouter.post("/generate", generateRiskReport);

reportRouter.get("/latestReport", getLatestReport);

reportRouter.get("/allReports", getAllDiscountRiskReports);

export default reportRouter;
