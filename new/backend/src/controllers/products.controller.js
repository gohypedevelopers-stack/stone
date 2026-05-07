import prisma from "../lib/prisma.js";
import {
  normalizeEnumInput,
  parseBoolean,
  serializePrisma,
  slugify,
} from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

const coerceBoolean = (value) => parseBoolean(value) ?? Boolean(value);

export const getBrands = async (req, res) => {
  try {
    // Fetch all brands from products (only real product brands, not vendors)
    const products = await prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { brand: true }
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
    
    // Extract only real product brands (no vendor names)
    const productBrands = products.map(p => p.brand).filter(Boolean);
    
    // Deduplicate and sort
    const allBrands = Array.from(new Set(
      [...productBrands, ...customHomepageBrands]
        .map(b => b?.trim())
        .filter(Boolean)
    )).filter(b => !hiddenHomepageBrands.includes(b)).sort((a, b) => a.localeCompare(b));
      
    return sendSuccess(res, allBrands, "Brands fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const listProducts = async (req, res) => {
  try {
    const { category, brand, featured, limitedOffer, newArrival, bestSeller, trending, search, vendorId } = req.query;

    const whereCondition = { status: { not: "ARCHIVED" } };
    if (vendorId) {
      whereCondition.vendorId = String(vendorId);
    }

    let products = await prisma.product.findMany({
      where: whereCondition,
      include: {
        vendor: true,
        category: true,
        stockRecords: {
          include: { vendor: true }
        },
        linkedProduct: { select: { id: true, name: true, imageUrls: true, price: true } },
        linkedDeals: { select: { id: true, name: true, imageUrls: true, price: true, discountPrice: true, specialOfferType: true, brand: true, category: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (category) {
      const normalizedCategory = String(category).toLowerCase();
      products = products.filter(
        (product) =>
          product.category?.name?.toLowerCase() === normalizedCategory ||
          product.category?.slug?.toLowerCase() === slugify(category),
      );
    }

    if (brand) {
      const normalizedBrand = String(brand).toLowerCase();
      products = products.filter(
        (product) => product.brand?.toLowerCase() === normalizedBrand,
      );
    }

    if (parseBoolean(featured) === true) {
      products = products.filter((product) => product.featured);
    }

    if (parseBoolean(newArrival) === true) {
      products = products.filter((product) => product.newArrival);
    }

    if (parseBoolean(bestSeller) === true) {
      products = products.filter((product) => product.bestSeller);
    }

    if (parseBoolean(trending) === true) {
      products = products.filter((product) => product.trending);
    }

    if (parseBoolean(limitedOffer) === true) {
      products = products.filter((product) => product.limitedOffer);
    }

    if (search) {
      const normalizedSearch = String(search).toLowerCase().trim();
      const synonyms = {
        "mostriser": "moisturizer",
        "mosturizer": "moisturizer",
        "serum": "serums",
      };
      const expandedSearch = synonyms[normalizedSearch] || normalizedSearch;

      products = products.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const category = (product.category?.name || "").toLowerCase();
        const tags = Array.isArray(product.tags) ? product.tags.map(t => String(t).toLowerCase().trim()) : [];
        
        const queryWords = [normalizedSearch, expandedSearch].filter(Boolean);
        const nameWords = name.split(/[\s-]+/);

        const nameMatch = queryWords.some(qw => name === qw || nameWords.some(w => w.startsWith(qw)) || (qw.length > 3 && name.includes(qw)));
        const brandMatch = queryWords.some(qw => brand.includes(qw));
        const categoryMatch = queryWords.some(qw => category.includes(qw));
        const tagsMatch = tags.some(t => {
          const tagWords = t.split(/[\s-]+/);
          return queryWords.some(qw => t === qw || tagWords.some(w => w.startsWith(qw)) || (qw.length > 3 && t.includes(qw)));
        });
        
        return nameMatch || brandMatch || categoryMatch || tagsMatch;
      });
    }

    const serializedProducts = serializePrisma(products).map(p => ({
      ...p,
      stock: (p.stockRecords || []).reduce((sum, sr) => sum + (sr.quantity || 0), 0)
    }));

    return sendSuccess(res, serializedProducts, "Products fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      vendorId,
      categoryId,
      categoryName,
      categorySlug,
      name,
      sku,
      slug,
      brand,
      description,
      imageUrls,
      tags,
      price,
      discountPrice,
      stock,
      featured,
      rewardEligible,
      limitedOffer,
      status,
      ingredients,
      defaultMrp,
      defaultWeight,
      unit,
      whyWeLoveIt,
      benefits,
      faq,
      newArrival,
      bestSeller,
      trending,
      specialOfferType,
      origin,
      linkedProductId,
      skinConcerns,
    } = req.body;

    if (!name || price === undefined) {
      return sendError(
        res,
        "Product name and price are required",
        400,
      );
    }

    if (vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });
      if (!vendor) return sendError(res, "Vendor not found", 404);
    }

    let resolvedCategoryId = categoryId || null;

    if (!resolvedCategoryId && categoryName) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          slug: categorySlug || slugify(categoryName),
        },
      });

      resolvedCategoryId = category.id;
    }

    let finalSlug = slug || slugify(name);

    // Initial check for slug uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });

    if (existingProduct) {
      // If slug exists, append a random string to make it unique
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const product = await prisma.product.create({
      data: {
        vendor: vendorId ? { connect: { id: vendorId } } : undefined,
        category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : undefined,
        name,
        sku: sku || null,
        slug: finalSlug,
        brand: brand || null,
        description: description || null,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        tags: Array.isArray(tags) ? tags : [],
        skinConcerns: Array.isArray(skinConcerns) ? skinConcerns : [],
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        status: normalizeEnumInput(status) || "ACTIVE",
        featured: coerceBoolean(featured),
        discounted: discountPrice
          ? Number(discountPrice) < Number(price)
          : false,
        rewardEligible: coerceBoolean(rewardEligible),
        limitedOffer: coerceBoolean(limitedOffer),
        newArrival: coerceBoolean(newArrival),
        bestSeller: coerceBoolean(bestSeller),
        trending: coerceBoolean(trending),
        ingredients: ingredients || null,
        defaultMrp: defaultMrp !== undefined && defaultMrp !== null && defaultMrp !== "" ? Number(defaultMrp) : null,
        defaultWeight: defaultWeight !== undefined && defaultWeight !== null && defaultWeight !== "" ? Number(defaultWeight) : null,
        unit: unit || null,
        whyWeLoveIt: whyWeLoveIt || null,
        benefits: benefits || null,
        faq: faq || null,
        specialOfferType: specialOfferType || null,
        // Set first vendor as fallback on the main Product record
        vendorId: (req.body.vendors && Array.isArray(req.body.vendors) && req.body.vendors[0]?.vendorId)
          ? req.body.vendors[0].vendorId
          : (vendorId || null),
        stockRecords: (req.body.vendors && Array.isArray(req.body.vendors)) ? {
          create: req.body.vendors.filter(v => v.vendorId).map(v => ({
            vendorId: v.vendorId,
            quantity: Number(v.stock || 0)
          }))
        } : (vendorId ? {
          create: {
            vendorId,
            quantity: Number(stock || 0)
          }
        } : undefined)
      },
      include: {
        vendor: true,
        category: true,
        stockRecords: { include: { vendor: true } }
      },
    });

    const serializedProduct = {
      ...serializePrisma(product),
      stock: (product.stockRecords || []).reduce((sum, sr) => sum + (sr.quantity || 0), 0)
    };

    return sendSuccess(res, serializedProduct, "Product created", 201);
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(
        res,
        `Unique constraint failed on the fields: (${error.meta.target})`,
        409,
      );
    }
    return sendError(res, error.message, 500);
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      include: {
        vendor: true,
        category: true,
        stockRecords: { include: { vendor: true } }
      },
    });

    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    const serializedProduct = {
      ...serializePrisma(product),
      stock: (product.stockRecords || []).reduce((sum, sr) => sum + (sr.quantity || 0), 0)
    };

    return sendSuccess(res, serializedProduct, "Product fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      brand,
      price,
      discountPrice,
      status,
      featured,
      rewardEligible,
      limitedOffer,
      imageUrls,
      tags,
      vendorId,
      categoryId,
      categoryName,
      ingredients,
      defaultMrp,
      defaultWeight,
      unit,
      benefits,
      whyWeLoveIt,
      faq,
      newArrival,
      bestSeller,
      trending,
      specialOfferType,
      origin,
      linkedProductId,
      skinConcerns,
    } = req.body;
    
    let resolvedCategoryId = categoryId || undefined;

    if (!resolvedCategoryId && categoryName) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName, slug: slugify(categoryName) },
      });
      resolvedCategoryId = category.id;
    }

    // Sync first vendor as fallback on the main Product record
    let fallbackVendorId = vendorId || undefined;

    if (req.body.vendors && Array.isArray(req.body.vendors)) {
      fallbackVendorId = req.body.vendors[0]?.vendorId || fallbackVendorId;
    }

    const data = {
      name,
      sku,
      description,
      brand,
      vendor: fallbackVendorId ? { connect: { id: fallbackVendorId } } : (fallbackVendorId === null ? { disconnect: true } : undefined),
      category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : (categoryId === null ? { disconnect: true } : undefined),
      price: price ? Number(price) : undefined,
      discountPrice: discountPrice ? Number(discountPrice) : null,
      status: status || undefined,
      featured: featured !== undefined ? Boolean(featured) : undefined,
      rewardEligible: rewardEligible !== undefined ? Boolean(rewardEligible) : undefined,
      limitedOffer: limitedOffer !== undefined ? Boolean(limitedOffer) : undefined,
      newArrival: newArrival !== undefined ? Boolean(newArrival) : undefined,
      bestSeller: bestSeller !== undefined ? Boolean(bestSeller) : undefined,
      trending: trending !== undefined ? Boolean(trending) : undefined,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
      tags: Array.isArray(tags) ? tags : undefined,
      skinConcerns: Array.isArray(skinConcerns) ? skinConcerns : undefined,
      ingredients,
      defaultMrp: defaultMrp !== undefined ? (defaultMrp === null || defaultMrp === "" ? null : Number(defaultMrp)) : undefined,
      defaultWeight: defaultWeight !== undefined ? (defaultWeight === null || defaultWeight === "" ? null : Number(defaultWeight)) : undefined,
      unit,
      benefits,
      whyWeLoveIt,
      faq,
      specialOfferType,
      origin,
      linkedProduct: linkedProductId !== undefined ? (linkedProductId ? { connect: { id: linkedProductId } } : { disconnect: true }) : undefined,
    };

    // Remove undefined values
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    const product = await prisma.product.update({
      where: { id },
      data
    });

    // Deduplicate incoming vendors
    const uniqueVendors = Array.isArray(req.body.vendors) 
      ? Object.values(req.body.vendors.reduce((acc, v) => {
          if (v.vendorId) acc[v.vendorId] = v;
          return acc;
        }, {}))
      : [];

    if (uniqueVendors.length > 0) {
      const incomingVendorIds = uniqueVendors.map(v => v.vendorId);
      
      // Remove vendors not in incoming list
      await prisma.vendorStock.deleteMany({
        where: {
          productId: id,
          vendorId: { notIn: incomingVendorIds }
        }
      });

      // Upsert current vendors
      for (const v of uniqueVendors) {
        await prisma.vendorStock.upsert({
          where: {
            productId_vendorId: {
              productId: id,
              vendorId: v.vendorId
            }
          },
          update: { quantity: Number(v.stock || 0) },
          create: {
            productId: id,
            vendorId: v.vendorId,
            quantity: Number(v.stock || 0)
          }
        });
      }
    }

    // Fetch updated product with stockRecords to return consolidated stock
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: true,
        category: true,
        stockRecords: { include: { vendor: true } }
      }
    });

    const serializedProduct = {
      ...serializePrisma(updatedProduct),
      stock: (updatedProduct.stockRecords || []).reduce((sum, sr) => sum + (sr.quantity || 0), 0)
    };

    return sendSuccess(res, serializedProduct, "Product updated successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Perform Soft Delete to preserve order history
    const product = await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return sendSuccess(res, product, "Product deleted (archived) successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
export const updateVendorStock = async (req, res) => {
  try {
    const { productId, vendorId, quantity } = req.body;
    
    if (!productId || !vendorId || quantity === undefined) {
      return sendError(res, "Product, vendor, and quantity are required", 400);
    }

    const stock = await prisma.vendorStock.upsert({
      where: {
        productId_vendorId: {
          productId,
          vendorId
        }
      },
      update: { quantity: Number(quantity) },
      create: {
        productId,
        vendorId,
        quantity: Number(quantity)
      }
    });

    // We no longer sync total stock back to a Product.stock field as it doesn't exist in the schema.
    // The frontend handles aggregation via stockRecords.

    return sendSuccess(res, stock, "Stock updated successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
