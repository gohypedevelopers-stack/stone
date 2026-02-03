import React, { useState, useEffect } from "react";
import { Bell, Lock, Clock } from "lucide-react";

// Import local images
import imgG from "./assets/COMINGSOON/G.jpg";
import imgH from "./assets/COMINGSOON/H.jpg";
import imgI from "./assets/COMINGSOON/I.jpg";
import imgJ from "./assets/COMINGSOON/J.jpg";

// Mock upcoming products data
const UPCOMING_PRODUCTS = [
    {
        id: "up1",
        name: "Sakura Silk Essence",
        image: imgG,
        launchDate: "Feb 10, 10:00 AM"
    },
    {
        id: "up2",
        name: "Glass Skin Barrier Cream",
        image: imgH,
        launchDate: "Feb 12, 12:00 PM"
    },
    {
        id: "up3",
        name: "Rose Quartz Roller Set",
        image: imgI,
        launchDate: "Feb 14, 09:00 AM"
    },
    {
        id: "up4",
        name: "Lavender Sleeping Mask",
        image: imgJ,
        launchDate: "Feb 15, 08:00 PM"
    }
];

export default function UpcomingDrops({ onNavigate }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Set target date to roughly 3 days from now for demo
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        targetDate.setHours(10, 0, 0, 0);

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference <= 0) {
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
    }, []);

    return (
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-pink-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-t from-blue-100/30 to-teal-100/30 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

            <div className="max-w-[1240px] mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between mb-12 gap-8">
                    <div>

                        <h2 className="text-4xl md:text-5xl font-[800] text-[#151515] tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Upcoming <br className="hidden md:block" />Beauty Drop
                        </h2>
                    </div>

                    {/* Countdown Timer */}
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-1 shadow-lg shadow-purple-900/5">
                        <div className="bg-white/80 rounded-xl px-6 py-4 flex items-center gap-6 md:gap-8">
                            {Object.entries(timeLeft).map(([unit, value]) => (
                                <div key={unit} className="flex flex-col items-center">
                                    <span className="text-2xl md:text-3xl font-[900] tabular-nums text-[#151515] leading-none mb-1">
                                        {value.toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">{unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {UPCOMING_PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => onNavigate && onNavigate("product-page")}
                            className="group relative bg-white/60 backdrop-blur-md rounded-[24px] border border-white/60 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                        >

                            {/* Image Container */}
                            <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[20px] bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter blur-[2px] group-hover:blur-0"
                                />

                                {/* Blurred Overlay / Lock */}
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/0 transition-colors duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-400 shadow-sm group-hover:scale-0 group-hover:opacity-0 transition-all duration-300 transform">
                                        <Lock size={20} />
                                    </div>
                                </div>

                                {/* Date Label */}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/50">
                                    <Clock size={12} className="text-purple-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#151515]">
                                        {product.launchDate}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 pb-6 pt-2 text-center">
                                <h3 className="text-lg font-bold text-[#151515] mb-4 truncate">{product.name}</h3>

                                {/* Notify Me Button */}
                                <button className="w-full py-3 rounded-xl border border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[1px] group/btn overflow-hidden relative">
                                    <div className="absolute inset-0 bg-white rounded-[10px] group-hover/btn:bg-opacity-90 transition-all" />
                                    <div className="relative flex items-center justify-center gap-2 text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 group-hover/btn:text-white transition-colors">
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
