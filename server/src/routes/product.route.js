import { Router } from "express";
import {
  uploadProductData,
  uploadSingleProduct,
  updateSingleProduct,
  getSingleProduct,
  deleteSingleProduct,
  getAllProducts,
} from "../controllers/product.controller.js";
import { uploadCsv } from "../middlewares/multer.middleware.js";

const productRouter = Router();

productRouter.post("/upload", uploadCsv, uploadProductData);
productRouter.post("/add", uploadSingleProduct);
productRouter.get("/get/:id", getSingleProduct);
productRouter.get("/", getAllProducts);
productRouter.patch("/update/:id", updateSingleProduct);
productRouter.delete("/delete/:id", deleteSingleProduct);

export default productRouter;
