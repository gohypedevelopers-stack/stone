import { useState, useEffect } from "react";
import {
    Star, Heart, ShoppingBag, Eye, X, Filter, ChevronDown, Check,
    Truck, ShieldCheck, RefreshCw, Zap, Search, Sparkles, ArrowRight
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.jsx";

// Import some logos for the switcher (reusing imports for now, in real app these come from props/data)
import laneigeLogo from "./assets/productlogo/brands/laneige-logo-brandlogos.net_hveh22jp8.svg";
import cosrxLogo from "./assets/productlogo/brands/l-oreal-professionnel.svg"; // Placeholder

const API_URL = "http://localhost:5000/api";

export default function BrandPage({ brandName = "Laneige", onBrandChange, addToCart }) {
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Most Popular");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const r = await fetch(`${API_URL}/products/brands`);
                const d = await r.json();
                if (d.success) setAvailableBrands(d.data);
            } catch (e) {
                console.error("Error fetching brands:", e);
            }
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const r = await fetch(`${API_URL}/products?brand=${brandName}`);
                const d = await r.json();
                if (d.success) {
                    const filtered = d.data.filter(p => p.showOnline !== false && p.category?.name !== "Special Offer" && !p.specialOfferType);
                    setProducts(filtered);
                }
            } catch (e) {
                console.error("Error fetching products:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [brandName]);

    const currentBrand = {
        name: brandName,
        logo: brandName.toLowerCase() === 'laneige' ? laneigeLogo : 
              brandName.toLowerCase() === 'cosrx' ? cosrxLogo : null,
        tagline: brandName.toLowerCase() === 'laneige' ? "Hydration experts from Korea" : 
                 brandName.toLowerCase() === 'cosrx' ? "Expecting Tomorrow" : 
                 "Premium Beauty Collection"
    };

    const PRODUCTS = products.map(p => ({
        ...p,
        image: p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=400&q=80',
        rating: p.rating || 4.5,
        benefits: Array.isArray(p.benefits) ? p.benefits.map(b => b.text || b) : ["Premium Care", "Natural"]
    }));

    const TOP_PICKS = PRODUCTS.slice(0, 3);
    const GRID_PRODUCTS = PRODUCTS.slice(3);

    const FILTERS = ["All", "Skincare", "Makeup", "Sun Care", "Masks", "Sets"];

    return (
        <div className="min-h-screen bg-[#fffefc] font-sans text-[#1a1a1a] pb-20 fade-in">
            {/* 1. BRAND HERO HEADER */}
            <section className="relative pt-6 pb-6 px-6 overflow-hidden bg-white">
                {/* Modern Minimal Background */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-linear-to-l from-blue-50 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-linear-to-t from-pink-50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-8 bg-[#1a1a1a]/20" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/60">
                            Official Brand Store
                        </span>
                        <div className="h-px w-8 bg-[#1a1a1a]/20" />
                    </div>

                    <div className="mb-6 flex justify-center">
                        {currentBrand.logo ? (
                            <img src={currentBrand.logo} alt={currentBrand.name} className="h-16 object-contain opacity-90" />
                        ) : (
                            <h1 className="text-5xl font-black uppercase tracking-tighter text-[#1a1a1a]">
                                {brandName}
                            </h1>
                        )}
                    </div>

                    <p className="text-gray-500 max-w-xl mx-auto text-lg font-light leading-relaxed">
                        {currentBrand.tagline}
                    </p>
                </div>
            </section>

            {/* 2. UNIFIED CONTROL BAR */}
            <div className="sticky top-[70px] z-40 bg-[#fffefc]/90 backdrop-blur-xl border-y border-gray-100 shadow-sm transition-all">
                <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-col xl:flex-row items-center justify-between gap-4 xl:gap-8">

                    {/* Left: Brand Switcher & Search */}
                    <div className="flex items-center gap-6 w-full xl:w-auto">
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Switch Brand:</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 bg-white border border-gray-200 pl-4 pr-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm outline-none">
                                    {brandName}
                                    <ChevronDown size={14} className="text-gray-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 p-1 bg-white border border-gray-100 rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95">
                                    {availableBrands.map(brand => (
                                        <DropdownMenuItem
                                            key={brand}
                                            onClick={() => onBrandChange && onBrandChange(brand)}
                                            className={`
                                                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors
                                                ${brand === brandName ? "bg-gray-100 text-black" : "text-gray-500 hover:bg-gray-50 hover:text-black"}
                                            `}
                                        >
                                            {brand === brandName && <Check size={12} className="text-black" />}
                                            <span className={brand !== brandName ? "pl-5" : ""}>{brand}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder={`Search within ${brandName}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:bg-white focus:border-black transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Middle: Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto no-scrollbar mask-gradient">
                        {FILTERS.map(f => (
                            <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${activeFilter === f ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>{f}</button>
                        ))}
                    </div>

                    {/* Right: Sort */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 bg-transparent font-bold text-[10px] uppercase tracking-wider cursor-pointer focus:outline-none text-gray-600 hover:text-black transition-colors outline-none">
                            {sortOption}
                            <ChevronDown size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1 bg-white border border-gray-100 rounded-xl shadow-lg">
                            {["Most Popular", "Price: Low to High", "Newest Arrivals"].map((option) => (
                                <DropdownMenuItem
                                    key={option}
                                    onClick={() => setSortOption(option)}
                                    className={`
                                            px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-colors
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

            <div className="max-w-[1440px] mx-auto px-6 py-12">
                {/* 3. FEATURED TOP PICKS */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-[#1a1a1a]">Top Picks from {brandName}</h2>
                        <a href="#" className="text-xs font-bold uppercase tracking-wider underline decoration-gray-300 hover:decoration-black transition-all">View All</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TOP_PICKS.map((p, i) => (
                            <div key={p.id} className="group relative bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                <div className="h-80 overflow-hidden bg-gray-50 relative">
                                    {p.tag && (
                                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
                                            {p.tag}
                                        </span>
                                    )}
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                                    <div className="flex gap-2 mb-4">
                                        {p.benefits.map(b => (
                                            <span key={b} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase tracking-wide">{b}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg">
                                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}
                                        </span>
                                        <button onClick={() => addToCart(p)} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-pink-500 transition-colors">
                                            <ShoppingBag size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. MAIN PRODUCT GRID */}
                <section className="mb-20">
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Full Collection</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
                        {GRID_PRODUCTS.map(p => (
                            <div key={p.id} className="group flex flex-col">
                                <div className="relative aspect-3/4 rounded-[20px] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-lg transition-all">
                                    <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors">
                                        <Heart size={16} />
                                    </button>
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

                                    {/* Overlay Add Button */}
                                    <button
                                        onClick={() => addToCart(p)}
                                        className="absolute bottom-3 right-3 w-10 h-10 bg-white text-black rounded-full shadow-lg flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
                                    >
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>

                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-1">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[10px] font-bold text-gray-500">{p.rating}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#1a1a1a] mb-1 leading-snug group-hover:text-pink-600 transition-colors line-clamp-2">{p.name}</h3>
                                    <div className="flex items-center gap-2">
                                        {p.salePrice ? (
                                            <>
                                                <span className="text-sm font-bold text-pink-600">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.salePrice)}</span>
                                                <span className="text-xs text-gray-400 line-through">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. ABOUT BRAND & NEWSLETTER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-gray-100 pt-16">
                    <div className="bg-gray-50 rounded-[32px] p-10 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-4">About {brandName}</h3>
                        <p className="text-gray-500 leading-relaxed mb-6">
                            Discover the science and nature behind {brandName}. Known for their innovative formulas and dedication to clean, effective beauty. Every product is tested for quality and performance.
                        </p>
                        <a href="#" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-4 transition-all">Read Full Story <ArrowRight size={14} /></a>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-[32px] p-10 text-white flex flex-col justify-center text-center">
                        <Sparkles className="mx-auto mb-4 text-pink-300" />
                        <h3 className="text-2xl font-bold mb-2">Join usage {brandName} Lists</h3>
                        <p className="text-gray-400 text-sm mb-6">Get early access to new drops and exclusive sets.</p>
                        <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto w-full">
                            <input type="email" placeholder="Email address" className="flex-1 bg-white/10 border-transparent rounded-full px-5 py-3 text-sm focus:bg-white/20 transition-all focus:outline-none" />
                            <button className="bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-pink-100 transition-colors">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
