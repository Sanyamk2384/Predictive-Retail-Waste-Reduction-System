import { Router } from "express";
import { uploadSalesCsv, getSales } from "../controllers/salesController.js";
import { uploadCsv } from "../middlewares/multer.middleware.js";

const saleRoute = Router();

saleRoute.post("/upload", uploadCsv, uploadSalesCsv);
saleRoute.get("/", getSales);

export default saleRoute;
