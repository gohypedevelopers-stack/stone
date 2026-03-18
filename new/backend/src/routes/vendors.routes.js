import { Router } from "express";
import {
  createVendor,
  getVendorDashboard,
  listVendors,
} from "../controllers/vendors.controller.js";

const router = Router();

router.get("/", listVendors);
router.post("/", createVendor);
router.get("/dashboard", getVendorDashboard);

export default router;
