import React, { useMemo } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import ProductCard from "./components/card.jsx";

const CATEGORIES = ["ALL", "Skincare", "Makeup", "Haircare", "Fragrance", "Tools"];

const BestSellersMarquee = React.memo(function BestSellersMarquee({
  settings,
  products: PRODUCTS,
  addToCart,
  onNavigate,
  wishlist,
  toggleWishlist
}) {
  const [activeCategory, setActiveCategory] = React.useState("ALL");

  const mappedProducts = useMemo(() => {
    let list = settings?.products?.length > 0
      ? settings.products.map(p => PRODUCTS.find(x => x.id === p.id) || p)
      : PRODUCTS.filter(p => p.showOnline !== false && (p.bestSeller || p.featured || p.trending));

    // Fallback if no products are specifically marked
    if (!settings?.products?.length && list.length === 0) {
      list = PRODUCTS.filter(p => p.showOnline !== false);
    }

    if (activeCategory !== "ALL") {
      list = list.filter(p => p.category === activeCategory);
    }

    return list.slice(0, settings?.maxItems || 12);
  }, [settings, PRODUCTS, activeCategory]);

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="w-full md:w-auto">
            <h2 className="text-4xl md:text-6xl font-[900] text-[#1a1a1a] tracking-tight leading-none mb-4 uppercase">
              Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600">Sellers</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-md mb-8">
              Most loved essentials, carefully curated for your daily routine.
            </p>

            {/* Category Chips */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 border
                    ${activeCategory === cat
                      ? 'bg-[#151515] text-white border-transparent shadow-xl shadow-gray-200 scale-105'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200 hover:text-pink-600'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate("shop")}
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-pink-600 transition-all self-start md:self-auto"
          >
            Explore All
            <div className="w-8 h-[2px] bg-gray-200 group-hover:w-16 group-hover:bg-pink-600 transition-all rounded-full" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-8 animate-smooth-marquee pause-on-hover whitespace-nowrap py-4 pr-10">
          {mappedProducts.concat(mappedProducts).map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="inline-block w-[280px] md:w-[320px] transition-all duration-500">
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
