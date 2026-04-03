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

export const ProductProvider = ({ children }) => {
  const [apiProducts, setApiProducts] = useState([]);
  const [preorderProducts, setPreorderProducts] = useState([]);
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
            images: Array.isArray(p.images) ? p.images : ([p.image] || [])
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
          image: p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
          tag: p.bestSeller ? "Best Seller" : p.newArrival ? "New Arrival" : p.trending ? "Trending" : p.category?.name || "New",
          category: p.category?.name || "Uncategorized",
          rating: p.rating || 4.5,
          reviews: p.reviews || 120,
          inStock: p.onlineStock > 0,
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

  useEffect(() => {
    fetchProducts();
    fetchPreorders();
  }, [fetchProducts, fetchPreorders]);

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
    loading,
    error,
    refreshProducts: () => { fetchProducts(); fetchPreorders(); }
  }), [allProducts, apiProducts, finalPreorders, loading, error, fetchProducts, fetchPreorders]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
