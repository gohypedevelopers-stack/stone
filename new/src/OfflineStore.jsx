import React from "react";
import { MapPin, ChevronRight, ExternalLink, Navigation } from "lucide-react";

export default function OfflineStore() {
   const stores = [
      {
         name: "Ontario Mills Boutique",
         address: "1 Mills Cir. Ste 503A. Ontario, CA 91764. Located at Ontario Mills",
         active: true,
         distance: "1.2 km away"
      },
      {
         name: "Outlets at Orange – Coming Soon",
         address: "20 City Blvd W, Orange, CA 92868, United States",
         active: false,
         distance: null
      }
   ];

   return (
      <section className="py-24 bg-[#F8F9FA]">
         <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

               {/* Left Column: Store List */}
               <div className="lg:col-span-5 space-y-12">
                  <div className="space-y-4">
                     <span className="text-[10px] font-[1000] text-brand2 uppercase tracking-[0.5em] leading-none">VISIT US IN PERSON</span>
                     <h2 className="text-[52px] font-serif font-medium italic text-[#151515] tracking-tight leading-none lowercase">
                        Offline Store
                     </h2>
                  </div>

                  <div className="space-y-6 relative pl-8 border-l border-stone-100">
                     {stores.map((store, idx) => (
                        <div key={idx} className="relative group">
                           {/* Active vertical line indicator */}
                           {store.active && (
                              <div className="absolute -left-[33px] top-0 bottom-0 w-1.5 bg-brand2 rounded-full shadow-[0_0_15px_rgba(255,93,177,0.3)] transition-all" />
                           )}

                           <div className={`p-8 rounded-[40px] transition-all duration-700 ${store.active ? 'bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-50' : 'opacity-40 grayscale'}`}>
                              <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-xl font-serif font-bold text-[#151515]">
                                    {store.name}
                                 </h3>
                                 {store.distance && (
                                    <span className="text-[9px] font-[1000] text-brand2 bg-brand2/10 px-2 py-1 rounded uppercase tracking-tighter">
                                       {store.distance}
                                    </span>
                                 )}
                              </div>
                              <p className="text-sm leading-relaxed text-stone-500 font-medium max-w-[80%]">
                                 {store.address}
                              </p>

                              {store.active && (
                                 <div className="mt-8 flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-[10px] font-[1000] text-[#151515] uppercase tracking-widest border-b-2 border-[#151515] pb-1 hover:text-brand2 hover:border-brand2 transition-all">
                                       Get Directions <Navigation size={12} />
                                    </button>
                                    <button className="flex items-center gap-2 text-[10px] font-[1000] text-stone-400 uppercase tracking-widest hover:text-[#151515] transition-all pb-1">
                                       View Boutique info <ChevronRight size={14} />
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Right Column: Hero Card */}
               <div className="lg:col-span-7 h-full">
                  <div className="bg-white rounded-[56px] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] border border-stone-50 flex flex-col md:flex-row h-full min-h-[500px] group/hero relative border-[12px] border-white">

                     {/* Person Image */}
                     <div className="md:w-2/5 relative h-[400px] md:h-auto overflow-hidden">
                        <img
                           src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200"
                           alt="Boutique"
                           className="w-full h-full object-cover group-hover/hero:scale-110 transition-transform duration-[2s] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/hero:opacity-100 transition-opacity" />
                     </div>

                     {/* Store Details Content */}
                     <div className="md:w-3/5 p-12 lg:p-16 flex flex-col justify-between">
                        <div>
                           <span className="text-[10px] font-[1000] text-brand2 uppercase tracking-[0.4em] mb-4 block">SELECT BOUTIQUE SHOP</span>
                           <h4 className="text-3xl font-serif font-medium italic text-[#151515] tracking-tight mb-2 leading-none">
                              The Art of Selection
                           </h4>
                           <span className="text-[64px] font-[1000] text-[#151515] tracking-[1.5px] uppercase block leading-none mt-2">
                              mol<span className="text-pink-600 italic">da</span>
                           </span>
                        </div>

                        {/* Small Store Mini-Gallery */}
                        <div className="space-y-6">
                           <p className="text-[13px] font-medium text-stone-400 leading-relaxed max-w-[90%]">Experience our curated collections in a space designed for discovery, featuring exclusive in-store rituals and expert consultations.</p>
                           <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                              <div className="flex-none w-32 aspect-square rounded-[24px] overflow-hidden shadow-lg border-4 border-white group/thumb hover:scale-105 transition-transform duration-500">
                                 <img src="https://images.unsplash.com/photo-1555529771-7888783a18d3?auto=format&fit=crop&w=400" alt="Boutique Interior" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-none w-32 aspect-square rounded-[24px] overflow-hidden shadow-lg border-4 border-white group/thumb hover:scale-105 transition-transform duration-500">
                                 <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400" alt="Boutique Details" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-none w-32 aspect-square rounded-[24px] bg-[#FAFAFA] flex items-center justify-center text-stone-300 border-4 border-white shadow-lg pointer-events-none">
                                 <MapPin size={24} />
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-[1000] uppercase tracking-[0.2em] text-[#151515] pt-10 mt-auto border-t border-stone-50">
                           <span>Global Partner Network</span>
                           <div className="h-px w-8 bg-stone-200" />
                           <span className="text-stone-300">USA • KOREA • JAPAN</span>
                        </div>
                     </div>

                  </div>
               </div>

            </div>
         </div>
      </section>
   );
}
