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
  QrCode,
  Smartphone,
  Building,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { toast } from "sonner";
import AuthModal from "./components/AuthModal";
import { API_URL, getMediaUrl } from "@/utils/api";
import { cn } from "@/lib/utils";

export default function CheckoutPage({ setCart }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({});

  const [addressDetails, setAddressDetails] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    line1: "",
    city: "",
    zip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("qr");

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

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/settings/platform`);
        const data = await res.json();
        if (data.success) {
          setPlatformSettings(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  if (!state || !state.items) return null;

  const { items: rawItems, subtotal: rawSubtotal, discount: rawDiscount, shipping: rawShipping, promo } = state;

  const parsePrice = (val) => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^\d.-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Pre-calculate all numeric values for consistency
  const parsedItems = rawItems.map(item => ({
    ...item,
    price: parsePrice(item.price),
    qty: item.qty || 1
  }));

  const finalSubtotal = parsePrice(rawSubtotal);
  const finalDiscount = parsePrice(rawDiscount);
  const finalShipping = parsePrice(rawShipping);
  const finalTotal = parsedItems.reduce((acc, item) => acc + (item.price * item.qty), 0) - finalDiscount + finalShipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to complete your order");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = parsedItems.map((item) => ({
        productId: item.id.startsWith("manual-") ? null : item.id,
        name: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        isFree: !!item.isFree,
        offerType: item.offerType,
      }));

      const apiVendorId = parsedItems.find((i) => i.vendorId)?.vendorId || (vendors[0]?.id || "default_vendor");

      const payload = {
        customerId: user.id,
        vendorId: apiVendorId,
        items: orderItems,
        discountAmount: finalDiscount,
        rewardPointsUsed: 0,
        type: parsedItems.some(item => item.id?.startsWith("po")) ? "PreOrder" : "Online",
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
        setLastOrderDetails({ 
          ...data.data, 
          paymentMethod,
          items: parsedItems,
          total: finalTotal
        });
        setOrderPlaced(true);
        setCart?.([]);
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
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-stone-100 p-8 md:p-12 text-center animate-in zoom-in-95 fade-in duration-700 slide-in-from-bottom-8">
          <div className="w-20 h-20 bg-stone-50 border border-stone-100 text-stone-900 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-stone-100/50 relative group">
            <div className="absolute inset-0 bg-[#D4A373]/10 rounded-[28px] scale-0 group-hover:scale-100 transition-transform duration-500" />
            <CheckCircle size={40} strokeWidth={1.5} className="relative text-[#D4A373]" />
          </div>
          
          <div className="space-y-3 mb-10">
            <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase leading-none">
              Order Confirmed
            </h1>
            <p className="text-stone-400 font-medium text-sm px-4">
              Thank you! Your order is being processed and will be with you soon.
            </p>
          </div>

          {lastOrderDetails && (
            <div className="mb-10 py-6 px-4 bg-stone-50/50 rounded-[24px] border border-stone-50 flex flex-col items-center">
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">
                Order Reference
              </p>
              <p className="text-xl font-black text-stone-900 tracking-tight font-mono">
                {lastOrderDetails.orderNumber}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {lastOrderDetails?.paymentMethod === "qr" && (
              <button
                onClick={() => {
                  const vendor = vendors.find(v => v.id === lastOrderDetails.vendorId);
                  const phone = vendor?.contactNumber || "+918287123014";
                  
                  // Format simplified items list
                  const itemsList = (lastOrderDetails.items || []).map((item, index) => {
                    const pricePerItem = typeof item.price === "number" ? item.price : 0;
                    return `${index + 1}. *${item.name}*\n   Price: ₹${pricePerItem.toLocaleString("en-IN")} | Qty: ${item.qty || 1}`;
                  }).join("\n");

                  const totalVal = lastOrderDetails.total || 0;

                  const message = [
                    `Hi OMW, I just placed an order!`,
                    `*Order Ref:* ${lastOrderDetails.orderNumber}`,
                    `\n*Order Details:*`,
                    itemsList,
                    `\n*Total Amount:* ₹${totalVal.toLocaleString("en-IN")}`,
                    `\nI've attached my payment screenshot for verification.`
                  ].join("\n");

                  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}&lang=en`, "_blank");
                }}
                className="w-full h-14 bg-[#25D366] text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#128C7E] transition-all shadow-xl shadow-green-100/40 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Smartphone size={16} />
                Share on WhatsApp
              </button>
            )}
            <button
              onClick={() => navigate("/account")}
              className="w-full h-14 border-2 border-stone-100 bg-white text-stone-500 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:border-stone-900 hover:text-stone-900 transition-all active:scale-[0.98]"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full h-14 bg-stone-900 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-stone-200/50 flex items-center justify-center active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors">
          <Icon size={16} />
        </div>
        <input
          {...props}
          className="w-full bg-white border border-stone-200 rounded-xl py-4 pl-12 pr-4 text-[13px] font-bold text-stone-900 placeholder:text-stone-300 outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900/5 transition-all shadow-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-stone-900 font-sans pb-24">
      <main className="max-w-[1240px] mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-24">
        {/* Left Column: Form Content */}
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-stone-900 transition-colors"
            >
              <ChevronLeft size={16} /> Back to cart
            </button>
            <div className="space-y-1">
              <h1 className="text-5xl font-black text-stone-900 tracking-tight">
                Checkout
              </h1>
              <div className="flex items-center gap-2 text-stone-400 font-medium text-sm">
                <Lock size={14} /> Complete your order securely below.
              </div>
            </div>
          </div>

          {/* Section 1: Shipping Address */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-black text-xs">
                1
              </div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                Shipping Address
              </h2>
            </div>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  icon={User}
                  placeholder="e.g. kshitij"
                  value={addressDetails.firstName}
                  onChange={(e) => setAddressDetails({ ...addressDetails, firstName: e.target.value })}
                  required
                />
                <InputField
                  label="Last Name"
                  icon={User}
                  placeholder="e.g. sharma"
                  value={addressDetails.lastName}
                  onChange={(e) => setAddressDetails({ ...addressDetails, lastName: e.target.value })}
                  required
                />
              </div>

              <InputField
                label="Address"
                icon={MapPin}
                placeholder="Complete street address, apartment, etc."
                value={addressDetails.line1}
                onChange={(e) => setAddressDetails({ ...addressDetails, line1: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="City"
                  icon={Building}
                  placeholder="e.g. New Delhi"
                  value={addressDetails.city}
                  onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                  required
                />
                <InputField
                  label="Postal Code"
                  icon={Mail}
                  placeholder="6-digit code"
                  value={addressDetails.zip}
                  onChange={(e) => setAddressDetails({ ...addressDetails, zip: e.target.value })}
                  required
                />
              </div>

              <InputField
                label="Phone Number"
                icon={Phone}
                type="tel"
                placeholder="Active mobile number"
                value={addressDetails.phone}
                onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value })}
                required
              />
            </form>
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-black text-xs">
                2
              </div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                Payment Method
              </h2>
            </div>

            <div className="space-y-6">
              <div 
                onClick={() => setPaymentMethod("qr")}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group max-w-sm",
                  paymentMethod === "qr" 
                    ? "border-[#D4A373] bg-[#D4A373]/[0.03] shadow-md shadow-amber-100/20" 
                    : "border-stone-100 bg-white hover:border-stone-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg",
                    paymentMethod === "qr" ? "bg-[#D4A373] text-white shadow-amber-200/50 scale-105" : "bg-stone-50 text-stone-400 shadow-stone-100/50"
                  )}>
                    <QrCode size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-stone-900 uppercase tracking-tight">UPI / QR Code</p>
                    <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">Instant Verification</p>
                  </div>
                </div>
                
                {/* Radio Indicator */}
                <div className="absolute top-1/2 -translate-y-1/2 right-6">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                    paymentMethod === "qr" ? "border-[#D4A373] bg-[#D4A373]" : "border-stone-200"
                  )}>
                    {paymentMethod === "qr" && (
                      <div className="w-2 h-2 rounded-full bg-white animate-in fade-in zoom-in duration-300" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-100 rounded-[24px] p-6 md:p-8 shadow-sm max-w-2xl">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                  {/* Left: QR Code */}
                  <div className="relative group flex-shrink-0">
                    <div className="absolute -inset-4 bg-[#D4A373]/5 rounded-[32px] blur-xl group-hover:bg-[#D4A373]/10 transition-all duration-500" />
                    <div className="relative bg-white p-4 rounded-[24px] border border-stone-100 shadow-lg shadow-stone-100/30">
                      {platformSettings.PLATFORM_QR ? (
                        <img 
                          src={getMediaUrl(platformSettings.PLATFORM_QR)} 
                          alt="Payment QR" 
                          className="w-40 h-40 object-contain"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-stone-50 rounded-xl flex items-center justify-center text-stone-300 font-black text-[10px] uppercase tracking-widest text-center px-6">
                          QR not configured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Instructions */}
                  <div className="flex-1 space-y-6 py-2">
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-black text-stone-900 uppercase tracking-tighter">1. Scan & Pay</h3>
                      <p className="text-[11px] font-medium text-stone-400 leading-tight">
                        Scan with any UPI app and pay <span className="text-stone-900 font-bold">₹{finalTotal.toLocaleString("en-IN")}</span>.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-[13px] font-black text-stone-900 uppercase tracking-tighter">2. Capture Screenshot</h3>
                      <p className="text-[11px] font-medium text-stone-400 leading-tight">
                        Take a clear screenshot of the success screen.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-[13px] font-black text-emerald-600 uppercase tracking-tighter">3. Finalize & Share</h3>
                      <p className="text-[11px] font-medium text-stone-400 leading-tight">
                        Click "Finalize Order" and share it on WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Footer */}
          <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-stone-900 uppercase tracking-tight">Secure checkout</p>
                <p className="text-xs font-medium text-stone-400">Your payment information is encrypted and secure.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 opacity-80 transition-all cursor-default">
              <img src="/trust-badges.png" alt="Payment Security Trust Badges" className="h-10 object-contain" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="h-fit lg:sticky lg:top-12">
          <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-stone-100 overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <h2 className="text-lg font-black text-stone-900 tracking-tight">Order Summary</h2>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {parsedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-100 flex-shrink-0 overflow-hidden relative">
                        {(() => {
                          const imgPath = item.imageUrls?.[0] || item.image || item.imageUrl;
                          return imgPath ? (
                            <img 
                              src={getMediaUrl(imgPath)} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-200">
                              <ShoppingBag size={16} />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-stone-900 truncate uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-bold text-stone-400 mt-0.5">
                          QTY: {item.qty} · ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-black text-stone-900">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3 pt-6 border-t border-stone-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-black text-stone-900 text-[12px]">₹{finalSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-400 uppercase tracking-widest text-[10px]">Logistic Fee</span>
                  <span className="font-black text-emerald-600 uppercase tracking-widest text-[10px]">FREE</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-6 border-t border-stone-50 space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-stone-900 tracking-tighter leading-none">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </p>
                </div>

                {!user ? (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full h-14 bg-stone-900 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-stone-200/50"
                  >
                    <User size={14} /> SIGN IN TO CONTINUE
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-stone-900 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center relative group shadow-xl shadow-stone-200/50 transform active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock size={14} />
                        FINALIZE ORDER
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>
                )}

                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-stone-300 uppercase tracking-widest">
                  <CheckCircle size={10} /> Satisfaction Guaranteed
                </div>
              </div>
            </div>

            {/* Bottom Trust Icons */}
            <div className="bg-stone-50/50 border-t border-stone-100 p-6 grid grid-cols-3 gap-3">
              <div className="text-center space-y-1.5">
                <div className="w-7 h-7 rounded-full bg-white border border-stone-100 flex items-center justify-center mx-auto text-amber-600">
                  <ShieldCheck size={12} />
                </div>
                <p className="text-[7px] font-black text-stone-900 uppercase leading-tight">100% Original<br/><span className="text-stone-400">Authentic</span></p>
              </div>
              <div className="text-center space-y-1.5 border-x border-stone-200/50 px-1">
                <div className="w-7 h-7 rounded-full bg-white border border-stone-100 flex items-center justify-center mx-auto text-amber-600">
                  <CreditCard size={12} />
                </div>
                <p className="text-[7px] font-black text-stone-900 uppercase leading-tight">Secure Pay<br/><span className="text-stone-400">Encrypted</span></p>
              </div>
              <div className="text-center space-y-1.5">
                <div className="w-7 h-7 rounded-full bg-white border border-stone-100 flex items-center justify-center mx-auto text-amber-600">
                  <RotateCcw size={12} />
                </div>
                <p className="text-[7px] font-black text-stone-900 uppercase leading-tight">Easy Returns<br/><span className="text-stone-400">Hassle Free</span></p>
              </div>
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
