import { Router } from "express";
import {
  uploadStoreData,
  addSingleStore,
  updateSingleStore,
  getSingleStore,
  deleteSingleStore,
  getAllStores,
} from "../controllers/store.controller.js";
import { uploadCsv } from "../middlewares/multer.middleware.js";

const storeRouter = Router();

storeRouter.post("/upload", uploadCsv, uploadStoreData);
storeRouter.get("/get/:id", getSingleStore);
storeRouter.get("/", getAllStores);
storeRouter.post("/add", addSingleStore);
storeRouter.patch("/update/:id", updateSingleStore);
storeRouter.delete("/delete/:id", deleteSingleStore);

export default storeRouter;
