import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({
  product,
  isDark = false,
  onAddToCart,
  onToggleWishlist
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted);
    onToggleWishlist?.(product.id, !isWishlisted);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  // Theme classes
  // Using brand specific classes
  const cardClasses = isDark
    ? 'bg-[#151515] text-white border-white/10'
    : 'bg-white text-text-custom border-line-custom';

  const textSecondary = isDark ? 'text-gray-300' : 'text-text-custom';
  const textMuted = isDark ? 'text-gray-400' : 'text-muted-custom';

  // Brand primary button is usually black in this design (SkinQuiz used black)
  const buttonPrimary = isDark
    ? 'bg-white text-black hover:bg-gray-200'
    : 'bg-[#1b1b1b] hover:bg-black text-white';

  // Wishlist button
  const wishlistButton = isDark
    ? 'bg-white/10 hover:bg-white/20 text-white'
    : 'bg-white hover:bg-gray-50 text-black/70';

  return (
    <div
      className={`
        max-w-sm mx-auto rounded-[18px] border shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)]
        transition-all duration-300 overflow-hidden group transform hover:-translate-y-[4px]
        ${cardClasses}
      `}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`
            absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 border border-black/5
            ${wishlistButton} ${isWishlisted ? '!text-red-500 !bg-red-50' : ''} 
            hover:scale-110 shadow-sm
          `}>
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Sale Badge */}
        {product.salePrice && (
          <div
            className="absolute top-3 left-3 bg-[#1b1b1b] text-white px-3 py-1.5 rounded-[99px] text-[11px] font-bold uppercase tracking-wider shadow-md">
            -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
          </div>
        )}

        {/* Stock Badge */}
        {!product.inStock && (
          <div
            className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-[#1b1b1b] text-white px-4 py-2 rounded-full font-bold text-sm tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p
          className={`text-[11px] uppercase tracking-[1px] font-bold mb-2 ${textMuted}`}>
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="font-extrabold text-[18px] mb-2 leading-tight line-clamp-2 min-h-[44px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-2 gap-[1px]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-200'
                  }`} />
            ))}
          </div>
          <span className={`text-[12px] font-semibold ${textSecondary} opacity-80`}>
            ({product.reviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-2">
            {product.salePrice ? (
              <>
                <span className="text-[20px] font-bold text-[#eb4899]">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.salePrice)}
                </span>
                <span className={`text-[14px] line-through ${textMuted} decoration-black/30`}>
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                </span>
              </>
            ) : (
              <span className="text-[20px] font-bold">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`
            w-full py-3 px-6 rounded-[99px] font-bold text-[14px] uppercase tracking-[0.5px] transition-all duration-200 
            flex items-center justify-center space-x-2 
            ${product.inStock
              ? `${buttonPrimary} shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] active:scale-95`
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}>
          <ShoppingCart size={18} />
          <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;