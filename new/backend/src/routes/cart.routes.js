import { Router } from "express";
import { syncCart, deleteCart } from "../controllers/cart.controller.js";

const router = Router();

router.put("/sync", syncCart);
router.delete("/sync", deleteCart);

export default router;
