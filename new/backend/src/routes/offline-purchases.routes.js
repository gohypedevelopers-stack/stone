import { Router } from "express";
import {
  listOfflinePurchases,
  recordOfflinePurchase,
} from "../controllers/offline-purchases.controller.js";

const router = Router();

router.get("/", listOfflinePurchases);
router.post("/", recordOfflinePurchase);

export default router;
