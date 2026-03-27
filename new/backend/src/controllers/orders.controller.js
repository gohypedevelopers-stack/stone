import prisma from "../lib/prisma.js";
import {
  formatEnumOutput,
  normalizeEnumInput,
  serializePrisma,
} from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";
import { calculateRewardPoints } from "./settings.controller.js";

const formatOrder = (order) =>
  serializePrisma({
    ...order,
    status: formatEnumOutput(order.status),
    trackingEvents: order.trackingEvents?.map((entry) => ({
      ...entry,
      status: formatEnumOutput(entry.status),
    })),
  });

export const listOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const orders = await prisma.order.findMany({
      where: status
        ? {
            status: normalizeEnumInput(status),
          }
        : undefined,
      include: {
        customer: true,
        vendor: true,
        shippingAddress: true,
        items: {
          include: {
            product: true,
          },
        },
        trackingEvents: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, orders.map(formatOrder), "Orders fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      vendorId,
      addressId,
      items = [],
      discountAmount = 0,
      rewardPointsUsed = 0,
    } = req.body;

    if (!customerId || !vendorId || !Array.isArray(items) || items.length === 0) {
      return sendError(res, "Customer, vendor, and order items are required", 400);
    }

    const [customer, vendor, products] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.vendor.findUnique({ where: { id: vendorId } }),
      prisma.product.findMany({
        where: {
          id: {
            in: items.map((item) => item.productId).filter(Boolean),
          },
        },
      }),
    ]);

    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }

    if (!vendor) {
      return sendError(res, "Vendor not found", 404);
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const resolvedItems = items.map((item) => {
      const product = productMap.get(item.productId);
      const quantity = Number(item.quantity || 1);

      if (!product) {
        throw new Error(`Product not found for item ${item.productId}`);
      }

      if (quantity > product.stock) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      const unitPrice = Number(product.discountPrice || product.price);

      return {
        product,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      };
    });

    const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const normalizedDiscountAmount = Number(discountAmount || 0);
    const normalizedRewardPointsUsed = Number(rewardPointsUsed || 0);

    if (normalizedRewardPointsUsed > customer.rewardPoints) {
      return sendError(res, "Insufficient reward points", 400);
    }

    const totalAmount = Math.max(
      subtotal - normalizedDiscountAmount - normalizedRewardPointsUsed,
      0,
    );
    const rewardPointsEarned = await calculateRewardPoints(totalAmount);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: `OMW-${Date.now()}`,
          customerId,
          vendorId,
          addressId: addressId || null,
          status: "PLACED",
          subtotal,
          discountAmount: normalizedDiscountAmount,
          totalAmount,
          rewardPointsUsed: normalizedRewardPointsUsed,
          rewardPointsEarned,
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
          trackingEvents: {
            create: {
              status: "PLACED",
            },
          },
        },
        include: {
          customer: true,
          vendor: true,
          shippingAddress: true,
          items: {
            include: {
              product: true,
            },
          },
          trackingEvents: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      for (const item of resolvedItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const rewardPointsDelta = rewardPointsEarned - normalizedRewardPointsUsed;

      await tx.customer.update({
        where: { id: customerId },
        data: {
          rewardPoints:
            rewardPointsDelta >= 0
              ? { increment: rewardPointsDelta }
              : { decrement: Math.abs(rewardPointsDelta) },
        },
      });

      if (normalizedRewardPointsUsed > 0) {
        await tx.rewardTransaction.create({
          data: {
            customerId,
            type: "REDEEMED",
            source: "checkout",
            sourceId: createdOrder.id,
            points: normalizedRewardPointsUsed,
          },
        });
      }

      if (rewardPointsEarned > 0) {
        await tx.rewardTransaction.create({
          data: {
            customerId,
            type: "EARNED",
            source: "online-purchase",
            sourceId: createdOrder.id,
            points: rewardPointsEarned,
          },
        });
      }

      return createdOrder;
    });

    return sendSuccess(res, formatOrder(order), "Order created", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const normalizedStatus = normalizeEnumInput(status);

    if (!normalizedStatus) {
      return sendError(res, "Order status is required", 400);
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: req.params.orderId },
    });

    if (!existingOrder) {
      return sendError(res, "Order not found", 404);
    }

    const order = await prisma.order.update({
      where: { id: req.params.orderId },
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
        vendor: true,
        shippingAddress: true,
        items: {
          include: {
            product: true,
          },
        },
        trackingEvents: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return sendSuccess(res, formatOrder(order), "Order status updated");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
