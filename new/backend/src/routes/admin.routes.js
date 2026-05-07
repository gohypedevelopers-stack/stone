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
  getAdminBrands,
  resetVendorPassword,
  assignOrderToVendor,
  getCustomerSegments,
  updateAdminVendor,
  getPlatformSettings,
  updatePlatformSetting
} from "../controllers/admin.controller.js";
import { seedAdmin, loginAdmin, getAdminProfile } from "../controllers/auth.admin.controller.js";
import { getPointsSettings, updatePointsSettings } from "../controllers/settings.controller.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/products.controller.js";
import { getHomepageSections, updateHomepageSection, reorderSections } from "../controllers/homepage.controller.js";
import { getAbandonedCarts } from "../controllers/cart.controller.js";
import { getAllOffers, createOffer, updateOffer, deleteOffer, toggleOffer } from "../controllers/offers.controller.js";
import {
  assignOutletManager,
  createOutlet,
  createProductLabel,
  getAdminInventorySummary,
  getAdminOutletInventory,
  getAdminStockMovements,
  getPrintableProductLabel,
  getProductLabelById,
  listOutlets,
  listProductLabels,
  updateProductLabelStatus,
} from "../controllers/inventory.controller.js";

const router = Router();

// Admin Authentication
router.post("/auth/seed", seedAdmin);
router.post("/auth/login", loginAdmin);
router.get("/auth/profile", getAdminProfile);

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
router.put("/orders/:id/fulfill", assignOrderToVendor);
router.get("/vendors", getAdminVendors);
router.get("/vendors/:id", getAdminVendorDetail);
router.get("/vendor-analytics", getAdminVendorAnalytics);
router.get("/outlets", listOutlets);
router.post("/outlets", createOutlet);
router.patch("/outlets/:outletId/managers/:vendorId", assignOutletManager);
router.get("/outlets/:outletId/inventory", getAdminOutletInventory);
router.get("/inventory/summary", getAdminInventorySummary);
router.get("/stock-movements", getAdminStockMovements);
router.post("/product-labels", createProductLabel);
router.get("/product-labels", listProductLabels);
router.get("/product-labels/:id", getProductLabelById);
router.get("/product-labels/:id/print", getPrintableProductLabel);
router.patch("/product-labels/:id/status", updateProductLabelStatus);
router.get("/offline-ledgers", getAdminOfflinePurchases);
router.post("/offline-ledgers", createAdminOfflinePurchase);
router.get("/customers", getAdminCustomers);
router.get("/customers/lookup", lookupCustomerByMobile);
router.get("/customers/:id", getAdminCustomerDetail);
router.post("/vendors/:id/reset-password", resetVendorPassword);
router.patch("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id", updateAdminVendor);
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
router.get("/settings/platform", getPlatformSettings);
router.put("/settings/platform", updatePlatformSetting);
router.get("/abandoned-checkouts", getAbandonedCarts);
router.get("/customer-segments", getCustomerSegments);

// Offers
router.get("/offers", getAllOffers);
router.post("/offers", createOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);
router.patch("/offers/:id/toggle", toggleOffer);

export default router;
