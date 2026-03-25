import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";

const ProductCard = React.memo(
  ({ product, onAddToCart, wishlist = [], toggleWishlist, onClick }) => {
    // Check if this product is in the wishlist
    const isWishlisted = wishlist.some((item) => item.id === product.id);

    const handleWishlistClick = (e) => {
      e.stopPropagation();
      toggleWishlist?.(product);
    };

    const handleAddToCart = (e) => {
      e.stopPropagation();
      onAddToCart?.(product.id || product);
    };

    return (
      <div
        onClick={onClick}
        className="group relative bg-white rounded-[24px] border border-stone-100/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden transform hover:-translate-y-2 hover:scale-[1.015] cursor-pointer p-3.5 gpu-accelerated"
      >
        {/* Image Container with depth */}
        <div className="relative aspect-[4/5] rounded-[18px] overflow-hidden bg-[#f9f9f9] mb-4 group-hover:shadow-inner transition-shadow duration-500">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
          />

          {/* Luxury Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.tag && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-xl shadow-sm border border-white/80">
                {(product.tag === "Best Seller" || product.tag === "Trending") && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${product.tag === "Trending" ? "bg-amber-400" : "bg-pink-400"}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${product.tag === "Trending" ? "bg-amber-500" : "bg-pink-500"}`}></span>
                  </span>
                )}
                <span className="text-[9px] font-black uppercase tracking-[1.5px] text-stone-900">
                  {product.tag}
                </span>
              </div>
            )}
            {product.rewardEligible && (
              <div className="flex items-center gap-1.5 px-3 py-1.2 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 shadow-sm border border-emerald-400/20 text-white">
                <span className="text-[8px] font-black uppercase tracking-[1.5px]">
                  ✨ + Points
                </span>
              </div>
            )}
          </div>

          {/* Wishlist Button - Ultra Refined Glass */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm backdrop-blur-md border border-white/30 
            ${isWishlisted ? "bg-pink-500 text-white scale-110" : "bg-white/10 text-white hover:bg-white hover:text-pink-500 hover:scale-110"}`}
          >
            <Heart
              size={16}
              fill={isWishlisted ? "white" : "none"}
              strokeWidth={2.5}
            />
          </button>

          {/* Luxury Add to Cart Overlay */}
          <div className="absolute inset-x-3 bottom-3 translate-y-[130%] group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[14px] bg-stone-900 border border-stone-800 text-white font-black text-[10px] uppercase tracking-[2.5px] shadow-xl hover:bg-pink-600 hover:border-pink-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingCart size={13} />
              {product.inStock === false ? "Restocking" : "Add to Selection"}
            </button>
          </div>

          {/* Sold Out Overlay */}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-stone-50/10 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-stone-900/90 text-white px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-[2px] shadow-xl">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content - Sophisticated Typography */}
        <div className="px-1.5 pb-1">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-[2px]">
              {product.brand || "Exclusive"}
            </span>
            <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
              <Star size={9} className="fill-pink-500 text-pink-500" />
              <span className="text-[10px] font-black text-stone-900">
                {product.rating}
              </span>
            </div>
          </div>

          <h3 className="text-[15px] font-black text-[#1a1a1a] mb-2 leading-tight line-clamp-2 min-h-[38px] group-hover:text-pink-600 transition-colors tracking-tight">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-50">
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-black text-[#1a1a1a] tracking-tight">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0
                }).format(product.salePrice || product.price)}
              </span>
              {product.salePrice && (
                <span className="text-[12px] font-bold text-stone-300 line-through">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 0
                  }).format(product.price)}
                </span>
              )}
            </div>
            {product.salePrice && (
              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">
                -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default ProductCard;
