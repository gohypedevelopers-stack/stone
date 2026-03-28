import React, { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./components/card";

// Product images
import kp1 from "./assets/products/hydra_barrier.png"; // Using available product image

const ORIGINS = [
   {
      id: "korean",
      name: "Korean",
      title: "K-Beauty Rituals",
      subtitle: "Experience the glow of Seoul",
      heroImage: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=1200",
      products: [
         { id: "k1", brand: "NUMBUZIN", name: "[Numbuzin] No.9 NAD Bio Lifting Essence 50ml", price: 1650, originalPrice: 2750, discount: 40, image: kp1 },
         { id: "k2", brand: "CELIMAX", name: "[celimax] THE Vita-A Retinal Shot Tightening Booster 15ml", price: 1590, originalPrice: 1980, discount: 20, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400" },
         { id: "k3", brand: "BEAUTY OF JOSEON", name: "[Beauty of Joseon] Revive Eye Serum : Ginseng + Retinal 30ml", price: 1130, originalPrice: 1400, discount: 20, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400" }
      ]
   },
   {
      id: "japanese",
      name: "Japanese",
      title: "J-Beauty Precision",
      subtitle: "Timeless craftsmanship and purity",
      heroImage: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&q=80&w=1200",
      products: []
   },
   {
      id: "indian",
      name: "Indian",
      title: "Ayurvedic Wisdom",
      subtitle: "Ancient botanical heritage",
      heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
      products: []
   },
   {
      id: "us",
      name: "US",
      title: "American Innovation",
      subtitle: "Science-led clinical efficacy",
      heroImage: "https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?auto=format&fit=crop&q=80&w=1200",
      products: []
   },
   {
      id: "international",
      name: "International",
      title: "Global Selection",
      subtitle: "The world's finest curators",
      heroImage: "https://images.unsplash.com/photo-1498842812179-c81beecf902c?auto=format&fit=crop&q=80&w=1200",
      products: []
   }
];

export default function ShopByOrigin() {
   const [activeOrigin, setActiveOrigin] = useState(ORIGINS[0]);
   const [constraints, setConstraints] = useState({ left: 0, right: 0 });
   const containerRef = useRef(null);
   const contentRef = useRef(null);

   useEffect(() => {
      const updateConstraints = () => {
         if (containerRef.current && contentRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const contentWidth = contentRef.current.scrollWidth;
            // Calculate how far we can drag. contentWidth - containerWidth is the overflow.
            setConstraints({ left: -(contentWidth - containerWidth + 64), right: 0 });
         }
      };

      updateConstraints();
      window.addEventListener("resize", updateConstraints);
      // Update after a short delay to ensure DOM is rendered
      const timeout = setTimeout(updateConstraints, 300); 
      return () => {
         window.removeEventListener("resize", updateConstraints);
         clearTimeout(timeout);
      };
   }, [activeOrigin, activeOrigin.products.length]);

   return (
      <section className="section py-24 bg-white">
         <div className="max-w-[1440px] mx-auto px-6">

            {/* Pills Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#ff3b8f] uppercase tracking-[0.4em] mb-3 leading-none animate-in fade-in slide-in-from-bottom-2 duration-700">CURATED ORIGINS</span>
                  <h2 className="text-[48px] font-black text-[#151515] tracking-tighter uppercase leading-none animate-in fade-in slide-in-from-bottom-4 duration-1000">Shop By Origin</h2>
               </div>
               
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                  {ORIGINS.map(origin => (
                     <button
                        key={origin.id}
                        onClick={() => setActiveOrigin(origin)}
                        className={`px-7 py-3 rounded-lg text-[11px] font-black transition-all duration-500 whitespace-nowrap border uppercase tracking-widest
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
               {/* Left Hero Card */}
               <div className="lg:col-span-5 group/hero cursor-pointer h-full">
                  <div className="relative aspect-[4/5] h-full min-h-[550px] rounded-2xl overflow-hidden shadow-2xl shadow-stone-200 transition-all duration-1000 transform group-hover/hero:translate-y-[-8px]">
                     <img
                        src={activeOrigin.heroImage}
                        alt={activeOrigin.title}
                        className="w-full h-full object-cover group-hover/hero:scale-110 transition-transform duration-[2s] ease-out transform-gpu optimize-gpu"
                        draggable={false}
                        loading="lazy"
                      />
                     <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-80" />

                     <div className="absolute bottom-12 left-0 right-0 text-center text-white px-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff3b8f] mb-5 block opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700">GLOBAL CHOICE</span>
                        <h3 className="text-[48px] font-bold tracking-tight mb-5 leading-none group-hover/hero:scale-105 transition-transform duration-1000">{activeOrigin.title}</h3>
                        <div className="w-12 h-px bg-white/30 mx-auto mb-5" />
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 leading-relaxed max-w-[280px] mx-auto">{activeOrigin.subtitle}</p>
                     </div>

                     <div className="absolute top-10 right-10 w-20 h-20 rounded-full border border-white/10 bg-white/10 flex items-center justify-center text-white/90 group-hover/hero:rotate-12 group-hover/hero:scale-110 shadow-2xl transition-all duration-700 transform-gpu optimize-gpu">
                        <div className="text-[9px] font-black text-center leading-tight uppercase tracking-widest opacity-60">Global<br />Curated</div>
                     </div>
                  </div>
               </div>

               {/* Right Product Grid */}
               <div className="lg:col-span-7 flex flex-col justify-between h-full bg-[#FAFAFA]/40 p-8 rounded-2xl border border-stone-100/50">
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
                        {activeOrigin.products.length > 0 ? (
                           activeOrigin.products.map(p => (
                              <div key={p.id} className="w-[280px] flex-none animate-in fade-in zoom-in-95 duration-700 drop-shadow-sm">
                                 <ProductCard product={p} />
                              </div>
                           ))
                        ) : (
                           <div className="flex flex-col items-center justify-center w-full min-h-[440px] rounded-xl border-2 border-dashed border-stone-200 bg-white/80 group/empty shadow-inner">
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
                        <p className="text-[#151515] font-black text-[18px] tracking-tight">Discover {activeOrigin.products.length || 0}+ handcrafted beauty rituals.</p>
                     </div>
                     <button className="relative px-14 py-5 rounded-lg bg-[#151515] text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#ff3b8f] hover:translate-y-[-2px] transition-all duration-500 shadow-xl shadow-stone-200 active:scale-95 group">
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
