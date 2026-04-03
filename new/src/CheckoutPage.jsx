import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, MapPin, CreditCard, Lock, User, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { toast } from "sonner";
import AuthModal from "./components/AuthModal";

export default function CheckoutPage({ setCart }) {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastOrderDetails, setLastOrderDetails] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [addressDetails, setAddressDetails] = useState({
        firstName: "",
        lastName: "",
        line1: "",
        city: "",
        zip: "",
        phone: ""
    });

    // If no state (direct access) or no user, redirect to cart
    useEffect(() => {
        if (!state || !state.items || !user) {
            navigate("/cart");
        }
    }, [state, navigate, user]);

    if (!state || !state.items) return null;

    const { items, total, subtotal, discount, shipping, promo } = state;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error("Please login to complete your order");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Prepare items for backend
            const orderItems = items.map(item => ({
                productId: item.id.startsWith('manual-') ? null : item.id, // Backend needs DB IDs
                name: item.name,
                quantity: item.qty,
                unitPrice: item.price
            }));

            // 2. Resolve Vendor (use product vendor or first matching)
            // For now, we'll try to find any vendor ID or fallback to a known seed ID
            const apiVendorId = items.find(i => i.vendorId)?.vendorId || "cmmvweqhp0001l8m9jjuy9dou"; 

            const orderType = items.some(item => item.id.startsWith('po')) ? "PreOrder" : "Online";

            const payload = {
                customerId: user.id,
                vendorId: apiVendorId,
                items: orderItems,
                discountAmount: discount || 0,
                rewardPointsUsed: 0,
                type: orderType,
                address: {
                    line1: addressDetails.line1,
                    city: addressDetails.city,
                    state: "Default", // Could be enhanced with a selector
                    postalCode: addressDetails.zip,
                    country: "India"
                }
            };

            const res = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (data.success) {
                setLastOrderDetails(data.data);
                setOrderPlaced(true);
                setCart?.([]); // Clear the bag in frontend
                toast.success("Order placed successfully!");
            } else {
                toast.error(data.message || "Failed to place order");
            }
        } catch (err) {
            console.error("Purchase error:", err);
            toast.error("Connection failed. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[#fffcfc] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <CheckCircle size={48} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] mb-4 tracking-tighter uppercase">Order confirmed</h1>
                <p className="text-stone-500 max-w-md mb-4 font-medium text-lg">Thank you! Your order has been received.</p>
                {lastOrderDetails && (
                   <div className="mb-12 bg-stone-50 px-6 py-4 rounded-2xl border border-stone-100">
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Order Number</p>
                     <p className="text-sm font-black text-stone-900">{lastOrderDetails.orderNumber}</p>
                   </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                      onClick={() => navigate("/account")}
                      className="h-[56px] px-10 border-2 border-stone-200 text-stone-600 rounded-[16px] font-bold uppercase text-xs tracking-widest hover:border-black hover:text-black transition-all"
                  >
                      View My Orders
                  </button>
                  <button
                      onClick={() => navigate("/")}
                      className="h-[56px] px-10 bg-[#1a1a1a] text-white rounded-[16px] font-black uppercase text-xs tracking-widest hover:bg-[#d1408e] transition-all shadow-xl shadow-stone-200"
                  >
                      Continue Shopping
                  </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffcfc] text-[#1a1a1a] font-sans pb-12">
            <header className="sticky top-0 z-50 bg-[#fffcfc]/80 backdrop-blur-md border-b border-stone-100 px-6 h-[72px] flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-stone-600" />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tight">Checkout</h1>
            </header>

            <main className="max-w-[1140px] mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

                {/* Form */}
                <div className="space-y-10">
                    <section>
                        <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2.5 text-stone-400">
                            <MapPin size={16} /> 01. Shipping Address
                        </h2>
                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             <input required type="text" placeholder="First Name" value={addressDetails.firstName} onChange={e => setAddressDetails({...addressDetails, firstName: e.target.value})} className="w-full bg-white border border-stone-200 rounded-[16px] p-4 text-sm font-bold focus:outline-none focus:border-[#d1408e] placeholder:text-stone-300 transition-all focus:shadow-lg focus:shadow-pink-50" />
                             <input required type="text" placeholder="Last Name" value={addressDetails.lastName} onChange={e => setAddressDetails({...addressDetails, lastName: e.target.value})} className="w-full bg-white border border-stone-200 rounded-[16px] p-4 text-sm font-bold focus:outline-none focus:border-[#d1408e] placeholder:text-stone-300 transition-all focus:shadow-lg focus:shadow-pink-50" />
                             <input required type="text" placeholder="Address Line 1" value={addressDetails.line1} onChange={e => setAddressDetails({...addressDetails, line1: e.target.value})} className="md:col-span-2 w-full bg-white border border-stone-200 rounded-[16px] p-4 text-sm font-bold focus:outline-none focus:border-[#d1408e] placeholder:text-stone-300 transition-all focus:shadow-lg focus:shadow-pink-50" />
                             <input required type="text" placeholder="City" value={addressDetails.city} onChange={e => setAddressDetails({...addressDetails, city: e.target.value})} className="w-full bg-white border border-stone-200 rounded-[16px] p-4 text-sm font-bold focus:outline-none focus:border-[#d1408e] placeholder:text-stone-300 transition-all focus:shadow-lg focus:shadow-pink-50" />
                             <input required type="text" placeholder="Zip Code" value={addressDetails.zip} onChange={e => setAddressDetails({...addressDetails, zip: e.target.value})} className="w-full bg-white border border-stone-200 rounded-[16px] p-4 text-sm font-bold focus:outline-none focus:border-[#d1408e] placeholder:text-stone-300 transition-all focus:shadow-lg focus:shadow-pink-50" />
                             <input required type="tel" placeholder="Phone Number" value={addressDetails.phone} onChange={e => setAddressDetails({...addressDetails, phone: e.target.value})} className="md:col-span-2 w-full bg-white border border-stone-200 rounded-[16px] p-4 text-sm font-bold focus:outline-none focus:border-[#d1408e] placeholder:text-stone-300 transition-all focus:shadow-lg focus:shadow-pink-50" />
                        </form>
                    </section>

                    <section>
                        <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2.5 text-stone-400">
                            <CreditCard size={16} /> 02. Payment Method
                        </h2>
                        <div className="p-5 border-2 border-[#d1408e] bg-pink-50/10 rounded-[20px] flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#d1408e] rounded-xl flex items-center justify-center text-white">
                                <CreditCard size={20} />
                              </div>
                              <div>
                                <span className="font-black text-sm uppercase tracking-tight">Credit / Debit Card</span>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Instant Activation</p>
                              </div>
                            </div>
                            <div className="w-5 h-5 rounded-full border-[6px] border-[#d1408e] shadow-sm" />
                        </div>
                        <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mt-4 ml-1">🔒 Secure End-to-End Encryption</p>
                    </section>
                </div>

                {/* Summary */}
                <div className="h-fit lg:sticky lg:top-24">
                    <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-2xl shadow-stone-200/50">
                        <h2 className="text-lg font-black uppercase tracking-tight mb-8">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <p className="text-[13px] font-black text-stone-800 leading-tight mb-0.5">{item.name}</p>
                                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Qty: {item.qty} • {typeof item.price === 'string' ? item.price : `₹${item.price.toLocaleString('en-IN')}`}</p>
                                    </div>
                                    <span className="font-black text-stone-900 text-sm">₹{( (typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^\d.-]/g, ''))) * item.qty ).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t-2 border-dashed border-stone-100 pt-6 space-y-3">
                            <div className="flex justify-between text-sm font-bold text-stone-500">
                                <span className="uppercase tracking-widest text-[11px]">Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-[#d1408e] text-sm font-bold">
                                    <span className="uppercase tracking-widest text-[11px]">Promo Applied</span>
                                    <span>- ₹{discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold text-stone-500">
                                <span className="uppercase tracking-widest text-[11px]">Logistic Fee</span>
                                <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black mt-8 pt-8 border-t-2 border-stone-50">
                                <span className="uppercase tracking-tighter">Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {!user ? (
                           <div className="mt-8 p-8 bg-linear-to-b from-stone-50 to-white border border-stone-100 rounded-[32px] text-center shadow-sm">
                             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-pink-500">
                               <Lock size={24} />
                             </div>
                             <h3 className="text-base font-black text-stone-900 mb-2 uppercase tracking-tight">Identity Required</h3>
                             <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">Sign in to save this order and earn points.</p>
                             <button
                               onClick={() => setIsAuthModalOpen(true)}
                               className="w-full py-4 bg-stone-900 text-white rounded-[18px] font-black uppercase text-xs tracking-widest hover:bg-[#d1408e] transition-all shadow-xl shadow-stone-200 group flex items-center justify-center gap-2"
                             >
                               <Sparkles size={14} className="group-hover:animate-pulse" />
                               Sign In / Register
                             </button>
                           </div>
                        ) : (
                          <button
                              type="submit"
                              form="checkout-form"
                              disabled={isSubmitting}
                              className="w-full mt-10 h-[64px] bg-[#1a1a1a] text-white rounded-[20px] font-black uppercase tracking-widest text-sm hover:bg-[#d1408e] transform active:scale-95 transition-all shadow-xl shadow-stone-200 disabled:opacity-50"
                          >
                              {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Placing Order...
                                </span>
                              ) : "Finalize Order"}
                          </button>
                        )}
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          <CheckCircle size={12} /> Satisfaction Guaranteed
                        </div>
                    </div>
                </div>

            </main>
            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
}
