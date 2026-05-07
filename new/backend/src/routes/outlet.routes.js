import { Router } from "express";
import {
  addOutletInventory,
  listOutletInventory,
  listOutletStockMovements,
  reduceOutletInventory,
  scanProductCode,
} from "../controllers/inventory.controller.js";

const router = Router();

router.post("/scan-code", scanProductCode);
router.post("/inventory/add", addOutletInventory);
router.post("/inventory/reduce", reduceOutletInventory);
router.get("/inventory", listOutletInventory);
router.get("/stock-movements", listOutletStockMovements);

export default router;
