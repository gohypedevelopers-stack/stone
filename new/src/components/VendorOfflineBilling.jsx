import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CreditCard, 
  MapPin, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  Store,
  CheckCircle2,
  Printer,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { printThermalReceipt } from "@/utils/printReceipt";

const API_URL = "http://localhost:5000/api";

export function VendorOfflineBilling() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBill, setSuccessBill] = useState(null);
  const [pointsSettings, setPointsSettings] = useState({ pointsPerAmount: 0, amountThreshold: 100 });
  const [lookedUpCustomer, setLookedUpCustomer] = useState(null);
  const lookupTimerRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vRes, pRes, psRes] = await Promise.all([
          fetch(`${API_URL}/admin/vendors`),
          fetch(`${API_URL}/admin/products`),
          fetch(`${API_URL}/admin/settings/points`)
        ]);
        
        const [vData, pData, psData] = await Promise.all([vRes.json(), pRes.json(), psRes.json()]);
        
        if (vData.success) {
          // Only show approved vendors
          setVendors(vData.data.filter(v => v.approvalStatus === 'APPROVED'));
        }
        if (pData.success) {
          setProducts(pData.data);
        }
        if (psData.success) {
          setPointsSettings(psData.data);
        }
      } catch (err) {
        console.error("Failed to load generic data", err);
      }
    };
    fetchInitialData();
  }, []);

  // Debounced customer lookup by mobile
  useEffect(() => {
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    setLookedUpCustomer(null);

    const trimmed = customerMobile.trim();
    if (trimmed.length < 10) return;

    lookupTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/admin/customers/lookup?mobile=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setLookedUpCustomer(data.data);
          if (data.data.name && !customerName) {
            setCustomerName(data.data.name);
          }
        }
      } catch (err) {
        console.error("Customer lookup failed", err);
      }
    }, 400);

    return () => clearTimeout(lookupTimerRef.current);
  }, [customerMobile]);

  // Calculate reward points for a given price
  const calcPoints = (price) => {
    const { pointsPerAmount, amountThreshold } = pointsSettings;
    if (!amountThreshold || amountThreshold <= 0) return 0;
    return Math.floor(price / amountThreshold) * pointsPerAmount;
  };

  const selectedVendor = useMemo(() => 
    vendors.find(v => v.id === selectedVendorId), [vendors, selectedVendorId]
  );

  const vendorProducts = useMemo(() => {
    if (!selectedVendorId) return [];
    let fp = products.filter(p => p.vendorId === selectedVendorId && p.status === 'ACTIVE');
    if (searchQuery) {
      fp = fp.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return fp;
  }, [products, selectedVendorId, searchQuery]);

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Do not exceed stock
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, unitPrice: product.discountPrice || product.price }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) return item; // limit to available stock
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // derived state
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0);
  }, [cart]);
  
  const tax = subtotal * 0.00; // Assuming tax is inclusive or 0 for now
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!selectedVendorId || !customerMobile || cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        vendorId: selectedVendorId,
        mobile: customerMobile,
        name: customerName || undefined,
        amount: total,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      const res = await fetch(`${API_URL}/admin/offline-ledgers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccessBill(data.data);
        setCart([]);
        setCustomerMobile("");
        setCustomerName("");
      } else {
        toast.error(data.message || "Failed to process bill.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error processing offline bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <div className="h-20 w-20 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">Offline Bill Processed Successfully</h2>
        <p className="text-stone-500 font-medium mb-8">
          Bill Reference: <span className="font-bold text-stone-900 ml-1">OFF-{successBill.id.slice(0,8).toUpperCase()}</span>
        </p>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 max-w-md w-full text-center space-y-4">
           <h3 className="font-bold text-md uppercase tracking-wide text-stone-800 border-b border-stone-100 pb-4 mb-4">Receipt Summary</h3>
           <div className="flex justify-between text-sm">
             <span className="text-stone-500">Total Items</span>
             <span className="font-bold">{successBill.items?.reduce((a,b) => a + b.quantity, 0)}</span>
           </div>
           {(successBill.customerName || successBill.customer?.name) && (
             <div className="flex justify-between text-sm">
               <span className="text-stone-500">Customer Name</span>
               <span className="font-bold">{successBill.customerName || successBill.customer?.name}</span>
             </div>
           )}
           <div className="flex justify-between text-sm">
             <span className="text-stone-500">Customer Mobile</span>
             <span className="font-bold">{successBill.mobile}</span>
           </div>
           <div className="flex justify-between text-lg pt-4 border-t border-stone-100 mt-4">
             <span className="font-bold text-stone-900">Total Charged</span>
             <span className="font-bold text-stone-900">&#8377;{Number(successBill.amount).toLocaleString('en-IN')}</span>
           </div>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <Button 
            onClick={() => printThermalReceipt(successBill)} 
            className="bg-white text-stone-900 border border-stone-200 rounded-lg h-10 px-6 font-medium text-sm hover:bg-stone-50"
          >
            <span className="flex items-center gap-2"><Printer className="h-4 w-4" /> Print Copy</span>
          </Button>
          <Button 
            onClick={() => setSuccessBill(null)} 
            className="bg-stone-900 text-white rounded-lg h-10 px-8 font-medium text-sm hover:bg-stone-800"
          >
            New Transaction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-3">
             <CreditCard className="h-8 w-8 text-stone-700" /> POS / Offline Billing
          </h1>
          <p className="text-stone-500 font-medium mt-2">Process secure in-store purchases and offline transactions for merchant partners.</p>
        </div>
      </header>

      {/* Vendor Details Section */}
      <div className="bg-stone-100/60 p-2 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-2 border border-stone-200/60 shadow-inner">
        {/* Vendor Selector */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col justify-center">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 block">Operating Vendor</Label>
          <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
            <SelectTrigger className="h-11 rounded-lg border-stone-200 bg-stone-50 focus:ring-stone-900 font-semibold text-stone-800 focus:bg-white transition-colors">
              <SelectValue placeholder="Search or select a vendor..." />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-stone-200">
              {vendors.map(v => (
                <SelectItem key={v.id} value={v.id} className="cursor-pointer font-medium py-2 focus:bg-stone-50">
                  {v.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Display */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm flex flex-col justify-center">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 block">Terminal Location</Label>
          <div className="flex-1 rounded-lg border border-stone-100 bg-stone-50 px-4 flex items-center gap-3 w-full h-11">
            {selectedVendor ? (
              <>
                <div className="bg-white shadow-sm border border-stone-200 p-1.5 rounded flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-stone-600" />
                </div>
                <span className="font-semibold text-sm text-stone-800 truncate">{selectedVendor.storeAddress || 'No physical address logged.'}</span>
              </>
            ) : (
              <span className="text-stone-400 font-medium text-sm">Awaiting merchant selection...</span>
            )}
          </div>
        </div>
      </div>

      {/* POS Interface */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${!selectedVendorId && 'opacity-50 pointer-events-none grayscale'}`}>
        
        {/* Left Side: Product Selector */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-stone-200 shadow-sm rounded-xl overflow-hidden bg-white h-[800px] flex flex-col">
            <CardHeader className="bg-stone-50 border-b border-stone-100 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
                  <Store className="h-5 w-5 text-stone-500" /> Terminal Catalog
                </CardTitle>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg bg-white border border-stone-200 shadow-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {vendorProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-stone-400 font-medium text-sm">
                      No products found for this terminal.
                    </div>
                  ) : vendorProducts.map(p => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`group cursor-pointer bg-stone-50 border border-stone-200 rounded-xl p-4 transition-all flex flex-col relative ${p.stock <= 0 ? 'opacity-50 grayscale hover:border-rose-300' : 'hover:border-stone-400 hover:shadow-md'}`}
                    >
                      {p.stock <= 0 && (
                        <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md z-10 shadow-sm">
                          Out of Stock
                        </div>
                      )}
                      <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden border border-stone-100 relative">
                        {p.imageUrls && p.imageUrls[0] ? (
                          <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-200">
                             <Store className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 flex items-center justify-center transition-colors">
                          <Plus className="opacity-0 group-hover:opacity-100 h-8 w-8 text-stone-900 bg-white rounded-full p-2 shadow-sm transition-all scale-75 group-hover:scale-100" />
                        </div>
                      </div>
                      <div className="flex flex-col flex-1">
                        <h4 className="font-semibold text-sm text-stone-800 line-clamp-2 leading-tight">{p.name}</h4>
                        <div className="mt-auto pt-2 flex items-center justify-between gap-1">
                          <span className="font-bold text-stone-900 block text-base">&#8377;{Number(p.discountPrice || p.price).toLocaleString('en-IN')}</span>
                          {calcPoints(Number(p.discountPrice || p.price)) > 0 && (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
                              <Coins className="h-3 w-3" />
                              +{calcPoints(Number(p.discountPrice || p.price))} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Electronic Ledger / Cart */}
        <div className="lg:col-span-4">
          <Card className="border border-stone-200 shadow-sm rounded-xl overflow-hidden bg-white flex flex-col">
            <CardHeader className="bg-stone-50 border-b border-stone-200 pb-4 pt-4 z-10">
              <CardTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-stone-200">
                  <ShoppingCart className="h-4 w-4 text-stone-700" /> 
                </div>
                <span>Active Ledger</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden relative bg-stone-50/50">
              <div className="flex-1 overflow-y-auto max-h-[340px] px-5">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-stone-400 font-medium">
                      Register is currently empty.
                    </motion.div>
                  ) : (
                    <div className="space-y-3 py-4 pb-6">
                      {cart.map((item, idx) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id}
                          className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            {item.imageUrls && item.imageUrls[0] ? (
                              <div className="h-12 w-12 rounded-lg border border-stone-100 overflow-hidden shrink-0 bg-stone-50">
                                <img src={item.imageUrls[0]} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-lg border border-stone-100 flex items-center justify-center shrink-0 bg-stone-50 text-stone-300">
                                <Store className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm text-stone-900 leading-snug line-clamp-2 pr-1">{item.name}</h5>
                              <span className="font-medium text-stone-500 text-[11px] mt-0.5 block">&#8377;{Number(item.unitPrice).toLocaleString()} / unit</span>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-rose-500 transition-colors p-1 shrink-0 -mt-0.5 -mr-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 mt-1 border-t border-stone-100">
                            <div className="flex items-center gap-1 bg-stone-50 rounded-lg p-1 border border-stone-200">
                              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md text-stone-600 hover:text-stone-900 bg-white shadow-sm border border-stone-100" onClick={() => updateQuantity(item.id, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold text-xs w-6 text-center text-stone-800">{item.quantity}</span>
                              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md text-stone-600 hover:text-stone-900 bg-white shadow-sm border border-stone-100" onClick={() => updateQuantity(item.id, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-stone-900 text-sm">&#8377;{(Number(item.unitPrice) * item.quantity).toLocaleString()}</span>
                              {calcPoints(Number(item.unitPrice) * item.quantity) > 0 && (
                                <span className="flex items-center justify-end gap-0.5 text-amber-600 text-[10px] font-bold mt-0.5">
                                  <Coins className="h-2.5 w-2.5" />
                                  +{calcPoints(Number(item.unitPrice) * item.quantity)} pts
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ledger Footer */}
              <div className="bg-white p-6 border-t border-stone-200 z-10 flex flex-col gap-5 shrink-0 mt-auto">
                <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                     <span className="font-semibold text-stone-500">Subtotal</span>
                     <span className="font-bold text-stone-900">&#8377;{subtotal.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="font-semibold text-stone-500">Tax</span>
                     <span className="font-bold text-stone-900">&#8377;{tax.toLocaleString('en-IN')}</span>
                   </div>
                   {calcPoints(subtotal) > 0 && (
                     <div className="flex justify-between items-center text-sm bg-amber-50/70 -mx-6 px-6 py-2.5 border-y border-amber-100">
                       <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                         <Coins className="h-3.5 w-3.5" /> Reward Points
                       </span>
                       <span className="font-bold text-amber-700 flex items-center gap-1">
                         +{calcPoints(subtotal)} pts
                       </span>
                     </div>
                   )}
                   <Separator className="bg-stone-200" />
                   <div className="flex justify-between items-end pt-1">
                     <span className="font-semibold uppercase tracking-wide text-xs text-stone-500 pb-1">Total Net</span>
                     <span className="font-bold text-2xl text-stone-900 leading-none">&#8377;{total.toLocaleString('en-IN')}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5 flex-1">
                      <Label className="text-xs font-semibold text-stone-600">Customer Name</Label>
                      <Input 
                        placeholder="e.g. Aditi..." 
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="h-10 border-stone-200 rounded-lg focus-visible:ring-stone-900 px-3"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <Label className="text-xs font-semibold text-stone-600">Mobile No <span className="text-rose-500">*</span></Label>
                      <Input 
                        placeholder="e.g. 987654..." 
                        value={customerMobile}
                        onChange={e => setCustomerMobile(e.target.value)}
                        className="h-10 border-stone-200 rounded-lg focus-visible:ring-stone-900 px-3"
                      />
                      {lookedUpCustomer && (
                        <div className="flex items-center gap-2 mt-1.5 bg-emerald-50 border border-emerald-200/60 rounded-lg px-3 py-2">
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-emerald-800">{lookedUpCustomer.name}</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Existing customer</p>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 rounded-lg px-2.5 py-1">
                            <Coins className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-sm font-bold text-amber-700">{lookedUpCustomer.rewardPoints}</span>
                            <span className="text-[9px] font-bold text-amber-500 uppercase">pts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    className="w-full h-12 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-none disabled:opacity-50 transition-colors shrink-0 mt-2"
                    disabled={cart.length === 0 || !customerMobile || isSubmitting}
                    onClick={handleCheckout}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> Processing</span>
                    ) : (
                      <span className="flex items-center gap-2 text-white">Complete Transaction <CheckCircle2 className="h-4 w-4 ml-1" /></span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
