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
      
    return sendSuccess(res, allBrands, "Brands fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const listProducts = async (req, res) => {
  try {
    const { category, brand, featured, limitedOffer, newArrival, bestSeller, trending, search, vendorId } = req.query;

    const where = vendorId ? { vendorId: String(vendorId) } : undefined;

    let products = await prisma.product.findMany({
      where,
      include: {
        vendor: true,
        category: true,
        linkedProduct: { select: { id: true, name: true, imageUrls: true, price: true } },
        linkedDeals: { select: { id: true, name: true, imageUrls: true, price: true, discountPrice: true, specialOfferType: true, brand: true, stock: true, onlineStock: true, category: { select: { name: true } } } },
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
      const normalizedSearch = String(search).toLowerCase();
      products = products.filter((product) =>
        `${product.name} ${product.brand || ""} ${product.category?.name || ""}`
          .toLowerCase()
          .includes(normalizedSearch),
      );
    }

    return sendSuccess(res, serializePrisma(products), "Products fetched");
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
      whyWeLoveIt,
      benefits,
      faq,
      newArrival,
      bestSeller,
      trending,
      onlineStock,
      specialOfferType,
      linkedProductId,
    } = req.body;

    if (!vendorId || !name || price === undefined) {
      return sendError(
        res,
        "Vendor, product name, and price are required",
        400,
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return sendError(res, "Vendor not found", 404);
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
        vendor: { connect: { id: vendorId } },
        category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : undefined,
        name,
        slug: finalSlug,
        brand: brand || null,
        description: description || null,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
        tags: Array.isArray(tags) ? tags : [],
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock || 0),
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
        onlineStock: Number(onlineStock || 0),
        ingredients: ingredients || null,
        whyWeLoveIt: whyWeLoveIt || null,
        benefits: benefits || null,
        faq: faq || null,
        specialOfferType: specialOfferType || null,
        linkedProductId: linkedProductId || null,
      },
      include: {
        vendor: true,
        category: true,
      },
    });

    return sendSuccess(res, serializePrisma(product), "Product created", 201);
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
      },
    });

    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    return sendSuccess(res, serializePrisma(product), "Product fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      brand,
      price,
      discountPrice,
      stock,
      status,
      featured,
      rewardEligible,
      limitedOffer,
      imageUrls,
      tags,
      vendorId,
      categoryId,
      categoryName,
      // Optional schema fields:
      ingredients,
      benefits,
      whyWeLoveIt,
      faq,
      newArrival,
      bestSeller,
      trending,
      onlineStock,
      specialOfferType,
      linkedProductId,
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

    const data = {
      name,
      description,
      brand,
      vendor: vendorId ? { connect: { id: vendorId } } : undefined,
      category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : (categoryId === null ? { disconnect: true } : undefined),
      price: price ? Number(price) : undefined,
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: stock !== undefined ? Number(stock) : undefined,
      status: status || undefined,
      featured: featured !== undefined ? Boolean(featured) : undefined,
      rewardEligible: rewardEligible !== undefined ? Boolean(rewardEligible) : undefined,
      limitedOffer: limitedOffer !== undefined ? Boolean(limitedOffer) : undefined,
      newArrival: newArrival !== undefined ? Boolean(newArrival) : undefined,
      bestSeller: bestSeller !== undefined ? Boolean(bestSeller) : undefined,
      trending: trending !== undefined ? Boolean(trending) : undefined,
      onlineStock: onlineStock !== undefined ? Number(onlineStock) : undefined,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
      tags: Array.isArray(tags) ? tags : undefined,
      ingredients,
      benefits,
      whyWeLoveIt,
      faq,
      specialOfferType,
      linkedProductId: linkedProductId !== undefined ? (linkedProductId || null) : undefined,
    };

    // Remove undefined values
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    const product = await prisma.product.update({
      where: { id },
      data
    });

    return sendSuccess(res, serializePrisma(product), "Product updated successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return sendSuccess(res, null, "Product deleted successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
