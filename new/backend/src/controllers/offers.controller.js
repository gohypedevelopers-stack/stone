import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";
import { serializePrisma } from "../utils/data.js";

// ──────────────────────────────────────────────
// PUBLIC — active offers for storefront
// ──────────────────────────────────────────────
export const getActiveOffers = async (req, res) => {
  try {
    const { customerId } = req.query;
    const now = new Date();
    
    const include = {};
    if (customerId) {
      include.claims = {
        where: { customerId }
      };
    }

    // Find all active offers
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        endsAt: { gt: now },
      },
      include,
      orderBy: { createdAt: "desc" },
    });

    // If customerId provided, filter out offers they've already claimed
    const filteredOffers = customerId 
      ? offers.filter(o => o.claims.length === 0)
      : offers;

    return sendSuccess(res, serializePrisma(filteredOffers), "Active offers fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const claimOffer = async (req, res) => {
  try {
    const { offerId, customerId } = req.body;

    if (!offerId || !customerId) {
      return sendError(res, "offerId and customerId are required", 400);
    }

    // Check if already claimed
    const existing = await prisma.offerClaim.findUnique({
      where: {
        offerId_customerId: { offerId, customerId }
      }
    });

    if (existing) {
      return sendError(res, "Offer already claimed", 400);
    }

    const claim = await prisma.offerClaim.create({
      data: {
        offerId,
        customerId
      }
    });

    return sendSuccess(res, serializePrisma(claim), "Offer claimed successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ──────────────────────────────────────────────
// ADMIN — list all offers
// ──────────────────────────────────────────────
export const getAllOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, serializePrisma(offers), "All offers fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ──────────────────────────────────────────────
// ADMIN — create an offer
// ──────────────────────────────────────────────
export const createOffer = async (req, res) => {
  try {
    const {
      type,
      title,
      accentWord,
      badgeText,
      description,
      ctaText,
      ctaLink,
      endsAt,
      mainProductImage,
      freeProductImage,
      mainProductId,
      freeProductId,
      isActive,
    } = req.body;

    if (!title || !endsAt) {
      return sendError(res, "Title and endsAt are required", 400);
    }

    const offer = await prisma.offer.create({
      data: {
        type: type || "bogo",
        title,
        accentWord: accentWord || "Free",
        badgeText: badgeText || "LIMITED OFFER",
        description: description || "",
        ctaText: ctaText || "CLAIM OFFER",
        ctaLink: ctaLink || "/shop",
        endsAt: new Date(endsAt),
        mainProductImage: mainProductImage || "",
        freeProductImage: freeProductImage || "",
        mainProductId: mainProductId || null,
        freeProductId: freeProductId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return sendSuccess(res, serializePrisma(offer), "Offer created", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ──────────────────────────────────────────────
// ADMIN — update an offer
// ──────────────────────────────────────────────
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Convert endsAt string to Date if present
    if (updates.endsAt) {
      updates.endsAt = new Date(updates.endsAt);
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: updates,
    });

    return sendSuccess(res, serializePrisma(offer), "Offer updated");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ──────────────────────────────────────────────
// ADMIN — delete an offer
// ──────────────────────────────────────────────
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.offer.delete({ where: { id } });
    return sendSuccess(res, null, "Offer deleted");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ──────────────────────────────────────────────
// ADMIN — toggle active/inactive
// ──────────────────────────────────────────────
export const toggleOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) return sendError(res, "Offer not found", 404);

    const updated = await prisma.offer.update({
      where: { id },
      data: { isActive: !offer.isActive },
    });

    return sendSuccess(res, serializePrisma(updated), "Offer toggled");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
