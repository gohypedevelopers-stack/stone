import { Router } from "express";
import {
  createTransfer,
  listTransfers,
  getTransferDetail,
  updateTransferStatus,
  getGlobalInventory
} from "../controllers/stock-transfer.controller.js";

const router = Router();

// Global inventory visibility
router.get("/inventory", getGlobalInventory);

// Transfer management
router.post("/", createTransfer);
router.get("/", listTransfers);
router.get("/:id", getTransferDetail);
router.put("/:id/status", updateTransferStatus);

export default router;
