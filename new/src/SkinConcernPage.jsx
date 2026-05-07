import { useState, useMemo } from "react";
import {
    Star, Heart, ShoppingBag, Eye, X, Filter, ChevronDown, Check,
    Sparkles, ArrowRight, Droplets, Sun, Shield,
    Zap, Gem, Activity
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.jsx";

import { useProducts } from "./context/ProductContext.jsx";
import ProductCard from "./components/card.jsx";
import { useNavigate } from "react-router-dom";

// Import Local Assets (Reused from byskinconcern.jsx)
import darkspotImg from "./assets/skinconcern/darkspot.jpg";
import hydrationImg from "./assets/skinconcern/hydration.jpg";
import poresImg from "./assets/skinconcern/skin pores.jpg";
import acneImg from "./assets/skinconcern/acne and breakout.JPG";
import dullnessImg from "./assets/skinconcern/dullness.jpeg";
import sensitiveImg from "./assets/skinconcern/sensitive.jpg";
import oilControlImg from "./assets/skinconcern/oilyskin.jpg";
import rednessImg from "./assets/skinconcern/skinredness.jpg";
import antiAgingImg from "./assets/skinconcern/antiaging.jpg";
import sunImg from "./assets/skinconcern/sunprotection.jpg";

// Mock Data for Concerns with Local Images
const CONCERNS = [
    { key: "acne", label: "Acne & Breakouts", desc: "Clarify + calm", image: acneImg },
    { key: "dark-spots", label: "Dark Spots", desc: "Brighten tone", image: darkspotImg },
    { key: "dullness", label: "Dullness", desc: "Glow boost", image: dullnessImg },
    { key: "hydration", label: "Hydration", desc: "Deep moisture", image: hydrationImg },
    { key: "sensitive", label: "Sensitive Skin", desc: "Barrier care", image: sensitiveImg },
    { key: "pores", label: "Pores", desc: "Refine look", image: poresImg },
    { key: "oil-control", label: "Oil Control", desc: "Balance shine", image: oilControlImg },
    { key: "redness", label: "Redness", desc: "Soothe skin", image: rednessImg },
    { key: "anti-aging", label: "Anti-Aging", desc: "Smooth lines", image: antiAgingImg },
    { key: "sun-protection", label: "Sun Protection", desc: "Daily SPF", image: sunImg },
];

const ROUTINES = {
    "acne": [
        { step: 1, type: "Cleanser", title: "Salicylic Cleanser", benefit: "Unclog Pores" },
        { step: 2, type: "Toner", title: "BHA Toner", benefit: "Exfoliate" },
        { step: 3, type: "Serum", title: "Niacinamide", benefit: "Oil Control" },
        { step: 4, type: "Moisturizer", title: "Oil-Free Gel", benefit: "Hydrate" },
        { step: 5, type: "Sunscreen", title: "Matte SPF 50", benefit: "Protect" },
    ],
    "hydration": [
        { step: 1, type: "Cleanser", title: "Gentle Foam", benefit: "Cleanse" },
        { step: 2, type: "Toner", title: "Hyaluronic Toner", benefit: "Prep" },
        { step: 3, type: "Serum", title: "HA Serum", benefit: "Plump" },
        { step: 4, type: "Moisturizer", title: "Deep Cream", benefit: "Lock-in" },
        { step: 5, type: "Sunscreen", title: "Dewy SPF 50", benefit: "Protect" },
    ],
    "default": [
        { step: 1, type: "Cleanser", title: "Daily Cleanser", benefit: "Cleanse" },
        { step: 2, type: "Toner", title: "Balancing Toner", benefit: "Prep" },
        { step: 3, type: "Serum", title: "Vitamin C", benefit: "Glow" },
        { step: 4, type: "Moisturizer", title: "Hydrating Cream", benefit: "Hydrate" },
        { step: 5, type: "Sunscreen", title: "Invisible SPF", benefit: "Protect" },
    ]
};

export default function SkinConcernPage({ userConcern = "acne", onConcernChange, addToCart, wishlist, toggleWishlist }) {
    const { products } = useProducts();
    const navigate = useNavigate();
    const [activeConcern, setActiveConcern] = useState(userConcern);
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Most Popular");

    const currentRoutine = ROUTINES[activeConcern] || ROUTINES["default"];
    const currentConcernData = CONCERNS.find(c => c.key === activeConcern) || CONCERNS[0];

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.skinConcerns?.includes(activeConcern) || 
            p.tags?.some(tag => tag.toLowerCase().includes(activeConcern.toLowerCase()))
        );
    }, [products, activeConcern]);

    const filteredAndSortedProducts = useMemo(() => {
        let items = [...filteredProducts];
        
        if (activeFilter !== "All") {
            items = items.filter(p => p.tags?.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase())));
        }

        if (sortOption === "Price: Low to High") {
            items.sort((a, b) => a.price - b.price);
        } else if (sortOption === "New Arrivals") {
            items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return items;
    }, [filteredProducts, activeFilter, sortOption]);

    const TOP_PICKS = filteredAndSortedProducts.slice(0, 3);
    const GRID_PRODUCTS = filteredAndSortedProducts.slice(3);
    const FILTERS = ["All", "Oily Skin", "Dry Skin", "Sensitive", "Fragrance-Free", "Vegan"];

    return (
        <div className="min-h-screen bg-[#fdfbf9] font-sans text-[#1a1a1a] pb-20 fade-in">
            {/* 1. HERO HEADER */}
            {!activeConcern && (
                <>
                    <header className="relative pt-32 pb-16 px-6 text-center overflow-hidden bg-white/50 backdrop-blur-sm">
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">Shop by Skin Concern</h1>
                            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">Pick your goal — we’ll show the right products fast.</p>
                        </div>
                    </header>

                    {/* 2. CONCERN SELECTOR GRID (Clean Bento Style) */}
                    <section className="max-w-[1440px] mx-auto px-6 mb-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {/* Concerns Grid */}
                            {CONCERNS.map((c, i) => (
                                <button
                                    key={c.key}
                                    onClick={() => { setActiveConcern(c.key); onConcernChange && onConcernChange(c.key); }}
                                    className={`
                                        relative h-[180px] rounded-[24px] overflow-hidden group text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-black/5
                                        ${activeConcern === c.key ? "ring-2 ring-black bg-white" : "bg-white"}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-gray-50 to-white opacity-50 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${c.key === 'hydration' ? 'bg-blue-50 text-blue-600' :
                                            c.key === 'dullness' ? 'bg-orange-50 text-orange-600' :
                                                c.key === 'anti-aging' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-gray-50 text-gray-700'
                                            }`}>
                                            <Sparkles size={18} fill="currentColor" className="opacity-20" />
                                            <img src={c.image} className="absolute inset-0 w-full h-full object-cover opacity-0" alt="icon" />
                                            <img src={c.image} className="absolute w-full h-full object-cover rounded-2xl opacity-100 mix-blend-multiply" alt="icon-visual" />
                                        </div>

                                        <div className="pt-2">
                                            <h4 className="font-bold text-base leading-tight text-gray-900 mb-1">
                                                {c.label}
                                            </h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-black transition-colors">
                                                {c.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </button>
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* 3. STICKY SELECTION BAR */}
            {activeConcern && (
                <div className="sticky top-[70px] z-40 bg-white/90 backdrop-blur-xl border-y border-gray-100 py-3 shadow-sm transition-all">
                    <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold">{currentConcernData.label}</h2>
                            <button onClick={() => { setActiveConcern(null); navigate('/concern'); }} className="text-gray-400 hover:text-black transition-colors"><X size={16} /></button>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                            {FILTERS.map(f => (
                                <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${activeFilter === f ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>{f}</button>
                            ))}

                            <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 bg-transparent font-bold text-[10px] uppercase tracking-wider cursor-pointer outline-none">
                                    {sortOption}
                                    <ChevronDown size={14} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 p-1 bg-white border border-gray-100 rounded-xl shadow-lg">
                                    {["Most Popular", "Top Rated", "Price: Low to High", "New Arrivals"].map((option) => (
                                        <DropdownMenuItem key={option} onClick={() => setSortOption(option)} className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-gray-50">
                                            {option}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-6 py-12">

                {/* 4. RECOMMENDED ROUTINE */}
                <section className="mb-24">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-px w-8 bg-black"></div>
                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">Step-by-Step Guide</h2>
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight">Your Optimal Routine</h3>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-gray-400 text-xs font-medium italic">
                            <ArrowRight size={14} />
                            Scroll to follow the flow
                        </div>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-100 to-transparent -translate-y-1/2 hidden lg:block" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                            {currentRoutine.map((step, i) => {
                                const Icon = i === 0 ? Droplets : i === 1 ? Activity : i === 2 ? Zap : i === 3 ? Gem : Sun;
                                return (
                                    <div key={i} className="group relative">
                                        <div className="bg-white border border-gray-100 rounded-[32px] p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col justify-between">
                                            {/* Background Number Accent */}
                                            <div className="absolute -top-4 -right-4 opacity-[0.03] font-black text-9xl group-hover:opacity-[0.07] transition-opacity transform group-hover:scale-110 duration-700 pointer-events-none select-none italic">
                                                {step.step}
                                            </div>

                                            <div>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${i === 0 ? 'bg-blue-50 text-blue-500' :
                                                    i === 1 ? 'bg-indigo-50 text-indigo-500' :
                                                        i === 2 ? 'bg-purple-50 text-purple-500' :
                                                            i === 3 ? 'bg-rose-50 text-rose-500' :
                                                                'bg-amber-50 text-amber-500'
                                                    }`}>
                                                    <Icon size={24} />
                                                </div>

                                                <div className="space-y-1 mb-4">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                                        Step {step.step} • {step.type}
                                                    </div>
                                                    <h3 className="font-bold text-xl leading-tight group-hover:text-black">{step.title}</h3>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-50">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${i === 0 ? 'bg-blue-50/50 text-blue-600' :
                                                    i === 1 ? 'bg-indigo-50/50 text-indigo-600' :
                                                        i === 2 ? 'bg-purple-50/50 text-purple-600' :
                                                            i === 3 ? 'bg-rose-50/50 text-rose-600' :
                                                                'bg-amber-50/50 text-amber-600'
                                                    }`}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                    {step.benefit}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Connector Arrow (Desktop) */}
                                        {i < 4 && (
                                            <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 text-gray-200 hidden lg:block group-hover:text-black group-hover:translate-x-1 transition-all">
                                                <ArrowRight size={20} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 5. TOP PICKS */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8">Bestsellers for {currentConcernData.label}</h2>
                    {TOP_PICKS.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {TOP_PICKS.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onAddToCart={addToCart}
                                    wishlist={wishlist}
                                    toggleWishlist={toggleWishlist}
                                    onNavigate={(id) => navigate(`/product/${id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-stone-50 rounded-[32px] border border-dashed border-stone-200">
                            <Sparkles className="mx-auto text-stone-300 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-stone-600">Discovering more products...</h3>
                            <p className="text-stone-400">We're currently curating the best solutions for {currentConcernData.label}.</p>
                        </div>
                    )}
                </section>

                {/* 6. MAIN GRID */}
                {GRID_PRODUCTS.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold uppercase tracking-widest">Full Collection</h2>
                            <span className="text-xs font-medium text-gray-400">{GRID_PRODUCTS.length} Products</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {GRID_PRODUCTS.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onAddToCart={addToCart}
                                    wishlist={wishlist}
                                    toggleWishlist={toggleWishlist}
                                    onNavigate={(id) => navigate(`/product/${id}`)}
                                />
                            ))}
                        </div>
                    </section>
                )}

            </div>

            {/* 7. TRUST & CTA */}
            <section className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Shield, title: "Authentic", sub: "100% Sourced" },
                            { icon: Zap, title: "Fast Ship", sub: "2-Day Delivery" },
                            { icon: Activity, title: "Tested", sub: "Dermatologist Approved" },
                            { icon: Gem, title: "Premium", sub: "Curated Selection" },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-black">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-wide mb-1">{item.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-medium">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
