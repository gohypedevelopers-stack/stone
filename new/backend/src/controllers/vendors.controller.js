import prisma from "../lib/prisma.js";
import {
  formatEnumOutput,
  normalizeEnumInput,
  serializePrisma,
} from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

// ─── Helpers ───────────────────────────────────────────────────────────
const buildVendorDashboard = async (vendors) => {
  const vendorIds = vendors.map((vendor) => vendor.id);

  if (vendorIds.length === 0) {
    return [];
  }

  const [orderGroups, productGroups, lowStockGroups] = await Promise.all([
    prisma.order.groupBy({
      by: ["vendorId"],
      where: { vendorId: { in: vendorIds } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.product.groupBy({
      by: ["vendorId"],
      where: { vendorId: { in: vendorIds } },
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["vendorId"],
      where: {
        vendorId: { in: vendorIds },
        stock: { lte: 5 },
      },
      _count: { _all: true },
    }),
  ]);

  const orderMap = new Map(orderGroups.map((entry) => [entry.vendorId, entry]));
  const productMap = new Map(productGroups.map((entry) => [entry.vendorId, entry]));
  const lowStockMap = new Map(lowStockGroups.map((entry) => [entry.vendorId, entry]));

  return vendors.map((vendor) =>
    serializePrisma({
      ...vendor,
      approvalStatus: formatEnumOutput(vendor.approvalStatus),
      analytics: {
        totalOrders: orderMap.get(vendor.id)?._count._all || 0,
        totalRevenue: orderMap.get(vendor.id)?._sum.totalAmount || 0,
        totalProducts: productMap.get(vendor.id)?._count._all || 0,
        lowStockCount: lowStockMap.get(vendor.id)?._count._all || 0,
      },
    }),
  );
};

// ─── Existing Endpoints ────────────────────────────────────────────────

export const listVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });

    const dashboard = await buildVendorDashboard(vendors);

    return sendSuccess(res, dashboard, "Vendors fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createVendor = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      storeAddress,
      address,
      contactNumber,
      email,
      businessCategory,
      category,
      identityDocument,
      approvalStatus,
    } = req.body;

    if (!businessName || !ownerName || !(storeAddress || address) || !contactNumber || !(businessCategory || category)) {
      return sendError(
        res,
        "Business name, store address, contact number, and business category are required",
        400,
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        businessName,
        ownerName,
        storeAddress: storeAddress || address,
        contactNumber,
        email: email || null,
        businessCategory: businessCategory || category,
        identityDocument: identityDocument || null,
        approvalStatus: normalizeEnumInput(approvalStatus) || "PENDING",
      },
    });

    return sendSuccess(
      res,
      serializePrisma({
        ...vendor,
        approvalStatus: formatEnumOutput(vendor.approvalStatus),
        analytics: {
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          lowStockCount: 0,
        },
      }),
      "Vendor submitted for approval",
      201,
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getVendorDashboard = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });

    const dashboard = await buildVendorDashboard(vendors);

    return sendSuccess(res, dashboard, "Vendor dashboard summary fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── Vendor-Scoped Products ────────────────────────────────────────────

export const getVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, search } = req.query;

    const where = { vendorId };
    if (status) where.status = normalizeEnumInput(status);

    let products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (search) {
      const q = search.toLowerCase();
      products = products.filter((p) =>
        `${p.name} ${p.brand || ""} ${p.category?.name || ""}`.toLowerCase().includes(q),
      );
    }

    return sendSuccess(res, serializePrisma(products), "Vendor products fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── Vendor-Scoped Orders ──────────────────────────────────────────────

export const getVendorOrders = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.query;

    const where = { vendorId };
    if (status) where.status = normalizeEnumInput(status);

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        shippingAddress: true,
        items: {
          include: { product: true },
        },
        trackingEvents: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((order) =>
      serializePrisma({
        ...order,
        status: formatEnumOutput(order.status),
        trackingEvents: order.trackingEvents?.map((e) => ({
          ...e,
          status: formatEnumOutput(e.status),
        })),
      }),
    );

    return sendSuccess(res, formatted, "Vendor orders fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── Vendor Order Status Update (Fulfillment) ──────────────────────────

export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { vendorId, orderId } = req.params;
    const { status, note } = req.body;
    const normalizedStatus = normalizeEnumInput(status);

    if (!normalizedStatus) {
      return sendError(res, "Order status is required", 400);
    }

    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
    });

    if (!existingOrder) {
      return sendError(res, "Order not found for this vendor", 404);
    }

    // Validate transition
    const validTransitions = {
      PLACED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PACKED", "CANCELLED"],
      PACKED: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
    };

    const allowed = validTransitions[existingOrder.status] || [];
    if (!allowed.includes(normalizedStatus)) {
      return sendError(
        res,
        `Cannot transition from ${existingOrder.status} to ${normalizedStatus}`,
        400,
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: normalizedStatus,
        deliveredAt: normalizedStatus === "DELIVERED" ? new Date() : existingOrder.deliveredAt,
        trackingEvents: {
          create: {
            status: normalizedStatus,
            note: note || null,
          },
        },
      },
      include: {
        customer: true,
        shippingAddress: true,
        items: { include: { product: true } },
        trackingEvents: { orderBy: { createdAt: "asc" } },
      },
    });

    return sendSuccess(
      res,
      serializePrisma({
        ...order,
        status: formatEnumOutput(order.status),
        trackingEvents: order.trackingEvents?.map((e) => ({
          ...e,
          status: formatEnumOutput(e.status),
        })),
      }),
      "Order status updated",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── Vendor Product Update (stock, status, description) ────────────────

export const updateVendorProduct = async (req, res) => {
  try {
    const { vendorId, productId } = req.params;

    const existing = await prisma.product.findFirst({
      where: { id: productId, vendorId },
    });

    if (!existing) {
      return sendError(res, "Product not found for this vendor", 404);
    }

    const { stock, description, status } = req.body;

    const data = {};
    if (stock !== undefined) data.stock = Number(stock);
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = normalizeEnumInput(status);

    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: { category: true },
    });

    return sendSuccess(res, serializePrisma(product), "Product updated");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── Vendor Offline Purchases ──────────────────────────────────────────

export const getVendorOfflinePurchases = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const purchases = await prisma.offlinePurchase.findMany({
      where: { vendorId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { purchaseDate: "desc" },
    });

    return sendSuccess(res, serializePrisma(purchases), "Vendor offline purchases fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── Vendor Analytics ──────────────────────────────────────────────────

export const getVendorAnalytics = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return sendError(res, "Vendor not found", 404);

    // Parallel queries
    const [
      orderStats,
      productCount,
      lowStockProducts,
      recentOrders,
      offlinePurchases,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      // Total orders & revenue
      prisma.order.aggregate({
        where: { vendorId },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      // Total products
      prisma.product.count({ where: { vendorId } }),
      // Low stock products (stock <= 5)
      prisma.product.findMany({
        where: { vendorId, stock: { lte: 5 }, status: "ACTIVE" },
        include: { category: true },
        orderBy: { stock: "asc" },
      }),
      // Recent 10 orders
      prisma.order.findMany({
        where: { vendorId },
        include: {
          customer: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Offline purchase stats
      prisma.offlinePurchase.aggregate({
        where: { vendorId },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      // Top selling products by order item count
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: { vendorId },
          productId: { not: null },
        },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: { vendorId },
        _count: { _all: true },
      }),
    ]);

    // Resolve product names for top products
    const topProductIds = topProducts.map((p) => p.productId).filter(Boolean);
    const productDetails = topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, imageUrls: true, price: true, stock: true },
        })
      : [];
    const productMap = new Map(productDetails.map((p) => [p.id, p]));

    const resolvedTopProducts = topProducts.map((tp) => {
      const product = productMap.get(tp.productId);
      return {
        productId: tp.productId,
        name: product?.name || "Unknown",
        image: product?.imageUrls?.[0] || null,
        price: product?.price || 0,
        stock: product?.stock || 0,
        totalSold: tp._sum.quantity || 0,
        totalRevenue: tp._sum.lineTotal || 0,
      };
    });

    // Unique customer count from orders
    const customerIds = await prisma.order.findMany({
      where: { vendorId },
      select: { customerId: true },
      distinct: ["customerId"],
    });

    const statusBreakdown = ordersByStatus.map((e) => ({
      status: formatEnumOutput(e.status),
      count: e._count._all,
    }));

    return sendSuccess(
      res,
      serializePrisma({
        revenue: {
          total: orderStats._sum.totalAmount || 0,
          online: orderStats._sum.totalAmount || 0,
          offline: offlinePurchases._sum.amount || 0,
        },
        orders: {
          total: orderStats._count._all,
          statusBreakdown,
        },
        offlineSales: {
          total: offlinePurchases._count._all,
          totalAmount: offlinePurchases._sum.amount || 0,
        },
        totalProducts: productCount,
        totalCustomers: customerIds.length,
        lowStockProducts: lowStockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          category: p.category?.name || "General",
          imageUrl: p.imageUrls?.[0] || null,
        })),
        topProducts: resolvedTopProducts,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customer?.name || "Unknown",
          totalAmount: o.totalAmount,
          status: formatEnumOutput(o.status),
          createdAt: o.createdAt,
          itemCount: o.items?.length || 0,
        })),
      }),
      "Vendor analytics fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── Vendor Notifications ──────────────────────────────────────────────

export const getVendorNotifications = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { vendorId },
          { audience: "VENDOR", vendorId: null },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return sendSuccess(res, serializePrisma(notifications), "Vendor notifications fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const markVendorNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return sendSuccess(res, serializePrisma(notification), "Notification marked as read");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
