import { useState, useMemo } from "react";
import { getAllProducts } from "./data/products";
import "./homepage.css";

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
        <div className="container shopPage">
            {/* Sidebar */}
            <aside className="filterSidebar">
                <div className="filterSection">
                    <h3>Origin</h3>
                    <div className="filterOptions">
                        {origins.map(origin => (
                            <label key={origin} className="checkboxLabel">
                                <input
                                    type="checkbox"
                                    checked={selectedOrigins.includes(origin)}
                                    onChange={() => toggleOrigin(origin)}
                                />
                                {origin}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filterSection">
                    <h3>Price Range</h3>
                    <div className="priceInputs">
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
                        className="priceSlider"
                    />
                </div>
            </aside>

            {/* Product Grid */}
            <main className="shopMain">
                <div className="shopHeader">
                    <h2>Shop All ({filteredProducts.length})</h2>
                </div>

                <div className="shopGrid">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="bsCard">
                            <div className="bsImage" aria-hidden="true" />
                            <div className="bsBody">
                                <span className="bsPill">{p.tag}</span>
                                <div className="bsName">{p.name}</div>
                                <div className="bsMeta">
                                    <span className="bsPrice">{formatINR(p.price)}</span>
                                    <span className="bsRating">★ {p.rating}</span>
                                </div>
                                <span className="bsSize">{p.origin}</span>
                            </div>
                            <div className="bsActions">
                                <button className="bsWish" aria-label="Wishlist">{"\u2661"}</button>
                                <button className="bsAdd" onClick={() => addToCart(p.id)}>Add to cart</button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="noResults">
                        <p>No products match your filters.</p>
                        <button className="btn btnGhost" onClick={() => { setSelectedOrigins([]); setPriceRange([0, 2000]) }}>Clear Filters</button>
                    </div>
                )}
            </main>
        </div>
    );
}
