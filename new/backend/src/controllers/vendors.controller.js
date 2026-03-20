import prisma from "../lib/prisma.js";
import {
  formatEnumOutput,
  normalizeEnumInput,
  serializePrisma,
} from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

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
