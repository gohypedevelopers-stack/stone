import React, { useState } from "react";
import { ChevronRight, ShoppingCart, ArrowRight } from "lucide-react";

// Mock data for the Brands section
const BRANDS = [
  {
    id: "round-lab",
    name: "ROUND LAB",
    displayName: "Round Lab",
    tagline: "Purity of the East Sea",
    bannerColor: "from-[#E8F1F8] to-stone-100",
    heroImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200",
    products: [
      {
        id: "rl1",
        name: "Birch Juice Moisturizing Sun Cream 50ml",
        brand: "ROUND LAB",
        price: 1800,
        originalPrice: 2400,
        discount: 25,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400",
      },
      {
        id: "rl2",
        name: "1025 Dokdo Cleanser 150ml",
        brand: "ROUND LAB",
        price: 980,
        originalPrice: 1300,
        discount: 25,
        image: "https://images.unsplash.com/photo-1590156221170-c07a3086eb2d?auto=format&fit=crop&w=400",
      },
      {
        id: "rl3",
        name: "1025 Dokdo Toner 200ml",
        brand: "ROUND LAB",
        price: 1450,
        originalPrice: 2100,
        discount: 30,
        image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400",
      }
    ]
  },
  {
    id: "skin1004",
    name: "SKIN1004",
    displayName: "Skin1004",
    tagline: "Centella from Madagascar",
    bannerColor: "from-[#F9F5F0] to-stone-100",
    heroImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200",
    products: []
  },
  {
    id: "medicube",
    name: "MEDICUBE",
    displayName: "Medicube",
    tagline: "Clinical Derma Solutions",
    bannerColor: "from-[#FDF2F4] to-stone-100",
    heroImage: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200",
    products: []
  },
  {
    id: "dr-althea",
    name: "Dr. Althea",
    displayName: "Dr. Althea",
    tagline: "Premium Medical Aesthetics",
    bannerColor: "from-[#F4F4F9] to-stone-100",
    heroImage: "https://images.unsplash.com/photo-1490231324208-a530768e142e?auto=format&fit=crop&w=1200",
    products: []
  }
];

export default function BestBrand() {
  const [activeBrand, setActiveBrand] = useState(BRANDS[0]);

  return (
    <section className="section py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="flex flex-col mb-10">
            <span className="text-[10px] font-[1000] text-brand2 uppercase tracking-[0.5em] mb-3 leading-none">CURATED HOUSE BRANDS</span>
            <h2 className="text-[52px] font-bold text-[#151515] tracking-tight leading-none uppercase">
              Best Brand
            </h2>
          </div>

          {/* Brand Pills */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
            {BRANDS.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setActiveBrand(brand)}
                className={`px-10 py-3.5 rounded-full text-[11px] font-[1000] border transition-all duration-700 whitespace-nowrap uppercase tracking-[0.2em]
                  ${activeBrand.id === brand.id
                    ? "bg-[#151515] border-transparent text-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)]"
                    : "bg-white border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900"}`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="relative mb-20 group/banner">
          <div className={`w-full aspect-[21/9] rounded-[64px] overflow-hidden relative shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] border-[12px] border-[#FAFAFA]`}>
            {/* Background Image with Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activeBrand.bannerColor} mix-blend-multiply`} />
            <div className="absolute inset-0 opacity-40 mix-blend-hard-light grayscale group-hover/banner:grayscale-0 transition-all duration-1000 transform-gpu optimize-gpu">
              <img src={activeBrand.heroImage} alt="" className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-[2s] ease-out transform-gpu optimize-gpu" loading="lazy" />
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />

            {/* Banner Text Content */}
            <div className="absolute inset-0 flex items-center justify-between px-20">
              <div className="max-w-md z-10 group-hover/banner:translate-x-4 transition-transform duration-1000">
                <span className="text-[10px] font-[1000] text-white/60 uppercase tracking-[0.4em] mb-4 block">BRAND OF THE MONTH</span>
                <h3 className="text-[64px] font-bold text-white tracking-tighter leading-none mb-6">
                  {activeBrand.displayName}
                </h3>
                <p className="text-white/80 font-medium text-lg mb-10 tracking-tight">{activeBrand.tagline}</p>
                <button className="flex items-center gap-4 px-10 py-5 rounded-full bg-white text-[#151515] font-[1000] text-[10px] uppercase tracking-[0.3em] hover:bg-[#151515] hover:text-white transition-all transform active:scale-95 shadow-xl">
                  Discover Collection <ArrowRight size={16} />
                </button>
              </div>

              {/* Floating Preview (Simplified) */}
              <div className="hidden lg:flex items-center gap-8 relative z-10">
                <div className="w-[220px] aspect-[4/5] bg-white rounded-[40px] shadow-md skew-y-3 rotate-6 overflow-hidden border-[8px] border-white/40 transform group-hover/banner:translate-y-[-20px] transition-all duration-1000 p-2 transform-gpu optimize-gpu">
                  <img src={activeBrand.products[0]?.image} className="w-full h-full object-cover rounded-[32px] transform-gpu optimize-gpu" alt="" loading="lazy" />
                </div>
                <div className="absolute -right-20 -bottom-10 w-[180px] aspect-square bg-white rounded-full p-4 shadow-2xl group-hover/banner:rotate-12 transition-transform duration-[1.5s]">
                  <div className="w-full h-full rounded-full border border-dashed border-stone-200 flex items-center justify-center text-center p-4">
                    <span className="text-[9px] font-[1000] text-[#151515] uppercase tracking-widest leading-tight">Featured<br />Selection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {activeBrand.products.map((product) => (
            <div key={product.id} className="group/card cursor-pointer">
              {/* Product Image */}
              <div className="relative aspect-[4/5] bg-[#FAFAFA] rounded-[40px] overflow-hidden mb-6 border border-stone-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-700 hover:shadow-2xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000 ease-out transform-gpu optimize-gpu"
                  loading="lazy"
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
                  <span className="text-[10px] font-[1000] text-stone-400 tracking-[0.3em] uppercase">{product.brand}</span>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-stone-100 text-[#151515] hover:bg-[#151515] hover:text-white transition-all shadow-sm">
                    <ShoppingCart size={14} />
                  </button>
                </div>

                <h4 className="text-[16px] font-[1000] text-[#151515] line-clamp-2 leading-tight h-[44px] tracking-tight group-hover/card:text-pink-600 transition-colors">
                  {product.name}
                </h4>

                <div className="pt-4 mt-auto border-t border-stone-50 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-stone-300 text-[13px] font-bold line-through tracking-tight">₹{product.originalPrice}</span>
                    <span className="text-brand2 text-[10px] font-[1000] uppercase tracking-tighter bg-brand2/10 px-2 py-0.5 rounded">Save {product.discount}%</span>
                  </div>
                  <div className="text-[20px] font-semibold text-[#151515] tracking-tighter leading-none">
                    ₹{product.price}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Fallback Empty State */}
          {activeBrand.products.length === 0 && (
            <div className="col-span-4 py-20 border-2 border-dashed border-stone-100 rounded-[56px] flex flex-col items-center justify-center bg-[#FAFAFA]/50 group/empty">
              <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center mb-6">
                <div className="w-2 h-2 rounded-full bg-stone-300 animate-pulse" />
              </div>
              <p className="text-[10px] font-[1000] text-stone-300 uppercase tracking-[0.5em]">Inventory Processing</p>
              <p className="text-stone-400 text-sm mt-2">Checking collection availability for {activeBrand.displayName}...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
