import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";
import { serializePrisma } from "../utils/data.js";

const DEFAULT_SECTIONS = [
  { title: "Hero Slider", componentId: "hero-slider", sortOrder: 0, type: "BUILT_IN" },
  { title: "Offer Timer", componentId: "offer-timer", sortOrder: 1, type: "BUILT_IN" },
  { title: "Upcoming Drops", componentId: "upcoming-drops", sortOrder: 2, type: "BUILT_IN" },
  { title: "Shop By Category", componentId: "shop-by-category", sortOrder: 3, type: "BUILT_IN" },
  { title: "Best Sellers", componentId: "best-sellers", sortOrder: 4, type: "BUILT_IN" },
  { title: "Best Brand", componentId: "best-brand", sortOrder: 5, type: "BUILT_IN" },
  { title: "Special Combos", componentId: "special-combos", sortOrder: 6, type: "BUILT_IN" },
  { title: "Offline Store", componentId: "offline-store", sortOrder: 7, type: "BUILT_IN" },
  { title: "Hair Care Showcase", componentId: "hair-care-showcase", sortOrder: 8, type: "BUILT_IN" },
  { title: "Makeup Showcase", componentId: "makeup-showcase", sortOrder: 9, type: "BUILT_IN" },
  { title: "Shop By Origin", componentId: "shop-by-origin", sortOrder: 10, type: "BUILT_IN" },
  { title: "Shop By Brand", componentId: "shop-by-brand", sortOrder: 11, type: "BUILT_IN" },
  { title: "By Skin Concern", componentId: "by-skin-concern", sortOrder: 12, type: "BUILT_IN" },
  { title: "New Arrivals", componentId: "new-arrivals", sortOrder: 13, type: "BUILT_IN" },
  { title: "Watch And Shop", componentId: "watch-and-shop", sortOrder: 14, type: "BUILT_IN" },
  { title: "Limited Offer", componentId: "limited-offer", sortOrder: 15, type: "BUILT_IN" },
  { title: "Shop By Offer", componentId: "shop-by-offer", sortOrder: 16, type: "BUILT_IN" },
  { title: "Pre Order", componentId: "pre-order", sortOrder: 17, type: "BUILT_IN" },
  { title: "Skin Quiz", componentId: "skin-quiz", sortOrder: 18, type: "BUILT_IN" },
  { title: "Request Product", componentId: "request-product", sortOrder: 19, type: "BUILT_IN" },
];

export const getHomepageSections = async (req, res) => {
  try {
    let sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (sections.length === 0) {
      await prisma.homepageSection.createMany({
        data: DEFAULT_SECTIONS
      });
      sections = await prisma.homepageSection.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }

    return sendSuccess(res, sections, "Homepage sections fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateHomepageSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, sortOrder, title, settings } = req.body;

    const updates = {};
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
    if (title !== undefined) updates.title = title;
    if (settings !== undefined) updates.settings = settings;

    const section = await prisma.homepageSection.update({
      where: { id },
      data: updates,
    });

    return sendSuccess(res, section, "Homepage section updated");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const reorderSections = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return sendError(res, "orderedIds array is required", 400);

    const updates = orderedIds.map((id, index) => {
      return prisma.homepageSection.update({
        where: { id },
        data: { sortOrder: index }
      });
    });

    await prisma.$transaction(updates);
    return sendSuccess(res, null, "Sections reordered successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

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
      sections,
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
      prisma.homepageSection.findMany({
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const trendingProducts = sortByOrderVolume(
      trendingOrderItems.map((item) => item.product).filter(Boolean),
      trendingOrderItems,
    ).slice(0, 8);

    return sendSuccess(
      res,
      serializePrisma({
        sections,
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
