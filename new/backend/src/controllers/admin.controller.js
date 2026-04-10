import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";
import { calculateRewardPoints } from "./settings.controller.js";

export const getAdminVendorAnalytics = async (req, res) => {
  try {
    const { vendorId, timeRange = '1y' } = req.query;
    
    // Calculate time bounds and graph structure
    let startDate = new Date();
    let dateFormat = 'month'; // 'day' or 'month'
    let dataPointsCount = 12;

    const now = new Date();
    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 6);
      dateFormat = 'day';
      dataPointsCount = 7;
    } else if (timeRange === '1m') {
      startDate.setDate(now.getDate() - 29);
      dateFormat = 'day';
      dataPointsCount = 30;
    } else if (timeRange === '6m') {
      startDate.setMonth(now.getMonth() - 5);
      startDate.setDate(1);
      dateFormat = 'month';
      dataPointsCount = 6;
    } else { // 1y
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      dateFormat = 'month';
      dataPointsCount = 12;
    }
    startDate.setHours(0,0,0,0);

    const orderWhere = { createdAt: { gte: startDate } };
    const purchaseWhere = { purchaseDate: { gte: startDate } };
    
    if (vendorId) {
      orderWhere.vendorId = vendorId;
      purchaseWhere.vendorId = vendorId;
    }

    const [orders, offlinePurchases, vendors] = await Promise.all([
      prisma.order.findMany({ 
        where: orderWhere, 
        include: { 
          vendor: { select: { businessCategory: true } },
          items: {
            include: { product: { select: { imageUrls: true } } }
          }
        } 
      }),
      prisma.offlinePurchase.findMany({ 
        where: purchaseWhere, 
        include: { 
          vendor: { select: { businessCategory: true } },
          items: {
            include: { product: { select: { imageUrls: true } } }
          }
        } 
      }),
      prisma.vendor.findMany({ select: { id: true, businessName: true, businessCategory: true } })
    ]);

    // Graph Data Initialization
    const graphData = [];
    if (dateFormat === 'day') {
      for (let i = 0; i < dataPointsCount; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        graphData.push({
          date: d.toDateString(),
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: 0
        });
      }
    } else {
      for (let i = 0; i < dataPointsCount; i++) {
        const d = new Date(startDate);
        d.setMonth(startDate.getMonth() + i);
        graphData.push({
          month: d.getMonth(),
          year: d.getFullYear(),
          label: d.toLocaleDateString('en-US', { month: 'short' }),
          amount: 0
        });
      }
    }

    // Total Sale Units
    const totalSaleUnits = orders.length + offlinePurchases.length;

    // Gross Revenue & Product Performance & Graph Data
    let grossRevenue = 0;
    const productStatsMap = {};
    
    const processData = (record, dateField, amountField) => {
      const amount = Number(record[amountField] || 0);
      const d = new Date(record[dateField]);
      
      // Totals
      grossRevenue += amount;

      // Graph
      if (dateFormat === 'day') {
        const dateStr = d.toDateString();
        const point = graphData.find(g => g.date === dateStr);
        if (point) point.amount += amount;
      } else {
        const point = graphData.find(g => g.month === d.getMonth() && g.year === d.getFullYear());
        if (point) point.amount += amount;
      }
    };
    
    const processProductRevenue = (record, items, isOffline) => {
      // If no items exist (seed data), create a synthetic product derived from the vendor category
      if (!items || items.length === 0) {
        const category = record.vendor?.businessCategory || 'Store Product';
        const syntheticName = `Signature ${category.split('&')[0].trim()} Kit`;
        const amt = isOffline ? Number(record.amount || 0) : Number(record.totalAmount || 0);
        
        if (!productStatsMap[syntheticName]) productStatsMap[syntheticName] = { rev: 0, qty: 0, image: null };
        productStatsMap[syntheticName].rev += amt;
        productStatsMap[syntheticName].qty += 1;
        return;
      }

      items.forEach(item => {
        const pName = item.name || 'Unknown Product';
        const amt = isOffline ? (Number(item.quantity || 0) * Number(item.unitPrice || 0)) : Number(item.lineTotal || 0);
        const image = item.product?.imageUrls?.[0] || null;
        
        if (!productStatsMap[pName]) productStatsMap[pName] = { rev: 0, qty: 0, image };
        productStatsMap[pName].rev += amt;
        productStatsMap[pName].qty += Number(item.quantity || 0);
        if (!productStatsMap[pName].image && image) productStatsMap[pName].image = image;
      });
    };
    
    orders.forEach(o => {
      processData(o, 'createdAt', 'totalAmount');
      processProductRevenue(o, o.items, false);
    });
    offlinePurchases.forEach(p => {
      processData(p, 'purchaseDate', 'amount');
      processProductRevenue(p, p.items, true);
    });

    // Platform Earnings
    const platformEarnings = (grossRevenue * 0.15);

    // Dynamic Product Heights
    const maxProductRev = Math.max(...Object.values(productStatsMap).map(p => p.rev), 1);
    const productPerformance = Object.keys(productStatsMap).map(label => ({
      label,
      val: productStatsMap[label].rev,
      qty: productStatsMap[label].qty,
      image: productStatsMap[label].image,
      p: Math.min(100, Math.round((productStatsMap[label].rev / maxProductRev) * 100))
    })).sort((a, b) => b.val - a.val); // All sold products sorted by revenue

    return sendSuccess(res, {
      totalSaleUnits,
      grossRevenue,
      platformEarnings,
      productPerformance,
      graphData,
      vendorsList: vendors
    }, "Vendor analytics fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

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
          customer: { include: { addresses: true } },
          vendor: { select: { businessName: true } },
          shippingAddress: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.offlinePurchase.findMany({
        include: {
          customer: { include: { addresses: true } },
          vendor: { select: { businessName: true } },
        },
        orderBy: { purchaseDate: "desc" },
      })
    ]);

    // Normalize and merge
    const combined = [
      ...orders.map(o => {
        const hasPreorderItems = o.items.some(item => !item.productId || item.productId.startsWith('po'));
        const addr = o.shippingAddress || o.customer.addresses?.[0];
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customer.name,
          vendorName: "ONLINE STORE",
          totalAmount: o.totalAmount,
          rewardPointsEarned: o.rewardPointsEarned || 0,
          status: o.status,
          createdAt: o.createdAt,
          type: (o.type === 'Online' && hasPreorderItems) ? 'PreOrder' : o.type,
          destination: addr ? `${addr.city}, ${addr.state}` : "Direct Dispatch"
        };
      }),
      ...offlinePurchases.map(p => {
        const addr = p.customer?.addresses?.[0];
        return {
          id: p.id,
          orderNumber: `OFF-${p.id.slice(0, 8).toUpperCase()}`,
          customerName: p.customer?.name || p.mobile,
          vendorName: p.vendor.businessName,
          totalAmount: p.amount,
          rewardPointsEarned: p.rewardPointsEarned || 0,
          status: 'COMPLETED',
          createdAt: p.purchaseDate,
          type: 'Offline',
          destination: addr ? `${addr.city}, ${addr.state}` : "In-Store Pick"
        };
      })
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

export const resetVendorPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return sendError(res, "New password is required", 400);
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { password: hashedPassword },
    });

    const vendorData = { ...vendor };
    delete vendorData.password;

    return sendSuccess(res, vendorData, "Vendor password reset successfully");
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

export const lookupCustomerByMobile = async (req, res) => {
  try {
    const { mobile } = req.query;
    if (!mobile || mobile.length < 10) {
      return sendSuccess(res, null, "Mobile number too short");
    }
    const customer = await prisma.customer.findUnique({
      where: { mobile },
      select: { id: true, name: true, rewardPoints: true, mobile: true }
    });
    return sendSuccess(res, customer, customer ? "Customer found" : "No customer found");
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
      // Calculate reward points
      const rewardPointsEarned = await calculateRewardPoints(Number(amount));

      // Create Purchase Record
      const newPurchase = await tx.offlinePurchase.create({
        data: {
          customer: linkedCustomerId ? { connect: { id: linkedCustomerId } } : undefined,
          customerName: fallbackCustomerName,
          vendor: { connect: { id: vendorId } },
          mobile,
          amount,
          rewardPointsEarned,
          items: {
            create: items.map(item => ({
              productId: item.productId || null,
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

      // Award reward points if customer is linked
      if (linkedCustomerId && rewardPointsEarned > 0) {
        await tx.customer.update({
          where: { id: linkedCustomerId },
          data: { rewardPoints: { increment: rewardPointsEarned } },
        });
        await tx.rewardTransaction.create({
          data: {
            customerId: linkedCustomerId,
            type: "EARNED",
            source: "offline-purchase",
            sourceId: newPurchase.id,
            points: rewardPointsEarned,
            note: `Offline purchase at ${vendor.businessName}`,
          },
        });
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

    if (type === 'Online' || type === 'PreOrder') {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: {
            include: {
              addresses: true
            }
          },
          vendor: true,
          items: {
            include: {
              product: true
            }
          },
          shippingAddress: true,
          trackingEvents: { orderBy: { createdAt: 'desc' } }
        }
      });

      // Resolve product images for items with missing product links
      if (order && order.items) {
        for (const item of order.items) {
          if (!item.product) {
            // Step 1: Try the Product catalog
            item.product = await prisma.product.findFirst({
              where: { name: { contains: item.name, mode: 'insensitive' } }
            });
          }
          if (!item.product) {
            // Step 2: Try the PreOrder section config for the image
            const preorderSection = await prisma.homepageSection.findUnique({
              where: { componentId: 'pre-order' }
            });
            if (preorderSection?.settings?.preorderProducts) {
              const match = preorderSection.settings.preorderProducts.find(
                p => p.name?.toLowerCase() === item.name?.toLowerCase() ||
                     p.name?.toLowerCase().includes(item.name?.toLowerCase()) ||
                     item.name?.toLowerCase().includes(p.name?.toLowerCase())
              );
              if (match) {
                item.product = {
                  name: match.name,
                  imageUrls: match.image ? [match.image] : [],
                  price: match.price || item.unitPrice,
                };
              }
            }
          }
        }
      }

      const normalizedOrder = {
        ...order,
        vendor: {
          ...order.vendor,
          businessName: "ONLINE STORE"
        }
      };
      return sendSuccess(res, normalizedOrder, "Online order details fetched");
    } else {
      const purchase = await prisma.offlinePurchase.findUnique({
        where: { id },
        include: {
          customer: {
            include: {
              addresses: true
            }
          },
          vendor: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      // Fuzzy name resolution for offline items with missing product links
      if (purchase && purchase.items) {
        for (const item of purchase.items) {
          if (!item.product) {
            item.product = await prisma.product.findFirst({
              where: { name: { equals: item.name, mode: 'insensitive' } }
            });
          }
        }
      }

      return sendSuccess(res, purchase, "Offline purchase details fetched");
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
                            category: { connect: { id: category.id } },
                            vendor: { connect: { id: vendor.id } },
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

export const getPublicCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, imageUrl: true }
    });
    return sendSuccess(res, categories, "Categories fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, imageUrl: true, sortOrder: true, isActive: true }
    });
    return sendSuccess(res, categories, "Categories fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createAdminCategory = async (req, res) => {
  try {
    const { name, imageUrl, isActive } = req.body;
    if (!name) return sendError(res, "Category name is required", 400);

    const generateSlug = (text) => {
      if (!text) return "";
      return text.toString().toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
    };

    const slug = generateSlug(name) + '-' + Math.random().toString(36).substring(2, 6);

    // Get max sortOrder
    const lastCategory = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' }
    });
    const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;

    const category = await prisma.category.create({
      data: { name, slug, imageUrl, isActive: isActive ?? true, sortOrder }
    });
    return sendSuccess(res, category, "Category created successfully", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, isActive, sortOrder } = req.body;
    
    const updateData = {};
    if (name) {
      updateData.name = name;
      // Note: We might NOT want to change the slug if only the image or status changes
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });
    return sendSuccess(res, category, "Category updated successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const reorderAdminCategories = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    if (!items || !Array.isArray(items)) {
      return sendError(res, "Invalid items structure", 400);
    }

    await prisma.$transaction(
      items.map(item => 
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    return sendSuccess(res, null, "Categories reordered successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if there are products in this category
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return sendError(res, `Cannot delete category: it still has ${productsCount} products. Please move or delete the products first.`, 400);
    }

    await prisma.category.delete({ where: { id } });
    return sendSuccess(res, null, "Category deleted successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};


export const seedAdminCategories = async (req, res) => {
  try {
    const CATEGORIES = [
      "B.b cream", "Blender", "Blush", "Brush", "Cleanser", "cleansing oil",
      "compact powders", "Concealer", "Cushion foundation", "Essence",
      "Exfoliate", "Eye cream", "Face mists", "Foundation", "Hair set",
      "International makeup", "International skincare", "Japanese Skincare",
      "Korean skincare", "Lip blam", "Lipstick", "Makeup remover",
      "Mascara", "Moisturizer", "Primer", "Razor", "Serums", "Sheet masks",
      "SKIN1004", "Sunscreen", "Sunspray", "Sunstick", "toner", "toner pads",
      "Treatment mask"
    ];

    const generateSlug = (text) => {
      if (!text) return "";
      return text.toString().toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
    };

    let createdCount = 0;
    for (const name of CATEGORIES) {
      const slug = generateSlug(name) + '-' + Math.random().toString(36).substring(2, 6);
      await prisma.category.upsert({
        where: { name: name },
        update: {},
        create: { name, slug }
      });
      createdCount++;
    }

    return sendSuccess(res, { count: createdCount }, "Categories seeded successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminBrands = async (req, res) => {
  try {
    const DEFAULT_BRANDS = [
      "SkinCeuticals", "La Roche-Posay", "Tatcha", "Drunk Elephant", "Glossier",
      "Augustinus Bader", "e.l.f. Cosmetics", "NYX Professional Makeup", "Huda Beauty",
      "Sol de Janeiro", "Laneige", "Lakmé", "Mamaearth", "Sugar Cosmetics",
      "Nykaa Cosmetics", "Dot & Key", "Minimalist", "Dettol", "Detol", "Lifebuoy", 
      "Savlon", "Pears", "Dove", "Nivea", "Garnier", "L'Oréal"
    ];

    // Fetch all brands from products
    const products = await prisma.product.findMany({
      select: { brand: true }
    });
    
    // Fetch all vendors
    const vendors = await prisma.vendor.findMany({
      select: { businessName: true }
    });

    // Fetch homepage custom brands
    const homepageBrandsSection = await prisma.homepageSection.findUnique({
      where: { componentId: 'shop-by-brand' }
    });
    
    let customHomepageBrands = [];
    let hiddenHomepageBrands = [];
    if (homepageBrandsSection && homepageBrandsSection.settings) {
      const settings = homepageBrandsSection.settings;
      if (Array.isArray(settings.brands)) {
        customHomepageBrands = settings.brands.map(b => 
          typeof b === 'string' ? b : b.name
        ).filter(Boolean);
      }
      if (Array.isArray(settings.hiddenBrands)) {
        hiddenHomepageBrands = settings.hiddenBrands;
      }
    }
    
    // Extract names and combine
    const productBrands = products.map(p => p.brand).filter(Boolean);
    const vendorNames = vendors.map(v => v.businessName).filter(Boolean);
    
    // Deduplicate and sort
    const allBrands = Array.from(new Set(
      [...DEFAULT_BRANDS, ...productBrands, ...vendorNames, ...customHomepageBrands]
        .map(b => b?.trim())
        .filter(Boolean)
    )).filter(b => !hiddenHomepageBrands.includes(b)).sort((a, b) => a.localeCompare(b));
    
    console.log("ADMIN BRANDS FETCHED:", allBrands);
      
    return sendSuccess(res, allBrands, "Brands fetched");
  } catch (error) {
    console.error("ERROR FETCHING ADMIN BRANDS:", error);
    return sendError(res, error.message, 500);
  }
};
