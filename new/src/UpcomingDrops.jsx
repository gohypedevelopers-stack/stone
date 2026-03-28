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
                progress: 15,
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
            },
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
    },
    {
        id: "slot2",
        date: "26 Mar",
        time: "20:00",
        status: "Coming Soon",
        products: [
            {
                id: "p1-duplicate",
                name: "Sakura Silk Essence (Premium Edition)",
                description: "Unstoppable Radiance All Day - Skin Revitalizing Formula",
                image: imgG,
                price: 2499,
                originalPrice: 3499,
                reminders: 124,
                progress: 15,
            },
            {
                id: "p2-duplicate",
                name: "Lavender Sleeping Mask (Night Repair)",
                description: "Deep Hydration for Morning Glow - Limited Batch",
                image: imgJ,
                price: 1599,
                originalPrice: 1999,
                reminders: 89,
                progress: 45,
            },
            {
                id: "p3-duplicate",
                name: "Glass Skin Barrier Cream (Max)",
                description: "Fortify Your Skin Barrier - Advanced Ceramide Complex",
                image: imgH,
                price: 1850,
                originalPrice: 2200,
                reminders: 215,
                progress: 10,
            },
            {
                id: "p4-duplicate",
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
        <section className="py-24 px-4 bg-linear-to-br from-[#fdf6f9] via-[#f7f0ff] to-[#f0f7ff] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/40 rounded-full blur-[120px] -z-0" />

            <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
                {/* Header Title */}
                <div className="mb-16 px-2 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="text-pink-400" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Limited Release</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-[#151515] tracking-tighter leading-[0.85] uppercase">
                        Upcoming <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1] italic">Drops</span>
                    </h2>
                </div>

                {/* Time Slot Tabs - Neumorphic Style */}
                <div className="flex gap-6 mb-12 overflow-x-auto no-scrollbar pb-4 px-2">
                    {MOCK_TIME_SLOTS.map((slot) => {
                        const isActive = activeSlotId === slot.id;
                        return (
                            <button
                                key={slot.id}
                                onClick={() => setActiveSlotId(slot.id)}
                                className={`flex-1 min-w-[200px] rounded-[32px] p-6 transition-all duration-500 border-2 h-[120px] flex flex-col items-center justify-center gap-1 relative overflow-hidden group
                                    ${isActive
                                        ? 'bg-white border-white shadow-[10px_10px_30px_rgba(0,0,0,0.05)] scale-[1.02]'
                                        : 'bg-white/30 border-white/50 text-stone-400 hover:bg-white/50'
                                    }
                                `}
                            >
                                <span className={`text-[12px] font-bold uppercase tracking-widest ${isActive ? 'text-pink-500' : 'opacity-60'}`}>{slot.date}</span>
                                <span className={`text-4xl font-black leading-none ${isActive ? 'text-stone-900' : 'text-stone-300'}`}>
                                    {slot.time}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-pink-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Product Section - Neumorphic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {activeSlot.products.map((product) => (
                        <React.Fragment key={product.id}>
                            {/* --- MOBILE LAYOUT --- */}
                            <div className="md:hidden bg-white/80 backdrop-blur-xl rounded-[32px] p-4 flex gap-5 items-center shadow-[10px_10px_30px_rgba(0,0,0,0.03)] border border-white/50">
                                <div className="w-[100px] h-[100px] flex-shrink-0 relative rounded-[24px] overflow-hidden bg-white shadow-inner">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[14px] font-black text-stone-900 leading-tight mb-1 uppercase tracking-tight">{product.name}</h3>
                                    <p className="text-[11px] text-stone-400 font-medium mb-3 line-clamp-1 italic">{product.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[20px] font-semibold text-[#151515]">₹{product.price.toLocaleString()}</span>
                                        <button className="bg-stone-900 text-white h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest">Remind</button>
                                    </div>
                                </div>
                            </div>

                            {/* --- DESKTOP LAYOUT (Neumorphic) --- */}
                            <div className="hidden md:flex flex-col bg-[#fcfcfc] rounded-[48px] p-6 shadow-[20px_20px_60px_#e3e3e3,-20px_-20px_60px_#ffffff] border border-white hover:shadow-[30px_30px_80px_#dbdbdb,-30px_-30px_80px_#ffffff] transition-all duration-700 group relative">
                                <div className="relative aspect-square rounded-[38px] overflow-hidden bg-white mb-8 shadow-inner group-hover:scale-[1.02] transition-transform duration-700">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />

                                    {/* Trending Badge */}
                                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl shadow-stone-200/50 border border-white">
                                        <TrendingUp size={18} className="text-pink-500" />
                                    </div>
                                </div>

                                <div className="px-2 pb-2 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-stone-900 leading-[1.1] mb-2 uppercase tracking-tight group-hover:text-pink-500 transition-colors">{product.name}</h3>
                                    <p className="text-[13px] text-stone-400 font-light mb-8 line-clamp-2 italic">{product.description}</p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-stone-300 line-through leading-none mb-1">₹{product.originalPrice.toLocaleString()}</span>
                                            <span className="text-[20px] font-semibold text-[#151515] leading-none tracking-tighter">₹{product.price.toLocaleString()}</span>
                                        </div>
                                        <button className="bg-stone-900 text-white px-8 h-[50px] rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-pink-500 hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-pink-200/50 flex items-center gap-2.5">
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
