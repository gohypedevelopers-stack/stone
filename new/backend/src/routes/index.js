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

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OMW backend is running",
    timestamp: new Date().toISOString(),
  });
});

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

export default router;
