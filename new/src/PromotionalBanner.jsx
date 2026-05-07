import React, { useMemo } from "react";
import ProductCard from "./components/card";
import { useProducts } from "./context/ProductContext";
import { THEME } from "./theme";

/**
 * PromotionalBanner - A premium, full-width section with high-density product grid
 * Designed for themed promotions like "Popular Sun Protection & Hydration"
 */
export default function PromotionalBanner({ 
  title = "Popular Sun Protection & Hydration", 
  subtitle = "Trusted SPF for your fun in the sun", 
  products = [], 
  bgColor = "transparent",
  addToCart, 
  wishlist, 
  toggleWishlist, 
  onNavigate 
}) {
  const { products: allProducts } = useProducts();

  // If no specific products are passed, we could optionally show top rated ones 
  // but for a promotional banner, explicit selection is usually preferred.
  const displayProducts = useMemo(() => {
    if (products && products.length > 0) {
      // Map the IDs/partial objects back to full product data if needed
      return products.map(sp => {
        const full = allProducts.find(p => String(p.id) === String(sp.id));
        return full || sp;
      }).filter(p => p && p.id);
    }
    return [];
  }, [products, allProducts]);

  if (displayProducts.length === 0 && !title) return null;

  return (
    <section 
      className="w-full py-16 md:py-24" 
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-[2560px] mx-auto px-6 lg:px-10 xl:px-12">
        {/* Header Section */}
        <div className="mb-12 md:mb-16 max-w-4xl">
          {title && (
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-black text-[#151515] tracking-tight leading-[1.1] uppercase mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl text-stone-500 font-medium tracking-tight">
              {subtitle}
            </p>
          )}
        </div>

        {/* Product Grid - Using a dense flex/grid layout that scales well */}
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 md:gap-8 lg:gap-10">
          {displayProducts.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard 
                product={product} 
                addToCart={addToCart} 
                wishlist={wishlist} 
                toggleWishlist={toggleWishlist} 
                onNavigate={onNavigate} 
              />
            </div>
          ))}

          {displayProducts.length === 0 && (
            <div className="col-span-full py-20 border-2 border-dashed border-stone-100 rounded-lg flex flex-col items-center justify-center bg-stone-50/50">
               <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">
                 No products selected for this promotion
               </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
