import { Router } from "express";
import {
  createProduct,
  getProductById,
  listProducts,
  getBrands
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/brands", getBrands);
router.post("/", createProduct);
router.get("/:productId", getProductById);

export default router;
