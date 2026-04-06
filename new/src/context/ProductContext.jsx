import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
// import { getAllProducts, PREORDER_PRODUCTS } from '../data/products';
import { SERVER_URL, fetchJson } from "../utils/api";
import { resolveImage } from "../utils/urlHelper";


const ProductContext = createContext({
  products: [],
  apiProducts: [],
  preorderProducts: [],
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
  const [preorderProducts, setPreorderProducts] = useState([]);
  const [apiCoupons, setApiCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
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


  const fetchPreorders = useCallback(async () => {
    try {
      const { data } = await fetchJson("/homepage");
      if (data.success) {
        const poSection = data.data.sections.find(s => s.componentId === 'pre-order');
        if (poSection?.settings?.preorderProducts) {
          // Normalize: Ensure images array
          const normalized = poSection.settings.preorderProducts.map(p => ({
            ...p,
            image: getMediaUrl(p.image || p.imageUrl || (Array.isArray(p.images) ? p.images[0] : "")),
            images: Array.isArray(p.images)
              ? p.images.map(getMediaUrl).filter(Boolean)
              : [getMediaUrl(p.image || p.imageUrl)].filter(Boolean)
          }));
          setPreorderProducts(normalized);
        }
      }
    } catch (err) {
      console.error("Failed to fetch pre-orders:", err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: result } = await fetchJson("/products");
      
      if (result.success) {
        // Map backend products to frontend format
        const mapped = result.data.map(p => ({
          ...p,
          id: p.id,
          image: p.imageUrls?.[0] 
            ? getMediaUrl(p.imageUrls[0]) 
            : 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
          imageUrls: Array.isArray(p.imageUrls) 
            ? p.imageUrls.map(getMediaUrl) 
            : [p.image ? getMediaUrl(p.image) : ""].filter(Boolean),
          tag: p.bestSeller ? "Best Seller" : p.newArrival ? "New Arrival" : p.trending ? "Trending" : p.category?.name || "New",
          category: p.category?.name || "Uncategorized",
          brand: p.brand || "OMW Skincare",
          rating: p.rating || 4.5,
          reviews: p.reviews || 120,
          inStock: p.onlineStock > 0,
          onlineStock: p.onlineStock || 0,
        }));
        setApiProducts(mapped);
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

  useEffect(() => {
    fetchProducts();
    fetchPreorders();
    fetchCoupons();
    fetchCategories();
  }, [fetchProducts, fetchPreorders, fetchCoupons, fetchCategories]);


  // Merge static products with API products
  const allProducts = useMemo(() => {
    // Rely only on API products
    return apiProducts;
  }, [apiProducts]);

  // Dynamic Pre-orders (strictly API)
  const finalPreorders = useMemo(() => {
    return preorderProducts;
  }, [preorderProducts]);


  const value = useMemo(() => ({
    products: allProducts,
    apiProducts,
    preorderProducts: finalPreorders,
    dynamicCategories,
    categories,
    apiCoupons,
    loading,
    error,
    refreshProducts: () => { fetchProducts(); fetchPreorders(); fetchCoupons(); fetchCategories(); }
  }), [allProducts, apiProducts, finalPreorders, dynamicCategories, categories, apiCoupons, loading, error, fetchProducts, fetchPreorders, fetchCoupons, fetchCategories]);


  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
