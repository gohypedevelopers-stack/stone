import { useState, useMemo, useEffect } from "react";
import ProductCard from "./components/card";
import { getAllProducts } from "./data/products";
import { SparklesText } from "./components/ui/sparkles-text";
import { ShieldCheck, RotateCcw, Lock, Clock, Flame, Tag, X, ChevronDown, Check, MousePointerClick, ShoppingBag, Gift, Wallet, TrendingUp, Filter, Package, Layers, Plus, Zap, Calendar, Siren, Stars, Hourglass, AlertCircle, Timer } from "lucide-react";

function formatINR(amount) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const OFFERS = [
    {
        id: "flat-20",
        label: "Flat 20% Off",
        sub: "On orders above ₹999",
        badge: "Hot",
        gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    },
    {
        id: "bogo",
        label: "Buy 1 Get 1",
        sub: "Select serums only",
        badge: "Ends Today",
        gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    },
    {
        id: "under-499",
        label: "Under ₹499",
        sub: "Budget friendly picks",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    },
    {
        id: "combo-deals",
        label: "Combo Deals",
        sub: "routine bundles",
        badge: "Value",
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    },
    {
        id: "weekend-specials",
        label: "Weekend Specials",
        sub: "Flash sale live now",
        gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    },
    {
        id: "limited-time",
        label: "Limited Time",
        sub: "Grab before it's gone",
        badge: "Urgent",
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
];

const FAQS = [
    {
        q: "How do I apply the Buy 1 Get 1 offer?",
        a: "Simply add two eligible products from the BOGO collection to your cart. The lower-priced item will automatically be free at checkout.",
    },
    {
        q: "Can I combine multiple offers?",
        a: "Generally, only one promotional code or automatic offer applies per order, unless specified otherwise (e.g., free shipping + discount).",
    },
    {
        q: "Are the products authentic?",
        a: "Yes! 100% of our products are sourced directly from brands or authorized distributors. We guarantee authenticity.",
    },
];

export default function ShopByOfferPage({ initialOffer = "flat-20", addToCart }) {
    const [selectedOfferId, setSelectedOfferId] = useState(initialOffer);
    const [sortBy, setSortBy] = useState("recommended"); // 'recommended' | 'price-asc' | 'price-desc'

    const products = getAllProducts();

    // Mock filtering logic - in a real app, products would have offer tags
    const filteredProducts = useMemo(() => {
        // For demo purposes, we'll randomize or check generic properties
        // In reality, match `product.offerIds.includes(selectedOfferId)`
        let list = [...products];

        // Simple pseudo-filter logic for variety
        if (selectedOfferId === "bogo") {
            list = list.filter((p) => p.category === "Serums" || p.price > 1200);
        } else if (selectedOfferId === "under-499") {
            list = list.filter((p) => p.price <= 499);
        } else if (selectedOfferId === "flat-20") {
            list = list.filter((p) => p.price > 800)
        }
        else {
            // shuffle slightly or limit for other categories
            list = list.slice(0, 12);
        }

        if (sortBy === "price-asc") {
            list.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            list.sort((a, b) => b.price - a.price);
        }

        return list;
    }, [products, selectedOfferId, sortBy]);

    const selectedOffer = OFFERS.find((o) => o.id === selectedOfferId) || OFFERS[0];

    // --- Flat 20% Off Specific Layout ---
    if (selectedOfferId === "flat-20") {
        const flat20Products = products.map(p => ({
            ...p,
            salePrice: Math.floor(p.price * 0.8),
            savings: Math.floor(p.price * 0.2)
        }));

        // Sort logics
        const displayProducts = [...flat20Products];
        if (sortBy === "price-asc") displayProducts.sort((a, b) => a.salePrice - b.salePrice);
        if (sortBy === "price-desc") displayProducts.sort((a, b) => b.salePrice - a.salePrice);

        // Mock countdown
        const [timeLeft, setTimeLeft] = useState({ h: 12, m: 30, s: 45 });

        return (
            <div className="min-h-screen bg-[#faf9f8] font-sans text-[#1b1b1b]">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#fff0f5,#e6e6fa,#ffe4e1)] py-16 px-6 text-center">
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 shadow-sm text-pink-600 border border-pink-100">
                            <Flame size={14} fill="currentColor" /> Sitewide Savings
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 font-['Playfair_Display'] tracking-tight text-[#1b1b1b]">
                            Flat 20% Off
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                            Enjoy instant savings on skincare & makeup essentials. No code required.
                        </p>

                        {/* Countdown / Urgency */}
                        <div className="inline-flex items-center gap-6 bg-white px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Offer Ends In</div>
                                <div className="flex items-center gap-2 font-mono text-xl font-bold text-brand1">
                                    <Clock size={20} className="text-pink-500" />
                                    <span>{timeLeft.h}h : {timeLeft.m}m : {timeLeft.s}s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-300/20 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-300/20 rounded-full blur-[120px]" />
                    </div>
                </div>

                {/* Sticky Offer Bar */}
                <div className="sticky top-[60px] z-40 bg-white/90 backdrop-blur-xl border-y border-gray-100 shadow-sm transition-all duration-300">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-900 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <Check size={14} className="text-green-600" />
                                Discount Applied
                            </div>
                            <span className="text-sm text-gray-500">
                                You’re viewing <strong className="text-gray-900">{products.length}</strong> eligible products
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg px-4 py-2 pr-8 cursor-pointer focus:outline-none hover:bg-gray-100 transition-colors"
                                >
                                    <option value="recommended">Recommended</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                            </div>
                            <button
                                onClick={() => setSelectedOfferId(null)} // Or go back to all offers
                                className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors underline decoration-transparent hover:decoration-current"
                            >
                                View All Offers
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-16">

                    {/* Featured Deals */}
                    <section>
                        <h2 className="flex items-center gap-2 text-2xl font-bold mb-8">
                            <Tag className="text-pink-500" /> Featured High-Value Picks
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {displayProducts.slice(0, 3).map((p) => (
                                <div key={p.id} className="relative group bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                                    <div className="flex gap-6">
                                        <div className="w-1/3 aspect-square bg-gray-50 rounded-2xl overflow-hidden p-2">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Save {formatINR(p.savings)}</div>
                                            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{p.name}</h3>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-2xl font-bold text-pink-600">{formatINR(p.salePrice)}</span>
                                                <span className="text-sm text-gray-400 line-through">{formatINR(p.price)}</span>
                                            </div>
                                            <button
                                                onClick={() => addToCart(p.id)}
                                                className="w-full bg-[#1b1b1b] text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg shadow-black/10"
                                            >
                                                Add to Bag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Main Grid */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8">Shop All 20% Off</h2>
                        {/* Using the same grid denseness as requested previously */}
                        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-4 gap-y-10">
                            {displayProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={{
                                        ...p,
                                        category: p.tag,
                                        salePrice: p.salePrice, // Passing calculated sale price
                                        inStock: true
                                    }}
                                    onAddToCart={() => addToCart(p.id)}
                                // Customizing styles via props if ProductCard supports it, or relying on passed data
                                />
                            ))}
                        </div>
                    </section>

                    {/* Trust Elements */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-gray-100 mt-12">
                        <div className="flex flex-col items-center text-center gap-3 p-6 bg-blue-50/50 rounded-2xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">100% Authentic Listings</h3>
                                <p className="text-xs text-gray-500 mt-1">Sourced directly from verified brands</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3 p-6 bg-pink-50/50 rounded-2xl">
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                                <RotateCcw size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Easy Returns</h3>
                                <p className="text-xs text-gray-500 mt-1">Hassle-free 30-day return policy</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3 p-6 bg-green-50/50 rounded-2xl">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Secure Payments</h3>
                                <p className="text-xs text-gray-500 mt-1">Encrypted SSL checkout protection</p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Carousel (Generic reuse for now) */}
                    <section>
                        <h3 className="text-xl font-bold mb-6">Pair with These Offers</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {products.slice(8, 14).map(p => (
                                <div key={p.id} className="min-w-[160px] w-[160px]">
                                    <ProductCard
                                        product={{ ...p, category: p.tag, inStock: true }}
                                        onAddToCart={() => addToCart(p.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // --- Buy 1 Get 1 Specific Layout ---
    if (selectedOfferId === "bogo") {
        const bogoProducts = products.filter(p => p.category === "Serums" || p.price > 1200); // Mock filter logic

        // Sort
        const displayProducts = [...bogoProducts];
        if (sortBy === "price-asc") displayProducts.sort((a, b) => a.price - b.price);
        if (sortBy === "price-desc") displayProducts.sort((a, b) => b.price - a.price);

        return (
            <div className="min-h-screen bg-[#fffcfc] font-sans text-[#1b1b1b]">
                {/* BOGO Hero */}
                <div className="relative overflow-hidden bg-[linear-gradient(to_bottom,#ffeef2,#fff5f7,#fff)] py-16 px-6 text-center">
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-[#ff4f6e]/10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 text-[#ff4f6e]">
                            <Gift size={14} /> Limited Time Offer
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter text-[#1b1b1b] uppercase italic leading-none">
                            Buy 1 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f6e] to-[#ff8a2a]">Get 1</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-light">
                            Double your beauty favorites at no extra cost. Mix and match allowed!
                        </p>

                        {/* How It Works Strip */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12 bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-pink-100 shadow-[0_10px_40px_rgba(255,79,110,0.08)]">
                            <div className="flex flex-col items-center gap-3 relative group">
                                <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-300">
                                    <MousePointerClick size={24} />
                                </div>
                                <h3 className="font-bold text-center">1. Choose Products</h3>
                                <p className="text-xs text-gray-500 text-center">Select any 2 eligible items from the list below</p>
                                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-pink-100" />
                            </div>
                            <div className="flex flex-col items-center gap-3 relative group">
                                <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-300">
                                    <ShoppingBag size={24} />
                                </div>
                                <h3 className="font-bold text-center">2. Add to Cart</h3>
                                <p className="text-xs text-gray-500 text-center">Add both items to your shopping bag</p>
                                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-pink-100" />
                            </div>
                            <div className="flex flex-col items-center gap-3 group">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Gift size={24} />
                                </div>
                                <h3 className="font-bold text-center">3. Get 2nd Free</h3>
                                <p className="text-xs text-gray-500 text-center">Lowest priced item is automatically free!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky BOGO Bar */}
                <div className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-xl border-y border-pink-100 shadow-sm">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full text-xs font-bold">1/2</span>
                            <span className="text-sm font-medium text-gray-900">
                                You’re shopping <strong className="text-pink-600">Buy 1 Get 1</strong> eligible products
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-transparent text-sm font-bold text-gray-700 pr-6 cursor-pointer focus:outline-none hover:text-black"
                                >
                                    <option value="recommended">Best Value</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => setSelectedOfferId(null)}
                                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                Exit Offer
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-16">
                    {/* Top BOGO Picks */}
                    <section>
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Top BOGO Picks</h2>
                                <p className="text-gray-500 mt-2">Customers are loving these combos right now</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {displayProducts.slice(0, 3).map((p) => (
                                <div key={p.id} className="relative group bg-white rounded-[2rem] p-6 border border-gray-100 hover:border-pink-200 shadow-sm hover:shadow-xl transition-all duration-300">
                                    <div className="absolute top-4 left-4 z-10 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                        Best Seller
                                    </div>
                                    <div className="absolute top-4 right-4 z-10 bg-[#ff4f6e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-pink-200">
                                        Free on 2nd
                                    </div>

                                    <div className="w-full aspect-[4/3] bg-[#fff0f5] rounded-[1.5rem] mb-6 overflow-hidden relative">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-xl mb-2">{p.name}</h3>
                                        <div className="text-sm text-gray-500 mb-4">{p.tag}</div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 uppercase font-bold">Price</span>
                                                <span className="text-xl font-black">{formatINR(p.price)}</span>
                                            </div>
                                            <button
                                                onClick={() => addToCart(p.id)}
                                                className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                            >
                                                <ShoppingBag size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Main Logic: BOGO Grid */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            All Eligible Products <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md">{products.length} Items</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-4 gap-y-10">
                            {displayProducts.map((p) => (
                                <div key={p.id} className="relative group">
                                    <div className="absolute top-3 left-3 z-10 bg-[#ff8a2a] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">
                                        BOGO
                                    </div>
                                    <ProductCard
                                        product={{
                                            ...p,
                                            category: p.tag,
                                            inStock: true
                                        }}
                                        onAddToCart={() => addToCart(p.id)}
                                    />
                                    {/* Visual nudge overlay */}
                                    {/* <div className="absolute inset-x-0 bottom-0 pointer-events-none p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center z-20">
                                         <div className="bg-black/80 backdrop-blur text-white text-[10px] py-1 px-3 rounded-full">
                                             Add 1 more to get free
                                         </div>
                                     </div> */}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // --- Under 499 Specific Layout ---
    if (selectedOfferId === "under-499") {
        const under499Products = products.filter(p => p.price <= 499);

        // Sort
        const displayProducts = [...under499Products];
        if (sortBy === "price-asc") displayProducts.sort((a, b) => a.price - b.price);
        if (sortBy === "price-desc") displayProducts.sort((a, b) => b.price - a.price);

        return (
            <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#1b1b1b]">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-[linear-gradient(120deg,#e0c3fc_0%,#8ec5fc_100%)] py-16 px-6 text-center">
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 text-white border border-white/30 shadow-sm">
                            <Wallet size={14} /> Budget Friendly
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 font-['Playfair_Display'] tracking-tight text-white drop-shadow-sm">
                            Under ₹499
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
                            Budget-friendly beauty essentials you’ll love. Great finds without stretching your wallet.
                        </p>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px]" />
                    </div>
                </div>

                {/* Sticky Summary Bar */}
                <div className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-xl border-y border-gray-100 shadow-sm">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                <Filter size={14} className="text-blue-600" />
                                Price Filter Active
                            </div>
                            <span className="text-sm text-gray-500">
                                Showing <strong className="text-gray-900">{under499Products.length}</strong> products priced under ₹499
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg px-4 py-2 pr-8 cursor-pointer focus:outline-none hover:bg-gray-100 transition-colors"
                                >
                                    <option value="recommended">Best Value</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                            </div>
                            <button
                                onClick={() => setSelectedOfferId(null)}
                                className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors underline decoration-transparent hover:decoration-current"
                            >
                                View All Offers
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-16">

                    {/* Top Picks Under 499 */}
                    <section>
                        <h2 className="flex items-center gap-2 text-2xl font-bold mb-8">
                            <TrendingUp className="text-blue-500" /> Top Picks Under ₹499
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {displayProducts.slice(0, 3).map((p) => (
                                <div key={p.id} className="relative group bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                                    <div className="absolute top-4 left-4 z-10 bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Great Value
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-1/3 aspect-square bg-gray-50 rounded-2xl overflow-hidden p-2">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{p.name}</h3>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-2xl font-bold text-[#1b1b1b]">{formatINR(p.price)}</span>
                                            </div>
                                            <button
                                                onClick={() => addToCart(p.id)}
                                                className="w-full bg-white border border-gray-200 text-[#1b1b1b] py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                                            >
                                                Add to Bag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Main Grid */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8">All Budget Finds</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-4 gap-y-10">
                            {displayProducts.map((p) => (
                                <div key={p.id} className="relative">
                                    <ProductCard
                                        product={{
                                            ...p,
                                            category: p.tag,
                                            inStock: true
                                        }}
                                        onAddToCart={() => addToCart(p.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Trust Elements */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-gray-100 mt-12">
                        <div className="flex flex-col items-center text-center gap-3 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Authentic Products</h3>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">
                                <RotateCcw size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Easy Returns</h3>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Secure Payments</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Combo Deals Specific Layout ---
    if (selectedOfferId === "combo-deals") {
        // Mocking Data for Bundles since we don't have real bundle types
        const bundles = [
            {
                id: "bundle-1",
                name: "Complete Radiance Kit",
                description: "Vitamin C Serum + Daily Moisturizer",
                products: [products[0], products[2]],
                price: 2400,
                originalPrice: 3200,
                savings: 800,
                benefit: "Glow & Hydrate",
                image: products[0].image, // Using first product image for demo
                rating: 4.8
            },
            {
                id: "bundle-2",
                name: "Acne Defense Duo",
                description: "Salicylic Cleanser + Spot Treatment",
                products: [products[4], products[6]],
                price: 1500,
                originalPrice: 2100,
                savings: 600,
                benefit: "Acne Control",
                image: products[4] ? products[4].image : products[0].image,
                rating: 4.7
            },
            {
                id: "bundle-3",
                name: "Weekend Prep Set",
                description: "Exfoliating Mask + Night Cream",
                products: [products[1], products[3]],
                price: 1800,
                originalPrice: 2500,
                savings: 700,
                benefit: "Deep Repair",
                image: products[1] ? products[1].image : products[0].image,
                rating: 4.9
            },
            {
                id: "bundle-4",
                name: "Daily Essentials Trio",
                description: "Cleanser + Toner + SPF",
                products: [products[5], products[7], products[8]],
                price: 2999,
                originalPrice: 4200,
                savings: 1201,
                benefit: "Full Routine",
                image: products[5] ? products[5].image : products[0].image,
                rating: 4.6
            }
        ].filter(b => b.products.every(p => p !== undefined)); // Safe check

        return (
            <div className="min-h-screen bg-[#fffbf9] font-sans text-[#1b1b1b]">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-[linear-gradient(to_bottom_right,#fff0f5,#e6e6fa,#ffe4e1)] py-16 px-6 text-center">
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-purple-100/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 text-purple-700 border border-purple-200 shadow-sm">
                            <Layers size={14} /> Bundle & Save
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 font-['Playfair_Display'] tracking-tight text-[#1b1b1b]">
                            Combo Deals
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                            Smart bundles, better value. Complete your routine for less with our curated sets.
                        </p>

                        {/* Why Combos Strip */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-12 mt-8">
                            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl">
                                <div className="bg-green-100 p-1.5 rounded-full text-green-600"><Check size={14} /></div>
                                <span className="text-sm font-medium">Save up to 30%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl">
                                <div className="bg-blue-100 p-1.5 rounded-full text-blue-600"><Zap size={14} /></div>
                                <span className="text-sm font-medium">Complete Regimens</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl">
                                <div className="bg-pink-100 p-1.5 rounded-full text-pink-600"><Gift size={14} /></div>
                                <span className="text-sm font-medium">Perfect for Gifting</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Combo Bar */}
                <div className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-xl border-y border-purple-50 shadow-sm">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                <Package size={16} />
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                                You’re viewing <strong className="text-purple-600">Combo Deals</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select
                                    className="appearance-none bg-transparent text-sm font-bold text-gray-700 pr-6 cursor-pointer focus:outline-none hover:text-black"
                                >
                                    <option value="recommended">Best Value</option>
                                    <option value="savings">Biggest Savings</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => setSelectedOfferId(null)}
                                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-purple-500 transition-colors"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-16">
                    {/* Top Combo Picks */}
                    <section>
                        <h2 className="flex items-center gap-3 text-3xl font-black italic mb-8">
                            <SparklesText text="Top Combo Picks" colors={{ first: "#a855f7", second: "#ec4899" }} />
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bundles.map((bundle) => (
                                <div key={bundle.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-2xl transition-all duration-300 group flex flex-col">

                                    <div className="w-full aspect-square bg-[#f3f4f6] rounded-[1.5rem] mb-6 relative overflow-hidden flex items-center justify-center">
                                        {/* Mocking a 'combo' visual by showing first image */}
                                        <img src={bundle.image} alt={bundle.name} className="h-3/4 object-contain mix-blend-multiply z-10 group-hover:scale-105 transition-transform duration-500" />

                                        {/* Combo Badge */}
                                        <div className="absolute top-4 left-4 z-20 bg-black/5 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Layers size={12} /> {bundle.products.length} Items inside
                                        </div>

                                        {/* Savings Badge */}
                                        <div className="absolute top-4 right-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                            Save {formatINR(bundle.savings)}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-purple-600 mb-2">{bundle.benefit}</div>
                                        <h3 className="font-bold text-xl mb-1">{bundle.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{bundle.description}</p>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs text-gray-400 line-through mr-2">{formatINR(bundle.originalPrice)}</span>
                                                <span className="text-xl font-black text-gray-900">{formatINR(bundle.price)}</span>
                                            </div>
                                            <button
                                                className="bg-[#1b1b1b] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                                            >
                                                <ShoppingBag size={16} /> Add Bundle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Trust Elements Reuse */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-gray-100 mt-12 opacity-80">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <ShieldCheck size={16} /> Authentic Products
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <RotateCcw size={16} /> Easy Returns
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Lock size={16} /> Secure Payment
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Weekend Specials Specific Layout ---
    if (selectedOfferId === "weekend-specials") {
        const weekendProducts = products.slice(0, 12).map(p => ({
            ...p,
            weekendPrice: Math.floor(p.price * 0.85),
            originalPrice: p.price
        }));

        const [timeLeft, setTimeLeft] = useState({ d: 1, h: 14, m: 22, s: 10 });

        return (
            <div className="min-h-screen bg-[#fff0f5] font-sans text-[#1b1b1b]">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-[linear-gradient(to_bottom,#fbc2eb,#a6c1ee)] py-20 px-6 text-center">
                    {/* Confetti/Sparkles Background Effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[10%] left-[20%] text-white/40 animate-pulse"><Stars size={24} /></div>
                        <div className="absolute top-[30%] right-[15%] text-white/30 animate-bounce"><Stars size={32} /></div>
                        <div className="absolute bottom-[20%] left-[10%] text-white/20"><Stars size={16} /></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-md px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase mb-8 text-white border border-white/40 shadow-lg animate-pulse">
                            <Siren size={16} /> Limited Time Event
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-6 font-['Playfair_Display'] tracking-tighter text-white drop-shadow-md">
                            Weekend Specials
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
                            Your weekend glow, at special prices. Treat yourself before Monday arrives!
                        </p>

                        {/* Countdown Timer */}
                        <div className="inline-block bg-white/90 backdrop-blur-xl px-10 py-6 rounded-3xl shadow-2xl">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Ends In</div>
                            <div className="flex items-center justify-center gap-8 font-mono text-4xl font-black text-[#1b1b1b]">
                                <div className="flex flex-col items-center">
                                    <span>01</span>
                                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider mt-1">Days</span>
                                </div>
                                <span className="text-gray-300 transform -translate-y-2">:</span>
                                <div className="flex flex-col items-center">
                                    <span>14</span>
                                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider mt-1">Hours</span>
                                </div>
                                <span className="text-gray-300 transform -translate-y-2">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-pink-600 animate-pulse">22</span>
                                    <span className="text-[10px] text-gray-400 font-sans font-bold uppercase tracking-wider mt-1">Mins</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Weekend Bar */}
                <div className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-xl border-y border-pink-100 shadow-sm">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-900">
                                You’re viewing <strong className="text-pink-600">Weekend-Only Deals</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select
                                    className="appearance-none bg-transparent text-sm font-bold text-gray-700 pr-6 cursor-pointer focus:outline-none hover:text-black"
                                >
                                    <option value="ending-soon">Ending Soon</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => setSelectedOfferId(null)}
                                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-pink-500 transition-colors"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-16">

                    {/* Top Weekend Picks */}
                    <section>
                        <h2 className="flex items-center gap-2 text-3xl font-bold mb-8 text-[#1b1b1b]">
                            <Calendar className="text-pink-500" /> This Weekend's Headliners
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {weekendProducts.slice(0, 3).map((p) => (
                                <div key={p.id} className="relative group bg-white rounded-3xl p-6 border-2 border-transparent hover:border-pink-300 shadow-sm hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300 overflow-hidden">
                                    {/* Glow Effect */}
                                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-pink-100/30 to-transparent rotate-45 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="absolute top-0 right-0 bg-[#1b1b1b] text-white text-xs font-bold px-4 py-2 rounded-bl-2xl z-10">
                                        Weekend Special
                                    </div>

                                    <div className="flex gap-6 relative z-10">
                                        <div className="w-1/3 aspect-square bg-gray-50 rounded-2xl overflow-hidden p-2">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{p.name}</h3>
                                            <div className="flex flex-col mb-4">
                                                <span className="text-xs text-gray-500 line-through">Was {formatINR(p.originalPrice)}</span>
                                                <span className="text-2xl font-black text-pink-600">{formatINR(p.weekendPrice)}</span>
                                            </div>
                                            <button
                                                onClick={() => addToCart(p.id)}
                                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                            >
                                                Grab Deal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Main Weekend Grid */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8">All Limited-Time Offers</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-4 gap-y-10">
                            {weekendProducts.map((p) => (
                                <div key={p.id} className="relative group">
                                    <ProductCard
                                        product={{
                                            ...p,
                                            price: p.weekendPrice, // Use discounted price
                                            category: p.tag,
                                            inStock: true
                                        }}
                                        onAddToCart={() => addToCart(p.id)}
                                    />
                                    {/* Subtle overlay hint */}
                                    {/* <div className="absolute inset-0 border-2 border-pink-400/0 group-hover:border-pink-400/50 rounded-2xl transition-all pointer-events-none" /> */}
                                    <div className="absolute top-2 left-2 bg-pink-100 text-pink-700 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                        -15%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // --- Limited Time Offers Specific Layout ---
    if (selectedOfferId === "limited-time") {
        const limitedTimeProducts = products.map(p => ({
            ...p,
            limitedPrice: Math.floor(p.price * 0.75), // Steeper discount for limited time
            originalPrice: p.price,
            endsIn: "4h 23m" // Mock individual timer
        }));

        const [timeLeft, setTimeLeft] = useState({ h: 4, m: 59, s: 59 });

        return (
            <div className="min-h-screen bg-[#fff5f5] font-sans text-[#1b1b1b]">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#ff9a9e_0%,#fecfef_99%,#fecfef_100%)] py-20 px-6 text-center">
                    {/* Pulse Background Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/10 rounded-full blur-3xl animate-pulse" />

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-red-600 px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-8 text-white shadow-xl shadow-red-500/30 animate-bounce">
                            <Hourglass size={14} /> Hurry — Ends Soon
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-6 font-['Playfair_Display'] tracking-tighter text-white drop-shadow-md">
                            Limited Time Offers
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
                            Exclusive savings, for a short time only. Don't miss out!
                        </p>

                        {/* Urgent Countdown */}
                        <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-md border border-white/40 px-8 py-4 rounded-2xl">
                            <Timer size={24} className="text-white" />
                            <div className="font-mono text-3xl font-black text-white tracking-widest">
                                04 : 59 : 59
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Limited Bar */}
                <div className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-xl border-y border-red-50 shadow-sm">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={16} className="text-red-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-900">
                                You’re viewing <strong className="text-red-500">Limited Time Deals</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select
                                    className="appearance-none bg-transparent text-sm font-bold text-gray-700 pr-6 cursor-pointer focus:outline-none hover:text-black"
                                >
                                    <option value="ending-soon">Ending Soon</option>
                                    <option value="savings">Best Value</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => setSelectedOfferId(null)}
                                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-16">

                    {/* Hurry Picks */}
                    <section>
                        <h2 className="flex items-center gap-2 text-3xl font-bold mb-8 text-[#1b1b1b]">
                            <Flame className="text-red-500 fill-red-500" /> Hurry Picks
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {limitedTimeProducts.slice(0, 3).map((p) => (
                                <div key={p.id} className="relative group bg-white rounded-3xl p-6 border border-gray-100 hover:border-red-200 shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300">
                                    <div className="absolute top-4 left-4 z-10 bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={10} /> {p.endsIn} left
                                    </div>

                                    <div className="flex gap-6 mt-4">
                                        <div className="w-1/3 aspect-square bg-gray-50 rounded-2xl overflow-hidden p-2">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{p.name}</h3>
                                            <div className="flex flex-col mb-4">
                                                <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-black text-red-600">₹{p.limitedPrice}</span>
                                                    <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">-25%</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addToCart(p.id)}
                                                className="w-full bg-red-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                                            >
                                                Add to Bag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Main Limited Grid */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8">Ends Soon</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-4 gap-y-10">
                            {limitedTimeProducts.map((p) => (
                                <div key={p.id} className="relative group">
                                    <ProductCard
                                        product={{
                                            ...p,
                                            price: p.limitedPrice, // Use discounted price
                                            category: p.tag,
                                            inStock: true
                                        }}
                                        onAddToCart={() => addToCart(p.id)}
                                    />
                                    {/* Pulse overlay */}
                                    {/* <div className="absolute inset-0 border-2 border-red-500/0 group-hover:border-red-500/30 rounded-2xl transition-all pointer-events-none animate-pulse" /> */}
                                    <div className="absolute top-2 left-2 bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                        Limited Time
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // --- Default / Other Offers Layout ---
    return (
        <div className="min-h-screen bg-bg-custom pb-20">
            {/* Hero Section */}
            <div className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 via-white to-white overflow-hidden">
                {/* Abstract background shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-pink-200 rounded-full blur-[100px]" />
                    <div className="absolute top-[10%] right-[5%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[80px]" />
                </div>

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 font-['Playfair_Display'] italic">
                        <SparklesText text="Beauty Treats & Offers" className="inline-block" colors={{ first: "#FF4FA3", second: "#efd31eff" }} />
                    </h1>
                    <p className="text-xl text-muted-custom font-['Playfair_Display']">
                        Exclusive savings on your favorite beauty essentials
                    </p>
                </div>
            </div>

            {/* Offer Type Cards Nav */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="grid grid-flow-col auto-cols-[160px] md:auto-cols-min md:grid-flow-row md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                    {OFFERS.map((offer) => (
                        <button
                            key={offer.id}
                            onClick={() => setSelectedOfferId(offer.id)}
                            className={`relative p-4 rounded-xl text-left transition-all duration-300 snap-start
                        ${selectedOfferId === offer.id
                                    ? "ring-2 ring-offset-2 ring-brand1 shadow-lg scale-[1.02]"
                                    : "hover:-translate-y-1 hover:shadow-md opacity-80 hover:opacity-100"
                                }
                    `}
                            style={{ background: offer.gradient }}
                        >
                            {offer.badge && (
                                <span className="absolute top-2 right-2 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    {offer.badge}
                                </span>
                            )}
                            <div className="mt-8 font-bold text-gray-900 leading-tight">{offer.label}</div>
                            <div className="text-xs text-gray-700 mt-1">{offer.sub}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-[60px] z-30 bg-white/80 backdrop-blur-md border-y border-line-custom mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
                    <div className="text-sm font-medium text-text-custom">
                        Showing results for: <span className="font-bold text-brand1">{selectedOffer.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer font-medium text-muted-custom hover:text-text-custom"
                        >
                            <option value="recommended">Best Value</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Top Deals Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    🔥 Top Deals Today
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...products].sort((a, b) => b.price - a.price).slice(0, 3).map((p, idx) => (
                        <div key={p.id} className="flex bg-white border border-line-custom rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="w-[120px] bg-gray-50 flex items-center justify-center p-2">
                                <img src={p.image} alt={p.name} className="max-h-full object-contain" />
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-center">
                                <div className="text-xs font-bold text-red-500 mb-1">50% OFF</div>
                                <h3 className="font-bold text-sm mb-1 line-clamp-1">{p.name}</h3>
                                <div className="text-xs text-muted-custom mb-3 line-clamp-1">{p.tag}</div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-bold">₹{Math.floor(p.price / 2)}</span>
                                    <span className="text-muted-custom line-through text-xs">₹{p.price}</span>
                                </div>
                                <button
                                    onClick={() => addToCart(p.id)}
                                    className="w-full py-2 bg-black text-white rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            {/* Product Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                    {filteredProducts.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={{ ...p, category: p.tag, inStock: true }} // simple adapter
                            onAddToCart={() => addToCart(p.id)}
                            onClick={() => { }} // Navigate to product detail
                        />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <p className="text-muted-custom">No products found for this offer category currently.</p>
                        <button onClick={() => setSelectedOfferId(OFFERS[0].id)} className="text-brand1 font-medium mt-2 hover:underline">View all offers</button>
                    </div>
                )}
            </section>

            {/* FAQ Recommendations */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6">You May Also Like</h3>
                    {/* Reuse a recommendation row or just random products */}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {products.slice(5, 10).map(p => (
                            <div key={p.id} className="min-w-[160px] w-[160px]">
                                <ProductCard
                                    product={{ ...p, category: p.tag, inStock: true }}
                                    onAddToCart={() => addToCart(p.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-6">Common Questions</h3>
                    <div className="space-y-4">
                        {FAQS.map((item, i) => (
                            <div key={i} className="border border-line-custom rounded-xl p-4 bg-white">
                                <h4 className="font-bold text-sm mb-2 text-gray-900">{item.q}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
