import { Router } from "express";
import { getActiveOffers, claimOffer } from "../controllers/offers.controller.js";

const router = Router();

// Public route — active offers for storefront
router.get("/active", getActiveOffers);
router.post("/claim", claimOffer);

export default router;
