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
    const { customerId, vendorId, mobile, amount, items, name } = req.body;
    
    // Validate vendor
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return sendError(res, "Vendor not found", 404);

    // Auto-link Customer by Mobile
    let linkedCustomerId = customerId || null;
    let fallbackCustomerName = name || null;

    if (!linkedCustomerId && mobile) {
      const existingCust = await prisma.customer.findUnique({ where: { mobile } });
      if (existingCust) {
         linkedCustomerId = existingCust.id;
         if (!fallbackCustomerName) fallbackCustomerName = existingCust.name;
      }
    }

    // Execute everything in a transaction to ensure rollback if stock update fails
    const purchase = await prisma.$transaction(async (tx) => {
      // Create Purchase Record
      const newPurchase = await tx.offlinePurchase.create({
        data: {
          customerId: linkedCustomerId,
          customerName: fallbackCustomerName,
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

      // Decrement Inventory Stock
      for (const item of items) {
        if (item.productId) {
          const currentProduct = await tx.product.findUnique({ where: { id: item.productId } });
          if (currentProduct) {
            const newStock = Math.max(0, currentProduct.stock - Number(item.quantity));
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: newStock }
            });
          }
        }
      }
      return newPurchase;
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

export const seedFrontendProducts = async (req, res) => {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const url = await import('url');

        const __filename = url.fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const generateSlug = (text) => {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '')
                + '-' + Math.random().toString(36).substring(2, 6);
        };

        const dataPath = path.resolve(__dirname, '../../../src/productData.js');
        if (!fs.existsSync(dataPath)) {
            return res.status(500).json({ error: "Cannot find productData.js at " + dataPath });
        }
        const content = fs.readFileSync(dataPath, 'utf8');

        const importRegex = /import\s+([a-zA-Z0-9_]+)\s+from\s+["'](\.\/assets\/[^"']+)["']/g;
        const imageMap = {};
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imageMap[match[1]] = match[2]; 
        }

        const dataStart = content.indexOf('export const CATEGORY_DATA_GENERATED = {');
        if (dataStart === -1) {
            return res.status(500).json({ error: "Could not find payload start" });
        }
        let dataText = content.substring(dataStart + 'export const CATEGORY_DATA_GENERATED = '.length);
        
        const evalScript = `
            ${Object.keys(imageMap).map(key => `const ${key} = "${imageMap[key]}";`).join('\n')}
            return ${dataText.replace(/;\s*$/, '')};
        `;
        const data = new Function(evalScript)();

        const uploadsDir = path.resolve(__dirname, '../../../public/uploads/products');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        let vendor = await prisma.vendor.findFirst({ where: { businessName: 'OMW Global' } });
        if (!vendor) {
            vendor = await prisma.vendor.create({
                data: {
                    businessName: 'OMW Global',
                    contactNumber: '0000000000',
                    email: 'global@omw.com',
                    businessCategory: 'General',
                    storeAddress: 'OMW Headquarters',
                    approvalStatus: 'APPROVED'
                }
            });
        }

        let addedCount = 0;
        for (const [catName, products] of Object.entries(data)) {
            let category = await prisma.category.findUnique({ where: { name: catName } });
            if (!category) {
                category = await prisma.category.create({ 
                    data: { name: catName, slug: generateSlug(catName) } 
                });
            }

            for (const prod of products) {
                const sourceImagePath = path.resolve(__dirname, '../../../src', prod.image);
                const filename = path.basename(prod.image);
                const destImagePath = path.join(uploadsDir, filename);

                if (fs.existsSync(sourceImagePath)) {
                    fs.copyFileSync(sourceImagePath, destImagePath);
                }

                const imageUrl = `http://localhost:5000/uploads/products/${encodeURIComponent(filename)}`;

                const existingProd = await prisma.product.findFirst({ where: { name: prod.name } });
                if (!existingProd) {
                    await prisma.product.create({
                        data: {
                            name: prod.name,
                            slug: generateSlug(prod.name),
                            brand: prod.brand || 'OMW Skincare',
                            description: prod.benefits?.join(', ') || '',
                            price: parseFloat(prod.price) || 0,
                            stock: 100,
                            categoryId: category.id,
                            vendorId: vendor.id,
                            imageUrls: [imageUrl],
                            status: 'ACTIVE'
                        }
                    });
                    addedCount++;
                }
            }
        }
        res.status(200).json({ success: true, message: `Seeded ${addedCount} products.` });
    } catch (error) {
        console.error("Seeding Error:", error);
        res.status(500).json({ success: false, error: String(error) });
    }
};

export const getAdminCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true }
    });
    return sendSuccess(res, categories, "Categories fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
