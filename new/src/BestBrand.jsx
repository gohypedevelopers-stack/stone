import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useProducts } from "./context/ProductContext";

export default function BestBrand({ title, bgColor }) {
  const navigate = useNavigate();
  const { products: allProducts } = useProducts();
  
  // Extract unique brands from all products
  const brands = useMemo(() => {
    const brandMap = new Map();
    allProducts.forEach(p => {
      if (p.brand && !brandMap.has(p.brand)) {
        brandMap.set(p.brand, {
          id: p.brand.toLowerCase().replace(/\s+/g, '-'),
          name: p.brand,
          displayName: p.brand,
          tagline: `Exploring ${p.brand}'s signature collection`,
          bannerColor: "from-stone-50 to-stone-100",
          heroImage: p.image || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200"
        });
      }
    });
    return Array.from(brandMap.values());
  }, [allProducts]);

  const [activeBrandId, setActiveBrandId] = useState(null);

  // Initialize active brand if not set
  useEffect(() => {
    if (brands.length > 0 && !activeBrandId) {
      setActiveBrandId(brands[0].id);
    }
  }, [brands, activeBrandId]);

  const activeBrand = useMemo(() => {
    return brands.find(b => b.id === activeBrandId) || brands[0] || null;
  }, [brands, activeBrandId]);

  const activeProducts = useMemo(() => {
    if (!activeBrand) return [];
    return allProducts.filter(p => p.brand === activeBrand.name).slice(0, 4);
  }, [allProducts, activeBrand]);

  if (!activeBrand) return null;


  return (
    <section className="section pt-8 pb-10 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col mb-10">
            <span className="text-[10px] font-[1000] text-brand2 uppercase tracking-[0.5em] mb-3 leading-none">
              CURATED HOUSE BRANDS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#151515] tracking-tight leading-tight uppercase">
            {title ? title.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1]"> {word} </span> : word + ' ') : (
              <>Upcoming <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1]">Drops</span></>
            )}
          </h2>
          </div>

          {/* Brand Pills */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setActiveBrandId(brand.id)}
                className={`px-10 py-3.5 rounded-[2px] text-[11px] font-[1000] border transition-all duration-700 whitespace-nowrap uppercase tracking-[0.2em]
                  ${
                    activeBrandId === brand.id
                      ? "bg-[#151515] border-transparent text-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)]"
                      : "bg-white border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900"
                  }`}
              >
                {brand.name}
              </button>
            ))}
          </div>

        </div>

        {/* Hero Banner Section */}
        <div className="relative mb-20 group/banner">
          <div
            className="w-full aspect-21/9 rounded-[2px] overflow-hidden relative shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] border-12 border-[#FAFAFA]"
          >
            {/* Background Image with Overlay */}
            <div
              className={`absolute inset-0 bg-linear-to-br ${activeBrand.bannerColor || 'from-stone-50 to-stone-100'} mix-blend-multiply`}
            />
            <div className="absolute inset-0 opacity-40 mix-blend-hard-light grayscale group-hover/banner:grayscale-0 transition-all duration-1000 transform-gpu optimize-gpu">
              <img
                src={activeBrand.heroImage}
                alt=""
                className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-[2s] ease-out transform-gpu optimize-gpu"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-white/10" />

            {/* Banner Text Content */}
            <div className="absolute inset-0 flex items-center justify-between px-6 md:px-20">
              <div className="max-w-md z-10 group-hover/banner:translate-x-4 transition-transform duration-1000">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-3 md:mb-4 block">
                  BRAND OF THE MONTH
                </span>
                <h3 className="text-3xl sm:text-5xl md:text-[64px] font-black text-white tracking-tighter leading-none mb-4 md:mb-6">
                  {activeBrand.displayName}
                </h3>
                <p className="text-white/80 font-medium text-sm md:text-lg mb-6 md:mb-10 tracking-tight line-clamp-2 md:line-clamp-none">
                  {activeBrand.tagline}
                </p>
                <button 
                  onClick={() => navigate(`/brand/${activeBrand.name}`)}
                  className="flex items-center gap-3 md:gap-4 px-6 md:px-10 py-3.5 md:py-5 rounded-[2px] bg-white text-[#151515] font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] border border-white hover:bg-[#151515] hover:text-white transition-all transform active:scale-95 shadow-xl"
                >
                  Discover <span className="hidden sm:inline">Collection</span> <ArrowRight size={14} className="md:w-4 md:h-4" />
                </button>
              </div>

                <div className="hidden lg:flex items-center gap-8 relative z-10">
                  {activeProducts[0] && (
                    <div className="w-[220px] aspect-4/5 bg-white rounded-[2px] shadow-md skew-y-3 rotate-6 overflow-hidden border-8 border-white/40 transform group-hover/banner:translate-y-[-20px] transition-all duration-1000 p-2 transform-gpu optimize-gpu">
                      <img
                        src={activeProducts[0].image}
                        className="w-full h-full object-cover rounded-[2px] transform-gpu optimize-gpu"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="absolute -right-20 -bottom-10 w-[180px] aspect-square bg-white rounded-[2px] p-4 shadow-2xl group-hover/banner:rotate-12 transition-transform duration-[1.5s]">
                    <div className="w-full h-full rounded-[2px] border border-dashed border-stone-200 flex items-center justify-center text-center p-4">
                      <span className="text-[9px] font-[1000] text-[#151515] uppercase tracking-widest leading-tight">
                        Featured
                        <br />
                        Selection
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {activeProducts.map((product) => (
            <div key={product.id} className="group/card cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
              {/* Product Image */}
              <div className="relative aspect-4/5 bg-[#FAFAFA] rounded-[2px] overflow-hidden mb-6 border border-stone-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-700 hover:shadow-2xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000 ease-out transform-gpu optimize-gpu"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-6 left-6">
                  <div className="bg-brand2 text-white text-[9px] font-[1000] px-3 py-1 rounded shadow-lg tracking-tighter uppercase transform -skew-x-12 border border-white/20">
                    BEST
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-4 px-2 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-[1000] text-stone-400 tracking-[0.3em] uppercase">
                    {product.brand}
                  </span>
                  <button className="w-10 h-10 rounded-[2px] flex items-center justify-center bg-white border border-stone-100 text-[#151515] hover:bg-[#151515] hover:text-white transition-all shadow-sm">
                    <ShoppingCart size={14} />
                  </button>
                </div>

                <h4 className="text-[16px] font-[1000] text-[#151515] line-clamp-2 leading-tight h-[44px] tracking-tight group-hover/card:text-pink-600 transition-colors">
                  {product.name}
                </h4>

                <div className="pt-4 mt-auto border-t border-stone-50 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-stone-300 text-[13px] font-bold line-through tracking-tight">
                        ₹{product.originalPrice}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="text-brand2 text-[10px] font-[1000] uppercase tracking-tighter bg-brand2/10 px-2 py-0.5 rounded">
                        Save {product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="text-[20px] font-semibold text-[#151515] tracking-tighter leading-none">
                    ₹{product.price}
                  </div>
                </div>
              </div>
            </div>
          ))}


          {/* Fallback Empty State */}
          {activeProducts.length === 0 && (
            <div className="col-span-4 py-20 border-2 border-dashed border-stone-100 rounded-[2px] flex flex-col items-center justify-center bg-[#FAFAFA]/50 group/empty">
              <div className="w-12 h-12 rounded-[2px] border border-stone-200 flex items-center justify-center mb-6">
                <div className="w-2 h-2 rounded-[2px] bg-stone-300 animate-pulse" />
              </div>
              <p className="text-[10px] font-[1000] text-stone-300 uppercase tracking-[0.5em]">
                Inventory Processing
              </p>
              <p className="text-stone-400 text-sm mt-2">
                Checking collection availability for {activeBrand.displayName}
                ...
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
