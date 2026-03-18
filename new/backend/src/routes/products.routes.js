import { Router } from "express";
import {
  createProduct,
  getProductById,
  listProducts,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", listProducts);
router.post("/", createProduct);
router.get("/:productId", getProductById);

export default router;
