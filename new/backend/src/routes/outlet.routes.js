import { Router } from "express";
import {
  addOutletInventory,
  listOutletInventory,
  listOutletStockMovements,
  reduceOutletInventory,
  scanProductCode,
  listAvailableBatches,
} from "../controllers/inventory.controller.js";

import { outletAuth } from "../middleware/outletAuth.js";

const router = Router();

// Apply outletAuth middleware to all routes in this router
router.use(outletAuth);

router.post("/scan-code", scanProductCode);
router.post("/inventory/add", addOutletInventory);
router.post("/inventory/reduce", reduceOutletInventory);
router.get("/inventory", listOutletInventory);
router.get("/stock-movements", listOutletStockMovements);
router.get("/available-batches", listAvailableBatches);

export default router;
