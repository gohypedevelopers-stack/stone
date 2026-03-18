import prisma from "../lib/prisma.js";
import { serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

const formatOfflinePurchase = (purchase) =>
  serializePrisma({
    ...purchase,
    linkedCustomerId: purchase.customerId,
  });

export const listOfflinePurchases = async (req, res) => {
  try {
    const purchases = await prisma.offlinePurchase.findMany({
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
    const { vendorId, mobile, amount, purchaseDate, items = [] } = req.body;

    if (!vendorId || !mobile || amount === undefined) {
      return sendError(res, "Vendor, mobile number, and amount are required", 400);
    }

    const [vendor, customer] = await Promise.all([
      prisma.vendor.findUnique({
        where: { id: vendorId },
      }),
      prisma.customer.findUnique({
        where: { mobile },
      }),
    ]);

    if (!vendor) {
      return sendError(res, "Vendor not found", 404);
    }

    const purchase = await prisma.offlinePurchase.create({
      data: {
        vendorId,
        customerId: customer?.id || null,
        mobile,
        amount: Number(amount),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        linkedAt: customer ? new Date() : null,
        items: {
          create: Array.isArray(items)
            ? items.map((item) => ({
                name: item.name,
                quantity: Number(item.quantity || 1),
                unitPrice: Number(item.unitPrice ?? item.price ?? 0),
              }))
            : [],
        },
      },
      include: {
        customer: true,
        vendor: true,
        items: true,
      },
    });

    return sendSuccess(
      res,
      formatOfflinePurchase(purchase),
      "Offline purchase recorded",
      201,
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
