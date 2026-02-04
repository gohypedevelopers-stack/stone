import { useState, useMemo } from "react";
import {
    Star, Heart, ShoppingBag, Eye, X, Filter, ChevronDown, Check,
    Truck, ShieldCheck, RefreshCw, Zap, Search, ArrowRight, Sparkles
} from "lucide-react";

export default function CategoryPage({ category = "Serums", addToCart, onCategoryChange }) {
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Most Popular");

    const ALL_CATEGORIES = [
        "B.b cream", "Blender", "Blush", "Brush", "Cleanser", "cleansing oil", "compact powders",
        "Concealer", "Cushion foundation", "Essence", "Exfoliate", "Eye cream", "Face mists",
        "Foundation", "Hair set", "International makeup", "International skincare", "Japanese Skincare",
        "Korean skincare", "Lip blam", "Lipstick", "Makeup remover", "Mascara", "Moisturizer",
        "Primer", "Razor", "Serums", "Sheet masks", "SKIN1004", "Sunscreen", "Sunspray",
        "Sunstick", "toner", "toner pads", "Treatment mask"
    ];

    // -- MOCK DATA Generator Based on Category --
    // In a real app, this would fetch from an API based on the 'category' prop
    const MOCK_PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
        id: `cat-${i}`,
        name: `${category} Perfector ${i + 1}`,
        brand: ["COSRX", "Laneige", "Innisfree", "Some By Mi"][i % 4],
        price: 800 + (i * 150),
        rating: 4.5 + (i % 5) * 0.1,
        reviews: 120 + i * 20,
        image: `https://images.unsplash.com/photo-${1600000000000 + i}?auto=format&fit=crop&w=800&q=80`,
        tag: i === 0 ? "Best Seller" : i === 2 ? "Trending" : null,
        benefits: ["Hydrating", "Glow", "Soothing", "Brightening"].slice(0, 2)
    }));

    // Top Picks
    const TOP_PICKS = MOCK_PRODUCTS.slice(0, 3);
    const GRID_PRODUCTS = MOCK_PRODUCTS.slice(3);

    const FILTERS = ["All", "Hydration", "Brightening", "Acne Care", "Anti-Aging", "Sensitive Skin"];

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-sans text-[#1a1a1a] pb-20 fade-in">
            {/* 1. HERO HEADER */}
            <section className="relative pt-24 pb-20 px-6 overflow-hidden bg-gradient-to-b from-white to-[#fcfcfc]">
                {/* Abstract Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[80px]" />
                    <Sparkles className="absolute top-20 left-20 text-yellow-300 opacity-50" size={32} />
                    <Sparkles className="absolute bottom-40 right-40 text-pink-300 opacity-40" size={24} />
                </div>

                <div className="relative z-10 max-w-[1440px] mx-auto text-center">
                    <span className="inline-block bg-white/80 backdrop-blur border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 shadow-sm">
                        {MOCK_PRODUCTS.length} Products Found
                    </span>
                    <h1 className="text-5xl md:text-7xl font-[900] tracking-tight mb-4 capitalize text-[#1a1a1a]">
                        {category}
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Glow, hydration & repair essentials. Discover the finest collection curated for your skin's needs.
                    </p>
                </div>
            </section>

            {/* 2. STICKY FILTER BAR */}
            <div className="sticky top-[70px] z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-y border-gray-200/50 py-4 shadow-sm">
                <div className="max-w-[1440px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Category Dropdown (NEW) */}
                    <div className="relative min-w-[200px] w-full lg:w-auto">
                        <select
                            value={category}
                            onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
                            className="w-full appearance-none bg-[#1a1a1a] text-white border border-[#1a1a1a] pl-5 pr-10 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black focus:outline-none shadow-md transition-colors"
                        >
                            {ALL_CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="text-gray-900 bg-white">{cat}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search within ${category}...`}
                            className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-6 py-3 text-sm font-medium focus:outline-none focus:border-[#1a1a1a] transition-colors"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar pb-1">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${activeFilter === f
                                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative min-w-[160px] hidden lg:block">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-200 pl-5 pr-10 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-black focus:outline-none"
                        >
                            <option>Most Popular</option>
                            <option>Latest Drops</option>
                            <option>Price: Low to High</option>
                            <option>Top Rated</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 py-12">

                {/* 3. TOP PICKS SECTION */}
                <section className="mb-20">
                    <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="text-yellow-400 fill-yellow-400" size={20} />
                        <h2 className="text-2xl font-[900] tracking-tight uppercase">Top Picks in {category}</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {TOP_PICKS.map((p, i) => (
                            <div key={p.id} className="relative group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                <div className="absolute top-4 left-4 z-10">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md ${i === 0 ? "bg-[#1a1a1a]" : "bg-pink-500"}`}>
                                        {i === 0 ? "Bestseller" : "Trending Now"}
                                    </span>
                                </div>

                                <div className="h-64 overflow-hidden bg-gray-50 relative">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>

                                <div className="p-8">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{p.brand}</div>
                                    <h3 className="text-xl font-[800] mb-2 leading-tight">{p.name}</h3>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {p.benefits.map(b => (
                                            <span key={b} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold uppercase">{b}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-lg font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}</div>
                                        <button onClick={() => addToCart(p.id)} className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-pink-600 transition-colors shadow-lg">
                                            <ShoppingBag size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. MAIN GRID */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {GRID_PRODUCTS.map(p => (
                            <div key={p.id} className="group flex flex-col">
                                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-lg transition-all">
                                    <button className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors">
                                        <Heart size={18} />
                                    </button>
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

                                    {/* Quick Add Button */}
                                    <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => addToCart(p.id)}
                                            className="w-full bg-white text-[#1a1a1a] py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={14} /> Add to Cart
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.brand}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-bold">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" /> {p.rating}
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-[#1a1a1a] mt-1 mb-1 leading-tight group-hover:text-pink-600 transition-colors">{p.name}</h3>
                                    <div className="font-bold text-[#1a1a1a]">
                                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* 5. TRUST BADGES */}
            <section className="border-t border-gray-200 mt-20 pt-16 pb-8">
                <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { icon: ShieldCheck, title: "Authentic Products", sub: "100% Sourced from Brands" },
                        { icon: Truck, title: "Free Shipping", sub: "On orders above ₹999" },
                        { icon: RefreshCw, title: "Easy Returns", sub: "15-Day Stress Free" },
                        { icon: Zap, title: "Secure Payments", sub: "Cards, UPI & COD" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-[#1a1a1a]">
                                <item.icon size={26} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="font-[800] text-sm tracking-wide mb-1">{item.title}</h4>
                                <p className="text-xs text-gray-500 font-medium">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. NEWSLETTER */}
            <section className="max-w-[1440px] mx-auto px-6 mt-12">
                <div className="bg-[#1a1a1a] rounded-[32px] p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="text-pink-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Don't Miss Out</span>
                        <h2 className="text-3xl md:text-5xl font-[900] tracking-tight mb-6">First Access to New Drops</h2>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input type="email" placeholder="Enter your email" className="flex-1 bg-white/10 hover:bg-white/20 border-transparent rounded-full px-6 py-4 text-white placeholder:text-gray-400 focus:outline-none transition-all text-sm font-medium" />
                            <button className="bg-white text-[#1a1a1a] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-pink-100 transition-colors">Join Class</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
