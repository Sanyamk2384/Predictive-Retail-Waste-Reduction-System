import { Router } from "express";
import {
  uploadInventoryCsv,
  getInventoryBatches,
  addInventoryBatch,
  deleteInventoryBatch,
  updateinventoryBatch,
} from "../controllers/inventory.controller.js";
import { uploadCsv } from "../middlewares/multer.middleware.js";

const inventoryRoute = Router();

inventoryRoute.post("/upload", uploadCsv, uploadInventoryCsv);
inventoryRoute.post("/add", addInventoryBatch);
inventoryRoute.get("/", getInventoryBatches);
inventoryRoute.delete("/:id", deleteInventoryBatch);
inventoryRoute.put("/:id", updateinventoryBatch);

export default inventoryRoute;
