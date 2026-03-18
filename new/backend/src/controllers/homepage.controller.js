import prisma from "../lib/prisma.js";
import { serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

const sortByOrderVolume = (products, orderItems) => {
  const scoreMap = new Map();

  for (const item of orderItems) {
    scoreMap.set(item.productId, (scoreMap.get(item.productId) || 0) + item.quantity);
  }

  return [...products].sort((left, right) => (scoreMap.get(right.id) || 0) - (scoreMap.get(left.id) || 0));
};

export const getHomepageContent = async (req, res) => {
  try {
    const [
      banners,
      campaigns,
      featuredProducts,
      discountProducts,
      rewardProducts,
      limitedOffers,
      newArrivals,
      trendingOrderItems,
    ] = await Promise.all([
      prisma.homepageBanner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.campaign.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { featured: true },
        include: { vendor: true, category: true },
        take: 8,
      }),
      prisma.product.findMany({
        where: { discounted: true },
        include: { vendor: true, category: true },
        take: 8,
      }),
      prisma.product.findMany({
        where: { rewardEligible: true },
        include: { vendor: true, category: true },
        take: 8,
      }),
      prisma.product.findMany({
        where: { limitedOffer: true },
        include: { vendor: true, category: true },
        take: 8,
      }),
      prisma.product.findMany({
        include: { vendor: true, category: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.orderItem.findMany({
        where: {
          productId: {
            not: null,
          },
        },
        include: {
          product: {
            include: {
              vendor: true,
              category: true,
            },
          },
        },
      }),
    ]);

    const trendingProducts = sortByOrderVolume(
      trendingOrderItems.map((item) => item.product).filter(Boolean),
      trendingOrderItems,
    ).slice(0, 8);

    return sendSuccess(
      res,
      serializePrisma({
        banners,
        featuredProducts,
        discountProducts,
        rewardProducts,
        trendingProducts,
        newArrivals,
        limitedOffers,
        campaigns,
      }),
      "Homepage content fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
