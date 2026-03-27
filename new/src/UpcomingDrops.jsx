import React, { useState, useMemo } from "react";
import { Bell, Clock, Info, Share2, Sparkles, TrendingUp } from "lucide-react";

// Updated mock data to support time slots and social proof
const MOCK_TIME_SLOTS = [
    {
        id: "slot1",
        date: "26 Mar",
        time: "10:00",
        status: "Coming Soon",
        products: [
            {
                id: "p1",
                name: "Sakura Silk Essence (Premium Edition)",
                description: "Unstoppable Radiance All Day - Skin Revitalizing Formula",
                image: imgG,
                price: 2499,
                originalPrice: 3499,
                reminders: 124,
                progress: 15, // % of reminders filled
            },
            {
                id: "p2",
                name: "Lavender Sleeping Mask (Night Repair)",
                description: "Deep Hydration for Morning Glow - Limited Batch",
                image: imgJ,
                price: 1599,
                originalPrice: 1999,
                reminders: 89,
                progress: 45,
            }
        ]
    },
    {
        id: "slot2",
        date: "26 Mar",
        time: "20:00",
        status: "Coming Soon",
        products: [
            {
                id: "p3",
                name: "Glass Skin Barrier Cream (Max)",
                description: "Fortify Your Skin Barrier - Advanced Ceramide Complex",
                image: imgH,
                price: 1850,
                originalPrice: 2200,
                reminders: 215,
                progress: 10,
            },
            {
                id: "p4",
                name: "Rose Quartz Roller Set (Heritage)",
                description: "Ancient Cooling Therapy - 100% Authentic Stone",
                image: imgI,
                price: 3200,
                originalPrice: 4500,
                reminders: 56,
                progress: 60,
            }
        ]
    }
];

import imgG from "./assets/COMINGSOON/G.jpg";
import imgH from "./assets/COMINGSOON/H.jpg";
import imgI from "./assets/COMINGSOON/I.jpg";
import imgJ from "./assets/COMINGSOON/J.jpg";

export default React.memo(function UpcomingDrops({ onNavigate }) {
    const [activeSlotId, setActiveSlotId] = useState(MOCK_TIME_SLOTS[0].id);

    const activeSlot = useMemo(() => 
        MOCK_TIME_SLOTS.find(s => s.id === activeSlotId), 
    [activeSlotId]);

    return (
        <section className="py-20 px-4 bg-[#fff1f7]/50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-100/30 rounded-full blur-[100px] -z-0" />
            
            <div className="max-w-[1000px] mx-auto relative z-10">
                {/* Header Title */}
                <div className="mb-12 px-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-pink-500" size={24} />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-pink-600">Flash Event</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold text-[#151515] tracking-tight leading-[0.85] uppercase">
                        Limited Time <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500">
                            Drops
                        </span>
                    </h2>
                </div>

                {/* Time Slot Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
                    {MOCK_TIME_SLOTS.map((slot) => {
                        const isActive = activeSlotId === slot.id;
                        return (
                            <button
                                key={slot.id}
                                onClick={() => setActiveSlotId(slot.id)}
                                className={`flex-1 min-w-[180px] rounded-2xl p-4 transition-all duration-300 border h-[110px] flex flex-col items-center justify-center gap-1 relative overflow-hidden group
                                    ${isActive 
                                        ? 'bg-linear-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-lg shadow-pink-200' 
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-pink-300'
                                    }
                                `}
                            >
                                <span className={`text-[14px] font-medium ${isActive ? 'opacity-90' : 'opacity-80'}`}>{slot.date}</span>
                                <span className={`text-3xl font-black leading-none ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                    {slot.time}
                                </span>
                                <span className="text-[12px] font-bold opacity-80 uppercase tracking-wide">
                                    {slot.status}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 right-0 p-2 opacity-20">
                                        <Clock size={40} className="rotate-12" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Product Section - Adaptive Layout */}
                <div className="md:grid md:grid-cols-3 lg:grid-cols-3 gap-8 space-y-4 md:space-y-0">
                    {activeSlot.products.map((product) => (
                        <React.Fragment key={product.id}>
                            {/* --- MOBILE LAYOUT (Horizontal Row) --- */}
                            <div className="md:hidden bg-white rounded-[24px] p-3 flex gap-4 items-center border border-pink-50/50 shadow-sm relative overflow-hidden">
                                <div className="w-[110px] h-[110px] flex-shrink-0 relative">
                                    <div className="w-full h-full rounded-[18px] overflow-hidden bg-stone-50 border border-gray-50">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -top-1 -left-1 bg-white text-pink-600 p-1.5 rounded-lg shadow-md border border-pink-50">
                                        <TrendingUp size={12} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[13px] font-black text-gray-900 leading-tight mb-1 truncate">{product.name}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium mb-3 line-clamp-1">{product.description}</p>
                                    
                                    <div className="w-full h-[4px] bg-gray-100 rounded-full mb-2 overflow-hidden">
                                        <div className="h-full bg-linear-to-r from-pink-400 to-purple-600 rounded-full" style={{ width: `${product.progress}%` }} />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-black text-gray-900 leading-none">₹{product.price.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                        </div>
                                        <button className="bg-[#151515] text-white h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <Bell size={10} /> Remind
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* --- DESKTOP LAYOUT (Vertical Grid Card) --- */}
                            <div className="hidden md:flex flex-col bg-white rounded-[40px] p-4 border border-pink-50/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 group relative">
                                <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-stone-50 mb-6">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-pink-600 p-3 rounded-2xl shadow-xl shadow-pink-100/50 border border-pink-50">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="bg-white/90 backdrop-blur-md p-4 rounded-[24px] border border-white/50 shadow-xl">
                                            <div className="w-full h-[6px] bg-pink-50/50 rounded-full mb-2 overflow-hidden">
                                                <div className="h-full bg-linear-to-r from-pink-400 via-purple-500 to-indigo-600 transition-all duration-1000" style={{ width: `${product.progress}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex -space-x-1.5">
                                                    {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-pink-100" />)}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">{product.reminders} Reminders</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2 pb-4 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 uppercase group-hover:text-pink-600 transition-colors">{product.name}</h3>
                                    <p className="text-[13px] text-gray-500 font-medium mb-6 line-clamp-2">{product.description}</p>
                                    
                                    <div className="mt-auto flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                            <span className="text-2xl font-black text-gray-900 leading-none">₹{product.price.toLocaleString()}</span>
                                        </div>
                                        <button className="bg-[#151515] text-white px-8 h-[54px] rounded-full text-xs font-black uppercase tracking-widest hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-pink-200 flex items-center gap-2">
                                            <Bell size={16} /> Remind Me
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* Empty State */}
                {activeSlot.products.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-pink-100 flex flex-col items-center gap-4">
                        <Clock size={48} className="text-pink-100" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No drops remaining for this slot</p>
                    </div>
                )}
            </div>
        </section>
    );
});
