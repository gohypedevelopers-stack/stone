import { useState, useMemo } from "react";
import { getAllProducts } from "./data/products";
import ProductCard from "./components/card.jsx";

function formatINR(amount) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export default function Shop({ addToCart }) {
    const allProducts = getAllProducts();

    // Filter States
    const [selectedOrigins, setSelectedOrigins] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 2000]);

    const origins = ["Korean", "Japanese", "Other"];

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
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
    }, [allProducts, selectedOrigins, priceRange]);

    function toggleOrigin(origin) {
        setSelectedOrigins(prev =>
            prev.includes(origin) ? prev.filter(o => o !== origin) : [...prev, origin]
        );
    }

    return (
        <div className="w-full px-0 sm:px-[10px] py-[32px] flex flex-col md:flex-row gap-[32px] max-w-[1320px] mx-auto min-h-[80vh]">
            {/* Sidebar */}
            <aside className="w-full md:w-[260px] flex-shrink-0 flex flex-col gap-[32px]">
                <div className="flex flex-col gap-[16px]">
                    <h3 className="text-[18px] font-[800] m-0">Origin</h3>
                    <div className="flex flex-col gap-[10px]">
                        {origins.map(origin => (
                            <label key={origin} className="flex items-center gap-[10px] cursor-pointer text-[14px] text-[#1b1b1b] font-[500] hover:text-[#000]">
                                <input
                                    type="checkbox"
                                    checked={selectedOrigins.includes(origin)}
                                    onChange={() => toggleOrigin(origin)}
                                    className="w-[18px] h-[18px] accent-black rounded-[4px] border border-black/20"
                                />
                                {origin}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-[16px]">
                    <h3 className="text-[18px] font-[800] m-0">Price Range</h3>
                    <div className="flex justify-between text-[14px] font-[600] text-muted-custom">
                        <span>{formatINR(priceRange[0])}</span>
                        <span>-</span>
                        <span>{formatINR(priceRange[1])}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="2000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                        className="w-full h-[4px] bg-black/10 rounded-[99px] appearance-none cursor-pointer accent-black"
                    />
                </div>
            </aside>

            {/* Product Grid */}
            <main className="flex-1">
                <div className="mb-[24px]">
                    <h2 className="text-[24px] font-[800] m-0">Shop All ({filteredProducts.length})</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                    {filteredProducts.map(p => (
                        <ProductCard
                            key={p.id}
                            product={{ ...p, category: p.tag, inStock: true }}
                            onAddToCart={() => addToCart(p.id)}
                        />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-[64px] text-center flex flex-col items-center gap-[16px]">
                        <p className="text-[16px] text-muted-custom m-0">No products match your filters.</p>
                        <button
                            className="bg-transparent text-[#1b1b1b] border border-black/10 px-[24px] py-[10px] rounded-[99px] font-[700] text-[14px] uppercase tracking-[0.5px] cursor-pointer transition-all hover:bg-black hover:text-white"
                            onClick={() => { setSelectedOrigins([]); setPriceRange([0, 2000]) }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
