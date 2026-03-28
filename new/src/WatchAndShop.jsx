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

const VideoCard = ({ card, onNavigate }) => {
    const videoRef = useRef(null);
    const [isInView, setIsInView] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        if (!videoRef.current) return;
        if (isInView) {
            videoRef.current.play().catch(() => {});
        } else {
            videoRef.current.pause();
        }
    }, [isInView]);

    return (
        <div
            onClick={() => onNavigate && onNavigate("product-page")}
            className="relative flex-shrink-0 w-[260px] md:w-[280px] h-[450px] md:h-[500px] rounded-[32px] overflow-hidden group snap-center shadow-sm hover:shadow-md transition-all duration-500 bg-gray-100 cursor-pointer transform-gpu optimize-gpu"
        >
            <video
                ref={videoRef}
                src={card.video}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 transform-gpu optimize-gpu"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 group-hover:to-black/80 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold text-white mb-4 leading-tight shadow-sm drop-shadow-md">
                    {card.productName}
                </h3>
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate("product-page"); }}
                    className="w-full bg-white text-[#151515] font-bold py-3.5 rounded-[20px] flex items-center justify-center gap-2 shadow-lg hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300 active:scale-95 group/btn"
                >
                    <ShoppingBag size={18} className="text-[#151515] group-hover/btn:text-white transition-colors" />
                    <span className="uppercase tracking-wide text-xs">Shop Now</span>
                </button>
            </div>
        </div>
    );
};

export default React.memo(function WatchAndShop({ onNavigate }) {
    const scrollRef = useRef(null);
    const products = getAllProducts().slice(0, 6);

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
        <section className="section py-16 md:py-24 bg-gradient-to-b from-white to-pink-50/30 overflow-hidden">
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
                        <VideoCard key={card.id} card={card} onNavigate={onNavigate} />
                    ))}

                    {/* Spacer for right padding */}
                    <div className="w-[1px] flex-shrink-0" />
                </div>

            </div>
        </section>
    );
});
