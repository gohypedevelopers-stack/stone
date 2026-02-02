import React, { useRef } from "react";
import { Play, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { getAllProducts } from "./data/products";

// Import local video assets
import vidA from "./assets/reels/A.mp4";
import vidB from "./assets/reels/B.mp4";
import vidC from "./assets/reels/C.mp4";
import vidD from "./assets/reels/D.mp4";
import vidE from "./assets/reels/E.mp4";
import vidF from "./assets/reels/F.mp4";

export default function WatchAndShop() {
    const scrollRef = useRef(null);
    const products = getAllProducts().slice(0, 6); // Use first 6 products for demo

    // Video mock data
    const videoCards = [
        {
            id: 1,
            video: vidA,
            productName: "Silk Essence Routine",
            price: 2499,

        },
        {
            id: 2,
            video: vidB,
            productName: "Glass Skin Glow",
            price: 1899,

        },
        {
            id: 3,
            video: vidC,
            productName: "Night Recovery",
            price: 3200,

        },
        {
            id: 4,
            video: vidD,
            productName: "Rose Quartz Facial",
            price: 1500,

        },
        {
            id: 5,
            video: vidE,
            productName: "Sun Protection Hack",
            price: 1299,

        },
        {
            id: 6,
            video: vidF,
            productName: "Hydration Boost",
            price: 2100,

        }
    ];

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-pink-50/30 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="flex items-end justify-between mb-10 px-2">
                    <div>
                        
                        <h2 className="text-4xl md:text-5xl font-[800] text-[#151515] tracking-tight">
                            Watch & <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Shop</span>
                        </h2>
                    </div>
                    
                </div>

                {/* Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-17 overflow-x-auto pb-8 px-2 snap-x mandatory no-scrollbar cursor-grab active:cursor-grabbing"
                >
                    {videoCards.map((card) => (
                        <div
                            key={card.id}
                            className="relative flex-shrink-0 w-[260px] md:w-[280px] h-[450px] md:h-[500px] rounded-[32px] overflow-hidden group snap-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-500 bg-gray-100"
                        >
                            {/* Video Player */}
                            <video
                                src={card.video}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 group-hover:to-black/80 transition-all duration-300" />

                            {/* Top UI */}


                            {/* Bottom UI */}
                            <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">


                                <h3 className="text-xl font-bold text-white mb-4 leading-tight shadow-sm drop-shadow-md">
                                    {card.productName}
                                </h3>

                                {/* Shop Button */}
                                <button className="w-full bg-white text-[#151515] font-bold py-3.5 rounded-[20px] flex items-center justify-center gap-2 shadow-lg hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300 active:scale-95 group/btn">
                                    <ShoppingBag size={18} className="text-[#151515] group-hover/btn:text-white transition-colors" />
                                    <span className="uppercase tracking-wide text-xs">Shop Now</span>
                                </button>
                            </div>

                            {/* Sparkle Decoration */}

                        </div>
                    ))}

                    {/* Spacer for right padding */}
                    <div className="w-[1px] flex-shrink-0" />
                </div>

            </div>
        </section>
    );
}
