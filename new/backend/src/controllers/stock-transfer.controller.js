import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";
import { serializePrisma, slugify } from "../utils/data.js";

/**
 * Admin creates a new stock transfer request
 */
export const createTransfer = async (req, res) => {
  try {
    const { sourceVendorId, destinationVendorId, items, notes, adminId: bodyAdminId } = req.body;
    
    // Clean up adminId - ensure it's either a valid ID or null
    let adminId = bodyAdminId || req.user?.id;
    if (!adminId || String(adminId).trim() === "" || adminId === "undefined" || adminId === "null") {
      adminId = null;
    }

    // NEW: Verify admin exists if adminId is provided to prevent Foreign Key constraint violation
    if (adminId) {
      const adminExists = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { id: true }
      });
      if (!adminExists) {
        console.warn(`[STOCK_TRANSFER] Invalid adminId provided: ${adminId}. Proceeds as null.`);
        adminId = null;
      }
    }

    if (!sourceVendorId || !destinationVendorId || !items || items.length === 0) {
      return sendError(res, "Source, destination, and items are required", 400);
    }

    if (sourceVendorId === destinationVendorId) {
      return sendError(res, "Source and destination cannot be the same", 400);
    }

    // Generate a transfer number
    const transferNumber = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    console.log(`[STOCK_TRANSFER] Attempting to create transfer ${transferNumber} from ${sourceVendorId} to ${destinationVendorId} by Admin: ${adminId || 'Anonymous'}`);

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        sourceVendorId,
        destinationVendorId,
        adminId,
        notes,
        status: "PENDING",
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: Number(item.quantity) || 0,
            unitPrice: item.unitPrice ? Number(item.unitPrice) : null
          }))
        }
      },
      include: {
        items: true,
        sourceVendor: { select: { businessName: true } },
        destinationVendor: { select: { businessName: true } }
      }
    });

    console.log(`[STOCK_TRANSFER] Successfully created ${transferNumber}`);
    return sendSuccess(res, serializePrisma(transfer), "Stock transfer created successfully", 201);
  } catch (error) {
    console.error("[STOCK_TRANSFER_ERROR]", error);
    return sendError(res, `Failed to create transfer: ${error.message}`, 500);
  }
};

/**
 * List transfers with filtering
 */
export const listTransfers = async (req, res) => {
  try {
    const { vendorId, status, type } = req.query; // type can be 'incoming' or 'outgoing'
    
    const where = {};
    if (status) where.status = status;
    
    if (vendorId) {
      if (type === 'incoming') {
        where.destinationVendorId = vendorId;
      } else if (type === 'outgoing') {
        where.sourceVendorId = vendorId;
      } else {
        where.OR = [
          { sourceVendorId: vendorId },
          { destinationVendorId: vendorId }
        ];
      }
    }

    const transfers = await prisma.stockTransfer.findMany({
      where,
      include: {
        sourceVendor: { select: { businessName: true } },
        destinationVendor: { select: { businessName: true } },
        items: {
          include: {
            product: {
              select: { name: true, imageUrls: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, serializePrisma(transfers), "Transfers fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update transfer status and handle inventory movements
 */
export const updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!transfer) return sendError(res, "Transfer not found", 404);

    // Business Logic for Status Transitions
    const currentStatus = transfer.status;
    
    // 1. DISPATCHED: Subtract stock from source vendor
    if (status === "DISPATCHED" && currentStatus !== "DISPATCHED") {
      await prisma.$transaction(async (tx) => {
        for (const item of transfer.items) {
          // Find the VendorStock record for this product at the source vendor
          const sourceStock = await tx.vendorStock.findUnique({
            where: {
              productId_vendorId: {
                productId: item.productId,
                vendorId: transfer.sourceVendorId
              }
            }
          });

          if (!sourceStock || sourceStock.quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ID ${item.productId} at source vendor. Available: ${sourceStock?.quantity || 0}`);
          }

          // Decrement source vendor stock
          await tx.vendorStock.update({
            where: {
              productId_vendorId: {
                productId: item.productId,
                vendorId: transfer.sourceVendorId
              }
            },
            data: { quantity: { decrement: item.quantity } }
          });
        }

        await tx.stockTransfer.update({
          where: { id },
          data: { status: "DISPATCHED", dispatchedAt: new Date() }
        });
      });
      console.log(`[STOCK_TRANSFER] Transfer ${transfer.transferNumber} DISPATCHED. Source stock decremented.`);
      return sendSuccess(res, null, "Stock dispatched and source inventory updated");
    }

    // 2. COMPLETED: Add stock to destination (and link/upsert VendorStock)
    if (status === "COMPLETED" && (currentStatus === "DISPATCHED" || currentStatus === "IN_TRANSIT")) {
      await prisma.$transaction(async (tx) => {
        for (const item of transfer.items) {
          // Check if destination vendor already has a stock record for this product
          // (They might have the global product record already, just need a stock entry)
          const destStock = await tx.vendorStock.findUnique({
            where: {
              productId_vendorId: {
                productId: item.productId,
                vendorId: transfer.destinationVendorId
              }
            }
          });

          if (destStock) {
            // Update existing stock at destination
            await tx.vendorStock.update({
              where: {
                productId_vendorId: {
                  productId: item.productId,
                  vendorId: transfer.destinationVendorId
                }
              },
              data: { quantity: { increment: item.quantity } }
            });
          } else {
            // Create new stock record at destination
            await tx.vendorStock.create({
              data: {
                productId: item.productId,
                vendorId: transfer.destinationVendorId,
                quantity: item.quantity
              }
            });
          }

          // Optional: If the destination needs a vendor-specific Product record copied (legacy behavior check)
          // The current system seems to favor shared Product IDs with unique VendorStock records.
          // If we really need to create a new Product record per vendor, we'd do it here, 
          // but that leads to duplication. We'll stick to VendorStock updates for existing products.
        }

        await tx.stockTransfer.update({
          where: { id },
          data: { status: "COMPLETED", receivedAt: new Date() }
        });
      });
      console.log(`[STOCK_TRANSFER] Transfer ${transfer.transferNumber} COMPLETED. Destination stock incremented.`);
      return sendSuccess(res, null, "Transfer completed and destination inventory updated");
    }

    // 3. Simple Status Updates (APPROVED, CANCELLED, etc.)
    const updatedTransfer = await prisma.stockTransfer.update({
      where: { id },
      data: { status }
    });

    return sendSuccess(res, serializePrisma(updatedTransfer), `Transfer status updated to ${status}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get global stock visibility
 */
export const getGlobalInventory = async (req, res) => {
  try {
    const { search } = req.query;
    
    const products = await prisma.product.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { category: { name: { contains: search, mode: 'insensitive' } } }
        ]
      } : {},
      include: {
        vendor: { select: { businessName: true, id: true } },
        category: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });

    // Grouping by product name+brand to show distribution across outlets
    const grouped = products.reduce((acc, p) => {
      const key = `${p.name}-${p.brand}`;
      if (!acc[key]) acc[key] = { name: p.name, brand: p.brand, totalStock: 0, outlets: [] };
      acc[key].totalStock += p.stock;
      acc[key].outlets.push({
        id: p.vendor.id,
        name: p.vendor.businessName,
        stock: p.stock,
        productId: p.id
      });
      return acc;
    }, {});

    return sendSuccess(res, Object.values(grouped), "Global inventory fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getTransferDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        sourceVendor: { select: { businessName: true, id: true, ownerName: true, contactNumber: true } },
        destinationVendor: { select: { businessName: true, id: true, ownerName: true, contactNumber: true } },
        items: {
          include: {
            product: {
              select: { name: true, brand: true, imageUrls: true, price: true, category: { select: { name: true } } }
            }
          }
        }
      }
    });

    if (!transfer) return sendError(res, "Transfer not found", 404);

    return sendSuccess(res, serializePrisma(transfer), "Transfer details fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
