import React from "react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WishlistDrawer({ open, onClose, wishlist, onToggleWishlist, onAddToCart }) {
    const navigate = useNavigate();

    const formatINR = (amount) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
    };

    const handleItemClick = (item) => {
        onClose();
        const id = item.id.toString();
        if (id.startsWith("po") || id.startsWith("up")) {
            navigate(`/preorder/${id}`);
        } else {
            navigate(`/product/${id}`);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 w-[min(420px,92vw)] h-full bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] transform transition-transform duration-300 z-[61] flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-[900] text-[#1a1a1a]">Your Wishlist ({wishlist.length})</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {wishlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 mb-2">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="opacity-50"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                            </div>
                            <p className="text-gray-500 font-medium">Your wishlist is empty.</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-full font-bold text-sm hover:bg-black transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wishlist.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className="flex gap-4 p-3 rounded-2xl border border-gray-100 bg-white hover:border-pink-200 transition-colors group cursor-pointer"
                                >
                                    {/* Image */}
                                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-[#1a1a1a] text-[15px] truncate pr-4">{item.name}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleWishlist(item);
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <p className="text-sm font-bold text-[#d1408e] mt-1">
                                            {item.salePrice ? formatINR(item.salePrice) : (typeof item.price === 'number' ? formatINR(item.price) : item.price)}
                                        </p>

                                        <div className="mt-auto pt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddToCart(item.id);
                                                    onClose();
                                                }}
                                                className="w-full h-[36px] rounded-lg bg-[#1a1a1a] text-white text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#d1408e] transition-colors"
                                            >
                                                <ShoppingCart size={14} /> Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
