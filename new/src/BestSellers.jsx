import { getAllProducts } from "./data/products";
import ProductCard from "./components/card.jsx";

export default function BestSellers({ addToCart }) {
    const allProducts = getAllProducts();
    // Filter for 'Best Seller' or 'Top Rated'
    const bestSellers = allProducts.filter(p => p.tag === "Best Seller" || p.tag === "Top Rated" || p.rating >= 4.7);

    return (
        <div className="w-full px-[20px] py-[40px] max-w-[1240px] mx-auto min-h-[80vh]">

            {/* Hero-like Header for Best Sellers */}
            <div className="relative rounded-[20px] overflow-hidden bg-[#151515] text-white p-[40px] md:p-[60px] mb-[50px] flex flex-col items-center text-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
                <div className="relative z-10">
                    <span className="text-[14px] font-[700] uppercase tracking-[2px] text-[#d1408e] mb-[12px] block">Customer Favorites</span>
                    <h1 className="text-[48px] font-[800] tracking-tight mb-[16px] leading-[1.1]">Best Sellers</h1>
                    <p className="text-[16px] text-white/80 max-w-[600px] leading-relaxed">
                        Our most-loved products, tried and tested by thousands. <br />These are the essentials our community swears by.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[28px]">
                {bestSellers.map(p => (
                    <div key={p.id} className="w-full">
                        <ProductCard
                            product={{ ...p, category: p.tag, inStock: true }}
                            onAddToCart={() => addToCart(p.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
