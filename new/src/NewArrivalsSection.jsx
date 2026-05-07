import { ChevronRight, Sparkles } from "lucide-react";
import ImageReveal from "./components/image-tiles";
import imgNew1 from "./assets/newprod/new1.jpg";
import imgNew2 from "./assets/newprod/new2.jpg";
import imgNew3 from "./assets/newprod/new3.jpg";
import React from "react";
import { useProducts } from "./context/ProductContext";
import ProductCard from "./components/card.jsx";

export default React.memo(function NewArrivalsSection({ onNavigate, addToCart, wishlist, toggleWishlist }) {
  const { products } = useProducts();
  const productGridRef = React.useRef(null);
  
  const newProducts = React.useMemo(() => {
    return (products || [])
      .filter(p => p.newArrival || p.tag === "New Arrival")
      .slice(0, 8);
  }, [products]);

  const scrollToProducts = () => {
    if (newProducts.length > 0) {
      productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onNavigate) {
      onNavigate("new-arrivals");
    }
  };

  return (
    <section className="relative px-6 py-12 md:py-24 max-w-[1440px] mx-auto space-y-16">
      <div className="bg-gradient-to-br from-[#f0f9ff]/80 to-white/40 rounded-[40px] border border-stone-200 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
        {/* Text Content */}
        <div className="max-w-xl relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#151515] flex items-center gap-2">
              <Sparkles size={12} className="text-pink-500" /> Just Dropped
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-[900] text-[#151515] leading-[0.95] mb-8 tracking-tighter uppercase">
            New<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600">
              Arrivals
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-light">
            Our curators just restocked with the season's most anticipated formulas. 
            Experience high-performance beauty, fresh from Seoul.
          </p>
          <button
            onClick={scrollToProducts}
            className="bg-[#151515] text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-[#151515]/20 flex items-center gap-3 mx-auto md:mx-0"
          >
            Shop the Drop <ChevronRight size={16} />
          </button>
        </div>

        {/* Floating Collage (Visual) */}
        <div className="relative w-full md:w-1/2 h-[350px] md:h-[450px] flex items-center justify-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 scale-90 md:scale-110">
            <ImageReveal
              leftImage={imgNew1}
              middleImage={imgNew2}
              rightImage={imgNew3}
            />
          </div>
        </div>
      </div>

      {/* Product Grid Integration */}
      {newProducts.length > 0 && (
        <div className="space-y-10 scroll-mt-32" ref={productGridRef}>
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Recent Additions</h3>
            <div className="h-px flex-1 bg-stone-100 mx-8 hidden md:block" />
            <button 
              onClick={() => onNavigate && onNavigate("new-arrivals")}
              className="text-[11px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2 group"
            >
              View Full Collection <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {newProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                onNavigate={() => onNavigate && onNavigate(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
});
