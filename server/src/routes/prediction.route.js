import { Router } from "express";
import { generatePrediction } from "../controllers/prediction.controller.js";

const predictionRouter = Router();

predictionRouter.post("/generate", generatePrediction);

export default predictionRouter;
