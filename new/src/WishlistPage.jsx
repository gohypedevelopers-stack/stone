import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, ShoppingBag, ShoppingCart } from "lucide-react";
import ProductCard from "./components/card.jsx";

const WishlistPage = ({ wishlist = [], toggleWishlist, addToCart }) => {
    const navigate = useNavigate();

    const isEmpty = wishlist.length === 0;

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-sans pb-24">
            {/* Header Section */}
            <header className="pt-16 pb-12 px-6 md:px-12 border-b border-gray-100 bg-white">
                <div className="max-w-[1440px] mx-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors mb-6 group"
                    >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs font-black uppercase tracking-widest">Back</span>
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#1a1a1a] mb-2 uppercase">
                                My Wishlist
                            </h1>
                            <div className="flex items-center gap-3 mt-4">
                                <span className="h-0.5 w-12 bg-pink-500"></span>
                                <span className="text-sm font-black text-stone-400 uppercase tracking-[0.3em]">
                                    {wishlist.length} {wishlist.length === 1 ? 'Product' : 'Products'} Saved
                                </span>
                            </div>
                        </div>

                        {!isEmpty && (
                            <button 
                                onClick={() => navigate("/shop")}
                                className="group flex items-center gap-3 px-6 py-3 bg-[#1a1a1a] text-white rounded-full transition-all hover:bg-pink-600 hover:shadow-xl hover:shadow-pink-500/20 active:scale-95"
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest">Continue Shopping</span>
                                <ShoppingCart size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center animate-pulse">
                                <Heart size={40} className="text-pink-300" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-pink-100 rounded-full flex items-center justify-center shadow-sm">
                                <ShoppingCart size={14} className="text-pink-400" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-[#1a1a1a] mb-4 uppercase tracking-tight">Your wishlist is empty</h2>
                        <p className="text-stone-500 max-w-md mx-auto mb-10 font-medium text-lg leading-relaxed">
                            Seems like you haven't saved any of our premium essentials yet. Start exploring and find your perfect routine!
                        </p>
                        <button 
                            onClick={() => navigate("/shop")}
                            className="bg-stone-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-pink-600 hover:shadow-2xl hover:shadow-pink-500/20 active:scale-95 transition-all"
                        >
                            Explore Collection
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {wishlist.map((product) => (
                            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ProductCard 
                                    product={product}
                                    onAddToCart={() => addToCart(product.id)}
                                    wishlist={wishlist}
                                    toggleWishlist={toggleWishlist}
                                    onClick={() => navigate(`/product/${product.id}`)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Recommendations Strip (Optional Placeholder for Future) */}
            {!isEmpty && (
                <section className="bg-white py-20 border-t border-stone-100">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
                        <span className="text-pink-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Personalized Picks</span>
                        <h3 className="text-3xl font-black text-[#1a1a1a] mb-4 uppercase tracking-tight">Other items you'll love</h3>
                        <p className="text-stone-400 font-medium mb-12">Based on your saved products and preferences.</p>
                        <button 
                           onClick={() => navigate("/shop?offer=limited")}
                           className="text-sm font-black text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-1 hover:text-pink-500 hover:border-pink-500 transition-colors uppercase tracking-widest"
                        >
                           View Best Sellers
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default WishlistPage;
