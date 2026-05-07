import prisma from "../lib/prisma.js";
import { formatEnumOutput, serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const getAnalyticsOverview = async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalProducts, orderStats, orderStatusBreakdownRaw, orderItems, offlineStats] =
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
        prisma.offlinePurchase.aggregate({
          _count: { _all: true },
          _sum: { amount: true },
        }),
      ]);

    // Graph Data Calculation (Last 7 Days)
    const last7Days = new Date();
    last7Days.setHours(0, 0, 0, 0);
    last7Days.setDate(last7Days.getDate() - 6);

    const [trendOrders, trendOffline] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: last7Days } },
        select: { createdAt: true, totalAmount: true }
      }),
      prisma.offlinePurchase.findMany({
        where: { createdAt: { gte: last7Days } },
        select: { createdAt: true, amount: true }
      })
    ]);

    const graphData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(last7Days);
      d.setDate(d.getDate() + i);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const onlineAmt = trendOrders
        .filter(o => o.createdAt >= dayStart && o.createdAt <= dayEnd)
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const offlineAmt = trendOffline
        .filter(p => p.createdAt >= dayStart && p.createdAt <= dayEnd)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      graphData.push({
        day: dayLabel,
        onlineAmount: onlineAmt,
        offlineAmount: offlineAmt,
        total: onlineAmt + offlineAmt,
      });
    }

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
        totalRevenue: (orderStats._sum.totalAmount || 0) + (offlineStats._sum.amount || 0),
        revenue: {
          online: orderStats._sum.totalAmount || 0,
          offline: offlineStats._sum.amount || 0,
        },
        orders: {
          total: orderStats._count._all,
        },
        offlineSales: {
          total: offlineStats._count._all,
        },
        totalOrders: orderStats._count._all,
        totalUsers,
        totalVendors,
        totalProducts,
        topSellingCategories,
        orderStatusBreakdown,
        graphData,
      }),
      "Analytics overview fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
