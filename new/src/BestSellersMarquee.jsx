import React, { useMemo } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import ProductCard from "./components/card.jsx";

const BestSellersMarquee = React.memo(function BestSellersMarquee({
  settings,
  products: PRODUCTS,
  addToCart,
  onNavigate,
  wishlist,
  toggleWishlist
}) {
  const mappedProducts = useMemo(() => {
    let list = settings?.products?.length > 0 
      ? settings.products.map(p => PRODUCTS.find(x => x.id === p.id) || p) 
      : PRODUCTS.filter(p => p.showOnline !== false && (p.bestSeller || p.featured || p.trending));
    
    // Fallback if no products are specifically marked
    if (!settings?.products?.length && list.length === 0) {
      list = PRODUCTS.filter(p => p.showOnline !== false);
    }
    
    return list.slice(0, settings?.maxItems || 12);
  }, [settings, PRODUCTS]);

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-[#1a1a1a] tracking-tight leading-none mb-4">
              Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">Sellers</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-md">
              Most loved essentials, carefully curated for your daily routine.
            </p>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate("shop")}
            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Explore All 
            <div className="w-8 h-[1px] bg-gray-300 group-hover:w-12 group-hover:bg-black transition-all" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-6 animate-smooth-marquee pause-on-hover whitespace-nowrap py-4 pr-10">
          {mappedProducts.concat(mappedProducts).map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="inline-block w-[280px] md:w-[320px]">
              <ProductCard 
                product={product} 
                addToCart={addToCart} 
                onNavigate={onNavigate}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            </div>
          ))}
        </div>
        
        {/* Gradients */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
      </div>
    </section>
  );
});

export default BestSellersMarquee;
