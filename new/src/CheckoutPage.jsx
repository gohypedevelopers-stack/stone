import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, MapPin, CreditCard } from "lucide-react";

export default function CheckoutPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [orderPlaced, setOrderPlaced] = useState(false);

    // If no state (direct access), redirect to cart
    useEffect(() => {
        if (!state || !state.items) {
            navigate("/cart");
        }
    }, [state, navigate]);

    if (!state || !state.items) return null;

    const { items, total, subtotal, discount, shipping } = state;

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setOrderPlaced(true);
        }, 1500);
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[#fffcfc] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h1 className="text-3xl font-[900] text-[#1a1a1a] mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">Thank you for your purchase. Your order has been placed successfully.</p>
                <button
                    onClick={() => navigate("/")}
                    className="px-8 py-3 bg-[#1a1a1a] text-white rounded-[18px] font-bold"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffcfc] text-[#1a1a1a] font-sans pb-12">
            <header className="sticky top-0 z-50 bg-[#fffcfc]/80 backdrop-blur-md border-b border-gray-100 px-4 h-[64px] flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={22} className="text-[#444]" />
                </button>
                <h1 className="text-xl font-[800]">Checkout</h1>
            </header>

            <main className="max-w-[1000px] mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Form */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-[800] mb-4 flex items-center gap-2">
                            <MapPin size={18} /> Shipping Address
                        </h2>
                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="text" placeholder="First Name" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#d1408e]" />
                                <input required type="text" placeholder="Last Name" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#d1408e]" />
                            </div>
                            <input required type="text" placeholder="Address Line 1" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#d1408e]" />
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="text" placeholder="City" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#d1408e]" />
                                <input required type="text" placeholder="Zip Code" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#d1408e]" />
                            </div>
                            <input required type="tel" placeholder="Phone Number" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#d1408e]" />
                        </form>
                    </section>

                    <section className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-[800] mb-4 flex items-center gap-2">
                            <CreditCard size={18} /> Payment Method
                        </h2>
                        <div className="p-4 border border-[#d1408e] bg-pink-50/20 rounded-[14px] flex items-center justify-between">
                            <span className="font-bold text-sm">Credit / Debit Card</span>
                            <div className="w-4 h-4 rounded-full border-[5px] border-[#d1408e]" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 ml-1">Other payment methods coming soon.</p>
                    </section>
                </div>

                {/* Summary */}
                <div className="h-fit sticky top-24">
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-lg shadow-gray-200/50">
                        <h2 className="text-lg font-[800] mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate max-w-[200px]">{item.qty}x {item.name}</span>
                                    <span className="font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-[#d1408e]">
                                    <span>Discount</span>
                                    <span>- ₹{discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between text-lg font-[900] mt-4 pt-4 border-t border-dashed border-gray-200">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            className="w-full mt-6 py-4 bg-[#1a1a1a] text-white rounded-[18px] font-[800] hover:bg-[#d1408e] transition-colors shadow-lg"
                        >
                            Place Order
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
