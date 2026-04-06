import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import {
  CheckCircle,
  ShieldCheck,
  RefreshCcw,
  Bell,
  Heart,
  X,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

import { useProducts } from "./context/ProductContext";
import { resolveImage } from "./utils/urlHelper";

export default React.memo(function PreOrderSection({
  wishlist = [],
  toggleWishlist,
  title,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { preorderProducts } = useProducts();

  const displayProducts = preorderProducts;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Drag-to-Scroll Logic
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    // Disable text selection and snapping while dragging
    scrollRef.current.style.scrollSnapType = "none";
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = "x mandatory";
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = "x mandatory";
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplier for speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden bg-gradient-to-br from-[#fff0f5] via-[#f8f4ff] to-[#fffbea]">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-300/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-[900] text-[#1a1a1a] mb-2 tracking-tight flex items-center gap-3">
              Pre-ORDER
              <span className="text-lg md:text-xl text-[#d1408e]">✨</span>
            </h2>
            <p className="text-[#666] text-sm md:text-lg max-w-[500px] leading-relaxed">
              Reserve your favorites before they drop — limited quantities
              available.
            </p>
          </div>
          <button
            onClick={() => navigate("/pre-orders")}
            className="hidden md:flex items-center gap-1 text-[#d1408e] font-bold text-sm hover:underline"
          >
            View All <ChevronRight size={16} />
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Desktop Navigation Arrows */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-4 top-1/3 -translate-y-1/2 z-20 w-12 h-12 bg-white text-[#1a1a1a] rounded-full items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-4 top-1/3 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 backdrop-blur text-[#1a1a1a] rounded-full items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>

          {/* Scrollable Grid */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              userSelect: isDragging ? "none" : "auto",
            }}
          >
            {displayProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/preorder/${product.id}`)} // Navigate on click
                className="cursor-pointer w-[280px] md:w-[320px] shrink-0 snap-start group relative bg-white border border-stone-100 rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(209,64,142,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col"
              >
                {/* Image Area */}
                <div className="relative aspect-square md:aspect-[3/4] m-2 overflow-hidden rounded-[20px] bg-stone-50/50">
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                    <span className="bg-black/80 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {product.tag}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist && toggleWishlist(product);
                    }}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111] hover:bg-[#d1408e] hover:text-white transition-colors z-10 shadow-sm ${wishlist.some((i) => i.id === product.id) ? "!bg-red-50 !text-red-500" : ""}`}
                  >
                    <Heart
                      size={14}
                      fill={
                        wishlist.some((i) => i.id === product.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <img
                    src={resolveImage(product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Unlock Timer Overlay */}
                  <div className="absolute bottom-0 left-0 w-full bg-white py-2 px-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#d1408e] uppercase tracking-wider">
                      <Clock size={12} />
                      <span>Unlocks</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#1a1a1a]">
                      {product.unlockDate}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-4 flex flex-col flex-grow">
                  <h3 className="text-[15px] font-[800] text-[#1a1a1a] mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[#1a1a1a] text-[14px] font-bold mb-3">
                    {typeof product.price === "number"
                      ? `₹${product.price.toLocaleString("en-IN")}`
                      : product.price}
                  </p>

                  {/* Stock Bar */}
                  <div className="mb-4 mt-auto">
                    <div className="flex justify-between text-[10px] font-bold text-[#666] mb-1">
                      <span>Slots Left</span>
                      <span className="text-[#d1408e]">
                        {product.stockLeft}
                      </span>
                    </div>
                    <div className="w-full h-[4px] bg-gray-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ff4fa3] to-[#d1408e] rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, (product.stockLeft / (product.totalStock || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 h-[40px] rounded-full bg-gradient-to-r from-[#1a1a1a] to-[#333] hover:from-[#d1408e] hover:to-[#b03075] text-white font-[700] text-[12px] uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2">
                      PRE-ORDER
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* View All Card (Mobile Only) */}
            <div className="md:hidden min-w-[30%] snap-start flex items-center justify-center">
              <button
                onClick={() => navigate("/pre-orders")}
                className="flex flex-col items-center gap-2 text-[#d1408e] font-bold text-xs"
              >
                <div className="w-12 h-12 rounded-full border-2 border-[#d1408e] flex items-center justify-center">
                  <ChevronRight size={20} />
                </div>
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Trust Strip */}
        <div className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {[
              { icon: ShieldCheck, text: "Authentic Products" },
              { icon: CheckCircle, text: "Secure Payment" },
              { icon: RefreshCcw, text: "Cancel Anytime" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[#555]">
                <item.icon size={16} className="text-[#d1408e]" />
                <span className="text-[12px] font-bold">{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#d1408e] text-[13px] font-bold flex items-center gap-1.5 hover:underline bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm"
          >
            <Info size={14} />
            How Pre-Order Works
          </button>
        </div>
      </div>

      {/* How it Works Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-[420px] w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            <h3 className="text-2xl font-[900] text-[#1a1a1a] mb-6 text-center">
              How Pre-Order Works
            </h3>

            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-[10px] before:bottom-[10px] before:w-[2px] before:bg-gray-100">
              {[
                {
                  title: "Reserve & Pay",
                  desc: "Secure your item now with checkout.",
                },
                {
                  title: "We Prepare",
                  desc: "We source and pack your premium picks.",
                },
                {
                  title: "Shipped to You",
                  desc: "Dispatched on the launch date.",
                },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center font-bold text-[14px] shadow-md border-4 border-white shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-[#111]">
                      {step.title}
                    </h4>
                    <p className="text-[14px] text-[#666]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-8 bg-[#d1408e] text-white h-[48px] rounded-xl font-[700] text-[14px] hover:bg-[#b03075] transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </section>
  );
});
