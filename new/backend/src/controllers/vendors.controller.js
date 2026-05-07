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
      password,
    } = req.body;

    if (!businessName || !ownerName || !(storeAddress || address) || !contactNumber || !(businessCategory || category)) {
      return sendError(
        res,
        "Business name, owner name, store address, contact number, and business category are required",
        400,
      );
    }

    let hashedPassword = null;
    if (password) {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.default.hash(password, 10);
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
        password: hashedPassword,
      },
    });

    const serializedVendor = serializePrisma({
      ...vendor,
      approvalStatus: formatEnumOutput(vendor.approvalStatus),
      analytics: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        lowStockCount: 0,
      },
    });
    delete serializedVendor.password;

    return sendSuccess(
      res,
      serializedVendor,
      "Vendor created successfully",
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

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { outletId: true }
    });

    const where = {
      OR: [
        { vendorId },
        { stockRecords: { some: { vendorId } } },
        vendor?.outletId ? { outletInventories: { some: { outletId: vendor.outletId } } } : null,
      ].filter(Boolean),
    };
    
    if (status) {
      where.status = normalizeEnumInput(status);
    } else {
      // By default, hide archived products to avoid cluttering the dashboard
      where.status = { not: "ARCHIVED" };
    }

    const include = {
      category: true,
      stockRecords: { where: { vendorId } },
    };

    if (vendor?.outletId) {
      include.outletInventories = { where: { outletId: vendor.outletId } };
    }

    let products = await prisma.product.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
    });

    if (search) {
      const q = search.toLowerCase();
      products = products.filter((p) =>
        `${p.name} ${p.brand || ""} ${p.category?.name || ""}`.toLowerCase().includes(q),
      );
    }

    const serializedProducts = serializePrisma(products).map(p => {
      const vendorStock = (p.stockRecords || []).reduce((sum, sr) => sum + (sr.quantity || 0), 0);
      const outletStock = (p.outletInventories || []).reduce((sum, oi) => sum + (oi.quantity || 0), 0);
      return {
        ...p,
        stock: vendorStock + outletStock
      };
    });

    return sendSuccess(res, serializedProducts, "Vendor products fetched");
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
      where: {
        id: productId,
        OR: [
          { vendorId },
          { stockRecords: { some: { vendorId } } }
        ]
      },
    });

    if (!existing) {
      return sendError(res, "Product not found for this vendor", 404);
    }

    const { stock, description, status } = req.body;

    await prisma.$transaction(async (tx) => {
      // 1. Handle stock update via VendorStock record
      if (stock !== undefined) {
        await tx.vendorStock.upsert({
          where: { productId_vendorId: { productId, vendorId } },
          update: { quantity: Number(stock) },
          create: { productId, vendorId, quantity: Number(stock) },
        });
      }

      // 2. Handle product level updates (only if vendor owns the product record)
      if (existing.vendorId === vendorId) {
        const productData = {};
        if (description !== undefined) productData.description = description;
        if (status !== undefined) productData.status = normalizeEnumInput(status);

        if (Object.keys(productData).length > 0) {
          await tx.product.update({
            where: { id: productId },
            data: productData,
          });
        }
      }
    });

    return sendSuccess(res, null, "Product updated successfully");
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

    // Low stock products
    const lowStockProductsInclude = {
      category: true,
      stockRecords: { where: { vendorId } },
    };
    if (vendor.outletId) {
      lowStockProductsInclude.outletInventories = { where: { outletId: vendor.outletId } };
    }

    const [
      orderStats,
      productCount,
      allProducts,
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
      prisma.product.count({
        where: {
          OR: [
            { vendorId },
            { stockRecords: { some: { vendorId } } },
            vendor.outletId ? { outletInventories: { some: { outletId: vendor.outletId } } } : null,
          ].filter(Boolean)
        }
      }),
      // Get products to filter for low stock
      prisma.product.findMany({
        where: {
          OR: [
            { vendorId },
            { stockRecords: { some: { vendorId } } },
            vendor.outletId ? { outletInventories: { some: { outletId: vendor.outletId } } } : null,
          ].filter(Boolean),
          status: "ACTIVE"
        },
        include: lowStockProductsInclude,
        orderBy: { updatedAt: "desc" },
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

    // Calculate actual stock and filter for low stock
    const productsWithStock = allProducts.map(p => {
      const vStock = (p.stockRecords || []).reduce((sum, sr) => sum + (sr.quantity || 0), 0);
      const oStock = (p.outletInventories || []).reduce((sum, oi) => sum + (oi.quantity || 0), 0);
      return { ...p, stock: vStock + oStock };
    });

    const filteredLowStock = productsWithStock.filter(p => p.stock <= 5);

    // Resolve product names for top products
    const topProductIds = topProducts.map((p) => p.productId).filter(Boolean);
    const topProductInclude = {
      category: { select: { name: true } },
      stockRecords: { where: { vendorId } },
    };
    if (vendor.outletId) {
      topProductInclude.outletInventories = { where: { outletId: vendor.outletId } };
    }

    const productDetails = topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          include: topProductInclude,
        })
      : [];
    const productMap = new Map(productDetails.map((p) => [p.id, p]));

    const resolvedTopProducts = topProducts.map((tp) => {
      const product = productMap.get(tp.productId);
      const vStock = (product?.stockRecords || []).reduce((sum, sr) => sum + (sr.quantity || 0), 0);
      const oStock = (product?.outletInventories || []).reduce((sum, oi) => sum + (oi.quantity || 0), 0);
      
      return {
        productId: tp.productId,
        name: product?.name || "Unknown",
        image: product?.imageUrls?.[0] || null,
        price: product?.price || 0,
        stock: vStock + oStock,
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

    // Data for Revenue Chart (Daily trend for last 7 days)
    const last7Days = new Date();
    last7Days.setHours(0, 0, 0, 0);
    last7Days.setDate(last7Days.getDate() - 6);

    const [trendOrders, trendOffline] = await Promise.all([
      prisma.order.findMany({
        where: { vendorId, createdAt: { gte: last7Days } },
        select: { createdAt: true, totalAmount: true }
      }),
      prisma.offlinePurchase.findMany({
        where: { vendorId, createdAt: { gte: last7Days } },
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
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const offlineAmt = trendOffline
        .filter(p => p.createdAt >= dayStart && p.createdAt <= dayEnd)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      graphData.push({
        day: dayLabel,
        onlineAmount: onlineAmt,
        offlineAmount: offlineAmt,
        total: onlineAmt + offlineAmt,
      });
    }

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
        lowStockProducts: filteredLowStock.map((p) => ({
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
        graphData,
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
