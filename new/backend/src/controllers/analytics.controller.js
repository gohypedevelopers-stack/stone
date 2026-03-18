import prisma from "../lib/prisma.js";
import { formatEnumOutput, serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const getAnalyticsOverview = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalProducts, orderStats, orderStatusBreakdownRaw, orderItems] =
      await Promise.all([
        prisma.customer.count(),
        prisma.vendor.count(),
        prisma.product.count(),
        prisma.order.aggregate({
          _count: { _all: true },
          _sum: { totalAmount: true },
        }),
        prisma.order.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        prisma.orderItem.findMany({
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        }),
      ]);

    const categoryTotals = new Map();

    for (const item of orderItems) {
      const categoryName = item.product?.category?.name || "Uncategorized";
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + item.quantity);
    }

    const topSellingCategories = [...categoryTotals.entries()]
      .map(([category, orders]) => ({ category, orders }))
      .sort((left, right) => right.orders - left.orders)
      .slice(0, 5);

    const orderStatusBreakdown = orderStatusBreakdownRaw.map((entry) => ({
      status: formatEnumOutput(entry.status),
      count: entry._count._all,
    }));

    return sendSuccess(
      res,
      serializePrisma({
        totalRevenue: orderStats._sum.totalAmount || 0,
        totalOrders: orderStats._count._all,
        totalUsers,
        totalVendors,
        totalProducts,
        topSellingCategories,
        orderStatusBreakdown,
      }),
      "Analytics overview fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
