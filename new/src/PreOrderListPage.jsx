import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PREORDER_PRODUCTS } from "./data/products";
import { 
    Clock, Filter, ChevronDown, ChevronLeft, Heart, 
    ShieldCheck, Truck, RefreshCcw, Bell
} from "lucide-react";

export default function PreOrderListPage({ wishlist = [], toggleWishlist }) {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Release Date");

    const FILTERS = ["All", "Skincare", "Makeup", "Haircare", "Exclusive"];

    const filteredProducts = useMemo(() => {
        let items = [...PREORDER_PRODUCTS];

        if (activeFilter !== "All") {
            items = items.filter(p => p.category === activeFilter || p.tag === activeFilter);
        }

        // Sort logic
        return items.sort((a, b) => {
            switch (sortOption) {
                case "Price Low to High": return parseFloat(a.price.replace(/[^\d.-]/g, '')) - parseFloat(b.price.replace(/[^\d.-]/g, ''));
                case "Price High to Low": return parseFloat(b.price.replace(/[^\d.-]/g, '')) - parseFloat(a.price.replace(/[^\d.-]/g, ''));
                case "Demand": return a.stockLeft - b.stockLeft;
                default: return 0; // Release Date / Default
            }
        });
    }, [activeFilter, sortOption]);

    return (
        <div className="min-h-screen bg-[#fffcfc] font-sans pb-20">
            {/* Header Area */}
            <div className="bg-gradient-to-br from-[#fff0f5] to-white border-b border-pink-50 pt-24 pb-12 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm mb-8 transition-colors"
                    >
                        <ChevronLeft size={18} /> Back
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-100 rounded-full text-[10px] font-black uppercase tracking-widest text-[#d1408e] mb-4">
                                <Clock size={12} /> Early Access
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a] tracking-tight mb-4">
                                Pre-ORDER <span className="text-[#d1408e]">Drops</span>
                            </h1>
                            <p className="text-gray-500 text-lg max-w-xl font-medium leading-relaxed">
                                Reserve the most anticipated beauty launches before they hit the shelves.
                                Limited slots available for early supporters.
                            </p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-[#d1408e]">{PREORDER_PRODUCTS.length}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Drops</span>
                            </div>
                            <div className="w-[1px] h-10 bg-gray-100" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-gray-900">100%</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="sticky top-[70px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 mb-12">
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeFilter === f
                                    ? "bg-[#d1408e] text-white shadow-md"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full md:w-auto">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full md:w-auto appearance-none bg-white border border-gray-200 pl-5 pr-10 py-2.5 rounded-full text-sm font-bold cursor-pointer hover:border-[#d1408e] focus:outline-none shadow-sm transition-colors"
                        >
                            <option>Release Date</option>
                            <option>Price Low to High</option>
                            <option>Price High to Low</option>
                            <option>Demand</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {filteredProducts.map((p) => (
                        <div 
                            key={p.id}
                            onClick={() => navigate(`/preorder/${p.id}`)}
                            className="group cursor-pointer flex flex-col h-full"
                        >
                            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1 mb-6">
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-black/80 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                                        {p.tag}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWishlist(p);
                                    }}
                                    className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all z-10 ${wishlist.some(i => i.id === p.id) ? 'bg-red-50 text-red-500 lg:scale-110' : 'bg-white/80 text-gray-900 hover:bg-[#d1408e] hover:text-white'}`}
                                >
                                    <Heart size={18} fill={wishlist.some(i => i.id === p.id) ? "currentColor" : "none"} />
                                </button>
                                
                                <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} />
                                
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl border border-white/50 shadow-sm">
                                        <div className="flex justify-between items-center text-[10px] font-black text-[#d1408e] uppercase tracking-widest mb-1">
                                            <span className="flex items-center gap-1"><Clock size={12} /> Unlocks</span>
                                            <span>{p.unlockDate}</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#d1408e]" 
                                                style={{ width: `${(p.stockLeft / p.totalStock) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-1">
                                <h3 className="text-xl font-black text-[#1a1a1a] mb-1 group-hover:text-[#d1408e] transition-colors">{p.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">{p.price}</span>
                                    <div className="flex items-center gap-1 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        <Bell size={12} /> {p.stockLeft} Slots Left
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Footer */}
            <div className="mt-24 bg-[#1a1a1a] text-white py-16 px-6">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { icon: ShieldCheck, title: "Authentic", sub: "Direct from Brand" },
                        { icon: Truck, title: "Priority Ship", sub: "First into Hands" },
                        { icon: RefreshCcw, title: "Flexible", sub: "Cancel Anytime" },
                        { icon: Clock, title: "Launch Day", sub: "Prompt Delivery" }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d1408e]">
                                <item.icon size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-wide mb-1 uppercase tracking-widest">{item.title}</h4>
                                <p className="text-xs text-gray-400 font-medium">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
