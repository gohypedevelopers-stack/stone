import { Router } from "express";
import {
  createOrder,
  listOrders,
  updateOrderStatus,
} from "../controllers/orders.controller.js";

const router = Router();

router.get("/", listOrders);
router.post("/", createOrder);
router.patch("/:orderId/status", updateOrderStatus);

export default router;
