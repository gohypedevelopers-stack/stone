import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle,
  MapPin,
  CreditCard,
  Lock,
  User,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { toast } from "sonner";
import AuthModal from "./components/AuthModal";
import { API_URL } from "@/utils/api";

export default function CheckoutPage({ setCart }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);

  const [addressDetails, setAddressDetails] = useState({
    firstName: "",
    lastName: "",
    line1: "",
    city: "",
    zip: "",
    phone: "",
  });

  // Pre-fill form from user profile or last used address
  useEffect(() => {
    if (user) {
      setAddressDetails((prev) => {
        const names = (user.name || "").split(" ");
        const defaultAddr = user.addresses?.[0] || {};
        return {
          ...prev,
          firstName: prev.firstName || names[0] || "",
          lastName: prev.lastName || names.slice(1).join(" ") || "",
          phone: prev.phone || user.mobile || "",
          line1: prev.line1 || defaultAddr.line1 || "",
          city: prev.city || defaultAddr.city || "",
          zip: prev.zip || defaultAddr.postalCode || "",
        };
      });
    }
  }, [user]);

  useEffect(() => {
    if (!state || !state.items || !user) {
      navigate("/cart");
    }
  }, [state, navigate, user]);

  useEffect(() => {
    // Fetch vendors so we have a valid fallback vendorId
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_URL}/vendors`);
        const data = await res.json();
        if (data.success) {
          setVendors(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      }
    };
    fetchVendors();
  }, []);

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
      const orderItems = items.map((item) => ({
        productId: item.id.startsWith("manual-") ? null : item.id,
        name: item.name,
        quantity: item.qty,
        unitPrice:
          typeof item.price === "number"
            ? item.price
            : parseFloat(item.price.replace(/[^\d.-]/g, "")),
      }));

      // Prioritize item vendor id, then fallback to db vendor
      const fallbackVendor =
        vendors.length > 0 ? vendors[0].id : "default_vendor";
      const apiVendorId =
        items.find((i) => i.vendorId)?.vendorId || fallbackVendor;

      const orderType = items.some(
        (item) => item.id && item.id.startsWith("po"),
      )
        ? "PreOrder"
        : "Online";

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
          state: "Default",
          postalCode: addressDetails.zip,
          country: "India",
        },
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-stone-50 border border-stone-200 text-stone-900 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <CheckCircle size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-4 tracking-tighter uppercase">
          Order confirmed
        </h1>
        <p className="text-stone-500 max-w-md mb-8 font-medium text-lg">
          Thank you! Your order has been received.
        </p>
        {lastOrderDetails && (
          <div className="mb-12 bg-stone-50 px-8 py-6 rounded-2xl border border-stone-100 flex flex-col items-center">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
              Order Reference
            </p>
            <p className="text-xl font-black text-stone-900 tracking-tight">
              {lastOrderDetails.orderNumber}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/account")}
            className="h-[56px] px-10 border border-stone-200 text-stone-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:border-black hover:text-black transition-all"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="h-[56px] px-10 bg-stone-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-stone-200/50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const inputClasses =
    "w-full bg-stone-50/50 border border-stone-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 placeholder:text-stone-400 transition-all";

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans pb-12">
      <main className="max-w-[1140px] mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
        {/* Form */}
        <div className="space-y-10 md:space-y-12">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors"
            >
              <ChevronLeft size={16} /> Back to Cart
            </button>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-stone-900 mb-2">
              Checkout
            </h1>
            <p className="text-stone-500 font-medium">
              Complete your order securely below.
            </p>
          </div>

          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2.5 text-stone-400 border-b border-stone-100 pb-4">
              <MapPin size={16} /> 01. Shipping Address
            </h2>
            <form
              id="checkout-form"
              onSubmit={handlePlaceOrder}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                required
                type="text"
                placeholder="First Name"
                value={addressDetails.firstName}
                onChange={(e) =>
                  setAddressDetails({
                    ...addressDetails,
                    firstName: e.target.value,
                  })
                }
                className={inputClasses}
              />
              <input
                required
                type="text"
                placeholder="Last Name"
                value={addressDetails.lastName}
                onChange={(e) =>
                  setAddressDetails({
                    ...addressDetails,
                    lastName: e.target.value,
                  })
                }
                className={inputClasses}
              />
              <input
                required
                type="text"
                placeholder="Address Line 1"
                value={addressDetails.line1}
                onChange={(e) =>
                  setAddressDetails({
                    ...addressDetails,
                    line1: e.target.value,
                  })
                }
                className={`${inputClasses} md:col-span-2`}
              />
              <input
                required
                type="text"
                placeholder="City"
                value={addressDetails.city}
                onChange={(e) =>
                  setAddressDetails({ ...addressDetails, city: e.target.value })
                }
                className={inputClasses}
              />
              <input
                required
                type="text"
                placeholder="Zip Code"
                value={addressDetails.zip}
                onChange={(e) =>
                  setAddressDetails({ ...addressDetails, zip: e.target.value })
                }
                className={inputClasses}
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={addressDetails.phone}
                onChange={(e) =>
                  setAddressDetails({
                    ...addressDetails,
                    phone: e.target.value,
                  })
                }
                className={`${inputClasses} md:col-span-2`}
              />
            </form>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2.5 text-stone-400 border-b border-stone-100 pb-4">
              <CreditCard size={16} /> 02. Payment Method
            </h2>
            <div className="p-5 border-2 border-stone-900 bg-stone-50/50 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-900 rounded-lg flex items-center justify-center text-white">
                  <CreditCard size={20} />
                </div>
                <div>
                  <span className="font-black text-sm uppercase tracking-tight text-stone-900">
                    Credit / Debit Card
                  </span>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">
                    Instant Activation
                  </p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-[6px] border-stone-900 bg-white" />
            </div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-4 flex items-center gap-1.5 ml-1">
              <Lock size={12} /> Secure End-to-End Encryption
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit lg:sticky lg:top-24">
          <div className="bg-stone-50/50 p-8 rounded-2xl border border-stone-200">
            <h2 className="text-sm font-black uppercase tracking-tight mb-8">
              Order Summary
            </h2>
            <div className="space-y-4 mb-8">
              {items.map((item) => {
                const priceNum =
                  typeof item.price === "number"
                    ? item.price
                    : parseFloat(item.price.replace(/[^\d.-]/g, ""));
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-start gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-stone-800 leading-tight mb-1">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                        Qty: {item.qty} · ₹{priceNum.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="font-black text-stone-900 text-sm">
                      ₹{(priceNum * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-stone-200 pt-6 space-y-4">
              <div className="flex justify-between text-sm font-bold text-stone-500">
                <span className="uppercase tracking-widest text-[11px]">
                  Subtotal
                </span>
                <span className="text-stone-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-stone-900 text-sm font-bold">
                  <span className="uppercase tracking-widest text-[11px]">
                    Promo Applied
                  </span>
                  <span>- ₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-stone-500">
                <span className="uppercase tracking-widest text-[11px]">
                  Logistic Fee
                </span>
                <span className="text-stone-900">
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between items-end mt-8 pt-6 border-t border-stone-200">
                <div>
                  <span className="block uppercase tracking-widest text-[11px] text-stone-500 font-bold mb-1">
                    Total Amount
                  </span>
                  <span className="text-3xl font-black tracking-tighter text-stone-900">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {!user ? (
              <div className="mt-8 p-6 bg-white border border-stone-200 rounded-xl text-center shadow-sm">
                <div className="w-12 h-12 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <Lock size={20} />
                </div>
                <h3 className="text-sm font-black text-stone-900 mb-1.5 uppercase tracking-tight">
                  Identity Required
                </h3>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">
                  Sign in to complete your checkout.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full h-[48px] bg-stone-900 text-white rounded-lg font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <User size={14} />
                  Sign In / Register
                </button>
              </div>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full mt-8 h-[64px] bg-stone-900 text-white rounded-xl font-black uppercase tracking-widest text-[13px] hover:bg-black transform active:scale-[0.98] transition-all shadow-xl shadow-stone-200/50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Finalize Order"
                )}
              </button>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <CheckCircle size={12} strokeWidth={2} /> Satisfaction Guaranteed
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
