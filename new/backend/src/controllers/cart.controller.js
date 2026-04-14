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

    if (existingCart && Array.isArray(existingCart.items)) {
      // Create a deterministic digest of the cart contents
      const getDigest = (itemsList) => 
        itemsList
          .filter(item => item && item.id)
          .map(item => ({ id: String(item.id), qty: Number(item.qty) }))
          .sort((a, b) => a.id.localeCompare(b.id));

      const oldDigest = JSON.stringify(getDigest(existingCart.items));
      const newDigest = JSON.stringify(getDigest(items));
      
      if (oldDigest === newDigest) {
        console.log(`[Protocol-Sync] IDLE: No core changes for ${customerId}. Persistence preserved.`);
        return sendSuccess(res, existingCart, "Sync skipped (Cart stable)");
      } else {
        console.log(`[Protocol-Sync] ACTIVITY: Core change detected for ${customerId}. Updating timestamp.`);
        console.log(`[Protocol-Sync] Old: ${oldDigest} | New: ${newDigest}`);
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
