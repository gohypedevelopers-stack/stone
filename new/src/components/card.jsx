import React from "react";
import { Heart, ShoppingBag } from "lucide-react";

/**
 * Modern "Digital Atelier" Product Card
 * Matches the requested aesthetic:
 * - Bold Pink Product Name
 * - Clean Brand Header
 * - Integrated Add to Cart
 */
const ProductCard = React.memo(
  ({ product, onAddToCart, wishlist = [], toggleWishlist, onNavigate, onClick }) => {
    const isWishlisted = wishlist.some((item) => item.id === product.id);

    const handleWishlistClick = (e) => {
      e.stopPropagation();
      toggleWishlist?.(product);
    };

    const handleAddToCart = (e) => {
      e.stopPropagation();
      onAddToCart?.(product);
    };

    const handleNavigate = () => {
      if (onClick) {
        onClick();
      } else if (onNavigate) {
        onNavigate(product.id);
      }
    };

    // Correct Pricing Logic
    const price = product.price || 0;
    const mrp = product.originalPrice || Math.round(price * 1.45); // Standard 45% markup for luxury
    const points = product.points || Math.round(price * 0.03);

    return (
      <div
        onClick={handleNavigate}
        className="group relative bg-white rounded-lg transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer flex flex-col h-full overflow-hidden shadow-sm hover:shadow-md border-none transform-gpu optimize-gpu"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-[#F7F7F6]">
          <img
            src={product.image || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80"}
            alt={product.name}
            draggable={false}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu optimize-gpu"
            loading="lazy"
          />

          {/* Points & Discount */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <div className="bg-[#151515] text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-md tracking-widest uppercase">
              {points} POINTS
            </div>
            <div className="bg-[#ff3b8f] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-md uppercase tracking-widest">
              25% OFF
            </div>
          </div>

          {/* Heart/Wishlist */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm
            ${isWishlisted ? "bg-white text-pink-500 scale-110" : "bg-white text-stone-400 opacity-0 group-hover:opacity-100 hover:text-pink-500 hover:bg-white hover:scale-110"}`}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>

          {/* Stock Status Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg shadow-sm">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] font-black text-stone-900 tracking-widest uppercase">
              IN STOCK
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
              {product.brand || "Digital Atelier"}
            </span>
          </div>

          <h3 className="text-[15px] font-black text-[#151515] leading-[1.1] tracking-tight group-hover:text-[#ff3b8f] transition-colors uppercase line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-auto pt-1">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-medium text-[#CC0C39] leading-none">
                  -{Math.round(((mrp - price) / mrp) * 100)}%
                </span>
                <div className="flex items-start">
                  <span className="text-[12px] font-bold text-[#151515] mt-0.5 pr-0.5">₹</span>
                  <span className="text-[26px] font-black text-[#151515] tracking-tight leading-none">
                    {price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5 font-medium">
                M.R.P.: <span className="line-through">₹{mrp.toLocaleString()}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full mt-4 py-3 rounded-lg bg-[#151515] text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#ff3b8f] hover:shadow-2xl hover:shadow-[#ff3b8f]/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ProductCard;
