import { Router } from "express";
import {
  getAdminDashboard,
  getAdminProducts,
  getAdminOrders,
  getAdminVendors,
  getAdminVendorDetail,
  getAdminOfflinePurchases,
  createAdminOfflinePurchase,
  getAdminOrderDetail,
  getAdminCustomers,
  getAdminCustomerDetail,
  lookupCustomerByMobile,
  approveVendor,
  seedFrontendProducts,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  reorderAdminCategories,
  seedAdminCategories,
  getAdminVendorAnalytics,
  getAdminBrands
} from "../controllers/admin.controller.js";
import { getPointsSettings, updatePointsSettings } from "../controllers/settings.controller.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/products.controller.js";
import { getHomepageSections, updateHomepageSection, reorderSections } from "../controllers/homepage.controller.js";

const router = Router();

router.get("/dashboard", getAdminDashboard);

// Homepage Sections
router.get("/homepage/sections", getHomepageSections);
router.put("/homepage/sections/reorder", reorderSections);
router.put("/homepage/sections/:id", updateHomepageSection);

// Products
router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrderDetail);
router.get("/vendors", getAdminVendors);
router.get("/vendors/:id", getAdminVendorDetail);
router.get("/vendor-analytics", getAdminVendorAnalytics);
router.get("/offline-ledgers", getAdminOfflinePurchases);
router.post("/offline-ledgers", createAdminOfflinePurchase);
router.get("/customers", getAdminCustomers);
router.get("/customers/lookup", lookupCustomerByMobile);
router.get("/customers/:id", getAdminCustomerDetail);
router.patch("/vendors/:id/approve", approveVendor);
router.post("/seed-products", seedFrontendProducts);
router.get("/categories", getAdminCategories);
router.post("/categories", createAdminCategory);
router.post("/categories/seed", seedAdminCategories);
router.put("/categories/reorder", reorderAdminCategories);
router.put("/categories/:id", updateAdminCategory);
router.delete("/categories/:id", deleteAdminCategory);
router.get("/brands", getAdminBrands);
router.get("/settings/points", getPointsSettings);
router.put("/settings/points", updatePointsSettings);

export default router;
