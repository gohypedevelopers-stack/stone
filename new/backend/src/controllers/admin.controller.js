import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingVendorApprovals,
      activeCampaigns,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.vendor.count({
        where: { approvalStatus: "PENDING" },
      }),
      prisma.campaign.count({
        where: { status: "active" },
      }),
    ]);

    return sendSuccess(
      res,
      {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        pendingVendorApprovals,
        activeCampaigns,
      },
      "Admin dashboard fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        vendor: { select: { businessName: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, products, "Products fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const [orders, offlinePurchases] = await Promise.all([
      prisma.order.findMany({
        include: {
          customer: { select: { name: true, mobile: true } },
          vendor: { select: { businessName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.offlinePurchase.findMany({
        include: {
          customer: { select: { name: true, mobile: true } },
          vendor: { select: { businessName: true } },
        },
        orderBy: { purchaseDate: "desc" },
      })
    ]);

    // Normalize and merge
    const combined = [
      ...orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        vendorName: o.vendor.businessName,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
        type: 'Online'
      })),
      ...offlinePurchases.map(p => ({
        id: p.id,
        orderNumber: `OFF-${p.id.slice(0, 8).toUpperCase()}`,
        customerName: p.customer?.name || p.mobile,
        vendorName: p.vendor.businessName,
        totalAmount: p.amount,
        status: 'COMPLETED',
        createdAt: p.purchaseDate,
        type: 'Offline'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sendSuccess(res, combined, "Orders fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, vendors, "Vendors fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { approvalStatus: status },
    });

    return sendSuccess(res, vendor, `Vendor ${status.toLowerCase()} successfully`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, customers, "Customers fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { 
            id: true,
            orderNumber: true, 
            totalAmount: true, 
            status: true, 
            createdAt: true 
          }
        }
      }
    });
    return sendSuccess(res, customer, "Customer details fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminVendorDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        products: {
          take: 5,
          orderBy: { createdAt: "desc" }
        },
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { name: true } }
          }
        }
      }
    });
    
    // Calculate total revenue
    const totalRevenue = vendor.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    
    return sendSuccess(res, { ...vendor, totalRevenue }, "Vendor details fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminOfflinePurchases = async (req, res) => {
  try {
    const purchases = await prisma.offlinePurchase.findMany({
      include: {
        customer: { select: { name: true, mobile: true } },
        vendor: { select: { businessName: true } },
        items: true
      },
      orderBy: { purchaseDate: "desc" }
    });
    return sendSuccess(res, purchases, "Offline purchases fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createAdminOfflinePurchase = async (req, res) => {
  try {
    const { customerId, vendorId, mobile, amount, items } = req.body;
    
    // Validate vendor
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return sendError(res, "Vendor not found", 404);

    const purchase = await prisma.offlinePurchase.create({
      data: {
        customerId: customerId || null,
        vendorId,
        mobile,
        amount,
        items: {
          create: items.map(item => ({
            name: item.name,
            quantity: Number(item.quantity),
            unitPrice: item.unitPrice
          }))
        }
      },
      include: { items: true }
    });

    return sendSuccess(res, purchase, "Offline purchase recorded successfully", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (type === 'Online') {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          vendor: true,
          items: true,
          shippingAddress: true,
          trackingEvents: { orderBy: { createdAt: 'desc' } }
        }
      });
      return sendSuccess(res, order, "Online order details fetched");
    } else {
      const purchase = await prisma.offlinePurchase.findUnique({
        where: { id },
        include: {
          customer: true,
          vendor: true,
          items: true
        }
      });
      
      // Normalize offline purchase to look like an order for the frontend
      const normalized = {
        ...purchase,
        orderNumber: `OFF-${purchase.id.slice(0, 8).toUpperCase()}`,
        totalAmount: purchase.amount,
        createdAt: purchase.purchaseDate,
        status: 'COMPLETED',
        type: 'Offline'
      };
      
      return sendSuccess(res, normalized, "Offline purchase details fetched");
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
