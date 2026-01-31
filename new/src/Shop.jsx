import { useState, useMemo } from "react";
import { getAllProducts } from "./data/products";
import ProductCard from "./components/card.jsx";
import { ChevronDown } from "lucide-react";

function formatINR(amount) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
}

export default function Shop({ addToCart }) {
    const allProducts = getAllProducts();

    // Filter States
    const [selectedOrigins, setSelectedOrigins] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 2000]);
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
        <div className="w-full px-[24px] sm:px-[40px] py-[40px] lg:pt-[60px] flex flex-col md:flex-row gap-[48px] max-w-[1440px] mx-auto min-h-[80vh]">
            {/* Sidebar */}
            <aside className="w-full md:w-[260px] flex-shrink-0 flex flex-col gap-[40px] md:sticky md:top-[120px] self-start h-fit transition-all duration-300">
                {/* Origin Filter */}
                <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[18px] font-[700] tracking-[-0.3px] m-0 text-[#151515]">Origin</h3>
                    <div className="flex flex-col gap-[14px]">
                        {origins.map(origin => (
                            <label key={origin} className="flex items-center gap-[14px] cursor-pointer group select-none">
                                <div className={`w-[20px] h-[20px] rounded-[6px] border-[1.5px] flex items-center justify-center transition-all duration-200 ${selectedOrigins.includes(origin) ? 'bg-[#151515] border-[#151515] scale-100' : 'border-[#e0e0e0] bg-white group-hover:border-[#b0b0b0]'}`}>
                                    {selectedOrigins.includes(origin) && (
                                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 4.5L4.5 7.5L10.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-[15px] font-[500] transition-colors ${selectedOrigins.includes(origin) ? 'text-[#151515]' : 'text-[#6f6f6f] group-hover:text-[#151515]'}`}>{origin}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Filter */}
                <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[18px] font-[700] tracking-[-0.3px] m-0 text-[#151515]">Price Range</h3>
                    <div className="flex items-center gap-[10px] text-[14px] font-[600] text-[#6f6f6f]">
                        <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px]">{formatINR(priceRange[0])}</span>
                        <span className="text-[#e0e0e0]">—</span>
                        <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px]">{formatINR(priceRange[1])}</span>
                    </div>
                    <div className="relative h-[4px] w-[220px] bg-[#f0f0f0] rounded-[99px] mt-[8px]">
                        <div
                            className="absolute h-full bg-[#151515] rounded-[99px]"
                            style={{ width: `${(priceRange[1] / 2000) * 100}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="2000"
                            step="100"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                            className="absolute w-full h-[4px] opacity-0 cursor-pointer z-10 top-0 left-0"
                            aria-label="Filter by max price"
                        />
                        <div
                            className="absolute h-[18px] w-[18px] bg-white border-[1.5px] border-[#151515] rounded-full top-1/2 -translate-y-1/2 shadow-sm pointer-events-none transition-transform duration-100 ease-out"
                            style={{ left: `calc(${(priceRange[1] / 2000) * 100}% - 9px)` }}
                        />
                    </div>
                </div>
            </aside>

            {/* Product Grid */}
            <main className="flex-1 w-full min-w-0">
                <div className="mb-[36px] flex flex-wrap items-center justify-between gap-[20px]">
                    <div className="flex items-baseline gap-[10px]">
                        <h2 className="text-[32px] font-[800] tracking-[-0.8px] leading-none m-0 text-[#151515]">Shop All</h2>
                        <span className="text-[16px] font-[600] text-[#888888] mb-[2px]">({filteredProducts.length})</span>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative group">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="appearance-none bg-white border border-[#e0e0e0] rounded-[14px] pl-[18px] pr-[40px] py-[10px] text-[14px] font-[600] text-[#151515] cursor-pointer focus:outline-none focus:border-[#151515] hover:border-[#b0b0b0] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        >
                            <option value="default">Sort by: Price</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                        <div className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-[#6f6f6f] group-hover:text-[#151515] transition-colors">
                            <ChevronDown size={16} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[24px] gap-y-[48px]">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="w-full">
                            <ProductCard
                                product={{ ...p, category: p.tag, inStock: true }}
                                onAddToCart={() => addToCart(p.id)}
                            />
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-[120px] text-center flex flex-col items-center gap-[20px]">
                        <p className="text-[16px] text-[#6f6f6f] m-0 font-[500]">No products match your filters.</p>
                        <button
                            className="bg-[#151515] text-white px-[32px] py-[14px] rounded-[99px] font-[700] text-[13px] uppercase tracking-[1px] cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg"
                            onClick={() => { setSelectedOrigins([]); setPriceRange([0, 2000]); setSortOrder("default"); }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
