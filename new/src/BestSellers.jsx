import { useState, useMemo } from "react";
import { getAllProducts } from "./data/products";
import {
    Star, Heart, ShoppingBag, Eye, X, Filter, ChevronDown, Check,
    Truck, ShieldCheck, RefreshCw, Zap
} from "lucide-react";

export default function BestSellers({ addToCart }) {
    const allProducts = getAllProducts();
    const [activeFilter, setActiveFilter] = useState("Skincare");
    const [sortOption, setSortOption] = useState("Most Popular");
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Filters
    const FILTERS = ["Skincare", "Makeup", "Haircare", "Fragrance", "Tools", "New Best Sellers"];

    // Filter Logic
    const filteredProducts = useMemo(() => {
        let products = allProducts;

        // Category Filter
        if (activeFilter !== "All") {
            if (activeFilter === "New Best Sellers") {
                products = products.filter(p => p.tag === "New" || p.tag === "Best Seller");
            } else {
                products = products.filter(p => p.category === activeFilter);
            }
        }

        // Sort Logic
        return [...products].sort((a, b) => {
            switch (sortOption) {
                case "Best Rated": return b.rating - a.rating;
                case "New Arrivals": return a.tag === "New" ? -1 : 1;
                case "Price Low to High": return a.price - b.price;
                case "Price High to Low": return b.price - a.price;
                default: return 0; // Most Popular
            }
        });
    }, [activeFilter, sortOption, allProducts]);

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-sans text-[#1a1a1a] pb-20">

            {/* 1. HEADER SECTION */}
            <section className="pt-16 pb-12 text-center px-6 bg-gradient-to-b from-white to-[#fdfbf7]">
                <h1 className="text-5xl md:text-6xl font-[900] tracking-tight mb-4">Best Sellers</h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                    Shop our most-loved skincare, makeup, haircare, and beauty essentials.
                    Tried, tested, and adored by our community.
                </p>
            </section>

            {/* 2. FILTERS & SORT */}
            <div className="sticky top-[70px] z-30 bg-[#fdfbf7]/90 backdrop-blur-md py-4 border-b border-gray-200/50 mb-12">
                <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Categories */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeFilter === f
                                        ? "bg-[#1a1a1a] text-white shadow-md"
                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative group">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 pl-5 pr-10 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:border-gray-400 focus:outline-none shadow-sm"
                        >
                            <option>Most Popular</option>
                            <option>Best Rated</option>
                            <option>New Arrivals</option>
                            <option>Price Low to High</option>
                            <option>Price High to Low</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-black transition-colors" />
                    </div>
                </div>
            </div>

            {/* 3. PRODUCT GRID */}
            <div className="max-w-[1440px] mx-auto px-6 mb-24">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {filteredProducts.map(p => (
                            <div key={p.id} className="group relative">
                                {/* Image Area */}
                                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-gray-100 mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                                        {p.tag && (
                                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                {p.tag}
                                            </span>
                                        )}
                                    </div>

                                    {/* Wishlist */}
                                    <button className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur text-gray-600 flex items-center justify-center hover:bg-white hover:text-red-500 hover:scale-110 transition-all shadow-sm">
                                        <Heart size={18} strokeWidth={2} />
                                    </button>

                                    {/* Image */}
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Quick Actions Overlay (Desktop) */}
                                    <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                        <button
                                            onClick={() => addToCart(p.id)}
                                            className="flex-1 bg-[#1a1a1a] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black shadow-lg"
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => setQuickViewProduct(p)}
                                            className="w-12 bg-white text-[#1a1a1a] rounded-xl flex items-center justify-center hover:bg-gray-50 shadow-lg"
                                            title="Quick View"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{p.brand}</span>
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-bold">{p.rating}</span>
                                            <span className="text-[10px] text-gray-400">({p.reviews})</span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight mb-2 text-[#1a1a1a] group-hover:text-pink-600 transition-colors">{p.name}</h3>
                                    <div className="font-bold text-[#1a1a1a]">
                                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                    </div>
                )}
            </div>

            {/* 4. CURATED SECTIONS */}
            <section className="bg-white py-20 mb-12">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-[900] tracking-tight">Clean Beauty Favorites</h2>
                        <a href="#" className="text-sm font-bold border-b border-[#1a1a1a] pb-0.5 hover:text-pink-600 hover:border-pink-600 transition-colors">View All</a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#eff6f5] rounded-[32px] p-10 flex flex-col justify-center relative overflow-hidden group h-[300px]">
                            <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] bottom-[-20px] w-64 h-64 object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="relative z-10 max-w-xs">
                                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block shadow-sm">Plant Based</span>
                                <h3 className="text-3xl font-[900] mb-4">Nature's Best for Your Skin</h3>
                                <p className="text-gray-600 mb-6 font-medium">100% Vegan & Cruelty Free formulations.</p>
                                <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all w-fit">Shop Clean</button>
                            </div>
                        </div>
                        <div className="bg-[#fff0f5] rounded-[32px] p-10 flex flex-col justify-center relative overflow-hidden group h-[300px]">
                            <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] bottom-[-20px] w-64 h-64 object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="relative z-10 max-w-xs">
                                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block shadow-sm">Trending</span>
                                <h3 className="text-3xl font-[900] mb-4">Glow Up Essentials</h3>
                                <p className="text-gray-600 mb-6 font-medium">Get that glass skin look with our viral picks.</p>
                                <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all w-fit">Shop Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. TRUST STRIP */}
            <div className="bg-[#1a1a1a] text-white py-12">
                <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { icon: Truck, title: "Free Shipping", sub: "On orders over ₹999" },
                        { icon: ShieldCheck, title: "Authentic", sub: "100% Genuine Products" },
                        { icon: RefreshCw, title: "Easy Returns", sub: "15-Day Policy" },
                        { icon: Zap, title: "Fast Delivery", sub: "Within 3-5 Days" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <item.icon size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-wide">{item.title}</h4>
                                <p className="text-xs text-gray-400">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* QUICK VIEW MODAL */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setQuickViewProduct(null)}
                    />
                    <div className="relative bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                            onClick={() => setQuickViewProduct(null)}
                        >
                            <X size={20} />
                        </button>

                        <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
                            <img src={quickViewProduct.image} alt={quickViewProduct.name} className="max-w-full max-h-[400px] object-contain drop-shadow-xl" />
                        </div>

                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                            <div className="mb-auto">
                                <span className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-2 block">{quickViewProduct.brand}</span>
                                <h2 className="text-3xl font-[900] mb-2 leading-tight">{quickViewProduct.name}</h2>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex text-yellow-500"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                                    <span className="text-sm font-bold text-gray-500 underline">{quickViewProduct.reviews} Reviews</span>
                                </div>

                                <div className="text-2xl font-bold mb-8">
                                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(quickViewProduct.price)}
                                </div>

                                <div className="space-y-6 mb-8">
                                    {quickViewProduct.shades && quickViewProduct.shades.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Select Shade</span>
                                            <div className="flex flex-wrap gap-2">
                                                {quickViewProduct.shades.map(shade => (
                                                    <button key={shade} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:border-black focus:border-black focus:bg-black focus:text-white transition-all">
                                                        {shade}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Key Ingredients</span>
                                        <p className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            {quickViewProduct.ingredients || "Coming soon"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button className="w-14 h-14 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                                    <Heart size={24} />
                                </button>
                                <button
                                    onClick={() => {
                                        addToCart(quickViewProduct.id);
                                        setQuickViewProduct(null);
                                    }}
                                    className="flex-1 bg-[#1a1a1a] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={18} /> Add to Bag
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STICKY MOBILE FILTERS TRIGGER (Optional enhancement) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
                <button className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Filter size={16} /> Filters
                </button>
            </div>
        </div>
    );
}
