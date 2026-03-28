import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
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
  const [activeCategory, setActiveCategory] = useState("ALL");
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const isDraggingRef = useRef(false);

  const mappedProducts = useMemo(() => {
    let list = settings?.products?.length > 0
      ? settings.products.map(p => PRODUCTS.find(x => x.id === p.id) || p)
      : PRODUCTS.filter(p => p.showOnline !== false && (p.bestSeller || p.featured || p.trending));

    if (!settings?.products?.length && list.length === 0) {
      list = PRODUCTS.filter(p => p.showOnline !== false);
    }

    if (activeCategory !== "ALL") {
      list = list.filter(p => p.category === activeCategory);
    }

    return list.slice(0, settings?.maxItems || 12);
  }, [settings, PRODUCTS, activeCategory]);

  const marqueeItems = useMemo(() => {
    if (mappedProducts.length === 0) return [];
    // Repeat enough times to cover a large width for dragging and looping
    return [...mappedProducts, ...mappedProducts, ...mappedProducts, ...mappedProducts];
  }, [mappedProducts]);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const totalContentWidth = contentRef.current.scrollWidth;
        const itemWidth = totalContentWidth / marqueeItems.length;
        const loopPoint = -(totalContentWidth / 2); // Assuming 4x repeat means we can loop at half
        setConstraints({
          left: loopPoint,
          right: 0
        });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    const timeout = setTimeout(updateConstraints, 500);
    return () => {
      window.removeEventListener("resize", updateConstraints);
      clearTimeout(timeout);
    };
  }, [marqueeItems]);

  return (
    <section className="py-16 md:py-20 overflow-hidden bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="w-full md:w-auto">
            <h2 className="text-4xl md:text-5xl font-black text-[#151515] tracking-tighter leading-none mb-4 uppercase italic">
              Best Sellers
            </h2>
            <p className="text-gray-400 text-lg max-w-md mb-8 font-medium">
              Most loved essentials, carefully curated for your daily routine.
            </p>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border
                    ${activeCategory === cat
                      ? 'bg-[#151515] text-white border-[#151515] shadow-lg scale-105'
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
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-pink-600 transition-all self-start md:self-auto"
          >
            Explore Collection
            <div className="w-8 h-[2px] bg-gray-100 group-hover:w-16 group-hover:bg-pink-600 transition-all rounded-full" />
          </button>
        </div>
      </div>

      <div className="relative cursor-grab active:cursor-grabbing" ref={containerRef}>
        <motion.div
          ref={contentRef}
          className="flex gap-10 py-12 px-6 w-max"
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.05}
          dragTransition={{ power: 0.2, timeConstant: 200 }}
          onDragStart={() => {
            isDraggingRef.current = true;
          }}
          onDragEnd={() => {
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 100);
          }}
        >
          <div className="flex gap-10 animate-smooth-marquee pause-on-hover px-10">
            {marqueeItems.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="shrink-0 w-[280px] md:w-[320px] transition-transform duration-500 hover:scale-[1.02]"
                onClickCapture={(e) => {
                  if (isDraggingRef.current) {
                    e.stopPropagation();
                    e.preventDefault();
                  }
                }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={addToCart}
                  onNavigate={onNavigate}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
              </div>
            ))}
          </div>
        </motion.div>

        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
});

export default BestSellersMarquee;
