import express from "express";
import { 
  registerVendor, 
  loginVendor, 
  getVendorProfile 
} from "../controllers/auth.vendor.controller.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);
router.get("/profile", getVendorProfile);

export default router;
