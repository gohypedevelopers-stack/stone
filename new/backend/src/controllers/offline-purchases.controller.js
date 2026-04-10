import prisma from "../lib/prisma.js";
import { serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";
import { calculateRewardPoints } from "./settings.controller.js";

const formatOfflinePurchase = (purchase) =>
  serializePrisma({
    ...purchase,
    linkedCustomerId: purchase.customerId,
  });

export const listOfflinePurchases = async (req, res) => {
  try {
    const { vendorId } = req.query;

    const purchases = await prisma.offlinePurchase.findMany({
      where: vendorId ? { vendorId: String(vendorId) } : undefined,
      include: {
        customer: true,
        vendor: true,
        items: true,
      },
      orderBy: { purchaseDate: "desc" },
    });

    return sendSuccess(res, purchases.map(formatOfflinePurchase), "Offline purchases fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const recordOfflinePurchase = async (req, res) => {
  try {
    const { vendorId, mobile, amount, purchaseDate, items = [], customerId, customerName, name } = req.body;

    if (!vendorId || !mobile || amount === undefined) {
      return sendError(res, "Vendor, mobile number, and amount are required", 400);
    }

    const normalizedItems = Array.isArray(items)
      ? items.map((item) => ({
          productId: item.productId || null,
          name: item.name,
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.unitPrice ?? item.price ?? 0),
        }))
      : [];

    if (normalizedItems.length === 0) {
      return sendError(res, "At least one item is required", 400);
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return sendError(res, "Vendor not found", 404);
    }

    const purchase = await prisma.$transaction(async (tx) => {
      let linkedCustomer = null;

      if (customerId) {
        linkedCustomer = await tx.customer.findUnique({
          where: { id: customerId },
        });

        if (!linkedCustomer) {
          const error = new Error("Customer not found");
          error.statusCode = 404;
          throw error;
        }
      } else {
        linkedCustomer = await tx.customer.findUnique({
          where: { mobile },
        });
      }

      const resolvedCustomerName =
        linkedCustomer?.name || customerName || name || null;

      const rewardPointsEarned = linkedCustomer
        ? await calculateRewardPoints(Number(amount))
        : 0;

      const newPurchase = await tx.offlinePurchase.create({
        data: {
          customer: linkedCustomer ? { connect: { id: linkedCustomer.id } } : undefined,
          customerName: resolvedCustomerName,
          vendor: { connect: { id: vendorId } },
          mobile,
          amount: Number(amount),
          rewardPointsEarned,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          linkedAt: linkedCustomer ? new Date() : null,
          items: {
            create: normalizedItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          customer: true,
          vendor: true,
          items: true,
        },
      });

      for (const item of normalizedItems) {
        if (!item.productId) {
          continue;
        }

        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (stockUpdate.count === 0) {
          const error = new Error(`Insufficient stock for ${item.name}`);
          error.statusCode = 400;
          throw error;
        }
      }

      if (linkedCustomer && rewardPointsEarned > 0) {
        await tx.customer.update({
          where: { id: linkedCustomer.id },
          data: { rewardPoints: { increment: rewardPointsEarned } },
        });

        await tx.rewardTransaction.create({
          data: {
            customerId: linkedCustomer.id,
            type: "EARNED",
            source: "offline-purchase",
            sourceId: newPurchase.id,
            points: rewardPointsEarned,
            note: `Offline purchase at ${vendor.businessName}`,
          },
        });
      }

      return newPurchase;
    });

    return sendSuccess(
      res,
      formatOfflinePurchase(purchase),
      "Offline purchase recorded",
      201,
    );
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};
