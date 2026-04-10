import { Router } from "express";
import {
  createVendor,
  getVendorDashboard,
  listVendors,
  getVendorProducts,
  getVendorOrders,
  updateVendorOrderStatus,
  updateVendorProduct,
  getVendorOfflinePurchases,
  getVendorAnalytics,
  getVendorNotifications,
  markVendorNotificationRead,
} from "../controllers/vendors.controller.js";
import { lookupCustomerByMobile } from "../controllers/admin.controller.js";

const router = Router();

router.get("/", listVendors);
router.post("/", createVendor);
router.get("/dashboard", getVendorDashboard);
router.get("/customers/lookup", lookupCustomerByMobile);

// ─── Vendor-Scoped Endpoints ───────────────────────────────────────────
router.get("/:vendorId/products", getVendorProducts);
router.put("/:vendorId/products/:productId", updateVendorProduct);
router.get("/:vendorId/orders", getVendorOrders);
router.put("/:vendorId/orders/:orderId/status", updateVendorOrderStatus);
router.get("/:vendorId/offline-purchases", getVendorOfflinePurchases);
router.get("/:vendorId/analytics", getVendorAnalytics);
router.get("/:vendorId/notifications", getVendorNotifications);
router.patch("/notifications/:notificationId/read", markVendorNotificationRead);

export default router;
