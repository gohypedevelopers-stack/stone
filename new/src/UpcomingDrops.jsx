import React, { useState, useMemo } from "react";
import { Bell, Clock, Info, Share2, Sparkles, TrendingUp, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <section className="section py-8 px-4 bg-linear-to-br from-[#fdf6f9] via-[#f7f0ff] to-[#f0f7ff] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/40 rounded-full blur-[120px] -z-0" />

            <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
                {/* Header Title */}
                <div className="mb-6 px-2 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="text-pink-400" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Limited Release</span>
                    </div>
                    <h2 className="text-4xl font-semibold text-[#151515] tracking-tight leading-tight uppercase">
                        Upcoming <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1]">Drops</span>
                    </h2>
                </div>

                {/* Time Slot Switcher - Sleek Pill Design with Motion */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/80 p-1.5 rounded-full border border-white/80 shadow-sm flex items-center relative gap-1">
                        {MOCK_TIME_SLOTS.map((slot) => {
                            const isActive = activeSlotId === slot.id;
                            const isMorning = slot.time.startsWith("10");
                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => setActiveSlotId(slot.id)}
                                    className={`relative px-8 py-3 rounded-full transition-all duration-500 flex items-center gap-3
                                        ${isActive ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-3">
                                        {isMorning ? (
                                            <Sun size={18} className={isActive ? 'text-orange-400' : ''} />
                                        ) : (
                                            <Moon size={18} className={isActive ? 'text-indigo-400' : ''} />
                                        )}
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[10px] font-black uppercase tracking-widest mb-0.5">{slot.date}</span>
                                            <span className="text-sm font-bold">{slot.time}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Product Section - Animated Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSlotId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="contents"
                        >
                            {activeSlot.products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.5 }}
                                    className="flex flex-col h-full"
                                >
                                    {/* --- MOBILE LAYOUT --- */}
                                    <div className="md:hidden bg-white/95 rounded-[32px] p-4 flex gap-5 items-center shadow-sm border border-white/50">
                                        <div className="w-[100px] h-[100px] flex-shrink-0 relative rounded-[24px] overflow-hidden bg-white shadow-inner">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-stone-900 leading-tight mb-1 uppercase tracking-tight">{product.name}</h3>
                                            <p className="text-[12px] text-stone-400 font-medium mb-3 line-clamp-1">{product.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[20px] font-semibold text-[#151515]">₹{product.price.toLocaleString()}</span>
                                                <button className="bg-stone-900 text-white h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest">Remind</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- DESKTOP LAYOUT (Glass-Modern) --- */}
                                    <div className="hidden md:flex flex-col h-full bg-white/60 rounded-[40px] p-6 shadow-sm border border-white/60 hover:shadow-md hover:bg-white/90 transition-all duration-700 group relative overflow-hidden layer-isolate">
                                        {/* Soft Glow Accent */}
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl group-hover:bg-pink-300/30 transition-colors duration-1000" />
                                        
                                        <div className="relative aspect-square rounded-[32px] overflow-hidden bg-white mb-6 shadow-inner group-hover:scale-[1.02] transition-transform duration-700 optimize-gpu">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 optimize-gpu"
                                                loading="lazy"
                                            />

                                            {/* Minimalist Badge */}
                                            <div className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-xl shadow-sm border border-white/20 flex items-center gap-2">
                                                <TrendingUp size={12} className="text-pink-500" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-stone-600">Trending</span>
                                            </div>
                                        </div>

                                        <div className="px-1 flex-1 flex flex-col relative z-10">
                                            <h3 className="text-lg font-bold text-stone-900 leading-[1.2] mb-2 uppercase tracking-tight group-hover:text-pink-500 transition-colors line-clamp-2">{product.name}</h3>
                                            <p className="text-[13px] text-stone-500 font-light mb-6 line-clamp-2 leading-relaxed">{product.description}</p>

                                            {/* Limited Stock Info */}
                                            <div className="mb-6">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Dropping in Batch</span>
                                                    <span className="text-[10px] font-black text-pink-500">Limited Supply</span>
                                                </div>
                                                <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${60 + Math.random() * 30}%` }}
                                                        className="h-full bg-linear-to-r from-pink-400 to-purple-400 rounded-full"
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-bold text-stone-300 line-through leading-none mb-1">₹{product.originalPrice.toLocaleString()}</span>
                                                    <span className="text-[20px] font-black text-[#151515] leading-none tracking-tighter">₹{product.price.toLocaleString()}</span>
                                                </div>
                                                <button className="flex-1 bg-stone-900 text-white h-[48px] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-stone-200 flex items-center justify-center gap-2">
                                                    <Bell size={14} /> Notify
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
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
