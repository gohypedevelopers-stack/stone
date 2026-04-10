import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, FileText, Settings, Search,
  Bell, ChevronDown, ChevronRight, TrendingUp, TrendingDown, MoreVertical,
  Plus, Minus, Trash2, Printer, Check, AlertTriangle, BarChart3, History,
  Eye, X, Clock, CheckCircle2, Truck, MapPin, RefreshCw, Edit3, ArrowRight,
  IndianRupee, Users, Store, Receipt, Box, Filter, ChevronUp, LogOut
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { printThermalReceipt } from "@/utils/printReceipt";
import { API_URL, SERVER_URL } from "@/utils/api";
import VendorLogin from "./VendorLogin";

// ─── Constants ─────────────────────────────────────────────────────────
const BRAND_PURPLE = "#9a6bff";
const BRAND_DARK = "#151515";
const STATUS_COLORS = {
  placed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  confirmed: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  packed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  shipped: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  out_for_delivery: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};
const PIE_COLORS = ["#9a6bff", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#f87171"];

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "billing", label: "Offline Billing", icon: Receipt },
  { id: "offline-history", label: "Offline History", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "stock-alerts", label: "Stock Alerts", icon: AlertTriangle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const formatINR = (amt) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amt) || 0);

const getStatusStyle = (status) => {
  const s = String(status).toLowerCase().replace(/\s+/g, "_");
  return STATUS_COLORS[s] || { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" };
};

const statusLabel = (s) => String(s).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Main Component ────────────────────────────────────────────────────
export default function VendorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Authentication
  const [currentVendor, setCurrentVendor] = useState(() => {
    const saved = localStorage.getItem("vendorUser");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!currentVendor) {
      navigate("/vendor-login");
    }
  }, [currentVendor, navigate]);

  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [offlinePurchases, setOfflinePurchases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Billing state
  const [cart, setCart] = useState([]);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBill, setSuccessBill] = useState(null);
  const [lookedUpCustomer, setLookedUpCustomer] = useState(null);
  const lookupTimerRef = useRef(null);

  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  // Products filter
  const [productSearch, setProductSearch] = useState("");
  const [editingStock, setEditingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  const profileRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Data Fetching ─────────────────────────────────────────────────
  useEffect(() => {
    if (currentVendor?.id) {
      // Re-fetch profile to ensure session is valid and status is correct
      fetch(`${API_URL}/vendors/auth/profile?vendorId=${currentVendor.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCurrentVendor(data.data);
            localStorage.setItem("vendorUser", JSON.stringify(data.data));
          } else {
            localStorage.removeItem("vendorUser");
            setCurrentVendor(null);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!currentVendor) return;
    setLoading(true);
    fetchTabData(activeTab);
  }, [currentVendor, activeTab]);

  const fetchTabData = async (tab) => {
    if (!currentVendor) return;
    const vid = currentVendor.id;
    try {
      switch (tab) {
        case "dashboard":
        case "analytics":
          const [aRes, pRes] = await Promise.all([
            fetch(`${API_URL}/vendors/${vid}/analytics`),
            fetch(`${API_URL}/vendors/${vid}/products`),
          ]);
          const aData = await aRes.json();
          const pData = await pRes.json();
          if (aData.success) setAnalytics(aData.data);
          if (pData.success) setVendorProducts(pData.data);
          break;
        case "orders":
          const oRes = await fetch(`${API_URL}/vendors/${vid}/orders`);
          const oData = await oRes.json();
          if (oData.success) setVendorOrders(oData.data);
          break;
        case "products":
        case "billing":
        case "stock-alerts":
          const prRes = await fetch(`${API_URL}/vendors/${vid}/products`);
          const prData = await prRes.json();
          if (prData.success) setVendorProducts(prData.data);
          break;
        case "offline-history":
          const ohRes = await fetch(`${API_URL}/vendors/${vid}/offline-purchases`);
          const ohData = await ohRes.json();
          if (ohData.success) setOfflinePurchases(ohData.data);
          break;
        case "notifications":
          const nRes = await fetch(`${API_URL}/vendors/${vid}/notifications`);
          const nData = await nRes.json();
          if (nData.success) setNotifications(nData.data);
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorChange = (v) => {
    setCurrentVendor(v);
    setCart([]);
    setSuccessBill(null);
    setOrderStatusFilter("all");
  };

  // ─── Billing Logic ─────────────────────────────────────────────────
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
          if (data.data.name && !customerName) setCustomerName(data.data.name);
        }
      } catch (err) {}
    }, 400);
    return () => clearTimeout(lookupTimerRef.current);
  }, [customerMobile]);

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1, unitPrice: product.discountPrice || product.price }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQ = item.quantity + delta;
          if (newQ > item.stock || newQ < 1) return item;
          return { ...item, quantity: newQ };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const cartSubtotal = cart.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

  const handleCheckout = async () => {
    if (!currentVendor || !customerMobile || cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        vendorId: currentVendor.id,
        mobile: customerMobile,
        name: customerName || undefined,
        amount: cartSubtotal,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      const res = await fetch(`${API_URL}/admin/offline-ledgers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessBill(data.data);
        setCart([]);
        setCustomerMobile("");
        setCustomerName("");
        toast.success("Offline bill processed successfully!");
      } else {
        toast.error(data.message || "Failed to process bill");
      }
    } catch (err) {
      toast.error("Error processing offline bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Order Fulfillment ──────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/vendors/${currentVendor.id}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order updated to ${statusLabel(newStatus)}`);
        fetchTabData("orders");
      } else {
        toast.error(data.message || "Failed to update order");
      }
    } catch (err) {
      toast.error("Error updating order status");
    }
  };

  // ─── Product Stock Update ───────────────────────────────────────────
  const handleStockUpdate = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/vendors/${currentVendor.id}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(newStockValue) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stock updated");
        setEditingStock(null);
        setNewStockValue("");
        fetchTabData(activeTab);
      } else {
        toast.error(data.message || "Failed to update stock");
      }
    } catch (err) {
      toast.error("Error updating stock");
    }
  };

  // ─── Computed Data ──────────────────────────────────────────────────
  const activeProducts = useMemo(
    () => vendorProducts.filter((p) => p.status === "ACTIVE"),
    [vendorProducts],
  );

  const filteredOrders = useMemo(() => {
    let list = vendorOrders;
    if (orderStatusFilter !== "all") {
      list = list.filter((o) => o.status === orderStatusFilter);
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [vendorOrders, orderStatusFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return vendorProducts;
    const q = productSearch.toLowerCase();
    return vendorProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q),
    );
  }, [vendorProducts, productSearch]);

  const lowStockProducts = useMemo(
    () => vendorProducts.filter((p) => p.stock <= 5 && p.status === "ACTIVE"),
    [vendorProducts],
  );

  const getValidTransitions = (current) => {
    const map = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["packed", "cancelled"],
      packed: ["shipped", "cancelled"],
      shipped: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
    };
    return map[current] || [];
  };

  const getMediaUrl = (url) => {
    if (!url) return "";
    const normalized = String(url).trim();
    if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
    return `${SERVER_URL}/${normalized.replace(/^\//, "")}`;
  };

  // ─── Render Helpers ─────────────────────────────────────────────────

  const KPICard = ({ title, value, icon: Icon, trend, trendUp, color = "purple" }) => {
    const colorMap = {
      purple: { icon: "bg-purple-100 text-purple-600", trend: trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50" },
      blue: { icon: "bg-blue-100 text-blue-600", trend: trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50" },
      orange: { icon: "bg-orange-100 text-orange-600", trend: trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50" },
      pink: { icon: "bg-pink-100 text-pink-600", trend: trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50" },
    };
    const c = colorMap[color] || colorMap.purple;
    return (
      <div className="bg-white p-5 rounded-[2px] border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="text-2xl font-black text-[#151515] tracking-tight">{value}</div>
          <div className={`w-10 h-10 rounded-[2px] flex items-center justify-center ${c.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-sm text-gray-500 font-semibold tracking-wide mt-2">{title}</div>
        {trend && (
          <div className={`mt-3 flex items-center text-xs font-bold w-fit px-2 py-1 rounded-[2px] ${c.trend}`}>
            {trend} {trendUp ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
          </div>
        )}
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const s = getStatusStyle(status);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {statusLabel(status)}
      </span>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  if (!currentVendor) return <VendorLogin />;

  return (
    <div className="flex h-screen bg-[#f5f5f7] font-['Inter',sans-serif]">
      {/* ─── Sidebar ─── */}
      <aside
        className={`${sidebarCollapsed ? "w-[72px]" : "w-64"} bg-white flex flex-col border-r border-gray-100 transition-all duration-300 z-20 shrink-0`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] bg-gradient-to-br from-pink-500 via-[#9a6bff] to-indigo-500 text-white font-black text-lg shadow-lg shadow-[#9a6bff]/20">
            O
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-black text-[#151515] leading-tight text-[15px] tracking-tighter truncate">
                OMW Vendor
              </span>
              <span className="text-[9px] text-[#9a6bff] font-bold uppercase tracking-[0.2em]">
                Store Hub
              </span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1" data-lenis-prevent>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[2px] transition-all text-left ${
                  isActive
                    ? "bg-[#9a6bff] text-white shadow-md shadow-[#9a6bff]/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span className="font-semibold text-sm truncate">{item.label}</span>}
                {item.id === "notifications" && notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-[#9a6bff] text-white"}`}>
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
                {item.id === "stock-alerts" && lowStockProducts.length > 0 && (
                  <span className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-rose-500 text-white"}`}>
                    {lowStockProducts.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5 rotate-90" />}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto" data-lenis-prevent>
        {/* Top Bar */}
        <div className="bg-white px-6 py-3.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-[#151515] tracking-tight">
              {currentVendor ? `Welcome, ${currentVendor.ownerName || currentVendor.businessName}` : "Vendor Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative text-gray-500 hover:text-[#151515] p-1.5 hover:bg-gray-100 rounded-[2px] transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9a6bff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9a6bff]"></span>
                </span>
              )}
            </button>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 py-1 transition-colors rounded-[2px]"
              >
                <div className="w-8 h-8 rounded-[2px] bg-gradient-to-tr from-[#9a6bff] to-purple-300 flex items-center justify-center text-white font-black text-sm">
                  {currentVendor?.businessName?.charAt(0) || "V"}
                </div>
                <div className="text-sm hidden sm:block text-left">
                  <p className="font-bold text-[#151515] leading-tight flex items-center gap-1.5">
                    {currentVendor?.ownerName || currentVendor?.businessName || "Vendor"}
                    <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </p>
                  <p className="text-gray-400 text-xs font-medium">{currentVendor?.businessCategory || "Vendor"}</p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[2px] shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Store Authority</p>
                    <p className="text-sm font-bold text-[#151515] truncate">{currentVendor?.businessName}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setActiveTab("settings"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-gray-600 hover:text-[#9a6bff] hover:bg-purple-50 transition-colors rounded-[2px]"
                    >
                      <Store className="h-4 w-4" /> Store Profile
                    </button>
                    <button
                      onClick={() => { setActiveTab("settings"); setIsProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-gray-600 hover:text-[#9a6bff] hover:bg-purple-50 transition-colors rounded-[2px]"
                    >
                      <Settings className="h-4 w-4" /> Account Settings
                    </button>
                  </div>
                  <div className="p-1 border-t border-gray-50">
                    <button
                      onClick={() => {
                        localStorage.removeItem("vendorUser");
                        navigate("/vendor-login");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors rounded-[2px]"
                    >
                      <LogOut className="h-4 w-4" /> Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {loading && !analytics && activeTab === "dashboard" ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-[#9a6bff]" />
            </div>
          ) : (
            <>
              {/* ═══ DASHBOARD TAB ═══ */}
              {activeTab === "dashboard" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                      title="Total Revenue"
                      value={formatINR((analytics?.revenue?.total || 0) + (analytics?.revenue?.offline || 0))}
                      icon={IndianRupee}
                      trend="+12.5%"
                      trendUp
                      color="purple"
                    />
                    <KPICard
                      title="Total Orders"
                      value={(analytics?.orders?.total || 0).toLocaleString()}
                      icon={ShoppingCart}
                      trend="+8.2%"
                      trendUp
                      color="blue"
                    />
                    <KPICard
                      title="Active Products"
                      value={(analytics?.totalProducts || 0).toLocaleString()}
                      icon={Package}
                      color="orange"
                    />
                    <KPICard
                      title="Total Customers"
                      value={(analytics?.totalCustomers || 0).toLocaleString()}
                      icon={Users}
                      trend="+5.9%"
                      trendUp
                      color="pink"
                    />
                  </div>

                  {/* Revenue + Activity Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Breakdown */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-[2px] border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-[#151515]">Revenue Overview</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-[2px]">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Online Sales</p>
                          <p className="text-xl font-black text-[#151515]">{formatINR(analytics?.revenue?.total || 0)}</p>
                          <p className="text-xs text-gray-500 mt-1">{analytics?.orders?.total || 0} orders</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 p-4 rounded-[2px]">
                          <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1">Offline Sales</p>
                          <p className="text-xl font-black text-[#151515]">{formatINR(analytics?.revenue?.offline || 0)}</p>
                          <p className="text-xs text-gray-500 mt-1">{analytics?.offlineSales?.total || 0} transactions</p>
                        </div>
                      </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          {/* Stock/Line Graph for Revenue Trend */}
                          <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">7-Day Revenue Trend</h3>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                  { name: "Mon", revenue: 1200 }, { name: "Tue", revenue: 1800 },
                                  { name: "Wed", revenue: 2400 }, { name: "Thu", revenue: 1900 },
                                  { name: "Fri", revenue: 3200 }, { name: "Sat", revenue: 4500 },
                                  { name: "Sun", revenue: ((analytics?.revenue?.total || 0) + (analytics?.revenue?.offline || 0)) || 5600 }
                                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(val) => `₹${val/1000}k`} />
                                  <Tooltip 
                                    cursor={{ stroke: '#f0f0f0', strokeWidth: 2 }}
                                    contentStyle={{ borderRadius: "2px", border: "1px solid #f0f0f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                                    formatter={(value) => [formatINR(value), "Revenue"]}
                                  />
                                  <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: "#ec4899", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Order Status Distribution */}
                          {analytics?.orders?.statusBreakdown?.length > 0 && (
                            <div>
                              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Statuses</h3>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={analytics.orders.statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={statusLabel} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip 
                                      cursor={{ fill: '#f9fafb' }}
                                      contentStyle={{ borderRadius: "2px", border: "1px solid #f0f0f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                                    />
                                    <Bar dataKey="count" fill="#9a6bff" radius={[2, 2, 0, 0]} maxBarSize={40} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}
                        </div>
                    </div>

                    {/* Recent Orders Timeline */}
                    <div className="bg-white p-6 rounded-[2px] border border-gray-100 flex flex-col max-h-[460px]">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-[#151515]">Recent Orders</h2>
                        <button onClick={() => setActiveTab("orders")} className="text-xs text-[#9a6bff] font-bold hover:underline">
                          View All →
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1" data-lenis-prevent>
                        {analytics?.recentOrders?.length > 0 ? (
                          analytics.recentOrders.slice(0, 8).map((order) => (
                            <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-[2px] hover:bg-gray-100 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#151515] truncate">{order.customerName}</p>
                                <p className="text-xs text-gray-400">{order.orderNumber} · {order.itemCount} items</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-[#9a6bff]">{formatINR(order.totalAmount)}</p>
                                <StatusBadge status={order.status} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingCart className="h-10 w-10 mb-2 opacity-40" />
                            <p className="text-sm">No orders yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Products + Low Stock */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                      <h2 className="text-lg font-black text-[#151515] mb-4">Top Selling Products</h2>
                      <div className="space-y-3">
                        {analytics?.topProducts?.slice(0, 5).map((p, i) => (
                          <div key={p.productId} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                            <span className="text-xs font-black text-gray-400 w-5">#{i + 1}</span>
                            {p.image ? (
                              <img src={getMediaUrl(p.image)} className="w-9 h-9 rounded-[2px] object-cover border border-gray-100" />
                            ) : (
                              <div className="w-9 h-9 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                <Package className="h-4 w-4 text-purple-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#151515] truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                            </div>
                            <span className="font-black text-sm text-[#9a6bff]">{formatINR(p.totalRevenue)}</span>
                          </div>
                        ))}
                        {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                          <p className="text-center text-gray-400 text-sm py-6">No sales data yet</p>
                        )}
                      </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-[#151515]">⚠️ Low Stock Alert</h2>
                        {lowStockProducts.length > 0 && (
                          <span className="bg-rose-100 text-rose-700 text-xs font-black px-2 py-1 rounded-[2px]">
                            {lowStockProducts.length} items
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 max-h-[280px] overflow-y-auto" data-lenis-prevent>
                        {lowStockProducts.slice(0, 6).map((p) => (
                          <div key={p.id} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-[2px] border border-rose-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#151515] truncate">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.category?.name || "General"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>
                                {p.stock === 0 ? "OUT" : `${p.stock} left`}
                              </span>
                              <button
                                onClick={() => { setEditingStock(p.id); setNewStockValue(String(p.stock)); setActiveTab("stock-alerts"); }}
                                className="text-xs bg-[#9a6bff] text-white px-2 py-1 rounded-[2px] font-bold hover:bg-purple-600"
                              >
                                Restock
                              </button>
                            </div>
                          </div>
                        ))}
                        {lowStockProducts.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <CheckCircle2 className="h-10 w-10 mb-2 text-emerald-400" />
                            <p className="text-sm font-medium">All stock levels healthy</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ ORDERS TAB ═══ */}
              {activeTab === "orders" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">Order Management</h2>
                      <p className="text-sm text-gray-500 mt-1">Manage and fulfill customer orders</p>
                    </div>
                    <button onClick={() => fetchTabData("orders")} className="text-sm font-bold text-[#9a6bff] flex items-center gap-1 hover:underline">
                      <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                  </div>

                  {/* Status Filters */}
                  <div className="flex flex-wrap gap-2">
                    {["all", "placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setOrderStatusFilter(s)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-[2px] transition-all ${
                          orderStatusFilter === s
                            ? "bg-[#9a6bff] text-white shadow-md shadow-[#9a6bff]/20"
                            : "bg-white text-gray-500 border border-gray-200 hover:border-[#9a6bff] hover:text-[#9a6bff]"
                        }`}
                      >
                        {s === "all" ? "All Orders" : statusLabel(s)}
                        {s !== "all" && (
                          <span className="ml-1 opacity-70">
                            ({vendorOrders.filter((o) => o.status === s).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative max-w-sm">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by order # or customer..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-[2px] text-sm outline-none focus:ring-2 focus:ring-[#9a6bff] font-medium"
                    />
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-[2px] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredOrders.map((order) => {
                            const validTransitions = getValidTransitions(order.status);
                            return (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                  <span className="text-sm font-bold text-[#151515]">{order.orderNumber}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-semibold text-gray-800">{order.customer?.name || "Unknown"}</p>
                                  <p className="text-xs text-gray-400">{order.customer?.mobile || ""}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length || 0}</td>
                                <td className="px-4 py-3 text-sm font-black text-[#9a6bff]">{formatINR(order.totalAmount)}</td>
                                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                                <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                                <td className="px-4 py-3">
                                  {order.status !== "cancelled" && order.status !== "delivered" && validTransitions.length > 0 ? (
                                    <div className="relative">
                                      <select
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            updateOrderStatus(order.id, e.target.value);
                                            e.target.value = "";
                                          }
                                        }}
                                        defaultValue=""
                                        className="appearance-none text-xs bg-white border border-[#9a6bff]/40 text-[#151515] px-3 py-1.5 pr-8 rounded-[2px] font-bold outline-none focus:ring-2 focus:ring-[#9a6bff]/50 cursor-pointer hover:border-[#9a6bff]"
                                      >
                                        <option value="" disabled>Update Status</option>
                                        {validTransitions.map((trans) => (
                                          <option key={trans} value={trans}>
                                            {statusLabel(trans)}
                                          </option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 font-medium">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {filteredOrders.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-4 py-12 text-center text-gray-400 text-sm">
                                {vendorOrders.length === 0 ? "No orders yet" : "No orders match the current filter"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ PRODUCTS TAB ═══ */}
              {activeTab === "products" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">Product Catalog</h2>
                      <p className="text-sm text-gray-500 mt-1">{vendorProducts.length} products in your store</p>
                    </div>
                    <div className="relative max-w-sm">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-[2px] text-sm outline-none focus:ring-2 focus:ring-[#9a6bff] font-medium"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-[2px] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Stock</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredProducts.map((p, i) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-400 font-bold">{i + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.imageUrls?.[0] ? (
                                    <img src={getMediaUrl(p.imageUrls[0])} className="w-10 h-10 rounded-[2px] object-cover border border-gray-100" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                      <Package className="h-4 w-4 text-purple-500" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-[#151515] truncate max-w-[200px]">{p.name}</p>
                                    {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{p.category?.name || "General"}</td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-black text-[#9a6bff]">{formatINR(p.discountPrice || p.price)}</span>
                                {p.discountPrice && p.discountPrice < p.price && (
                                  <span className="text-xs text-gray-400 line-through ml-1">{formatINR(p.price)}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {editingStock === p.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={newStockValue}
                                      onChange={(e) => setNewStockValue(e.target.value)}
                                      className="w-16 border border-[#9a6bff] rounded-[2px] px-2 py-1 text-sm font-bold outline-none"
                                      autoFocus
                                    />
                                    <button onClick={() => handleStockUpdate(p.id)} className="text-emerald-600 hover:text-emerald-700">
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => { setEditingStock(null); setNewStockValue(""); }} className="text-gray-400 hover:text-gray-600">
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setEditingStock(p.id); setNewStockValue(String(p.stock)); }}
                                    className={`text-sm font-bold px-2 py-0.5 rounded-[2px] hover:ring-2 hover:ring-[#9a6bff] transition-all ${
                                      p.stock <= 5 ? "text-rose-700 bg-rose-50" : p.stock <= 20 ? "text-amber-700 bg-amber-50" : "text-gray-700 bg-gray-50"
                                    }`}
                                  >
                                    {p.stock}
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-[2px] text-xs font-bold ${
                                  p.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : p.status === "DRAFT" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr>
                              <td colSpan="6" className="px-4 py-12 text-center text-gray-400 text-sm">No products found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ OFFLINE BILLING TAB ═══ */}
              {activeTab === "billing" && (
                <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">New Offline Sale</h2>
                      <p className="text-sm text-gray-500 mt-1">Process a direct sale and select items from your catalog</p>
                    </div>
                  </div>

                  {successBill ? (
                    <div className="bg-white p-10 rounded-[2px] border border-gray-100 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black text-[#151515] mb-2">Sale Processed!</h3>
                      <p className="text-gray-500 mb-6">Ref: <span className="font-black text-[#151515]">OFF-{successBill.id?.slice(0, 8).toUpperCase()}</span></p>
                      <div className="bg-gray-50 rounded-[2px] p-5 max-w-xs w-full mb-6 text-left space-y-3">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500 text-sm">Mobile</span>
                          <span className="font-bold text-[#151515]">{successBill.mobile}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500 text-sm">Items</span>
                          <span className="font-bold text-[#151515]">{successBill.items?.reduce((a, b) => a + b.quantity, 0)}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="font-bold text-gray-800">Total</span>
                          <span className="font-black text-xl text-[#9a6bff]">{formatINR(successBill.amount)}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => printThermalReceipt(successBill)}
                          className="flex items-center gap-2 bg-white border-2 border-[#9a6bff] text-[#9a6bff] hover:bg-purple-50 h-11 px-5 rounded-[2px] font-bold text-sm transition-colors"
                        >
                          <Printer className="h-4 w-4" /> Print Receipt
                        </button>
                        <button
                          onClick={() => setSuccessBill(null)}
                          className="bg-[#9a6bff] hover:bg-purple-600 text-white h-11 px-5 rounded-[2px] font-bold text-sm transition-colors"
                        >
                          New Sale
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Product Selection */}
                      <div className="lg:col-span-7 bg-white p-5 rounded-[2px] border border-gray-100">
                        <h3 className="text-base font-black text-[#151515] mb-4 flex items-center gap-2">
                          <Package className="h-5 w-5 text-[#9a6bff]" /> Available Products
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1" data-lenis-prevent>
                          {activeProducts.map((p) => {
                            const inCart = cart.find((c) => c.id === p.id);
                            return (
                              <div
                                key={p.id}
                                className={`border p-3 rounded-[2px] flex flex-col justify-between transition-all ${
                                  inCart ? "border-[#9a6bff] bg-purple-50/30" : "border-gray-200 hover:border-[#9a6bff]"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {p.imageUrls?.[0] ? (
                                    <img src={getMediaUrl(p.imageUrls[0])} className="w-11 h-11 rounded-[2px] object-cover" />
                                  ) : (
                                    <div className="w-11 h-11 rounded-[2px] bg-gray-100 flex items-center justify-center">
                                      <Package className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-sm text-[#151515] line-clamp-2">{p.name}</h4>
                                    <div className="text-[#9a6bff] font-black mt-1">{formatINR(p.discountPrice || p.price)}</div>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-[2px] font-medium">Stock: {p.stock}</span>
                                  <button
                                    onClick={() => addToCart(p)}
                                    disabled={p.stock <= 0}
                                    className={`text-xs px-3 py-1.5 rounded-[2px] font-bold transition-all ${
                                      inCart
                                        ? "bg-[#9a6bff] text-white hover:bg-purple-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                  >
                                    {inCart ? "Add More" : "Add"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {activeProducts.length === 0 && (
                            <div className="col-span-full h-60 flex flex-col items-center justify-center text-gray-400">
                              <Package className="h-10 w-10 mb-2 opacity-40" />
                              <p className="text-sm">No active products</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cart */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="bg-white p-5 rounded-[2px] border border-gray-100 flex-1 flex flex-col">
                          <h3 className="text-base font-black text-[#151515] mb-4 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-[#9a6bff]" /> Cart ({cart.length})
                          </h3>
                          <div className="flex-1 overflow-y-auto space-y-3 max-h-[220px] pr-1" data-lenis-prevent>
                            {cart.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Cart is empty</div>
                            ) : (
                              cart.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-[#151515] line-clamp-1">{item.name}</h4>
                                    <div className="text-xs text-gray-500 mt-1">{formatINR(item.unitPrice)} × {item.quantity}</div>
                                  </div>
                                  <div className="flex items-center bg-gray-100 rounded-[2px]">
                                    <button onClick={() => updateCartQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                                    <button onClick={() => updateCartQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-rose-500">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                            <div>
                              <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1 block">Customer Details</label>
                              <input
                                value={customerMobile}
                                onChange={(e) => setCustomerMobile(e.target.value)}
                                placeholder="Mobile Number (10 digits)"
                                className="w-full bg-gray-50 border border-gray-200 h-10 pl-3 pr-3 rounded-[2px] font-medium text-sm outline-none focus:ring-2 focus:ring-[#9a6bff] mb-2"
                              />
                              {lookedUpCustomer && (
                                <div className="text-xs text-emerald-600 font-bold mb-2 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Customer found: {lookedUpCustomer.name} ({lookedUpCustomer.rewardPoints} pts)
                                </div>
                              )}
                              <input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Customer Name (Optional)"
                                className="w-full bg-gray-50 border border-gray-200 h-10 pl-3 pr-3 rounded-[2px] font-medium text-sm outline-none focus:ring-2 focus:ring-[#9a6bff]"
                              />
                            </div>
                            <div className="bg-gray-50 p-3 rounded-[2px] flex justify-between items-center">
                              <span className="font-bold text-gray-600 text-sm">Total</span>
                              <span className="font-black text-xl text-[#9a6bff]">{formatINR(cartSubtotal)}</span>
                            </div>
                            <button
                              onClick={handleCheckout}
                              disabled={cart.length === 0 || !customerMobile || isSubmitting}
                              className="w-full bg-[#9a6bff] hover:bg-purple-600 text-white h-11 rounded-[2px] font-bold text-sm shadow-lg shadow-[#9a6bff]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? "Processing..." : "Charge Offline Bill"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ OFFLINE HISTORY TAB ═══ */}
              {activeTab === "offline-history" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-[#151515]">Offline Purchase History</h2>
                    <p className="text-sm text-gray-500 mt-1">{offlinePurchases.length} offline transactions</p>
                  </div>
                  <div className="bg-white rounded-[2px] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Ref ID</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Mobile</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Items</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Linked</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {offlinePurchases.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 text-sm font-bold text-[#151515]">OFF-{p.id?.slice(0, 8).toUpperCase()}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.purchaseDate).toLocaleDateString("en-IN")}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-800">{p.customer?.name || p.customerName || "Walk-in"}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{p.mobile}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{p.items?.reduce((a, b) => a + b.quantity, 0) || 0}</td>
                              <td className="px-4 py-3 font-black text-[#9a6bff]">{formatINR(p.amount)}</td>
                              <td className="px-4 py-3">
                                {p.customerId ? (
                                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-[2px] font-bold">Linked</span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-[2px] font-bold">Unlinked</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {offlinePurchases.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-4 py-12 text-center text-gray-400 text-sm">No offline purchases yet</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ ANALYTICS TAB ═══ */}
              {activeTab === "analytics" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h2 className="text-2xl font-black text-[#151515]">Sales Analytics</h2>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Online Revenue" value={formatINR(analytics?.revenue?.total || 0)} icon={IndianRupee} color="purple" />
                    <KPICard title="Offline Revenue" value={formatINR(analytics?.revenue?.offline || 0)} icon={Store} color="pink" />
                    <KPICard title="Online Orders" value={(analytics?.orders?.total || 0).toString()} icon={ShoppingCart} color="blue" />
                    <KPICard title="Offline Sales" value={(analytics?.offlineSales?.total || 0).toString()} icon={Receipt} color="orange" />
                  </div>

                  {/* Top Products Table */}
                  <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                    <h3 className="text-lg font-black text-[#151515] mb-4">Top Selling Products</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Units Sold</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Revenue</th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Current Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {analytics?.topProducts?.map((p, i) => (
                            <tr key={p.productId} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 text-sm font-black text-gray-400">#{i + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.image ? (
                                    <img src={getMediaUrl(p.image)} className="w-9 h-9 rounded-[2px] object-cover" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                      <Package className="h-4 w-4 text-purple-500" />
                                    </div>
                                  )}
                                  <span className="text-sm font-bold text-[#151515]">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-gray-700">{p.totalSold}</td>
                              <td className="px-4 py-3 font-black text-[#9a6bff]">{formatINR(p.totalRevenue)}</td>
                              <td className="px-4 py-3">
                                <span className={`text-sm font-bold px-2 py-0.5 rounded-[2px] ${p.stock <= 5 ? "text-rose-700 bg-rose-50" : "text-gray-700 bg-gray-50"}`}>
                                  {p.stock}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                            <tr>
                              <td colSpan="5" className="px-4 py-12 text-center text-gray-400 text-sm">No sales data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Status Pie Chart */}
                  {analytics?.orders?.statusBreakdown?.length > 0 && (
                    <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                      <h3 className="text-lg font-black text-[#151515] mb-4">Order Status Distribution</h3>
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.orders.statusBreakdown}
                              dataKey="count"
                              nameKey="status"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              innerRadius={45}
                              strokeWidth={2}
                              label={({ name, percent }) => `${statusLabel(name)} ${(percent * 100).toFixed(0)}%`}
                            >
                              {analytics.orders.statusBreakdown.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, statusLabel(name)]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ STOCK ALERTS TAB ═══ */}
              {activeTab === "stock-alerts" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">Stock Alerts</h2>
                      <p className="text-sm text-gray-500 mt-1">Products with 5 or fewer units in stock</p>
                    </div>
                    {lowStockProducts.length > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-sm font-black px-3 py-1.5 rounded-[2px]">
                        {lowStockProducts.length} items need attention
                      </span>
                    )}
                  </div>

                  {lowStockProducts.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2px] border border-gray-100 text-center">
                      <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                      <h3 className="text-xl font-black text-[#151515] mb-2">All Good!</h3>
                      <p className="text-gray-500">All your products have healthy stock levels.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lowStockProducts.map((p) => (
                        <div key={p.id} className="bg-white p-5 rounded-[2px] border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3 mb-4">
                            {p.imageUrls?.[0] ? (
                              <img src={getMediaUrl(p.imageUrls[0])} className="w-14 h-14 rounded-[2px] object-cover border border-gray-100" />
                            ) : (
                              <div className="w-14 h-14 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                <Package className="h-6 w-6 text-purple-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[#151515] truncate">{p.name}</h4>
                              <p className="text-xs text-gray-400">{p.category?.name || "General"}</p>
                              <div className={`mt-2 text-sm font-black ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>
                                {p.stock === 0 ? "⛔ OUT OF STOCK" : `⚠️ Only ${p.stock} left`}
                              </div>
                            </div>
                          </div>

                          {editingStock === p.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={newStockValue}
                                onChange={(e) => setNewStockValue(e.target.value)}
                                className="flex-1 border border-[#9a6bff] rounded-[2px] px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#9a6bff]"
                                placeholder="New stock amount"
                                autoFocus
                              />
                              <button
                                onClick={() => handleStockUpdate(p.id)}
                                className="bg-emerald-500 text-white px-3 py-2 rounded-[2px] font-bold text-sm hover:bg-emerald-600"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setEditingStock(null); setNewStockValue(""); }}
                                className="bg-gray-200 text-gray-600 px-3 py-2 rounded-[2px] hover:bg-gray-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingStock(p.id); setNewStockValue(String(p.stock)); }}
                              className="w-full bg-[#9a6bff] text-white py-2 rounded-[2px] font-bold text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <RefreshCw className="h-4 w-4" /> Update Stock
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ NOTIFICATIONS TAB ═══ */}
              {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[2px] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100">
                          <Bell className="h-5 w-5 text-[#9a6bff]" />
                        </div>
                        <h2 className="text-2xl font-black text-[#151515] tracking-tight">Notifications</h2>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        You have <span className="text-[#151515] font-black">{notifications.filter((n) => !n.isRead).length}</span> unread alerts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.filter((n) => !n.isRead).length > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              const unread = notifications.filter(n => !n.isRead);
                              for (const n of unread) {
                                await fetch(`${API_URL}/vendors/notifications/${n.id}/read`, { method: "PATCH" });
                              }
                              setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
                              toast.success("All caught up!");
                            } catch (err) {}
                          }}
                          className="text-xs bg-[#151515] text-white font-bold px-4 py-2 rounded-[2px] hover:bg-black transition-colors shadow-md shadow-gray-900/10"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => fetchTabData("notifications")}
                        className="text-xs bg-white text-[#151515] font-bold px-3 py-2 rounded-[2px] border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3 text-gray-400" /> Refresh
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="bg-white p-16 rounded-[2px] border border-gray-100 text-center shadow-sm">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-black text-[#151515] mb-2">Inbox Zero</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">You're all caught up! No new notifications or alerts at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => {
                        const isOrder = n.title?.toLowerCase().includes("order");
                        const isStock = n.title?.toLowerCase().includes("stock");
                        const isAlert = n.title?.toLowerCase().includes("alert");
                        const Icon = isOrder ? ShoppingCart : isStock ? Package : isAlert ? AlertTriangle : Bell;

                        return (
                          <div
                            key={n.id}
                            className={`group relative bg-white p-5 rounded-[2px] border flex items-start gap-4 transition-all duration-300 ${
                              n.isRead ? "border-gray-100 shadow-sm hover:border-gray-200" : "border-[#9a6bff]/40 shadow-md shadow-[#9a6bff]/5 hover:border-[#9a6bff]/60"
                            }`}
                          >
                            {!n.isRead && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-[#9a6bff] rounded-l-[2px]" />
                            )}
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-[2px] flex items-center justify-center shrink-0 border ${
                                n.isRead ? "bg-gray-50 border-gray-100 text-gray-400" : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 text-[#9a6bff]"
                              }`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              {!n.isRead && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border border-white"></span>
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className={`text-sm tracking-tight ${n.isRead ? "font-bold text-gray-600" : "font-black text-[#151515]"}`}>
                                    {n.title}
                                  </p>
                                  <p className={`text-sm mt-1 leading-relaxed ${n.isRead ? "text-gray-500" : "text-gray-600"}`}>
                                    {n.message}
                                  </p>
                                </div>
                                {!n.isRead && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await fetch(`${API_URL}/vendors/notifications/${n.id}/read`, { method: "PATCH" });
                                        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
                                      } catch (err) {}
                                    }}
                                    className="text-[10px] font-black uppercase tracking-wider text-[#9a6bff] bg-purple-50 px-2 py-1 rounded-[2px] hover:bg-purple-100 transition-colors shrink-0"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-3 text-xs font-bold text-gray-400">
                                <Clock className="h-3 w-3" />
                                {new Date(n.createdAt).toLocaleDateString("en-IN", { 
                                  weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ SETTINGS TAB ═══ */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
                  <div>
                    <h2 className="text-2xl font-black text-[#151515]">Store Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Your store profile and information</p>
                  </div>

                  <div className="bg-white p-6 rounded-[2px] border border-gray-100 space-y-5">
                    <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                      <div className="w-16 h-16 rounded-[2px] bg-gradient-to-tr from-[#9a6bff] to-purple-300 flex items-center justify-center text-white font-black text-2xl">
                        {currentVendor?.businessName?.charAt(0) || "V"}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#151515]">{currentVendor?.businessName || "—"}</h3>
                        <p className="text-sm text-gray-500">{currentVendor?.businessCategory || "—"}</p>
                        <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-[2px] ${
                          currentVendor?.approvalStatus === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {currentVendor?.approvalStatus ? statusLabel(currentVendor.approvalStatus) : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Owner Name</label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">{currentVendor?.ownerName || "—"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Contact Number</label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">{currentVendor?.contactNumber || "—"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">{currentVendor?.email || "—"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Business Category</label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">{currentVendor?.businessCategory || "—"}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Store Address</label>
                      <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">{currentVendor?.storeAddress || "—"}</p>
                    </div>

                    {currentVendor?.checkoutQR && (
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Payment QR Code</label>
                        <img src={currentVendor.checkoutQR} className="w-40 h-40 rounded-[2px] border border-gray-200" alt="QR Code" />
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                    <h3 className="text-lg font-black text-[#151515] mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-[2px]">
                        <p className="text-2xl font-black text-[#9a6bff]">{analytics?.totalProducts || 0}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">Products</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-[2px]">
                        <p className="text-2xl font-black text-[#9a6bff]">{analytics?.orders?.total || 0}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">Orders</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-[2px]">
                        <p className="text-2xl font-black text-[#9a6bff]">{analytics?.totalCustomers || 0}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">Customers</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
