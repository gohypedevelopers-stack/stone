import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getAllProducts } from '../data/products';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          inStock: p.stock > 0,
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
  }, [fetchProducts]);

  // Merge static products with API products
  // Universal Deduplication by normalized name
  const allProducts = useMemo(() => {
    const normalize = (n) => n?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || "";
    const uniqueMap = new Map();
    
    // Combine all sources
    const staticProducts = getAllProducts();
    const source = [...apiProducts, ...staticProducts];

    source.forEach(p => {
      const key = normalize(p.name);
      // Priority: 1. Online products, 2. First seen product
      if (!uniqueMap.has(key) || (p.showOnline && !uniqueMap.get(key).showOnline)) {
        uniqueMap.set(key, p);
      }
    });

    return Array.from(uniqueMap.values());
  }, [apiProducts]);

  const value = useMemo(() => ({
    products: allProducts,
    apiProducts,
    loading,
    error,
    refreshProducts: fetchProducts
  }), [allProducts, apiProducts, loading, error, fetchProducts]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
