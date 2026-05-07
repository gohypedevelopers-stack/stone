import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "./context/ProductContext";
import { toast } from "sonner";
import ProductCard from "./components/card.jsx";
import { Clock, Filter, Sparkles, CheckCircle, Mail, ChevronRight, Heart } from "lucide-react";
import ImageReveal from "./components/image-tiles";
import { isInCategoryGroup } from "./utils/categoryMapping";
import imgNew1 from "./assets/newprod/new1.jpg";
import imgNew2 from "./assets/newprod/new2.jpg";
import imgNew3 from "./assets/newprod/new3.jpg";

export default function NewArrivals({ addToCart, wishlist = [], toggleWishlist }) {
    const { products: allProducts } = useProducts();
    const navigate = useNavigate();
    
    const [activeFilter, setActiveFilter] = useState("Latest");
    const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 0 });

    const filteredProducts = useMemo(() => {
        // 1. Initial filter for the page purpose
        let products = allProducts.filter(p => {
            const isNewArrival = p.newArrival === true || p.newArrival === "true" || p.tag === "New Arrival";
            const hasNewTag = p.tag === "New" || (p.tags && p.tags.some(t => String(t).toLowerCase().includes('new')));
            return isNewArrival || hasNewTag;
        });

        // 2. Filter out items that are EXCLUSIVELY special offers with no content (optional)
        // We'll keep them if they are tagged as New Arrival
        products = products.filter(p => {
            const isSpecialOnly = (p.category === "Special Offer" || p.category?.name === "Special Offer") && !p.newArrival;
            return !isSpecialOnly;
        });

        // 2. Apply active filter
        if (activeFilter === "Price Low") {
            return [...products].sort((a, b) => a.price - b.price);
        } else if (activeFilter !== "Latest") {
            // Category filters (Skincare, Makeup, Sets)
            return products.filter(p => isInCategoryGroup(p.category, activeFilter));
        }
        return products;
    }, [allProducts, activeFilter]);

    const saleProducts = allProducts.filter(p => p.price < 900); // Simulate sale items

    // Countdown timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 font-sans">

            {/* Simple Header */}
            <header className="px-6 py-12 max-w-[1440px] mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-1 px-1 bg-pink-500 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-pink-500">Discover</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tight">New Arrivals</h1>
                <p className="text-stone-500 mt-2 font-light text-lg">The latest in high-performance beauty, fresh from our curators.</p>
            </header>

            {/* 3. Product Grid */}
            <section className="px-6 max-w-[1440px] mx-auto mb-20">
                <div className={filteredProducts.length > 0 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12" : "flex flex-col items-center justify-center py-20 text-center bg-white/40 backdrop-blur-md rounded-[32px] border border-stone-100"}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(p => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                onAddToCart={addToCart}
                                onClick={() => navigate(`/product/${p.id}`)}
                                wishlist={wishlist}
                                toggleWishlist={toggleWishlist}
                            />
                        ))
                    ) : (
                        <div className="max-w-md px-6">
                            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="text-stone-300 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-2">New Drops Loading...</h3>
                            <p className="text-stone-500 font-light mb-8">We're currently updating our inventory with the freshest beauty picks. Check back in a few minutes!</p>
                            <button 
                                onClick={() => navigate('/shop')}
                                className="px-8 py-3 bg-[#151515] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                                Explore All Products
                            </button>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}
