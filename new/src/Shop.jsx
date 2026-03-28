import { useState, useMemo } from "react";
import { useProducts } from "./context/ProductContext";
import ProductCard from "./components/card.jsx";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function formatINR(amount) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
}

export default function Shop({ addToCart, wishlist, toggleWishlist }) {
    const { products: allProducts } = useProducts();
    const navigate = useNavigate();

    // Filter States
    const [selectedOrigins, setSelectedOrigins] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [localMaxPrice, setLocalMaxPrice] = useState(2000);
    const [sortOrder, setSortOrder] = useState("default"); // default, price-asc, price-desc

    const origins = ["Korean", "Japanese", "Other"];

    // Filter & Sort Logic
    const filteredProducts = useMemo(() => {
        let result = allProducts.filter(p => {
            // Origin Filter
            if (selectedOrigins.length > 0 && !selectedOrigins.includes(p.origin)) {
                return false;
            }
            // Price Filter
            if (p.price < priceRange[0] || p.price > priceRange[1]) {
                return false;
            }
            return true;
        });

        // Sorting
        if (sortOrder === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [allProducts, selectedOrigins, priceRange, sortOrder]);

    function toggleOrigin(origin) {
        setSelectedOrigins(prev =>
            prev.includes(origin) ? prev.filter(o => o !== origin) : [...prev, origin]
        );
    }

    return (
        <div className="w-full px-[12px] sm:px-[24px] md:px-[40px] pt-[12px] pb-[40px] lg:pt-[24px] lg:pb-[80px] flex flex-col md:flex-row gap-[24px] lg:gap-[48px] max-w-[1720px] mx-auto min-h-[80vh] relative">
            {/* Sidebar with Glassmorphism */}
            <aside className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-[40px] md:sticky md:top-[110px] self-start h-fit z-30 transition-all duration-300 bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                {/* Header for Sidebar */}
                <div className="pb-4 border-b border-stone-100 mb-2">
                    <h2 className="text-[20px] font-black tracking-tight text-[#1a1a1a] flex items-center gap-2">
                        Filters
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                    </h2>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">Refine your selection</p>
                </div>

                {/* Origin Filter - Pill Style */}
                <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-stone-400">Origin</h3>
                    <div className="flex flex-wrap gap-2.5">
                        {origins.map(origin => (
                            <button
                                key={origin}
                                onClick={() => toggleOrigin(origin)}
                                className={`px-5 py-2.5 rounded-full border transition-all duration-300 font-bold text-[11px] uppercase tracking-wider ${
                                    selectedOrigins.includes(origin)
                                        ? 'bg-stone-900 border-stone-900 text-white shadow-lg scale-105'
                                        : 'bg-white border-stone-200 text-stone-500 hover:border-pink-300 hover:text-pink-600'
                                }`}
                            >
                                {origin}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Filter - High-end Slider */}
                <div className="flex flex-col gap-[20px] mt-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-stone-400">Price Range</h3>
                        <span className="text-[12px] font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md transition-all duration-75">
                            {formatINR(localMaxPrice)}
                        </span>
                    </div>
                    <div className="relative pt-2 px-1">
                        <div className="h-[2px] w-full bg-stone-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-pink-500 to-purple-600 transition-none"
                                style={{ width: `${(localMaxPrice / 2000) * 100}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2000"
                            step="1"
                            value={localMaxPrice}
                            onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                            onMouseUp={() => setPriceRange([0, localMaxPrice])}
                            onTouchEnd={() => setPriceRange([0, localMaxPrice])}
                            className="absolute inset-x-0 -top-1.5 w-full h-8 opacity-0 cursor-pointer z-10"
                            aria-label="Filter by max price"
                        />
                        {/* Custom Handle */}
                        <div
                            className="absolute h-6 w-6 bg-white border-2 border-stone-900 rounded-full top-[1px] -translate-x-1/2 shadow-lg pointer-events-none transition-none flex items-center justify-center after:content-[''] after:w-1 after:h-1 after:bg-stone-900 after:rounded-full"
                            style={{ left: `${(localMaxPrice / 2000) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        <span>Min ₹0</span>
                        <span>Max ₹2,000</span>
                    </div>
                </div>

                {/* Clear All Helper */}
                {(selectedOrigins.length > 0 || localMaxPrice < 2000) && (
                    <button 
                        onClick={() => { 
                            setSelectedOrigins([]); 
                            setPriceRange([0, 2000]); 
                            setLocalMaxPrice(2000); 
                        }}
                        className="text-[11px] font-bold text-pink-600 hover:text-pink-700 transition-colors uppercase tracking-widest mt-4 text-left flex items-center gap-1.5"
                    >
                        <span className="text-base text-stone-300">↺</span> Reset selection
                    </button>
                )}
            </aside>

            {/* Product Grid */}
            <main className="flex-1 w-full min-w-0">
                <div className="mb-[48px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[24px]">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[40px] md:text-[56px] font-black tracking-[-2px] leading-[0.9] m-0 text-[#1a1a1a]">
                            Shop All
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="h-0.5 w-8 bg-pink-500"></span>
                            <span className="text-[13px] font-black text-stone-400 uppercase tracking-[2px]">
                                {filteredProducts.length} Premium Essentials Found
                            </span>
                        </div>
                    </div>

                    {/* Enhanced Sort Dropdown */}
                    <div className="relative min-w-[200px]">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full appearance-none bg-stone-50 border border-transparent rounded-[20px] pl-[20px] pr-[44px] py-[14px] text-[13px] font-bold text-stone-900 cursor-pointer focus:outline-none focus:bg-white focus:border-stone-900 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md uppercase tracking-wider"
                        >
                            <option value="default">Sort by: Relevancy</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                        <div className="absolute right-[20px] top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                            <ChevronDown size={14} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* Grid with better spacing and animation */}
                <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-[24px] gap-y-[56px]">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ProductCard
                                product={{ ...p, category: p.tag, inStock: true }}
                                onAddToCart={() => addToCart(p.id)}
                                wishlist={wishlist}
                                toggleWishlist={toggleWishlist}
                                onClick={() => navigate(`/product/${p.id}`)}
                            />
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-[160px] text-center flex flex-col items-center gap-[24px] bg-stone-50 rounded-[48px] border-2 border-dashed border-stone-200">
                        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-300">
                            <span className="text-4xl">🔎</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[20px] text-stone-900 m-0 font-black tracking-tight">Empty selection</p>
                            <p className="text-[14px] text-stone-400 m-0 font-bold max-w-[240px]">No products match your current luxury filters.</p>
                        </div>
                        <button
                            className="bg-stone-900 text-white px-[40px] py-[16px] rounded-[99px] font-black text-[11px] uppercase tracking-[2px] cursor-pointer transition-all hover:bg-stone-800 hover:scale-105 active:scale-95 shadow-xl shadow-stone-900/10 mt-2"
                            onClick={() => { setSelectedOrigins([]); setPriceRange([0, 2000]); setSortOrder("default"); }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
