import { useState, useMemo, useEffect } from "react";
import {
    Star, Heart, ShoppingBag, Eye, X, Filter, ChevronDown, Check,
    Truck, ShieldCheck, RefreshCw, Zap, Search, ArrowRight, Sparkles
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.jsx";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./components/ui/pagination";

import { useNavigate } from "react-router-dom";

import { API_URL } from "@/utils/api";

export default function CategoryPage({ category = "Serums", addToCart, onCategoryChange, wishlist = [], toggleWishlist }) {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Most Popular");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/products?category=${category}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    const mapped = d.data
                        .filter(p => p.showOnline !== false && p.category?.name !== "Special Offer" && !p.specialOfferType)
                        .map(p => ({
                        id: p.id,
                        name: p.name,
                        brand: p.brand || "OMW Skin",
                        price: p.price,
                        rating: 4.5 + (Math.random() * 0.5), // Mock rating if not in DB
                        reviews: Math.floor(Math.random() * 200) + 10,
                        image: p.imageUrls?.[0] || "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=800&q=80",
                        tag: p.tags?.[0] || null,
                        benefits: p.benefits ? p.benefits.split(',').map(b => b.trim()) : ["Premium", "Natural"]
                    }));
                    
                    // Filter out duplicates by ID or Name+Brand to be safe
                    const uniqueMapped = mapped.filter((p, index, self) =>
                        index === self.findIndex((t) => 
                            t.id === p.id || (t.name === p.name && t.brand === p.brand)
                        )
                    );
                    
                    setProducts(uniqueMapped);
                }
            })
            .catch(err => console.error("Error fetching category products:", err))
            .finally(() => setLoading(false));
    }, [category]);

    const ALL_CATEGORIES = [
        "B.b cream", "Blender", "Blush", "Brush", "Cleanser", "cleansing oil", "compact powders",
        "Concealer", "Cushion foundation", "Essence", "Exfoliate", "Eye cream", "Face mists",
        "Foundation", "Hair set", "International makeup", "International skincare", "Japanese Skincare",
        "Korean skincare", "Lip blam", "Lipstick", "Makeup remover", "Mascara", "Moisturizer",
        "Primer", "Razor", "Serums", "Sheet masks", "SKIN1004", "Sunscreen", "Sunspray",
        "Sunstick", "toner", "toner pads", "Treatment mask"
    ];

    const MOCK_PRODUCTS = useMemo(() => products, [products]);

    // Top Picks
    const TOP_PICKS = MOCK_PRODUCTS.slice(0, 3);

    // Avoid duplication: if we show TOP_PICKS, GRID_PRODUCTS should start AFTER them
    const GRID_PRODUCTS = MOCK_PRODUCTS.length > 3 
        ? MOCK_PRODUCTS.slice(3) 
        : MOCK_PRODUCTS;

    // Pagination Logic
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = GRID_PRODUCTS.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(GRID_PRODUCTS.length / itemsPerPage);

    // Reset page when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [category]);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const FILTERS = ["All", "Hydration", "Brightening", "Acne Care", "Anti-Aging", "Sensitive Skin"];

    // Content Mapping
    const CATEGORY_CONTENT = {
        "Serums": { title: "Concentrated Perfection", desc: "Targeted treatments to transform your skin." },
        "Sunscreen": { title: "Daily Invisible Shield", desc: "Protect your glow with zero white cast." },
        "Moisturizer": { title: "Deep Hydration Lock", desc: "Plump, dewy, and nourished skin all day." },
        "Hair set": { title: "Crown of Glory", desc: "Salon-quality care for stronger, shinier hair." },
        "Cleanser": { title: "The First Step", desc: "Gentle yet effective daily purification." },
        "B.b cream": { title: "B.B. Cream", desc: "Perfect coverage meets skincare." },
        "Lipstick": { title: "Bold & Beautiful", desc: "High-pigment shades for every mood." },
        "Korean skincare": { title: "K-Beauty Essentials", desc: "The secrets to the glass skin look." },
        "default": { title: "Curated Beauty", desc: "Premium essentials for your daily routine." }
    };


    const currentContent = CATEGORY_CONTENT[category] || CATEGORY_CONTENT["default"];

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-sans text-[#1a1a1a] pb-20 fade-in">
            {/* 1. HERO HEADER (Redesigned) */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-white">
                {/* Modern Minimal Background */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-pink-50 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-t from-purple-50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-8 bg-[#1a1a1a]/20" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/60">
                            {category} Collection
                        </span>
                        <div className="h-px w-8 bg-[#1a1a1a]/20" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#1a1a1a] uppercase">
                        {currentContent.title}
                    </h1>

                    <p className="text-gray-500 max-w-xl mx-auto text-lg font-light leading-relaxed">
                        {currentContent.desc}
                    </p>
                </div>
            </section>

            {/* 2. STICKY FILTER BAR */}
            <div className="sticky top-[70px] z-40 bg-[#fdfbf7]/90 backdrop-blur-xl border-y border-gray-100 py-3 shadow-sm transition-all">
                <div className="max-w-[1440px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Category Dropdown (Clean) */}
                    <div className="relative min-w-[220px] w-full lg:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center justify-between w-full bg-white border border-gray-200 pl-6 pr-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm outline-none text-left">
                                {category}
                                <ChevronDown size={14} className="text-gray-400" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[220px] max-h-96 overflow-y-auto p-1 bg-white border border-gray-100 rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95">
                                {ALL_CATEGORIES.map(cat => (
                                    <DropdownMenuItem
                                        key={cat}
                                        onClick={() => onCategoryChange && onCategoryChange(cat)}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors
                                            ${cat === category ? "bg-gray-100 text-black" : "text-gray-500 hover:bg-gray-50 hover:text-black"}
                                        `}
                                    >
                                        {cat === category && <Check size={12} className="text-black shrink-0" />}
                                        <span className={cat !== category ? "pl-5" : ""}>{cat}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Search */}
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find your favorite..."
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-black transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative min-w-[160px] hidden lg:block">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center justify-between gap-3 w-full bg-white border border-gray-200 pl-5 pr-4 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-black focus:outline-none transition-all outline-none">
                                <span className="truncate">{sortOption}</span>
                                <ChevronDown size={14} className="text-gray-500 shrink-0" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] p-1 bg-white border border-gray-100 rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95">
                                {["Most Popular", "Latest Drops", "Price: Low to High", "Top Rated"].map((option) => (
                                    <DropdownMenuItem
                                        key={option}
                                        onClick={() => setSortOption(option)}
                                        className={`
                                            px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors
                                            ${sortOption === option ? "bg-gray-100 text-black" : "text-gray-500 hover:bg-gray-50 hover:text-black"}
                                        `}
                                    >
                                        {option}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 py-12">

                {/* 3. TOP PICKS SECTION */}
                {MOCK_PRODUCTS.length > 3 && (
                    <section className="mb-20">
                    <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="text-yellow-400 fill-yellow-400" size={20} />
                        <h2 className="text-2xl font-[900] tracking-tight uppercase">Top Picks in {category}</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {TOP_PICKS.map((p, i) => (
                            <div key={p.id} className="relative group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer" onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}>
                                <div className="absolute top-4 left-4 z-10">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md ${i === 0 ? "bg-[#1a1a1a]" : "bg-pink-500"}`}>
                                        {i === 0 ? "Bestseller" : "Trending Now"}
                                    </span>
                                </div>

                                <div className="h-64 overflow-hidden bg-gray-50 relative">
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=800&q=80";
                                        }}
                                    />
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
                                        <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-pink-600 transition-colors shadow-lg">
                                            <ShoppingBag size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                )}

                {/* 4. MAIN GRID */}
                <section>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching Collection...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {currentProducts.map(p => (
                            <div key={p.id} className="group flex flex-col cursor-pointer" onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}>
                                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-lg transition-all">

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist && toggleWishlist(p);
                                        }}
                                        className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-white/60 backdrop-blur ${wishlist.some(i => i.id === p.id) ? 'text-red-500 bg-red-50' : 'hover:bg-white hover:text-red-500'}`}
                                    >
                                        <Heart size={18} fill={wishlist.some(i => i.id === p.id) ? "currentColor" : "none"} />
                                    </button>
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=800&q=80";
                                        }}
                                    />

                                    {/* Quick Add Button */}
                                    <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart(p); }}
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
                        {currentProducts.length === 0 && !loading && (
                            <div className="col-span-full py-32 text-center">
                                <Search className="mx-auto text-gray-200 mb-6" size={60} />
                                <h3 className="text-2xl font-bold mb-2">No items found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any products in the {category} category right now. Check back soon!</p>
                            </div>
                        )}
                    </div>
                )}



                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <PaginationItem key={i + 1}>
                                            <PaginationLink
                                                isActive={currentPage === i + 1}
                                                onClick={() => paginate(i + 1)}
                                                className="cursor-pointer"
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </section>

            </div >

            {/* 5. TRUST BADGES */}
            < section className="border-t border-gray-200 mt-20 pt-16 pb-8" >
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
            </section >

            {/* 6. NEWSLETTER */}
            < section className="max-w-[1440px] mx-auto px-6 mt-12" >
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
            </section >
        </div >
    );
}
