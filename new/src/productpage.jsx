import React, { useState } from "react";
import { Search, Filter, ChevronDown, Sparkles, Star, Sun, Shield } from "lucide-react";
import ProductCard from "./components/card.jsx";
import { getAllProducts } from "./data/products";

// Full Category List from User Request
const ALL_CATEGORIES = [
    "BB Cream", "Blender", "Blush", "Brush", "Cleanser", "Cleansing Oil",
    "Compact Powders", "Concealer", "Cushion Foundation", "Essence", "Exfoliate",
    "Eye Cream", "Face Mists", "Foundation", "Hair Set", "International Makeup",
    "International Skincare", "Japanese Skincare", "Korean Skincare", "Lip Balm",
    "Lipstick", "Makeup Remover", "Mascara", "Moisturizer", "Primer", "Razor",
    "Serums", "Sheet Masks", "SKIN1004", "Sunscreen", "Sunspray", "Sunstick",
    "Toner", "Toner Pads", "Treatment Mask"
];

// Top Filter Chips
const MAIN_FILTERS = ["All", "Skincare", "Makeup", "K-Beauty", "Sun Care", "Masks"];

export default function ProductPage({ addToCart }) {
    const allProducts = getAllProducts();
    const [activeFilter, setActiveFilter] = useState("All");
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Latest");

    // Filtering Logic
    const filteredProducts = allProducts.filter(product => {
        // 1. Search
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // 2. Main Filter (Mock logic as data tags might not match perfectly)
        if (activeFilter !== "All") {
            if (activeFilter === "K-Beauty" && product.origin !== "Korean") return false;
            // Add more specific logic based on product tags if available
        }

        // 3. Category Filter (Mock logic - in real app, match product.category)
        if (activeCategory !== "All") {
            // Allow if name includes category or generic match for demo
            // return product.name.toLowerCase().includes(activeCategory.toLowerCase());
        }

        return true;
    }).sort((a, b) => {
        if (sortOption === "Price Low") return a.price - b.price;
        if (sortOption === "Top Rated") return b.rating - a.rating;
        return 0; // Latest (default order)
    });

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">

            {/* 1. Hero Banner */}
            <section className="relative bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 py-16 md:py-24 px-6 mb-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="max-w-[1440px] mx-auto relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 border border-white/50 backdrop-blur-sm text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 shadow-sm">
                        Official Store
                    </span>
                    <h1 className="text-4xl md:text-6xl font-[900] text-[#151515] mb-6 tracking-tight">
                        Shop All <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600">Products</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover our curated collection of premium skincare and makeup essentials. From K-Beauty bestsellers to daily sun protection.
                    </p>
                </div>
            </section>

            <div className="max-w-[1440px] mx-auto px-4 md:px-6">

                {/* 2. Controls: Search, Sort, Main Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 sticky top-[70px] z-30 bg-[#FAFAFA]/95 backdrop-blur py-4 transition-all">

                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search for products, brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-6 py-3 text-sm font-medium focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50/50 shadow-sm transition-all"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative group min-w-[160px]">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-200 rounded-full px-6 py-3 text-sm font-bold text-gray-700 cursor-pointer focus:outline-none focus:border-pink-300 shadow-sm hover:border-gray-300 transition-all"
                        >
                            <option>Latest</option>
                            <option>Price Low</option>
                            <option>Top Rated</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* 3. Category Filter Chips (Horizontal Scroll) */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 mask-linear-fade">
                        {MAIN_FILTERS.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeFilter === filter
                                        ? "bg-[#151515] text-white shadow-lg scale-105"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <div className="w-[1px] h-6 bg-gray-300 mx-2 flex-shrink-0"></div>
                        {/* Render a few featured categories from the massive list */}
                        {ALL_CATEGORIES.slice(0, 8).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-[14px] text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${activeCategory === cat
                                        ? "bg-pink-100 text-pink-700 border-pink-200"
                                        : "bg-transparent text-gray-500 hover:text-[#151515] hover:bg-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                        <button className="text-xs font-bold text-pink-600 underline whitespace-nowrap hover:text-pink-700 px-4">See All Categories</button>
                    </div>
                </div>

                {/* 4. Promotional Section: Trending K-Beauty */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles className="text-pink-500 fill-pink-500" size={20} />
                        <h2 className="text-2xl font-[800] text-[#151515]">Trending K-Beauty Picks</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {filteredProducts.slice(0, 4).map(p => (
                            <ProductCard
                                key={`trend-${p.id}`}
                                product={{ ...p, inStock: true }}
                                onAddToCart={() => addToCart(p.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* 5. Promotional Section: Sunscreen Essentials (Banner Style) */}
                <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-orange-50 to-yellow-50 p-8 md:p-12 mb-16 border border-orange-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full mb-4 border border-orange-100">
                                <Sun size={14} className="text-orange-500" />
                                <span className="text-[10px] uppercase font-bold text-orange-600">Summer Ready</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-[900] text-[#151515] mb-4">Sunscreen Essentials</h2>
                            <p className="text-gray-600 mb-6">Lightweight, non-sticky protection for every skin type. No white cast guaranteed.</p>
                            <button className="bg-[#151515] text-white px-8 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:bg-black transition-all">Shop Sun Care</button>
                        </div>
                        <div className="flex gap-4">
                            {/* Mini Product Cards for Banner */}
                            {allProducts.filter(p => p.tag === "Best Seller").slice(0, 2).map(p => (
                                <div key={`sun-${p.id}`} className="w-40 bg-white p-3 rounded-2xl shadow-sm border border-white/50 hidden md:block">
                                    <img src={p.image} className="w-full aspect-square rounded-xl object-cover mb-2" alt={p.name} />
                                    <div className="text-xs font-bold text-gray-900 truncate">{p.name}</div>
                                    <div className="text-[10px] text-gray-500">SPF 50+ PA++++</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Abstract Sun Shapes */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
                </div>

                {/* 6. Main Product Grid */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-[800] text-[#151515]">All Products</h2>
                        <span className="text-sm font-bold text-gray-400">{filteredProducts.length} items</span>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {filteredProducts.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={{ ...p, inStock: true }}
                                    onAddToCart={() => addToCart(p.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                            <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                                <Search size={24} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </section>

                {/* 7. Mask & Treatment Favorites (Bottom Section) */}
                <section className="bg-[#F0F4FF] rounded-[32px] p-8 md:p-14 border border-blue-50 relative overflow-hidden">
                    <div className="relative z-10 text-center">
                        <Shield className="mx-auto text-blue-500 mb-4 fill-blue-500/20" size={32} />
                        <h2 className="text-3xl md:text-4xl font-[900] text-[#151515] mb-4">Mask & Treatment Favorites</h2>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">Deep hydration and repair for stressed skin. Shop our curated selection of sheet masks and sleeping packs.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Just displaying links or mini-cards */}
                            {["Mediheal", "Abib", "Torriden", "Round Lab"].map(brand => (
                                <div key={brand} className="bg-white px-6 py-4 rounded-xl font-bold text-gray-700 shadow-sm border border-blue-50/50 hover:border-blue-200 transition-colors cursor-pointer">
                                    {brand}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
