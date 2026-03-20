import React, { useState, useEffect } from "react";
import { Bell, Lock, Clock, Heart } from "lucide-react";

// Import local images
import imgG from "./assets/COMINGSOON/G.jpg";
import imgH from "./assets/COMINGSOON/H.jpg";
import imgI from "./assets/COMINGSOON/I.jpg";
import imgJ from "./assets/COMINGSOON/J.jpg";

// Mock upcoming products data (✅ quantity added)
const UPCOMING_PRODUCTS = [
    {
        id: "up1",
        name: "Sakura Silk Essence",
        image: imgG,
        launchDate: "Feb 10, 10:00 AM",
        qty: 120,
    },
    {
        id: "up2",
        name: "Glass Skin Barrier Cream",
        image: imgH,
        launchDate: "Feb 12, 12:00 PM",
        qty: 80,
    },
    {
        id: "up3",
        name: "Rose Quartz Roller Set",
        image: imgI,
        launchDate: "Feb 14, 09:00 AM",
        qty: 60,
    },
    {
        id: "up4",
        name: "Lavender Sleeping Mask",
        image: imgJ,
        launchDate: "Feb 15, 08:00 PM",
        qty: 150,
    },
];

export default function UpcomingDrops({ onNavigate, wishlist = [], toggleWishlist, products = [], deadline, title }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const targetDate = deadline ? new Date(deadline) : new Date();
        if (!deadline) {
            targetDate.setDate(targetDate.getDate() + 3);
            targetDate.setHours(10, 0, 0, 0);
        }

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [deadline]);

    const displayProducts = products && products.length > 0 ? products : UPCOMING_PRODUCTS;

    return (
        <section className="py-16 md:py-24 px-4 bg-linear-to-br from-pink-50 via-white to-purple-50 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-b from-pink-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-linear-to-t from-blue-100/30 to-teal-100/30 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

            <div className="max-w-[1240px] mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-10">
                    <div className="relative group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600">Exclusive Drop</span>
                            </div>
                        </div>
                        <style>
                            {`
                            @keyframes gradientFlow {
                                0% { background-position: 0% 50%; }
                                50% { background-position: 100% 50%; }
                                100% { background-position: 0% 50%; }
                            }
                            .animate-text-gradient {
                                background-size: 200% auto;
                                animation: gradientFlow 5s linear infinite;
                            }
                            `}
                        </style>
                        <h2 className="text-5xl md:text-7xl font-black text-[#151515] tracking-tight leading-[0.9]">
                            {title?.split(' ')[0] || "Upcoming"} <br className="hidden md:block" />
                            <span className="relative inline-block mt-2">
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-purple-600 animate-text-gradient">
                                    {title?.split(' ').slice(1).join(' ') || "Beauty Drop"}
                                </span>
                                <div className="absolute -bottom-2 left-0 w-full h-2 bg-linear-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-[2px]" />
                            </span>
                        </h2>
                    </div>

                    {/* Countdown */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-linear-to-r from-pink-400/20 to-purple-400/20 rounded-3xl blur-2xl opacity-50" />
                        <div className="relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-1 shadow-2xl shadow-purple-900/10">
                            <div className="bg-white/80 rounded-xl px-8 py-5 flex items-center gap-8 md:gap-12">
                                {Object.entries(timeLeft).map(([unit, value]) => (
                                    <div key={unit} className="flex flex-col items-center">
                                        <span className="text-3xl md:text-4xl font-black tabular-nums leading-none mb-2 bg-clip-text text-transparent bg-linear-to-b from-gray-900 to-gray-600">
                                            {value.toString().padStart(2, "0")}
                                        </span>
                                        <span className="text-[11px] uppercase font-black text-gray-400 tracking-[0.2em]">
                                            {unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((product, pId) => (
                        <div
                            key={product.id || pId}
                            onClick={() => onNavigate && onNavigate("product-page")}
                            className="group relative bg-white/60 backdrop-blur-md rounded-[24px] border border-white/60 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative aspect-4/5 overflow-hidden m-2 rounded-[20px] bg-gray-100">
                                <img
                                    src={product.image || product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter blur-[2px] group-hover:blur-0"
                                />

                                {/* Lock Overlay */}
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/0 transition-colors duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-400 shadow-sm group-hover:scale-0 group-hover:opacity-0 transition-all duration-300">
                                        <Lock size={20} />
                                    </div>
                                </div>

                                {/* Launch Date */}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/50">
                                    <Clock size={12} className="text-purple-500" />
                                    <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#151515]">
                                        {product.launchDate}
                                    </span>
                                </div>

                                {/* Quantity Badge */}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/50">
                                    <span className="text-[12px] font-extrabold tracking-wide text-gray-800">
                                        Qty: {product.qty || product.inventoryCount || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 pb-6 pt-2 text-center">
                                <h3 className="text-lg font-bold text-[#151515] mb-4 truncate">
                                    {product.name}
                                </h3>

                                {/* Notify Button */}
                                <button className="w-full py-3 rounded-xl border border-transparent bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 p-px group/btn overflow-hidden relative shadow-sm hover:shadow-lg transition-all active:scale-95">
                                    <div className="absolute inset-0 bg-white rounded-[10px] group-hover/btn:opacity-0 transition-opacity duration-300" />
                                    <div className="relative flex items-center justify-center gap-2 text-sm font-black bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-purple-600 group-hover/btn:bg-none group-hover/btn:text-white transition-all duration-300">
                                        <Bell size={16} className="text-purple-600 group-hover/btn:text-white transition-colors" />
                                        Notify Me
                                    </div>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
