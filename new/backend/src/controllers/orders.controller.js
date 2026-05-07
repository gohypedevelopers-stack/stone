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
      address, // New: support direct address creation
      type = "Online", // New: support explicit typing
      items = [],
      discountAmount = 0,
      rewardPointsUsed = 0,
    } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return sendError(res, "Customer and order items are required", 400);
    }

    // Policy: Online orders are always created as 'Unassigned' to allow manual admin routing.
    // Offline orders (POS) require immediate vendor assignment.
    const effectiveVendorId = type === "Online" ? null : vendorId;

    const [customer, vendor, products] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      effectiveVendorId ? prisma.vendor.findUnique({ where: { id: effectiveVendorId } }) : Promise.resolve(null),
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

    if (effectiveVendorId && !vendor) {
      return sendError(res, "Vendor not found", 404);
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const resolvedItems = items.map((item) => {
      const product = item.productId ? productMap.get(item.productId) : null;
      const quantity = Number(item.quantity || 1);

      if (!product) {
        const unitPrice = Number(item.unitPrice || 0);
        return {
          product: null,
          quantity,
          unitPrice,
          name: item.name || "Custom Item",
          lineTotal: unitPrice * quantity,
          isFree: !!item.isFree,
          offerType: item.offerType || null,
        };
      }

      const unitPrice = Number(product.discountPrice || product.price);

      return {
        product,
        quantity,
        unitPrice,
        name: product.name,
        lineTotal: unitPrice * quantity,
        isFree: !!item.isFree,
        offerType: item.offerType || null,
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
      let finalAddressId = addressId;

      // Handle new address creation if details provided
      if (address && typeof address === 'object') {
        const newAddress = await tx.address.create({
          data: {
            line1: address.line1,
            line2: address.line2 || null,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country || "India",
            customer: { connect: { id: customerId } }
          }
        });
        finalAddressId = newAddress.id;
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: `OMW-${Date.now()}`,
          customer: { connect: { id: customerId } },
          vendor: effectiveVendorId ? { connect: { id: effectiveVendorId } } : undefined,
          shippingAddress: finalAddressId ? { connect: { id: finalAddressId } } : undefined,
          status: "PLACED",
          type,
          subtotal,
          discountAmount: normalizedDiscountAmount,
          totalAmount,
          rewardPointsUsed: normalizedRewardPointsUsed,
          rewardPointsEarned,
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.product?.id || null,
              name: item.product?.name || item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              isFree: item.isFree,
              offerType: item.offerType,
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

      if (effectiveVendorId) {
        for (const item of resolvedItems) {
          if (item.product) {
            await tx.vendorStock.upsert({
              where: {
                productId_vendorId: {
                  productId: item.product.id,
                  vendorId: effectiveVendorId
                }
              },
              update: {
                quantity: {
                  decrement: item.quantity,
                },
              },
              create: {
                 productId: item.product.id,
                 vendorId: effectiveVendorId,
                 quantity: 0 
              }
            });
          }
        }
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

    // Clear the customer's cart after successful order
    await prisma.cart.deleteMany({ where: { customerId } });

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
export const fulfillOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vendorId } = req.body;

    if (!vendorId) {
      return sendError(res, "Vendor ID is required for fulfillment", 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    if (order.status !== "APPROVED") {
      return sendError(res, "Order must be APPROVED before assigning a vendor", 400);
    }

    if (order.vendorId) {
      return sendError(res, "Order is already assigned to a vendor", 400);
    }

    // Process fulfillment in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update stock for each product for the selected vendor
      for (const item of order.items) {
        if (item.productId) {
          // Verify stock exists first
          const stock = await tx.vendorStock.findUnique({
            where: {
              productId_vendorId: {
                productId: item.productId,
                vendorId: vendorId
              }
            }
          });

          if (!stock || stock.quantity < item.quantity) {
            throw new Error(`Insufficient stock for product in requested vendor outlet.`);
          }

          await tx.vendorStock.update({
            where: {
              productId_vendorId: {
                productId: item.productId,
                vendorId: vendorId
              }
            },
            data: {
              quantity: { decrement: item.quantity }
            }
          });
        }
      }

      // 2. Assign vendor and update status
      return tx.order.update({
        where: { id: orderId },
        data: {
          vendorId: vendorId,
          status: "CONFIRMED", // Auto-confirm when assigned? Or keep as is.
          trackingEvents: {
            create: {
              status: "CONFIRMED",
              note: `Order assigned to vendor and confirmed.`
            }
          }
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
        }
      });
    });

    return sendSuccess(res, formatOrder(updatedOrder), "Order fulfilled and assigned to vendor");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
