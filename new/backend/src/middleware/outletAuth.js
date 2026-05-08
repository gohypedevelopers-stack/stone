import prisma from "../lib/prisma.js";

/**
 * Middleware to ensure the request is from an authorized outlet manager.
 * It expects 'x-vendor-id' header and verifies the vendor is approved and assigned to an outlet.
 */
export const outletAuth = async (req, res, next) => {
  const vendorId = req.headers["x-vendor-id"];

  if (!vendorId) {
    return res.status(401).json({
      success: false,
      message: "Authorization header 'x-vendor-id' is missing",
    });
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { outlet: true },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Vendor not found",
      });
    }

    if (vendor.approvalStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Vendor account is not approved",
      });
    }

    if (!vendor.outletId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Vendor is not assigned to any outlet",
      });
    }

    // Attach vendor and outlet info to request for controller use
    req.vendor = vendor;
    req.outletId = vendor.outletId;

    next();
  } catch (error) {
    console.error("Outlet Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization",
    });
  }
};
