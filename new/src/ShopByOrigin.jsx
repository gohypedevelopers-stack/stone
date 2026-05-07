import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./components/card";
import { SERVER_URL } from "./utils/api";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

// Product images
import kp1 from "./assets/products/hydra_barrier.png"; // Using available product image

const DEFAULT_ORIGINS = [
   {
      id: "korean",
      name: "Korean",
      title: "K-Beauty Rituals",
      subtitle: "Experience the glass skin glow with our curated Korean skincare selection.",
      heroImage: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=1200",
      productIds: [],
      sourceMode: "Automatic"
   },
   {
      id: "japanese",
      name: "Japanese",
      title: "J-Beauty Precision",
      subtitle: "Timeless craftsmanship and purity from the heart of Japan.",
      heroImage: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&q=80&w=1200",
      productIds: [],
      sourceMode: "Automatic"
   },
   {
      id: "indian",
      name: "Indian",
      title: "Ayurvedic Wisdom",
      subtitle: "Ancient botanical heritage meeting modern science.",
      heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
      productIds: [],
      sourceMode: "Automatic"
   },
   {
      id: "us",
      name: "US",
      title: "American Innovation",
      subtitle: "Science-led clinical efficacy and research-backed formulas.",
      heroImage: "https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?auto=format&fit=crop&q=80&w=1200",
      productIds: [],
      sourceMode: "Automatic"
   },
   {
      id: "international",
      name: "International",
      title: "Global Selection",
      subtitle: "The world's finest curators and niche beauty discoveries.",
      heroImage: "https://images.unsplash.com/photo-1498842812179-c81beecf902c?auto=format&fit=crop&q=80&w=1200",
      productIds: [],
      sourceMode: "Automatic"
   }
];

export default function ShopByOrigin({ settings, products: ALL_PRODUCTS = [] }) {
   const navigate = useNavigate();
   
    // Helper for fuzzy origin matching
    const getNormalizedOrigin = (name) => {
      if (!name) return "";
      const n = name.toLowerCase().trim();
      if (n === "korean" || n === "korea") return "korea";
      if (n === "japanese" || n === "japan") return "japan";
      if (n === "indian" || n === "india") return "india";
      if (n === "us" || n === "usa" || n === "united states" || n === "american") return "usa";
      return n;
    };

    // Normalize origins data
    const origins = React.useMemo(() => {
      const raw = settings?.origins && settings.origins.length > 0 ? settings.origins : DEFAULT_ORIGINS;
      return raw.map(o => {
        let productList = [];
        
        if (o.sourceMode === "Automatic") {
          // Dynamic Filtering Logic
          const targetOrigin = getNormalizedOrigin(o.name);
          const originNameLower = o.name.toLowerCase();

          productList = ALL_PRODUCTS.filter(p => {
            // Explicit match
            if (p.origin && getNormalizedOrigin(p.origin) === targetOrigin) return true;
            
            // Fallback match
            const pName = p.name?.toLowerCase() || "";
            const pBrand = p.brand?.toLowerCase() || "";
            const pCategory = (typeof p.category === 'string' ? p.category : p.category?.name || "").toLowerCase();
            const pTag = p.tag?.toLowerCase() || "";

            return pName.includes(targetOrigin) || pName.includes(originNameLower) ||
                   pBrand.includes(targetOrigin) || pBrand.includes(originNameLower) ||
                   pCategory.includes(targetOrigin) || pCategory.includes(originNameLower) ||
                   pTag.includes(targetOrigin) || pTag.includes(originNameLower);
          }).map(found => ({
             ...found,
             id: found.id,
             brand: found.brand || "OMW",
             name: found.name,
             price: Number(found.price),
             originalPrice: Number(found.originalPrice || found.price),
             discount: found.discount || 0,
             image: getMediaUrl(found.image || (found.imageUrls && found.imageUrls[0]) || "")
          }));
        } else {
          // Manual Selection Logic (Existing)
          productList = (o.productIds || []).map(pid => {
            const found = ALL_PRODUCTS.find(p => String(p.id) === String(pid));
            if (found) {
              return {
                ...found,
                id: found.id,
                brand: found.brand || "OMW",
                name: found.name,
                price: Number(found.price),
                originalPrice: Number(found.originalPrice || found.price),
                discount: found.discount || 0,
                image: getMediaUrl(found.image || (found.imageUrls && found.imageUrls[0]) || "")
              };
            }
            // Fallback for hardcoded IDs if they don't match database IDs yet
            if (pid === "k1") return { id: "k1", brand: "NUMBUZIN", name: "[Numbuzin] No.9 NAD Bio Lifting Essence 50ml", price: 1650, originalPrice: 2750, discount: 40, image: kp1 };
            return null;
          }).filter(Boolean);
        }

        // Handle Custom Products (Manual entries that are NOT in inventory)
        const customList = (o.customProducts || []).map(cp => {
           const regPrice = Number(String(cp.price || "0").replace(/[^0-9.]/g, ''));
           const salePrice = cp.discountPrice ? Number(String(cp.discountPrice).replace(/[^0-9.]/g, '')) : regPrice;
           const hasDiscount = salePrice > 0 && salePrice < regPrice;
           
           return {
              ...cp,
              id: cp.id,
              brand: cp.brand || "OMW Choice",
              name: cp.name,
              price: salePrice,
              originalPrice: regPrice,
              discount: hasDiscount ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 0,
              image: getMediaUrl(cp.image),
              isCustom: true
           };
        });

        const combinedProducts = [...productList, ...customList];

        // Fallback for legacy "products" array in origin if combinedProducts is empty
        const legacyProducts = (o.products || []).map(p => ({
          ...p,
          image: getMediaUrl(p.image || kp1)
        }));

        return {
          ...o,
          products: combinedProducts.length > 0 ? combinedProducts : legacyProducts,
           totalCount: combinedProducts.length || legacyProducts.length || 0
        };
      });
    }, [settings, ALL_PRODUCTS]);

   const [activeOrigin, setActiveOrigin] = useState(origins[0]);
   const [constraints, setConstraints] = useState({ left: 0, right: 0 });
   const containerRef = useRef(null);
   const contentRef = useRef(null);

   // Sync active origin if origins change (e.g. settings saved)
   useEffect(() => {
     const currentActive = origins.find(o => o.id === activeOrigin?.id) || origins[0];
     setActiveOrigin(currentActive);
   }, [origins]);

   useEffect(() => {
      const updateConstraints = () => {
         if (containerRef.current && contentRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const contentWidth = contentRef.current.scrollWidth;
            setConstraints({ left: -(contentWidth - containerWidth + 64), right: 0 });
         }
      };

      updateConstraints();
      window.addEventListener("resize", updateConstraints);
      const timeout = setTimeout(updateConstraints, 500); 
      return () => {
         window.removeEventListener("resize", updateConstraints);
         clearTimeout(timeout);
      };
   }, [activeOrigin, activeOrigin?.products?.length]);

   if (!activeOrigin) return null;

   return (
      <section className="section py-16 md:py-24 bg-white scroll-mt-24 md:scroll-mt-32">
         <div className="max-w-[1440px] mx-auto px-4 md:px-6">

            {/* Pills Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16">
                <div className="flex flex-col">
                   <span className="text-[9px] md:text-[10px] font-black text-[#ff3b8f] uppercase tracking-[0.4em] mb-2 md:mb-3 leading-none animate-in fade-in slide-in-from-bottom-2 duration-700">CURATED ORIGINS</span>
                   <h2 className="text-3xl md:text-[48px] font-black text-[#151515] tracking-tighter uppercase leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">Shop By Origin</h2>
                </div>
               
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-2 px-2 md:mx-0 md:px-0">
                  {origins.map(origin => (
                     <button
                        key={origin.id}
                        onClick={() => {
                           if (activeOrigin.id === origin.id) {
                             navigate(`/shop?origin=${origin.name}`);
                           } else {
                             setActiveOrigin(origin);
                           }
                         }}
                        className={`px-6 md:px-7 py-2.5 md:py-3 rounded-lg text-[10px] md:text-[11px] font-black transition-all duration-500 whitespace-nowrap border uppercase tracking-widest
                    ${activeOrigin.id === origin.id
                               ? "bg-[#151515] border-[#151515] text-white shadow-xl shadow-stone-200"
                               : "bg-white border-stone-100 text-stone-400 hover:border-stone-300 hover:text-stone-900"}`}
                     >
                        {origin.name}
                     </button>
                  ))}
               </div>
            </div>

            {/* Hero + Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16">
               {/* Left Hero Card */}
               <div 
                  onClick={() => navigate(`/shop?origin=${activeOrigin.name}`)}
                  className="lg:col-span-5 group/hero cursor-pointer lg:h-full"
               >
                  <div className="relative aspect-[4/5] lg:h-full min-h-[350px] md:min-h-[550px] rounded-2xl overflow-hidden shadow-2xl shadow-stone-200 transition-all duration-1000 transform group-hover/hero:translate-y-[-8px]">
                     <img
                        src={getMediaUrl(activeOrigin.heroImage)}
                        alt={activeOrigin.title}
                        className="w-full h-full object-cover group-hover/hero:scale-110 transition-transform duration-[2s] ease-out transform-gpu optimize-gpu"
                        draggable={false}
                        loading="lazy"
                      />
                     <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-80" />

                     <div className="absolute bottom-10 md:bottom-12 left-0 right-0 text-center text-white px-6 md:px-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff3b8f] mb-4 md:mb-5 block opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700">GLOBAL CHOICE</span>
                        <h3 className="text-3xl md:text-[48px] font-bold tracking-tight mb-4 md:mb-5 leading-none group-hover/hero:scale-105 transition-transform duration-1000 uppercase">{activeOrigin.title}</h3>
                        <div className="w-10 md:w-12 h-px bg-white/30 mx-auto mb-4 md:mb-5" />
                        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white/60 leading-relaxed max-w-[280px] mx-auto">{activeOrigin.subtitle}</p>
                     </div>


                  </div>
               </div>

               {/* Right Product Grid */}
               <div className="lg:col-span-7 flex flex-col justify-between h-full bg-[#FAFAFA]/40 p-1 md:p-8 rounded-2xl border border-stone-100/50">
                  <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-2 py-4" ref={containerRef}>
                     <motion.div 
                        ref={contentRef}
                        className="flex gap-6 w-max"
                        drag="x"
                        dragConstraints={constraints}
                        dragElastic={0.1}
                        dragTransition={{ power: 0.3, bounceStiffness: 200, bounceDamping: 20 }}
                        whileTap={{ cursor: "grabbing" }}
                     >
                        {activeOrigin.products?.length > 0 ? (
                           activeOrigin.products.map(p => (
                              <div key={p.id} className="w-[280px] flex-none animate-in fade-in zoom-in-95 duration-700 drop-shadow-sm">
                                 <ProductCard 
                                    product={p} 
                                    onClick={() => {
                                      if (p.isCustom) {
                                        navigate(`/ritual/${p.id}`);
                                      } else {
                                        navigate(`/product/${p.id}`);
                                      }
                                    }} 
                                 />
                              </div>
                           ))
                        ) : (
                           <div className="flex flex-col items-center justify-center w-[280px] md:w-[500px] min-h-[440px] rounded-xl border-2 border-dashed border-stone-200 bg-white/80 group/empty shadow-inner">
                              <div className="w-20 h-20 rounded-2xl bg-stone-50 flex items-center justify-center mb-6 overflow-hidden border border-stone-100">
                                 <div className="w-12 h-12 bg-stone-200 rounded-full opacity-30 animate-pulse" />
                              </div>
                              <p className="text-[#151515] font-black uppercase tracking-[0.5em] text-[11px] mb-2">Coming Soon</p>
                              <p className="text-stone-400 text-[12px] font-medium text-center px-12">New architectural drops from {activeOrigin.name} arriving next week.</p>
                           </div>
                        )}
                        <div className="w-32 shrink-0" /> {/* Extra padding for the last card */}
                     </motion.div>
                  </div>

                  {/* View All Footer */}
                  <div className="pt-10 border-t border-stone-200/50 flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
                     <div className="flex flex-col max-md:text-center">
                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] leading-none mb-3">Curated Collections from {activeOrigin.name}</span>
                        <p className="text-[#151515] font-black text-[18px] tracking-tight">Discover {activeOrigin.totalCount || 0}+ handcrafted beauty rituals.</p>
                     </div>
                     <button 
                        onClick={() => navigate(`/shop?origin=${activeOrigin.name}`)}
                        className="relative px-14 py-5 rounded-lg bg-[#151515] text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#ff3b8f] hover:translate-y-[-2px] transition-all duration-500 shadow-xl shadow-stone-200 active:scale-95 group"
                     >
                        <span className="flex items-center gap-4">
                           Explore All <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-500" />
                        </span>
                     </button>
                  </div>
               </div>
            </div>

         </div>
      </section>
   );
}
