import { Router } from "express";
import authRoutes from "./auth.routes.js";
import vendorsRoutes from "./vendors.routes.js";
import productsRoutes from "./products.routes.js";
import ordersRoutes from "./orders.routes.js";
import offlinePurchasesRoutes from "./offline-purchases.routes.js";
import rewardsRoutes from "./rewards.routes.js";
import homepageRoutes from "./homepage.routes.js";
import adminRoutes from "./admin.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import uploadRoutes from "./upload.routes.js";
import couponRoutes from "./coupon.routes.js";
import { getPublicCategories } from "../controllers/admin.controller.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OMW backend is running",
    timestamp: new Date().toISOString(),
  });
});

router.get("/categories", getPublicCategories);

router.use("/auth", authRoutes);
router.use("/vendors", vendorsRoutes);
router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);
router.use("/offline-purchases", offlinePurchasesRoutes);
router.use("/rewards", rewardsRoutes);
router.use("/homepage", homepageRoutes);
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/upload", uploadRoutes);
router.use("/coupons", couponRoutes);

export default router;
