import { Router } from "express";
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

router.get("/", getCoupons);
router.post("/", createCoupon);
router.delete("/:id", deleteCoupon);
router.post("/validate", validateCoupon);

export default router;
