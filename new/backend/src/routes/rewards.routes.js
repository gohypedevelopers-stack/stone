import { Router } from "express";
import {
  getRewardSummary,
  redeemRewards,
} from "../controllers/rewards.controller.js";

const router = Router();

router.get("/summary", getRewardSummary);
router.post("/redeem", redeemRewards);

export default router;
