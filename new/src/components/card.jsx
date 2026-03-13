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
        className="group relative bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(235,72,153,0.12)] transition-[transform,shadow,color] duration-500 overflow-hidden transform hover:-translate-y-2 cursor-pointer p-3 gpu-accelerated"
      >
        {/* Image Container */}
        <div className="relative aspect-square rounded-[20px] overflow-hidden bg-gray-50 mb-4">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.tag && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-black/5">
                {product.tag === "Best Seller" && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
                  </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-wider text-[#151515]">
                  {product.tag}
                </span>
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-[transform,background-color,color] duration-300 shadow-sm backdrop-blur-md border border-white/50 
            ${isWishlisted ? "bg-pink-50 text-pink-500" : "bg-white/80 text-gray-400 hover:text-pink-500 hover:scale-110"}`}
          >
            <Heart
              size={18}
              fill={isWishlisted ? "currentColor" : "none"}
              strokeWidth={2.5}
            />
          </button>

          {/* Add to Cart Hover Overlay */}
          <div className="absolute inset-x-3 bottom-3 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-out will-change-transform">
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-gray-900 to-gray-700 text-white font-black text-[12px] uppercase tracking-widest shadow-xl hover:from-pink-600 hover:to-purple-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              {product.inStock === false ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-900 text-white px-4 py-2 rounded-full font-black text-[12px] uppercase tracking-widest">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-1 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {product.brand || "Exclusive"}
            </span>
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[11px] font-black text-[#151515]">
                {product.rating}
              </span>
            </div>
          </div>

          <h3 className="text-base font-black text-[#151515] mb-2 leading-tight line-clamp-2 min-h-[40px] group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#151515]">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(product.salePrice || product.price)}
              </span>
              {product.salePrice && (
                <span className="text-xs font-bold text-gray-400 line-through">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(product.price)}
                </span>
              )}
            </div>
            {product.salePrice && (
              <span className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-md">
                SAVE{" "}
                {Math.round(
                  ((product.price - product.salePrice) / product.price) * 100,
                )}
                %
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default ProductCard;
