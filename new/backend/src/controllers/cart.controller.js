import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const syncCart = async (req, res) => {
  try {
    const { customerId, items } = req.body;

    if (!customerId) {
      return sendError(res, "Customer ID is required", 400);
    }

    if (!items || !Array.isArray(items)) {
      return sendError(res, "Invalid items format", 400);
    }

    if (items.length === 0) {
      // Delete cart if empty
      await prisma.cart.deleteMany({
        where: { customerId }
      });
      return sendSuccess(res, null, "Cart cleared");
    }

    // Hyper-Robust Content-Aware Sync: Prevents timer resets on page reloads
    const existingCart = await prisma.cart.findUnique({
      where: { customerId }
    });

    if (existingCart) {
      // Hyper-Robust normalization: ensuring we compare only what matters (ID + Qty)
      const getDigest = (raw) => {
        try {
          const list = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (!Array.isArray(list)) return "[]";
          return JSON.stringify(
            list
              .filter(i => i && i.id)
              .map(i => ({ id: String(i.id), qty: Number(i.qty) }))
              .sort((a, b) => a.id.localeCompare(b.id))
          );
        } catch (e) {
          return "[]";
        }
      };

      const oldD = getDigest(existingCart.items);
      const newD = getDigest(items);
      
      if (oldD === newD) {
        console.log(`[Protocol-Sync] IDLE for ${customerId}. (Digest: ${oldD.slice(0,40)}...)`);
        return sendSuccess(res, existingCart, "Sync skipped (Stable)");
      } else {
        console.log(`[Protocol-Sync] ACTIVITY for ${customerId}.`);
        console.log(`[Protocol-Sync] OLD: ${oldD}`);
        console.log(`[Protocol-Sync] NEW: ${newD}`);
      }
    }

    const cart = await prisma.cart.upsert({
      where: { customerId },
      create: {
        customerId,
        items,
        updatedAt: new Date()
      },
      update: {
        items,
        updatedAt: new Date()
      }
    });

    return sendSuccess(res, cart, "Cart synced (Active)");
  } catch (error) {
    console.error("Critical Sync Error:", error);
    return sendError(res, "Failed to sync cart", 500);
  }
};

export const deleteCart = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return sendError(res, "Customer ID is required", 400);
    }

    await prisma.cart.deleteMany({
      where: { customerId }
    });

    return sendSuccess(res, null, "Cart deleted");
  } catch (error) {
    console.error("Error deleting cart:", error);
    return sendError(res, "Failed to delete cart", 500);
  }
};

// Admin: Get abandoned carts
export const getAbandonedCarts = async (req, res) => {
  try {
    const { thresholdMinutes = 30 } = req.query;
    const threshold = parseInt(thresholdMinutes, 10);

    const cutoff = new Date(Date.now() - threshold * 60 * 1000);

    const queryFilter = threshold === 0 ? {} : {
      updatedAt: {
        lte: cutoff
      }
    };

    const abandonedCarts = await prisma.cart.findMany({
      where: queryFilter,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            mobile: true,
            email: true,
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return sendSuccess(res, { carts: abandonedCarts, serverTime: Date.now() }, "Abandoned carts fetched");
  } catch (error) {
    console.error("Error fetching abandoned carts:", error);
    return sendError(res, "Failed to fetch abandoned carts", 500);
  }
};
