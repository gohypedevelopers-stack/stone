import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, coupons, "Coupons fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, maxUsage, expiresAt } = req.body;

    if (!code || !discountType || !discountValue) {
      return sendError(res, "Missing required fields", 400);
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return sendError(res, "Coupon code already exists", 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase || 0),
        maxUsage: maxUsage ? Number(maxUsage) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return sendSuccess(res, coupon, "Coupon created successfully", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return sendSuccess(res, null, "Coupon deleted successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return sendError(res, "Code is required", 400);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return sendError(res, "Invalid coupon code", 404);
    }

    if (!coupon.isActive) {
      return sendError(res, "Coupon is no longer active", 400);
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return sendError(res, "Coupon has expired", 400);
    }

    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      return sendError(res, "Coupon usage limit reached", 400);
    }

    if (Number(subtotal) < Number(coupon.minPurchase)) {
      return sendError(res, `Minimum purchase of ₹${coupon.minPurchase} required`, 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (Number(subtotal) * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    return sendSuccess(res, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    }, "Coupon applied successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
