import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingVendorApprovals,
      activeCampaigns,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.vendor.count({
        where: { approvalStatus: "PENDING" },
      }),
      prisma.campaign.count({
        where: { status: "active" },
      }),
    ]);

    return sendSuccess(
      res,
      {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        pendingVendorApprovals,
        activeCampaigns,
      },
      "Admin dashboard fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
