import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
// import { getAllProducts, PREORDER_PRODUCTS } from '../data/products';
import { SERVER_URL, fetchJson } from "../utils/api";
import { resolveImage } from "../utils/urlHelper";


const ProductContext = createContext({
  products: [],
  apiProducts: [],
  dynamicCategories: [],
  apiCoupons: [],
  categories: [],
  loading: true,
  error: null,
  refreshProducts: () => {},
});


export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

const getMediaUrl = (url) => {
  return resolveImage(url) || "";
};

export const ProductProvider = ({ children }) => {
  const [apiProducts, setApiProducts] = useState([]);
  const [apiCoupons, setApiCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await fetchJson("/categories");
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);



  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: result } = await fetchJson("/products");
      
      if (result.success) {
        // Map backend products to frontend format and filter out test/junk data
        const mapped = result.data
          .filter(p => {
            const brand = (p.brand || "").toUpperCase();
            
            // Exclude only the known "HELLO" test brand, but allow generic names like "PRODUCT"
            const isTestBrand = brand === "HELLO";
            
            return !isTestBrand;
          })
          .map(p => {
            const basePrice = Number(p.price) || 0;
            const discountPrice = Number(p.discountPrice) || 0;
            const hasDiscount = discountPrice > 0 && discountPrice < basePrice;

            return {
              ...p,
              id: p.id,
              // Use discountPrice as the primary price if available, otherwise basePrice
              price: hasDiscount ? discountPrice : basePrice,
              // Map base price to originalPrice for UI strike-through
              originalPrice: hasDiscount ? basePrice : 0,
              image: p.imageUrls?.[0] 
                ? getMediaUrl(p.imageUrls[0]) 
                : 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
              imageUrls: Array.isArray(p.imageUrls) 
                ? p.imageUrls.map(getMediaUrl) 
                : [p.image ? getMediaUrl(p.image) : ""].filter(Boolean),
              tags: Array.isArray(p.tags) ? p.tags.map(t => String(t).trim()) : (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()) : []),
              tag: p.bestSeller ? "Best Seller" : p.newArrival ? "New Arrival" : p.trending ? "Trending" : p.category?.name || "New",
              category: p.category?.name || "Rituals",
              brand: p.brand || "OMW Skincare",
              rating: p.rating || 4.5,
              reviews: p.reviews || 120,
              inStock: p.stock > 0,
              stock: p.stock || 0,
            };
          });
        // Deduplicate by Name & Brand to prevent multiple cards for the same product
        const deduplicated = Object.values(
          mapped.reduce((acc, p) => {
            const key = `${p.brand || ""}-${p.name}`
              .toLowerCase()
              .replace(/\s+/g, " ")
              .trim();
            if (!acc[key]) {
              acc[key] = { ...p };
            } else {
              // Aggregate stock and merge stock records
              acc[key].stock = (acc[key].stock || 0) + (p.stock || 0);
              acc[key].inStock = acc[key].stock > 0;
              if (p.stockRecords) {
                acc[key].stockRecords = [
                  ...(acc[key].stockRecords || []),
                  ...p.stockRecords,
                ];
              }
            }
            return acc;
          }, {}),
        );

        setApiProducts(deduplicated);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  const dynamicCategories = useMemo(() => {
    if (categories.length > 0) {
      return categories.map(c => ({
        id: c.id,
        key: c.slug,
        title: c.name,
        name: c.name,
        slug: c.slug,
        image: c.imageUrl,
        imageUrl: c.imageUrl
      }));
    }

    return Array.from(
      new Set(
        apiProducts
          .map((product) => product.category)
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right)).map(name => ({
      key: name.toLowerCase().replace(/\s+/g, '-'),
      title: name,
      image: null
    }));
  }, [apiProducts, categories]);


  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await fetchJson("/coupons");
      if (data.success) setApiCoupons(data.data);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    }
  }, []);

  const fetchSections = useCallback(async () => {
    try {
      const { data } = await fetchJson("/admin/homepage/sections");
      if (data.success) {
        setSections(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch sections:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
    fetchCategories();
    fetchSections();
  }, [fetchProducts, fetchCoupons, fetchCategories, fetchSections]);

  const allProducts = useMemo(() => {
    // Include custom products from origins
    const customProductsFromOrigins = sections.reduce((acc, section) => {
      if (section.componentId === "shop-by-origin" && section.settings?.origins) {
        section.settings.origins.forEach(origin => {
          if (origin.customProducts && origin.customProducts.length > 0) {
            const mapped = origin.customProducts.map(cp => ({
              ...cp,
              id: cp.id,
              origin: origin.name,
              // Map custom fields to expected product schema
              image: cp.image || (cp.imageUrls && cp.imageUrls[0]) || "",
              imageUrls: cp.imageUrls || [cp.image].filter(Boolean),
              tag: cp.tag || origin.name,
              category: cp.category || "Rituals",
              brand: cp.brand || "OMW Choice",
              // Pricing Logic
              price: cp.discountPrice && Number(cp.discountPrice) < Number(cp.price) ? Number(cp.discountPrice) : Number(cp.price) || 0,
              originalPrice: cp.discountPrice && Number(cp.discountPrice) < Number(cp.price) ? Number(cp.price) : 0,
              mrp: Number(cp.price) || 0,
              discountPrice: Number(cp.discountPrice) || null,
              stock: Number(cp.stock) || 0,
              inStock: Number(cp.stock) > 0,
              isCustom: true
            }));
            acc.push(...mapped);
          }
        });
      }
      return acc;
    }, []);

    return [...apiProducts, ...customProductsFromOrigins];
  }, [apiProducts, sections]);

  const value = useMemo(() => ({
    products: allProducts,
    apiProducts,
    sections,
    dynamicCategories,
    categories,
    apiCoupons,
    loading,
    error,
    refreshProducts: () => { fetchProducts(); fetchCoupons(); fetchCategories(); fetchSections(); }
  }), [allProducts, apiProducts, sections, dynamicCategories, categories, apiCoupons, loading, error, fetchProducts, fetchCoupons, fetchCategories, fetchSections]);


  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
