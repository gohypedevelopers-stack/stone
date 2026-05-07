import React from "react";
import { Clock, Search, ShoppingBag, ArrowRight } from "lucide-react";
import { SERVER_URL } from "./utils/api";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

// Mock data for the Combos section fallback
const FALLBACK_COMBOS = [
  {
    id: "combo-1",
    brand: "MOIDA",
    name: "K-Beauty Starter Ritual Set",
    price: 2850,
    originalPrice: 7100,
    discount: 60,
    badge: "Limited Edition",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800",
    color: "from-[#F0F7F4] to-white",
  },
  {
    id: "combo-2",
    brand: "CELIMAX",
    name: "Retinal Booster Duo Experience",
    price: 2350,
    originalPrice: 3500,
    discount: 34,
    badge: "Exclusive",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800",
    color: "from-[#F9F9F9] to-white",
  },
  {
    id: "combo-3",
    brand: "MEDICUBE",
    name: "Special Pink Care Glow Ritual",
    price: 19900,
    originalPrice: 42500,
    discount: 53,
    badge: "Curated Set",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800",
    color: "from-[#FFF1F5] to-white",
  },
  {
    id: "combo-4",
    brand: "KSECRET",
    name: "Black Ginseng Revitalizing Trio",
    price: 2250,
    originalPrice: 4700,
    discount: 51,
    badge: "Exclusive",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800",
    color: "from-[#FFF8F0] to-white",
  },
];

const ComboCard = ({ combo, onNavigate }) => {
  const image = combo.image || getMediaUrl(combo.imageUrls?.[0] || combo.imageUrl);
  const discount = combo.discount || (combo.originalPrice > 0 ? Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100) : 0);

  return (
    <div className="flex flex-col group cursor-pointer group/card" onClick={() => onNavigate && onNavigate(combo.id)}>
      {/* Image Container with Badges */}
      <div
        className={`relative aspect-square rounded-[2px] overflow-hidden mb-6 bg-linear-to-br ${combo.color || "from-[#F9F9F9] to-white"} border border-stone-100 shadow-sm group-hover/card:shadow-md transition-all duration-700 transform-gpu optimize-gpu`}
      >
        <img
          src={image}
          alt={combo.name}
          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[1.2s] ease-out mix-blend-multiply opacity-90 group-hover/card:opacity-100 transform-gpu optimize-gpu"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-brand2 text-white text-[9px] font-[1000] px-3 py-1 rounded shadow-lg tracking-tighter uppercase transform -skew-x-12 border border-white/20">
            BEST VALUE
          </div>
          <div className="bg-white/95 px-2 py-1 rounded-[2px] text-[9px] font-black uppercase text-stone-800 border border-white/40 w-fit flex items-center gap-1 shadow-sm">
            <Clock size={10} className="text-pink-500" /> <span>Limited</span>
          </div>
        </div>

        {/* Exclusive Tag */}
        <div className="absolute top-6 right-6">
          <div className="px-3 py-1 bg-[#151515] text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-[2px] shadow-xl border border-white/10">
            {combo.badge || "Bundle"}
          </div>
        </div>

        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500">
          <div className="w-14 h-14 rounded-[2px] bg-white text-[#151515] flex items-center justify-center shadow-2xl scale-90 group-hover/card:scale-100 transition-transform">
            <Search size={20} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 px-2 flex-1 flex flex-col">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-[1000] text-stone-400 uppercase tracking-[0.3em]">
            {combo.brand || "Selection"}
          </span>
          <div className="h-px flex-1 bg-stone-50" />
        </div>

        <h3 className="text-[18px] font-[1000] text-[#151515] leading-tight line-clamp-2 h-[44px] tracking-tight group-hover/card:text-pink-600 transition-colors">
          {combo.name}
        </h3>

        <div className="pt-4 mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[12px] text-stone-300 font-bold line-through">
              ₹{(combo.originalPrice || 0).toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-[10px] font-[1000] text-brand2 uppercase tracking-tighter">
                Save {discount}%
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-semibold text-[#151515] tracking-tighter">
              ₹{(combo.price || 0).toLocaleString()}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onNavigate && onNavigate(combo.id);
              }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#151515] border-b-2 border-[#151515] pb-1 hover:text-pink-600 hover:border-pink-600 transition-all"
            >
              Shop bundle <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ComboSection({ onNavigate, products }) {
  const displayCombos = products && products.length > 0 ? products : FALLBACK_COMBOS;

  return (
    <section className="section pt-6 pb-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <div className="space-y-3">
            <span className="text-[10px] font-[1000] text-brand2 uppercase tracking-[0.5em] leading-none">
              THE ART OF THE BUNDLE
            </span>
            <h2 className="text-[48px] font-bold text-[#151515] tracking-tight leading-none uppercase">
              Value Bundles
            </h2>
            <p className="text-stone-400 text-sm font-medium">
              Limited-time signature rituals at curated pricing.
            </p>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate("shop")}
            className="px-10 py-4 rounded-[2px] border border-stone-200 text-[#151515] font-[1000] text-[10px] uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all shadow-sm"
          >
            View all Rituals
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {displayCombos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
}
