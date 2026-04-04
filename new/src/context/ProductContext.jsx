import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
// import { getAllProducts, PREORDER_PRODUCTS } from '../data/products';


const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

export const ProductProvider = ({ children }) => {
  const [apiProducts, setApiProducts] = useState([]);
  const [preorderProducts, setPreorderProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [apiCoupons, setApiCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPreorders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/homepage`);
      const data = await res.json();
      if (data.success) {
        const poSection = data.data.sections.find(s => s.componentId === 'pre-order');
        if (poSection?.settings?.preorderProducts) {
          // Normalize: Ensure images array
          const normalized = poSection.settings.preorderProducts.map(p => ({
            ...p,
            image: getMediaUrl(p.image || p.imageUrl || (Array.isArray(p.images) ? p.images[0] : "")),
            images: Array.isArray(p.images) ? p.images.map(getMediaUrl) : ([getMediaUrl(p.image)] || [])
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
      const response = await fetch(`${API_URL}/admin/products`);
      const result = await response.json();
      
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

  const fetchCategories = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/admin/categories`);
      const data = await resp.json();
      if (data.success) setDynamicCategories(data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/coupons`);
      const data = await resp.json();
      if (data.success) setApiCoupons(data.data);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchPreorders();
    fetchCategories();
    fetchCoupons();
  }, [fetchProducts, fetchPreorders, fetchCategories, fetchCoupons]);

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
    apiCoupons,
    loading,
    error,
    refreshProducts: () => { fetchProducts(); fetchPreorders(); fetchCategories(); fetchCoupons(); }
  }), [allProducts, apiProducts, finalPreorders, dynamicCategories, apiCoupons, loading, error, fetchProducts, fetchPreorders, fetchCategories, fetchCoupons]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
