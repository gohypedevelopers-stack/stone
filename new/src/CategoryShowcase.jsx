import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "./components/card";

export default function CategoryShowcase({
   category = "Hair Care",
   bannerBigText = "Hair",
   bannerSmallText = "CARE",
   bannerColor = "from-stone-50 to-stone-100",
   bannerImage = "https://images.unsplash.com/photo-1522337660859-02fbefad157a?auto=format&fit=crop&w=800",
   products = []
}) {
   const navigate = useNavigate();
   return (
      <section className="section py-24 bg-white">
         <div className="max-w-[1440px] mx-auto px-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-12">
               <div className="flex flex-col">
                  <span className="text-[10px] font-[1000] text-brand2 uppercase tracking-[0.5em] mb-2 leading-none">CURATED SELECTION</span>
                  <h2 className="text-[44px] font-bold text-[#151515] tracking-tight leading-none uppercase">
                     {category}
                  </h2>
               </div>
               <button className="group flex items-center gap-3 px-8 py-3 rounded-lg border border-stone-200 text-[#151515] font-[1000] text-[10px] uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all shadow-sm">
                  <span>View collection</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>

            {/* Category Banner */}
            <div className={`w-full aspect-21/6 lg:aspect-21/4 rounded-2xl overflow-hidden relative group cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.06)] mb-16 border-12 border-[#FAFAFA] layer-isolate`}>
               <div className={`absolute inset-0 bg-linear-to-r ${bannerColor} opacity-20`} />

               <div className="absolute inset-0 flex items-center px-16 z-10">
                  <div className="group-hover:translate-x-4 transition-transform duration-1000 ease-out optimize-gpu">
                     <h3 className="text-5xl font-bold text-[#151515] tracking-tighter leading-none flex flex-col">
                        <span className="font-medium lowercase opacity-80">{bannerBigText}</span>
                        <span className="font-bold -mt-2 uppercase tracking-tighter block">{bannerSmallText}</span>
                     </h3>
                     <div className="mt-6 flex items-center gap-4">
                        <div className="h-px w-12 bg-[#151515]" />
                        <span className="text-[10px] font-[1000] uppercase tracking-[0.3em] text-[#151515]">Spring '25 ARRIVALS</span>
                     </div>
                  </div>
               </div>

               <div className="absolute right-0 top-0 bottom-0 w-2/3 overflow-hidden">
                  <img
                     src={bannerImage}
                     className="w-full h-full object-cover transform translate-x-12 group-hover:scale-105 transition-transform duration-[1.5s] ease-out optimize-gpu"
                     alt=""
                     loading="lazy"
                     decoding="async"
                  />
                  <div className="absolute inset-y-0 left-0 w-64 bg-linear-to-r from-[#FAFAFA] to-transparent" />
               </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
               {products.map(p => (
                  <div key={p.id} className="h-full">
                     <ProductCard product={p} onClick={() => navigate(`/product/${p.id}`)} />
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}
