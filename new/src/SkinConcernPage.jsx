import { useState, useMemo } from "react";
import {
    Star, Heart, ShoppingBag, Eye, X, Filter, ChevronDown, Check,
    Search, Sparkles, ArrowRight, Droplets, Sun, Shield,
    Zap, Gem, Activity
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.jsx";

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

export default function SkinConcernPage({ userConcern = "acne", onConcernChange, addToCart }) {
    const [activeConcern, setActiveConcern] = useState(userConcern);
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Most Popular");

    const currentRoutine = ROUTINES[activeConcern] || ROUTINES["default"];
    const currentConcernData = CONCERNS.find(c => c.key === activeConcern) || CONCERNS[0];

    // Mock Products
    const PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
        id: `concern-${activeConcern}-${i}`,
        name: `${currentConcernData.label} Solution ${i + 1}`,
        price: 900 + (i * 120),
        salePrice: i % 3 === 0 ? 800 + (i * 100) : null,
        rating: 4.7,
        reviews: 150 + i * 10,
        image: `https://images.unsplash.com/photo-${1600000000000 + i}?auto=format&fit=crop&w=800&q=80`,
        tag: i === 0 ? "Bestseller" : i === 1 ? "Trending" : null,
        benefits: ["Targeted Action", "Fast Results"]
    }));

    const TOP_PICKS = PRODUCTS.slice(0, 3);
    const GRID_PRODUCTS = PRODUCTS.slice(3);
    const FILTERS = ["All", "Oily Skin", "Dry Skin", "Sensitive", "Fragrance-Free", "Vegan"];

    return (
        <div className="min-h-screen bg-[#fdfbf9] font-sans text-[#1a1a1a] pb-20 fade-in">
            {/* 1. HERO HEADER */}
            <header className="relative pt-32 pb-16 px-6 text-center overflow-hidden bg-white/50 backdrop-blur-sm">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif italic font-medium mb-4 tracking-tight">Shop by Skin Concern</h1>
                    <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">Pick your goal — we’ll show the right products fast.</p>

                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products for acne, hydration, dark spots..."
                            className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-6 py-4 shadow-sm focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 font-medium"
                        />
                    </div>
                </div>
            </header>

            {/* 2. CONCERN SELECTOR GRID (Clean Bento Style) */}
            <section className="max-w-[1440px] mx-auto px-6 mb-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Featured/Active Card (Large) */}


                    {/* Other Concerns Grid */}
                    {CONCERNS.filter(c => c.key !== "acne").map((c, i) => (
                        <button
                            key={c.key}
                            onClick={() => { setActiveConcern(c.key); onConcernChange && onConcernChange(c.key); }}
                            className={`
                                relative h-[180px] rounded-[24px] overflow-hidden group text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-black/5
                                ${activeConcern === c.key ? "ring-2 ring-black bg-white" : "bg-white"}
                            `}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${c.key === 'hydration' ? 'bg-blue-50 text-blue-600' :
                                    c.key === 'dullness' ? 'bg-orange-50 text-orange-600' :
                                        c.key === 'anti-aging' ? 'bg-purple-50 text-purple-600' :
                                            'bg-gray-50 text-gray-700'
                                    }`}>
                                    {/* Small Icon based on image or generic */}
                                    <Sparkles size={18} fill="currentColor" className="opacity-20" />
                                    <img src={c.image} className="absolute inset-0 w-full h-full object-cover opacity-0" alt="icon" /> {/* Hidden img for layout structure if needed, but using icon */}
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

                            {/* Hover accent */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        </button>
                    ))}
                </div>
            </section>

            {/* 3. STICKY SELECTION BAR */}
            <div className="sticky top-[70px] z-40 bg-white/90 backdrop-blur-xl border-y border-gray-100 py-3 shadow-sm transition-all">
                <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold">{currentConcernData.label}</h2>
                        <button onClick={() => {/* clear */ }} className="text-gray-400 hover:text-black transition-colors"><X size={16} /></button>
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

            <div className="max-w-[1440px] mx-auto px-6 py-12">

                {/* 4. RECOMMENDED ROUTINE */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px w-8 bg-gray-200"></div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Your Routine Guide</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {currentRoutine.map((step, i) => (
                            <div key={i} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-[900] text-6xl group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">{step.step}</div>
                                <div className="relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold mb-4">{step.step}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{step.type}</div>
                                    <h3 className="font-bold text-lg leading-tight mb-2">{step.title}</h3>
                                    <div className="inline-block bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600 uppercase">{step.benefit}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. TOP PICKS */}
                <section className="mb-20">
                    <h2 className="text-3xl font-serif italic mb-8">Bestsellers for {currentConcernData.label}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TOP_PICKS.map((p, i) => (
                            <div key={p.id} className="bg-white rounded-[32px] p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col">
                                <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gray-50 mb-6 group-hover:scale-[0.98] transition-all duration-500">
                                    <div className="absolute top-4 left-4 z-10">
                                        {p.tag && <span className="bg-[#1a1a1a] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">{p.tag}</span>}
                                    </div>
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="px-2 pb-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold leading-tight group-hover:text-pink-600 transition-colors">{p.name}</h3>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs font-bold">{p.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">Targeted formulation for visible results.</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-lg font-bold">
                                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}
                                        </span>
                                        <button onClick={() => addToCart(p.id)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-sm">
                                            <ShoppingBag size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. MAIN GRID */}
                <section>
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold uppercase tracking-widest">Full Collection</h2>
                        <span className="text-xs font-medium text-gray-400">{GRID_PRODUCTS.length} Products</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {GRID_PRODUCTS.map(p => (
                            <div key={p.id} className="group flex flex-col">
                                <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-lg transition-all">
                                    <button className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors shadow-sm">
                                        <Heart size={18} />
                                    </button>
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

                                    {/* Quick Add */}
                                    <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => addToCart(p.id)}
                                            className="w-full bg-white text-[#1a1a1a] py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={14} /> Add to Cart
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2 text-center md:text-left">
                                    <h3 className="text-sm font-bold text-[#1a1a1a] leading-tight mb-1 group-hover:text-pink-600 transition-colors">{p.name}</h3>
                                    <div className="text-sm font-bold text-gray-900">
                                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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
