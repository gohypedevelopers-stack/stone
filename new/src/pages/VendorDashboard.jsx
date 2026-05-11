import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Plus,
  Minus,
  Trash2,
  Printer,
  Check,
  AlertTriangle,
  BarChart3,
  History,
  Eye,
  X,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  RefreshCw,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Loader2,
  IndianRupee,
  Users,
  Store,
  Receipt,
  Box,
  Filter,
  ChevronUp,
  LogOut,
  ArrowRightLeft,
  Building2,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { printThermalReceipt } from "@/utils/printReceipt";
import { API_URL, SERVER_URL } from "@/utils/api";
import VendorLogin from "./VendorLogin";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import OutletInventoryWorkspace from "@/components/outlet/OutletInventoryWorkspace";

// ─── Constants ─────────────────────────────────────────────────────────
const BRAND_PURPLE = "#9a6bff";
const BRAND_DARK = "#151515";
const STATUS_COLORS = {
  placed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  confirmed: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  packed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  shipped: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  out_for_delivery: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
  delivered: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};
const PIE_COLORS = [
  "#9a6bff",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#f87171",
];

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "scanner", label: "Scan & Stock", icon: Package },
  { id: "outlet-inventory", label: "Outlet Inventory", icon: Store },
  { id: "billing", label: "Offline Billing", icon: Receipt },
  { id: "offline-history", label: "Offline History", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "stock-alerts", label: "Stock Alerts", icon: AlertTriangle },
  { id: "stock-transfers", label: "Stock Transfers", icon: ArrowRightLeft },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const formatINR = (amt) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amt) || 0);

const getStatusStyle = (status) => {
  const s = String(status).toLowerCase().replace(/\s+/g, "_");
  return (
    STATUS_COLORS[s] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      dot: "bg-gray-500",
    }
  );
};

const statusLabel = (s) =>
  String(s)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Render Helpers (Moved outside to prevent blinks) ──────────────────

const DispatchProtocolWorkstation = memo(
  ({
    navigate,
    currentVendor,
    dispatchDestination,
    setDispatchDestination,
    allVendors,
    activeProducts,
    dispatchItems,
    addDispatchItem,
    removeDispatchItem,
    updateDispatchItemQty,
    isSubmitting,
    handleCreateDispatch,
    getMediaUrl,
    formatINR,
    posSearch,
    setPosSearch,
  }) => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 p-2 lg:p-4">
        <div className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/vendor-dashboard/stock-transfers")}
              className="h-10 w-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                Dispatch Protocol
              </h2>
              <p className="text-[10px] text-stone-400 font-medium">Outbound Stock Transfer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Configuration & Inventory */}
          <div className="lg:col-span-7 space-y-6">
            {/* Destination Selector */}
            <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-stone-400" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Route Target
                </span>
              </div>
              <div className="relative">
                <select
                  value={dispatchDestination}
                  onChange={(e) => setDispatchDestination(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 h-11 px-4 rounded-lg font-bold text-sm outline-none focus:border-[#9a6bff] transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Target Outlet...</option>
                  {allVendors.filter(v => v.id !== currentVendor?.id).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.businessName} ({v.location || "Branch"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Product Catalog */}
            <div className="bg-white rounded-[1px] border border-stone-200/50 shadow-sm overflow-hidden flex flex-col transition-all duration-500 hover:shadow-md hover:shadow-stone-200/30">
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 bg-[#9a6bff]/10 border border-[#9a6bff]/20 rounded-[2px] flex items-center justify-center">
                      <Package className="h-5 w-5 text-[#9a6bff]" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#9a6bff] border-2 border-white rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.3em]">
                      Inventory Staging
                    </h3>
                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                      Ready for Outbound Protocol
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative group/search">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 transition-colors group-focus-within/search:text-[#9a6bff]" />
                    <input
                      type="text"
                      placeholder="Locate Stock Item..."
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      className="w-72 pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-[2px] text-xs outline-none focus:bg-white focus:border-[#9a6bff] focus:ring-4 focus:ring-[#9a6bff]/5 font-bold transition-all placeholder:text-stone-300 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 max-h-[700px] overflow-y-auto custom-scrollbar bg-stone-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeProducts.map((p) => {
                    const isStaged = dispatchItems.some(
                      (i) => i.productId === p.id,
                    );
                    return (
                      <div
                        key={p.id}
                        onClick={() => !isStaged && addDispatchItem(p.id)}
                        className={cn(
                          "group/item p-4 rounded-xl border transition-all duration-300 flex flex-col gap-4 relative",
                          isStaged
                            ? "bg-emerald-50/20 border-emerald-100 opacity-60 cursor-not-allowed"
                            : "bg-white border-stone-100 hover:border-[#9a6bff]/40 hover:shadow-xl hover:shadow-stone-200/40 cursor-pointer",
                        )}
                      >
                        <div className="flex gap-4">
                          <div className="h-16 w-16 bg-stone-50 rounded-lg overflow-hidden shrink-0 border border-stone-100/50">
                            {p.imageUrls?.[0] ? (
                              <img
                                src={getMediaUrl(p.imageUrls[0])}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-stone-200 m-auto" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                            <div>
                              <p className="text-[10px] font-bold text-[#9a6bff] uppercase tracking-wider mb-1">
                                {p.brand || "Standard"}
                              </p>
                              <h4 className="text-[13px] font-bold text-stone-900 leading-snug line-clamp-2">
                                {p.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-sm font-black text-stone-900">
                                {formatINR(p.discountPrice || p.price)}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                p.stock <= 5 ? "text-rose-500 bg-rose-50" : "text-stone-400 bg-stone-50"
                              )}>
                                {p.stock} in stock
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          className={cn(
                            "w-full h-10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all",
                            isStaged
                              ? "bg-emerald-500 text-white"
                              : "bg-stone-50 text-stone-400 group-hover/item:bg-[#9a6bff] group-hover/item:text-white"
                          )}
                        >
                          {isStaged ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Staged</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              <span>Stage Item</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Manifest (Dedicated Column) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-[152px] h-fit">
            <div className="bg-white rounded-[1px] border border-stone-200/50 shadow-lg flex flex-col h-[calc(100vh-200px)]">
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
                <div>
                  <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-stone-400" /> Dispatch
                    Manifest
                  </h3>
                </div>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100 px-2 py-1 rounded-[1px] bg-white">
                  {dispatchItems.length} SKUs Staged
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar bg-stone-50/10">
                {dispatchItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                    <Box className="h-8 w-8 text-stone-300 mb-4" />
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      Manifest is empty
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dispatchItems.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-white p-3 border border-stone-100 rounded-lg group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-stone-50 rounded shrink-0 overflow-hidden border border-stone-100/50">
                            {item.image && (
                              <img
                                src={getMediaUrl(item.image)}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-stone-400 font-medium">
                              {formatINR(item.price || 0)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-stone-900 tabular-nums">
                              {formatINR((item.price || 0) * item.quantity)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateDispatchItemQty(item.productId, item.quantity - 1)}
                              className="h-6 w-6 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-[11px] font-black tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateDispatchItemQty(item.productId, item.quantity + 1)}
                              className="h-6 w-6 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeDispatchItem(item.productId)}
                            className="text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 bg-stone-50 border-t border-stone-200/60 space-y-6 relative overflow-hidden">
                {/* Subtle Technical Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(#9a6bff 0.5px, transparent 0.5px)`, backgroundSize: '12px 12px' }} />
                
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1.5">
                      Total Consignment Value
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-black text-stone-900 tabular-nums tracking-tight">
                        {formatINR(
                          dispatchItems.reduce(
                            (sum, item) =>
                              sum + (item.price || 0) * item.quantity,
                            0,
                          ),
                        )}
                      </p>
                      <span className="text-[8px] text-[#9a6bff] tracking-widest font-bold uppercase italic">
                        Final Consensus
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1.5">
                      Batch Units
                    </p>
                    <div className="h-8 px-4 bg-white border border-stone-200 rounded-[1px] flex items-center justify-center shadow-sm">
                      <p className="text-sm font-black text-stone-900 tabular-nums">
                        {dispatchItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  disabled={
                    isSubmitting ||
                    !dispatchDestination ||
                    dispatchItems.length === 0
                  }
                  onClick={handleCreateDispatch}
                  className="w-full bg-[#9a6bff] text-white h-14 rounded-[1px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-[#9a6bff]/20 active:scale-[0.98] group/execute"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                      <span className="animate-pulse">Registering Protocol...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 transition-transform group-hover/execute:translate-x-1" />
                      Execute Outbound Protocol
                    </>
                  )}
                </button>

                {!dispatchDestination && dispatchItems.length > 0 && (
                  <div className="flex items-center justify-center gap-2 text-rose-500 bg-rose-50 py-2 rounded-[1px] border border-rose-100">
                    <AlertTriangle className="h-3 w-3" />
                    <p className="text-[8px] font-black uppercase tracking-widest">
                      Routing Target Required
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

// ─── Render Helpers (Moved outside to prevent blinks) ──────────────────

const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = "purple",
}) => {
  const colorMap = {
    purple: {
      icon: "bg-purple-100 text-purple-600",
      trend: trendUp
        ? "text-emerald-600 bg-emerald-50"
        : "text-rose-600 bg-rose-50",
    },
    blue: {
      icon: "bg-blue-100 text-blue-600",
      trend: trendUp
        ? "text-emerald-600 bg-emerald-50"
        : "text-rose-600 bg-rose-50",
    },
    orange: {
      icon: "bg-orange-100 text-orange-600",
      trend: trendUp
        ? "text-emerald-600 bg-emerald-50"
        : "text-rose-600 bg-rose-50",
    },
    pink: {
      icon: "bg-pink-100 text-pink-600",
      trend: trendUp
        ? "text-emerald-600 bg-emerald-50"
        : "text-rose-600 bg-rose-50",
    },
  };
  const c = colorMap[color] || colorMap.purple;
  return (
    <div className="bg-white p-5 rounded-[2px] border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-black text-[#151515] tracking-tight">
          {value}
        </div>
        <div
          className={`w-10 h-10 rounded-[2px] flex items-center justify-center ${c.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-sm text-gray-500 font-semibold tracking-wide mt-2">
        {title}
      </div>
      {trend && (
        <div
          className={`mt-3 flex items-center text-xs font-bold w-fit px-2 py-1 rounded-[2px] ${c.trend}`}
        >
          {trend}{" "}
          {trendUp ? (
            <TrendingUp className="h-3 w-3 ml-1" />
          ) : (
            <TrendingDown className="h-3 w-3 ml-1" />
          )}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = getStatusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {statusLabel(status)}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
export default function VendorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath =
    location.pathname.split("/").filter(Boolean).pop() || "dashboard";
  const activeTab = SIDEBAR_ITEMS.some((item) => item.id === currentPath)
    ? currentPath
    : currentPath === "dispatch"
      ? "stock-transfers"
      : "dashboard";
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
  const [stockTransfers, setStockTransfers] = useState([]);
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
  const [posSearch, setPosSearch] = useState("");
  const [editingStock, setEditingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  const [isTransferDetailOpen, setIsTransferDetailOpen] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [verifiedItems, setVerifiedItems] = useState({}); // { [transferId]: { [productId]: boolean } }
  const [allVendors, setAllVendors] = useState([]);
  const [dispatchDestination, setDispatchDestination] = useState("");
  const [dispatchItems, setDispatchItems] = useState([]); // [{ productId, quantity }]

  const toggleItemVerification = (transferId, productId) => {
    setVerifiedItems((prev) => {
      const currentTransfer = prev[transferId] || {};
      return {
        ...prev,
        [transferId]: {
          ...currentTransfer,
          [productId]: !currentTransfer[productId],
        },
      };
    });
  };

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
        .then((res) => res.json())
        .then((data) => {
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
          if (pData.success) setVendorProductsWithDeduplication(pData.data);
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
          if (prData.success) setVendorProductsWithDeduplication(prData.data);
          break;
        case "offline-history":
          const ohRes = await fetch(
            `${API_URL}/vendors/${vid}/offline-purchases`,
          );
          const ohData = await ohRes.json();
          if (ohData.success) setOfflinePurchases(ohData.data);
          break;
        case "notifications":
          const nRes = await fetch(`${API_URL}/vendors/${vid}/notifications`);
          const nData = await nRes.json();
          if (nData.success) setNotifications(nData.data);
          break;
        case "stock-transfers":
          const [stRes, stpRes, vRes] = await Promise.all([
            fetch(`${API_URL}/stock-transfers?vendorId=${vid}`),
            fetch(`${API_URL}/vendors/${vid}/products`),
            fetch(`${API_URL}/vendors`),
          ]);
          const stData = await stRes.json();
          const stpData = await stpRes.json();
          const vData = await vRes.json();
          if (stData.success) setStockTransfers(stData.data);
          if (stpData.success) setVendorProductsWithDeduplication(stpData.data);
          if (vData.success) setAllVendors(vData.data);
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setVendorProductsWithDeduplication = (products) => {
    if (!Array.isArray(products)) {
      setVendorProducts([]);
      return;
    }
    const grouped = products.reduce((acc, p) => {
      const key = p.name;
      if (!acc[key]) {
        acc[key] = { ...p };
      } else {
        acc[key].stock = (acc[key].stock || 0) + (p.stock || 0);
        if (p.status === "ACTIVE") acc[key].status = "ACTIVE";
      }
      return acc;
    }, {});
    setVendorProducts(Object.values(grouped));
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
        const res = await fetch(
          `${API_URL}/admin/customers/lookup?mobile=${encodeURIComponent(trimmed)}`,
        );
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
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          unitPrice: product.discountPrice || product.price,
        },
      ];
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

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

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
      const res = await fetch(
        `${API_URL}/vendors/${currentVendor.id}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
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
      const res = await fetch(
        `${API_URL}/vendors/${currentVendor.id}/products/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: Number(newStockValue) }),
        },
      );
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

  const fetchTransferDetail = async (id) => {
    setDetailLoading(true);
    setIsTransferDetailOpen(true);
    try {
      const resp = await fetch(`${API_URL}/stock-transfers/${id}`);
      const data = await resp.json();
      if (data.success) {
        setViewingTransfer(data.data);
      } else {
        toast.error("Failed to fetch transfer protocol");
        setIsTransferDetailOpen(false);
      }
    } catch (err) {
      toast.error("Decryption failed: Node unreachable");
      setIsTransferDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateTransferStatus = async (id, status) => {
    const isGlobalAction = !isTransferDetailOpen;
    try {
      const res = await fetch(`${API_URL}/stock-transfers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Transfer status updated to ${statusLabel(status)}`);
        fetchTabData("stock-transfers");
        // If modal is open, refresh its data
        if (!isGlobalAction) {
          fetchTransferDetail(id);
        }
      } else {
        toast.error(data.message || "Failed to update transfer");
      }
    } catch (err) {
      toast.error("Error updating transfer status");
    }
  };

  const fetchAllVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/vendors`);
      const data = await res.json();
      if (data.success) {
        setAllVendors(
          data.data.filter((v) => {
            const name = v.businessName?.toLowerCase() || "";
            return (
              v.id !== currentVendor.id &&
              !name.includes("omw global") &&
              !name.includes("admin stock")
            );
          }),
        );
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const handleInitiateDispatch = () => {
    fetchAllVendors();
    setDispatchDestination("");
    setDispatchItems([]);
    navigate("/vendor-dashboard/dispatch");
  };

  const handleCreateDispatch = async () => {
    if (!dispatchDestination) {
      toast.error("Please select a destination outlet");
      return;
    }
    if (dispatchItems.length === 0) {
      toast.error("Please add at least one product to dispatch");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/stock-transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceVendorId: currentVendor.id,
          destinationVendorId: dispatchDestination,
          items: dispatchItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          notes: `Outlet-initiated transfer from ${currentVendor.businessName}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stock transfer protocol initiated!");
        navigate("/vendor-dashboard/stock-transfers");
        fetchTabData("stock-transfers");
      } else {
        toast.error(data.message || "Failed to initiate transfer");
      }
    } catch (err) {
      toast.error("Logistics node failure: Check your connection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDispatchItem = (productId) => {
    const product = vendorProducts.find((p) => p.id === productId);
    if (!product) return;
    if (product.stock <= 0) {
      toast.error("Product out of stock in your outlet");
      return;
    }

    setDispatchItems((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      if (exists) return prev;
      return [
        ...prev,
        {
          productId,
          quantity: 1,
          name: product.name,
          brand: product.brand || "Standard",
          max: product.stock,
          image: product.imageUrls?.[0],
          price: product.discountPrice || product.price,
          category: product.category?.name || "General",
        },
      ];
    });
  };

  const updateDispatchItemQty = (productId, qty) => {
    setDispatchItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const newQty = Math.max(1, Math.min(item.max, qty));
        return { ...item, quantity: newQty };
      }),
    );
  };

  const removeDispatchItem = (productId) => {
    setDispatchItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // ─── Computed Data ──────────────────────────────────────────────────
  const activeProducts = useMemo(() => {
    let list = vendorProducts.filter((p) => p.status === "ACTIVE");
    if (posSearch.trim()) {
      const q = posSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [vendorProducts, posSearch]);

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
    if (normalized.startsWith("http://") || normalized.startsWith("https://"))
      return normalized;
    return `${SERVER_URL}/${normalized.replace(/^\//, "")}`;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DISPATCH WORKSTATION (Light Theme)
  // ═══════════════════════════════════════════════════════════════════════

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
                {currentVendor?.businessName?.toLowerCase() === "omw global" ||
                currentVendor?.businessName?.toLowerCase() === "admin stock"
                  ? "Admin Stock"
                  : currentVendor?.businessName}
              </span>
              <span className="text-[9px] text-[#9a6bff] font-bold uppercase tracking-[0.2em]">
                Store Hub
              </span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
          data-lenis-prevent
        >
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={`/vendor-dashboard/${item.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[2px] transition-all text-left ${
                  isActive
                    ? "bg-[#9a6bff] text-white shadow-md shadow-[#9a6bff]/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-semibold text-sm truncate">
                    {item.label}
                  </span>
                )}
                {item.id === "notifications" &&
                  notifications.filter((n) => !n.isRead).length > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-[#9a6bff] text-white"}`}
                    >
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                {item.id === "stock-alerts" && lowStockProducts.length > 0 && (
                  <span
                    className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-rose-500 text-white"}`}
                  >
                    {lowStockProducts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5 rotate-90" />
            )}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto relative" data-lenis-prevent>
        {/* Top Bar */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-[#151515] tracking-tight">
              {currentVendor
                ? `Welcome, ${currentVendor.ownerName || currentVendor.businessName}`
                : "Vendor Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/vendor-dashboard/notifications")}
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
                    {currentVendor?.ownerName ||
                      currentVendor?.businessName ||
                      "Vendor"}
                    <ChevronDown
                      className={`h-3 w-3 text-gray-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </p>
                  <p className="text-gray-400 text-xs font-medium">
                    {currentVendor?.businessCategory || "Vendor"}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[2px] shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                      Store Authority
                    </p>
                    <p className="text-sm font-bold text-[#151515] truncate">
                      {currentVendor?.businessName}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        navigate("/vendor-dashboard/settings");
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-gray-600 hover:text-[#9a6bff] hover:bg-purple-50 transition-colors rounded-[2px]"
                    >
                      <Store className="h-4 w-4" /> Store Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/vendor-dashboard/settings");
                        setIsProfileDropdownOpen(false);
                      }}
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
        <div className="p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Routes>
            <Route
              index
              element={<Navigate to="/vendor-dashboard/dashboard" replace />}
            />
            <Route
              path="/dashboard"
              element={
                loading && !analytics ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#9a6bff]" />
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <KPICard
                        title="Total Revenue"
                        value={formatINR(
                          (analytics?.revenue?.total || 0) +
                            (analytics?.revenue?.offline || 0),
                        )}
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
                        value={(
                          analytics?.totalCustomers || 0
                        ).toLocaleString()}
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
                          <h2 className="text-lg font-black text-[#151515]">
                            Revenue Overview
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-[2px]">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                              Online Sales
                            </p>
                            <p className="text-xl font-black text-[#151515]">
                              {formatINR(analytics?.revenue?.total || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {analytics?.orders?.total || 0} orders
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 p-4 rounded-[2px]">
                            <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1">
                              Offline Sales
                            </p>
                            <p className="text-xl font-black text-[#151515]">
                              {formatINR(analytics?.revenue?.offline || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {analytics?.offlineSales?.total || 0} transactions
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          {/* Stock/Line Graph for Revenue Trend */}
                          <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                              7-Day Revenue Trend
                            </h3>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={[
                                    { name: "Mon", revenue: 1200 },
                                    { name: "Tue", revenue: 1800 },
                                    { name: "Wed", revenue: 2400 },
                                    { name: "Thu", revenue: 1900 },
                                    { name: "Fri", revenue: 3200 },
                                    { name: "Sat", revenue: 4500 },
                                    {
                                      name: "Sun",
                                      revenue:
                                        (analytics?.revenue?.total || 0) +
                                          (analytics?.revenue?.offline || 0) ||
                                        5600,
                                    },
                                  ]}
                                  margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f0f0f0"
                                  />
                                  <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                                  />
                                  <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                  />
                                  <Tooltip
                                    cursor={{
                                      stroke: "#f0f0f0",
                                      strokeWidth: 2,
                                    }}
                                    contentStyle={{
                                      borderRadius: "2px",
                                      border: "1px solid #f0f0f0",
                                      boxShadow:
                                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    formatter={(value) => [
                                      formatINR(value),
                                      "Revenue",
                                    ]}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    dot={{
                                      r: 4,
                                      fill: "#ec4899",
                                      strokeWidth: 2,
                                      stroke: "#fff",
                                    }}
                                    activeDot={{ r: 6 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Order Status Distribution */}
                          {analytics?.orders?.statusBreakdown?.length > 0 && (
                            <div>
                              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                Order Statuses
                              </h3>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={analytics.orders.statusBreakdown}
                                    margin={{
                                      top: 10,
                                      right: 10,
                                      left: -20,
                                      bottom: 0,
                                    }}
                                  >
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      vertical={false}
                                      stroke="#f0f0f0"
                                    />
                                    <XAxis
                                      dataKey="status"
                                      axisLine={false}
                                      tickLine={false}
                                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                                      tickFormatter={statusLabel}
                                    />
                                    <YAxis
                                      axisLine={false}
                                      tickLine={false}
                                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                                      allowDecimals={false}
                                    />
                                    <Tooltip
                                      cursor={{ fill: "#f9fafb" }}
                                      contentStyle={{
                                        borderRadius: "2px",
                                        border: "1px solid #f0f0f0",
                                        boxShadow:
                                          "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                      }}
                                    />
                                    <Bar
                                      dataKey="count"
                                      fill="#9a6bff"
                                      radius={[2, 2, 0, 0]}
                                      maxBarSize={40}
                                    />
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
                          <h2 className="text-lg font-black text-[#151515]">
                            Recent Orders
                          </h2>
                          <button
                            onClick={() => setActiveTab("orders")}
                            className="text-xs text-[#9a6bff] font-bold hover:underline"
                          >
                            View All →
                          </button>
                        </div>
                        <div
                          className="flex-1 overflow-y-auto space-y-3 pr-1"
                          data-lenis-prevent
                        >
                          {analytics?.recentOrders?.length > 0 ? (
                            analytics.recentOrders.slice(0, 8).map((order) => (
                              <div
                                key={order.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-[2px] hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[#151515] truncate">
                                    {order.customerName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {order.orderNumber} · {order.itemCount}{" "}
                                    items
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-black text-[#9a6bff]">
                                    {formatINR(order.totalAmount)}
                                  </p>
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
                        <h2 className="text-lg font-black text-[#151515] mb-4">
                          Top Selling Products
                        </h2>
                        <div className="space-y-3">
                          {analytics?.topProducts?.slice(0, 5).map((p, i) => (
                            <div
                              key={p.productId}
                              className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                            >
                              <span className="text-xs font-black text-gray-400 w-5">
                                #{i + 1}
                              </span>
                              {p.image ? (
                                <img
                                  src={getMediaUrl(p.image)}
                                  className="w-9 h-9 rounded-[2px] object-cover border border-gray-100"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                  <Package className="h-4 w-4 text-purple-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#151515] truncate">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {p.totalSold} sold
                                </p>
                              </div>
                              <span className="font-black text-sm text-[#9a6bff]">
                                {formatINR(p.totalRevenue)}
                              </span>
                            </div>
                          ))}
                          {(!analytics?.topProducts ||
                            analytics.topProducts.length === 0) && (
                            <p className="text-center text-gray-400 text-sm py-6">
                              No sales data yet
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Low Stock Alert */}
                      <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-black text-[#151515]">
                            ⚠️ Low Stock Alert
                          </h2>
                          {lowStockProducts.length > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-xs font-black px-2 py-1 rounded-[2px]">
                              {lowStockProducts.length} items
                            </span>
                          )}
                        </div>
                        <div
                          className="space-y-3 max-h-[280px] overflow-y-auto"
                          data-lenis-prevent
                        >
                          {lowStockProducts.slice(0, 6).map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-[2px] border border-rose-100"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#151515] truncate">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {p.category?.name || "General"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-black ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}
                                >
                                  {p.stock === 0 ? "OUT" : `${p.stock} left`}
                                </span>
                                <button
                                  onClick={() => {
                                    navigate("/vendor-dashboard/stock-alerts");
                                  }}
                                  className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-[2px] font-black uppercase tracking-widest hover:bg-stone-200 transition-colors"
                                >
                                  View Alert
                                </button>
                              </div>
                            </div>
                          ))}
                          {lowStockProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                              <CheckCircle2 className="h-10 w-10 mb-2 text-emerald-400" />
                              <p className="text-sm font-medium">
                                All stock levels healthy
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            />

            <Route
              path="/orders"
              element={
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">
                        Order Management
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage and fulfill customer orders
                      </p>
                    </div>
                    <button
                      onClick={() => fetchTabData("orders")}
                      className="text-sm font-bold text-[#9a6bff] flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                  </div>

                  {/* Status Filters */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "all",
                      "placed",
                      "confirmed",
                      "packed",
                      "shipped",
                      "out_for_delivery",
                      "delivered",
                      "cancelled",
                    ].map((s) => (
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
                            ({vendorOrders.filter((o) => o.status === s).length}
                            )
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
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                              Order
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                              Items
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredOrders.map((order) => {
                            const validTransitions = getValidTransitions(
                              order.status,
                            );
                            return (
                              <tr
                                key={order.id}
                                className="hover:bg-gray-50/50 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <span className="text-sm font-bold text-[#151515]">
                                    {order.orderNumber}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {order.customer?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {order.customer?.mobile || ""}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {order.items?.length || 0}
                                </td>
                                <td className="px-4 py-3 text-sm font-black text-[#9a6bff]">
                                  {formatINR(order.totalAmount)}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge status={order.status} />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {order.status !== "cancelled" &&
                                  order.status !== "delivered" &&
                                  validTransitions.length > 0 ? (
                                    <div className="relative">
                                      <select
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            updateOrderStatus(
                                              order.id,
                                              e.target.value,
                                            );
                                            e.target.value = "";
                                          }
                                        }}
                                        defaultValue=""
                                        className="appearance-none text-xs bg-white border border-[#9a6bff]/40 text-[#151515] px-3 py-1.5 pr-8 rounded-[2px] font-bold outline-none focus:ring-2 focus:ring-[#9a6bff]/50 cursor-pointer hover:border-[#9a6bff]"
                                      >
                                        <option value="" disabled>
                                          Update Status
                                        </option>
                                        {validTransitions.map((trans) => (
                                          <option key={trans} value={trans}>
                                            {statusLabel(trans)}
                                          </option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 font-medium">
                                      —
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {filteredOrders.length === 0 && (
                            <tr>
                              <td
                                colSpan="7"
                                className="px-4 py-12 text-center text-gray-400 text-sm"
                              >
                                {vendorOrders.length === 0
                                  ? "No orders yet"
                                  : "No orders match the current filter"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/products"
              element={
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">
                        Product Catalog
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {vendorProducts.length} products in your store
                      </p>
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
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              #
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Product
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Category
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Price
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Stock
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredProducts.map((p, i) => (
                            <tr
                              key={p.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-gray-400 font-bold">
                                {i + 1}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.imageUrls?.[0] ? (
                                    <img
                                      src={getMediaUrl(p.imageUrls[0])}
                                      className="w-10 h-10 rounded-[2px] object-cover border border-gray-100"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                      <Package className="h-4 w-4 text-purple-500" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-[#151515] truncate max-w-[200px]">
                                      {p.name}
                                    </p>
                                    {p.brand && (
                                      <p className="text-xs text-gray-400">
                                        {p.brand}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {p.category?.name || "General"}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-black text-[#9a6bff]">
                                  {formatINR(p.discountPrice || p.price)}
                                </span>
                                {p.discountPrice &&
                                  p.discountPrice < p.price && (
                                    <span className="text-xs text-gray-400 line-through ml-1">
                                      {formatINR(p.price)}
                                    </span>
                                  )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-sm font-bold px-2 py-0.5 rounded-[2px] ${
                                    p.stock <= 5
                                      ? "text-rose-700 bg-rose-50"
                                      : p.stock <= 20
                                        ? "text-amber-700 bg-amber-50"
                                        : "text-gray-700 bg-gray-50"
                                  }`}
                                >
                                  {p.stock}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2.5 py-1 rounded-[2px] text-xs font-bold ${
                                    p.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : p.status === "DRAFT"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-4 py-12 text-center text-gray-400 text-sm"
                              >
                                No products found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/scanner"
              element={
                <OutletInventoryWorkspace
                  currentVendor={currentVendor}
                  mode="scanner"
                />
              }
            />
            <Route
              path="/outlet-inventory"
              element={
                <OutletInventoryWorkspace
                  currentVendor={currentVendor}
                  mode="inventory"
                />
              }
            />

            <Route
              path="/billing"
              element={
                <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">
                        New Offline Sale
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Process a direct sale and select items from your catalog
                      </p>
                    </div>
                  </div>

                  {successBill ? (
                    <div className="bg-white p-10 rounded-[2px] border border-gray-100 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black text-[#151515] mb-2">
                        Sale Processed!
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Ref:{" "}
                        <span className="font-black text-[#151515]">
                          OFF-{successBill.id?.slice(0, 8).toUpperCase()}
                        </span>
                      </p>
                      <div className="bg-gray-50 rounded-[2px] p-5 max-w-xs w-full mb-6 text-left space-y-3">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500 text-sm">Mobile</span>
                          <span className="font-bold text-[#151515]">
                            {successBill.mobile}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500 text-sm">Items</span>
                          <span className="font-bold text-[#151515]">
                            {successBill.items?.reduce(
                              (a, b) => a + b.quantity,
                              0,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="font-bold text-gray-800">Total</span>
                          <span className="font-black text-xl text-[#9a6bff]">
                            {formatINR(successBill.amount)}
                          </span>
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
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                      {/* Product Selection */}
                      <div className="xl:col-span-8 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                              <Package className="h-5 w-5 text-[#9a6bff]" />
                              Available Products
                            </h3>
                            <div className="relative w-full md:w-80">
                              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                              <input
                                type="text"
                                placeholder="Search by name or brand..."
                                value={posSearch}
                                onChange={(e) => setPosSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#9a6bff]/20 focus:border-[#9a6bff] font-medium transition-all"
                              />
                            </div>
                          </div>

                          <div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
                            data-lenis-prevent
                          >
                            {activeProducts.map((p) => {
                              const inCart = cart.find((c) => c.id === p.id);
                              return (
                                <div
                                  key={p.id}
                                  className={cn(
                                    "group relative bg-white border p-4 rounded-xl transition-all duration-300",
                                    inCart
                                      ? "border-[#9a6bff] shadow-md shadow-[#9a6bff]/5 ring-1 ring-[#9a6bff]/20"
                                      : "border-stone-100 hover:border-[#9a6bff] hover:shadow-lg hover:shadow-stone-200/50",
                                  )}
                                >
                                  <div className="flex gap-4">
                                    <div className="relative shrink-0">
                                      {p.imageUrls?.[0] ? (
                                        <img
                                          src={getMediaUrl(p.imageUrls[0])}
                                          className="w-16 h-16 rounded-lg object-cover bg-stone-50"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 rounded-lg bg-stone-50 flex items-center justify-center">
                                          <Package className="w-6 h-6 text-stone-300" />
                                        </div>
                                      )}
                                      {inCart && (
                                        <div className="absolute -top-2 -right-2 bg-[#9a6bff] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                                          {inCart.quantity}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-[#9a6bff] transition-colors">
                                        {p.name}
                                      </h4>
                                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-0.5">
                                        {p.brand || "Standard"}
                                      </p>
                                      <div className="flex items-baseline gap-1.5 mt-2">
                                        <span className="text-sm font-black text-stone-900">
                                          {formatINR(
                                            p.discountPrice || p.price,
                                          )}
                                        </span>
                                        {p.discountPrice &&
                                          p.discountPrice < p.price && (
                                            <span className="text-[10px] text-stone-400 line-through">
                                              {formatINR(p.price)}
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                                        Available
                                      </span>
                                      <span
                                        className={cn(
                                          "text-xs font-bold",
                                          p.stock <= 5
                                            ? "text-rose-500"
                                            : "text-stone-900",
                                        )}
                                      >
                                        {p.stock} units
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => addToCart(p)}
                                      disabled={p.stock <= 0}
                                      className={cn(
                                        "h-9 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95",
                                        inCart
                                          ? "bg-[#9a6bff] text-white hover:bg-purple-600 shadow-md shadow-[#9a6bff]/20"
                                          : "bg-stone-900 text-white hover:bg-stone-800",
                                        "disabled:opacity-20 disabled:cursor-not-allowed",
                                      )}
                                    >
                                      {inCart ? "Add More" : "Add to Cart"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            {activeProducts.length === 0 && (
                              <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-300">
                                <Search className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">
                                  No products found
                                </p>
                                <button
                                  onClick={() => setPosSearch("")}
                                  className="mt-4 text-[#9a6bff] text-xs font-black uppercase tracking-widest hover:underline"
                                >
                                  Clear Search
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cart Section */}
                      <div className="xl:col-span-4 sticky top-6">
                        <div className="bg-white rounded-2xl p-6 text-stone-900 border border-stone-200 shadow-sm overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <ShoppingCart size={140} strokeWidth={1} />
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-[#9a6bff]" />
                                My Cart
                              </h3>
                              <span className="bg-[#9a6bff]/10 text-[#9a6bff] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {cart.length} Items
                              </span>
                            </div>

                            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                              {cart.length === 0 ? (
                                <div className="py-10 text-center">
                                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-300 mb-4">
                                    <Package size={24} />
                                  </div>
                                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                    Cart is empty
                                  </p>
                                </div>
                              ) : (
                                cart.map((item) => (
                                  <div
                                    key={item.id}
                                    className="bg-stone-50 p-3 rounded-xl border border-stone-100 hover:border-[#9a6bff]/30 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-stone-900 line-clamp-1">
                                          {item.name}
                                        </h4>
                                        <p className="text-[10px] font-bold text-stone-400 mt-0.5">
                                          {formatINR(item.unitPrice)} per unit
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-stone-300 hover:text-rose-500 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                      <div className="flex items-center bg-stone-200/50 rounded-lg p-0.5">
                                        <button
                                          onClick={() =>
                                            updateCartQty(item.id, -1)
                                          }
                                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white rounded-md transition-all"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-black text-stone-900">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() =>
                                            updateCartQty(item.id, 1)
                                          }
                                          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white rounded-md transition-all"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </button>
                                      </div>
                                      <span className="text-sm font-black text-[#9a6bff]">
                                        {formatINR(
                                          item.unitPrice * item.quantity,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-3">
                                <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                  Customer Assignment
                                </label>
                                <div className="space-y-2">
                                  <div className="relative">
                                    <Users className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                      value={customerMobile}
                                      onChange={(e) =>
                                        setCustomerMobile(e.target.value)
                                      }
                                      placeholder="Mobile Number (10 digits)"
                                      className="w-full bg-stone-50 border border-stone-200 h-11 pl-10 pr-4 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-[#9a6bff]/20 focus:border-[#9a6bff] transition-all"
                                    />
                                  </div>
                                  {lookedUpCustomer && (
                                    <div className="bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
                                        {lookedUpCustomer.name} •{" "}
                                        {lookedUpCustomer.rewardPoints} Points
                                      </p>
                                    </div>
                                  )}
                                  <input
                                    value={customerName}
                                    onChange={(e) =>
                                      setCustomerName(e.target.value)
                                    }
                                    placeholder="Customer Name (Optional)"
                                    className="w-full bg-stone-50 border border-stone-200 h-11 px-4 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-[#9a6bff]/20 focus:border-[#9a6bff] transition-all"
                                  />
                                </div>
                              </div>

                              <div className="pt-6 border-t border-stone-100">
                                <div className="flex justify-between items-end mb-6">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                      Payable Amount
                                    </span>
                                    <span className="text-3xl font-black text-stone-900 tracking-tighter">
                                      {formatINR(cartSubtotal)}
                                    </span>
                                  </div>
                                  <Receipt className="h-8 w-8 text-[#9a6bff] opacity-20" />
                                </div>

                                <button
                                  onClick={handleCheckout}
                                  disabled={
                                    cart.length === 0 ||
                                    !customerMobile ||
                                    isSubmitting
                                  }
                                  className={cn(
                                    "w-full h-14 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl",
                                    cart.length > 0 && customerMobile
                                      ? "bg-[#9a6bff] hover:bg-purple-600 text-white shadow-[#9a6bff]/20"
                                      : "bg-stone-100 text-stone-400 cursor-not-allowed",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                  )}
                                >
                                  {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                      Processing...
                                    </span>
                                  ) : (
                                    "Charge Offline Bill"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              }
            />

            <Route
              path="/offline-history"
              element={
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-2xl font-black text-[#151515]">
                      Offline Purchase History
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {offlinePurchases.length} offline transactions
                    </p>
                  </div>
                  <div className="bg-white rounded-[2px] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Ref ID
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Mobile
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Items
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Linked
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {offlinePurchases.map((p) => (
                            <tr
                              key={p.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm font-bold text-[#151515]">
                                OFF-{p.id?.slice(0, 8).toUpperCase()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(p.purchaseDate).toLocaleDateString(
                                  "en-IN",
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                {p.customer?.name ||
                                  p.customerName ||
                                  "Walk-in"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {p.mobile}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {p.items?.reduce((a, b) => a + b.quantity, 0) ||
                                  0}
                              </td>
                              <td className="px-4 py-3 font-black text-[#9a6bff]">
                                {formatINR(p.amount)}
                              </td>
                              <td className="px-4 py-3">
                                {p.customerId ? (
                                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-[2px] font-bold">
                                    Linked
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-[2px] font-bold">
                                    Unlinked
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {offlinePurchases.length === 0 && (
                            <tr>
                              <td
                                colSpan="7"
                                className="px-4 py-12 text-center text-gray-400 text-sm"
                              >
                                No offline purchases yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/analytics"
              element={
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-2xl font-black text-[#151515]">
                    Sales Analytics
                  </h2>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                      title="Online Revenue"
                      value={formatINR(analytics?.revenue?.total || 0)}
                      icon={IndianRupee}
                      color="purple"
                    />
                    <KPICard
                      title="Offline Revenue"
                      value={formatINR(analytics?.revenue?.offline || 0)}
                      icon={Store}
                      color="pink"
                    />
                    <KPICard
                      title="Online Orders"
                      value={(analytics?.orders?.total || 0).toString()}
                      icon={ShoppingCart}
                      color="blue"
                    />
                    <KPICard
                      title="Offline Sales"
                      value={(analytics?.offlineSales?.total || 0).toString()}
                      icon={Receipt}
                      color="orange"
                    />
                  </div>

                  {/* Top Products Table */}
                  <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                    <h3 className="text-lg font-black text-[#151515] mb-4">
                      Top Selling Products
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              #
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Product
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Units Sold
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Revenue
                            </th>
                            <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">
                              Current Stock
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {analytics?.topProducts?.map((p, i) => (
                            <tr
                              key={p.productId}
                              className="hover:bg-gray-50/50"
                            >
                              <td className="px-4 py-3 text-sm font-black text-gray-400">
                                #{i + 1}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.image ? (
                                    <img
                                      src={getMediaUrl(p.image)}
                                      className="w-9 h-9 rounded-[2px] object-cover"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                      <Package className="h-4 w-4 text-purple-500" />
                                    </div>
                                  )}
                                  <span className="text-sm font-bold text-[#151515]">
                                    {p.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-gray-700">
                                {p.totalSold}
                              </td>
                              <td className="px-4 py-3 font-black text-[#9a6bff]">
                                {formatINR(p.totalRevenue)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-sm font-bold px-2 py-0.5 rounded-[2px] ${p.stock <= 5 ? "text-rose-700 bg-rose-50" : "text-gray-700 bg-gray-50"}`}
                                >
                                  {p.stock}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {(!analytics?.topProducts ||
                            analytics.topProducts.length === 0) && (
                            <tr>
                              <td
                                colSpan="5"
                                className="px-4 py-12 text-center text-gray-400 text-sm"
                              >
                                No sales data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Status Pie Chart */}
                  {analytics?.orders?.statusBreakdown?.length > 0 && (
                    <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                      <h3 className="text-lg font-black text-[#151515] mb-4">
                        Order Status Distribution
                      </h3>
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
                              label={({ name, percent }) =>
                                `${statusLabel(name)} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {analytics.orders.statusBreakdown.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [
                                value,
                                statusLabel(name),
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              }
            />

            <Route
              path="/stock-alerts"
              element={
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">
                        Stock Alerts
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Products with 5 or fewer units in stock
                      </p>
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
                      <h3 className="text-xl font-black text-[#151515] mb-2">
                        All Good!
                      </h3>
                      <p className="text-gray-500">
                        All your products have healthy stock levels.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white p-5 rounded-[2px] border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            {p.imageUrls?.[0] ? (
                              <img
                                src={getMediaUrl(p.imageUrls[0])}
                                className="w-14 h-14 rounded-[2px] object-cover border border-gray-100"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-[2px] bg-purple-50 flex items-center justify-center">
                                <Package className="h-6 w-6 text-purple-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[#151515] truncate">
                                {p.name}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {p.category?.name || "General"}
                              </p>
                              <div
                                className={`mt-2 text-sm font-black ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}
                              >
                                {p.stock === 0
                                  ? "⛔ OUT OF STOCK"
                                  : `⚠️ Only ${p.stock} left`}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-full py-2 rounded-[2px] font-black text-[10px] uppercase tracking-widest text-center border ${
                              p.stock === 0
                                ? "bg-rose-50 text-rose-600 border-rose-100"
                                : "bg-stone-50 text-stone-400 border-stone-100"
                            }`}
                          >
                            In-Store Inventory: {p.stock}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              }
            />

            <Route
              path="/dispatch"
              element={
                <DispatchProtocolWorkstation
                  navigate={navigate}
                  currentVendor={currentVendor}
                  dispatchDestination={dispatchDestination}
                  setDispatchDestination={setDispatchDestination}
                  allVendors={allVendors}
                  activeProducts={activeProducts}
                  dispatchItems={dispatchItems}
                  addDispatchItem={addDispatchItem}
                  removeDispatchItem={removeDispatchItem}
                  updateDispatchItemQty={updateDispatchItemQty}
                  isSubmitting={isSubmitting}
                  handleCreateDispatch={handleCreateDispatch}
                  getMediaUrl={getMediaUrl}
                  formatINR={formatINR}
                  posSearch={posSearch}
                  setPosSearch={setPosSearch}
                />
              }
            />
            <Route
              path="/stock-transfers"
              element={
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-[#151515]">
                        Stock Logistics
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage incoming and outgoing outlet transfers
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleInitiateDispatch}
                        className="text-xs bg-[#9a6bff] text-white font-bold px-4 py-2 rounded-[2px] hover:bg-purple-600 transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
                      >
                        <Plus className="h-4 w-4" /> New Dispatch
                      </button>
                      <button
                        onClick={() => fetchTabData("stock-transfers")}
                        className="text-xs bg-white text-[#151515] font-bold px-3 py-2 rounded-[2px] border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3 text-gray-400" /> Sync
                        Logistics
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Incoming Transfers */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 rounded-[2px] bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <Truck className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="font-black text-[#151515] uppercase tracking-tight italic">
                          Incoming{" "}
                          <span className="text-emerald-600">Shipments</span>
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {stockTransfers.filter(
                          (t) => t.destinationVendorId === currentVendor?.id,
                        ).length === 0 ? (
                          <div className="bg-white p-12 rounded-[2px] border border-gray-100 text-center text-gray-400 text-sm italic">
                            No incoming shipments recorded
                          </div>
                        ) : (
                          stockTransfers
                            .filter(
                              (t) =>
                                t.destinationVendorId === currentVendor?.id,
                            )
                            .map((t) => (
                              <div
                                key={t.id}
                                onClick={() => fetchTransferDetail(t.id)}
                                className="bg-white p-5 rounded-[2px] border border-gray-100 shadow-sm hover:border-[#9a6bff]/30 hover:shadow-md transition-all cursor-pointer group"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                      Ref: #{t.id.slice(-6).toUpperCase()}
                                    </span>
                                    <div className="text-sm font-black text-[#151515] mt-0.5">
                                      From:{" "}
                                      {t.sourceVendor?.businessName?.toLowerCase() ===
                                        "omw global" ||
                                      t.sourceVendor?.businessName?.toLowerCase() ===
                                        "admin stock"
                                        ? "Admin Stock"
                                        : t.sourceVendor?.businessName}
                                    </div>
                                  </div>
                                  <div
                                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-[2px] border ${
                                      t.status === "DISPATCHED"
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : t.status === "COMPLETED"
                                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                          : "bg-gray-50 text-gray-500 border-gray-100"
                                    }`}
                                  >
                                    {statusLabel(t.status)}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-3 bg-gray-50/50 p-2 rounded-[2px]">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />{" "}
                                    {new Date(t.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Box className="h-3 w-3" />{" "}
                                    {t.items?.length} SKUs
                                  </div>
                                  <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4 ml-auto text-emerald-600">
                                    <Box className="h-3 w-3" />{" "}
                                    {t.items?.reduce(
                                      (sum, item) => sum + (item.quantity || 0),
                                      0,
                                    )}{" "}
                                    Total Units
                                  </div>
                                </div>

                                <div className="space-y-1.5 mb-4 px-1">
                                  {t.items?.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-[11px] border-b border-gray-50 pb-1.5 last:border-0"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-emerald-400 rounded-full" />
                                        <span className="font-bold text-[#151515] truncate max-w-[160px]">
                                          {item.product?.name ||
                                            vendorProducts.find(
                                              (p) => p.id === item.productId,
                                            )?.name ||
                                            "Unidentified Item"}
                                        </span>
                                      </div>
                                      <span className="font-black text-gray-400 tabular-nums">
                                        ×{item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {t.status === "DISPATCHED" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchTransferDetail(t.id);
                                    }}
                                    className="w-full bg-emerald-600 text-white h-10 rounded-[2px] font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                                  >
                                    Verify & Receive Shipment
                                  </button>
                                )}
                                {t.status === "COMPLETED" && (
                                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest pt-2">
                                    <CheckCircle2 className="h-4 w-4" /> Stock
                                    Successfully Registered
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Outgoing Transfers */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 rounded-[2px] bg-indigo-50 flex items-center justify-center border border-indigo-100">
                          <ArrowRight className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h3 className="font-black text-[#151515] uppercase tracking-tight italic">
                          Outgoing{" "}
                          <span className="text-indigo-600">Dispatches</span>
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {stockTransfers.filter(
                          (t) => t.sourceVendorId === currentVendor?.id,
                        ).length === 0 ? (
                          <div className="bg-white p-12 rounded-[2px] border border-gray-100 text-center text-gray-400 text-sm italic">
                            No outgoing dispatches recorded
                          </div>
                        ) : (
                          stockTransfers
                            .filter(
                              (t) => t.sourceVendorId === currentVendor?.id,
                            )
                            .map((t) => (
                              <div
                                key={t.id}
                                onClick={() => fetchTransferDetail(t.id)}
                                className="bg-white p-5 rounded-[2px] border border-gray-100 shadow-sm hover:border-[#9a6bff]/30 hover:shadow-md transition-all cursor-pointer group"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                      Ref: #{t.id.slice(-6).toUpperCase()}
                                    </span>
                                    <div className="text-sm font-black text-[#151515] mt-0.5">
                                      To:{" "}
                                      {t.destinationVendor?.businessName?.toLowerCase() ===
                                        "omw global" ||
                                      t.destinationVendor?.businessName?.toLowerCase() ===
                                        "admin stock"
                                        ? "Admin Stock"
                                        : t.destinationVendor?.businessName}
                                    </div>
                                  </div>
                                  <div
                                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-[2px] border ${
                                      t.status === "APPROVED"
                                        ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                        : t.status === "PENDING"
                                          ? "bg-amber-50 text-amber-600 border-amber-100"
                                          : t.status === "DISPATCHED"
                                            ? "bg-blue-50 text-blue-600 border-blue-100"
                                            : t.status === "COMPLETED"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                              : "bg-gray-50 text-gray-500 border-gray-100"
                                    }`}
                                  >
                                    {statusLabel(t.status)}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-3 bg-gray-50/50 p-2 rounded-[2px]">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />{" "}
                                    {new Date(t.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Box className="h-3 w-3" />{" "}
                                    {t.items?.length} SKUs
                                  </div>
                                  <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4 ml-auto text-indigo-600">
                                    <Box className="h-3 w-3" />{" "}
                                    {t.items?.reduce(
                                      (sum, item) => sum + (item.quantity || 0),
                                      0,
                                    )}{" "}
                                    Total Units
                                  </div>
                                </div>

                                <div className="space-y-1.5 mb-4 px-1">
                                  {t.items?.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-[11px] border-b border-gray-50 pb-1.5 last:border-0"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-indigo-400 rounded-full" />
                                        <span className="font-bold text-[#151515] truncate max-w-[160px]">
                                          {item.product?.name ||
                                            vendorProducts.find(
                                              (p) => p.id === item.productId,
                                            )?.name ||
                                            "Unidentified Item"}
                                        </span>
                                      </div>
                                      <span className="font-black text-gray-400 tabular-nums">
                                        ×{item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {t.status === "APPROVED" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchTransferDetail(t.id);
                                    }}
                                    className="w-full bg-indigo-600 text-white h-10 rounded-[2px] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                  >
                                    Run Dispatch Protocol
                                  </button>
                                )}
                                {t.status === "PENDING" && (
                                  <div className="bg-amber-50 text-amber-800 p-3 rounded-[2px] text-[10px] font-bold flex items-start gap-2 leading-relaxed">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    Awaiting admin approval before you can
                                    dispatch this stock.
                                  </div>
                                )}
                                {t.status === "COMPLETED" && (
                                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest pt-2">
                                    <CheckCircle2 className="h-4 w-4" />{" "}
                                    Shipment Delivered & Confirmed
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/notifications"
              element={
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[2px] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100">
                          <Bell className="h-5 w-5 text-[#9a6bff]" />
                        </div>
                        <h2 className="text-2xl font-black text-[#151515] tracking-tight">
                          Notifications
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        You have{" "}
                        <span className="text-[#151515] font-black">
                          {notifications.filter((n) => !n.isRead).length}
                        </span>{" "}
                        unread alerts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.filter((n) => !n.isRead).length > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              const unread = notifications.filter(
                                (n) => !n.isRead,
                              );
                              for (const n of unread) {
                                await fetch(
                                  `${API_URL}/vendors/notifications/${n.id}/read`,
                                  { method: "PATCH" },
                                );
                              }
                              setNotifications((prev) =>
                                prev.map((x) => ({ ...x, isRead: true })),
                              );
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
                      <h3 className="text-xl font-black text-[#151515] mb-2">
                        Inbox Zero
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        You're all caught up! No new notifications or alerts at
                        the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => {
                        const isOrder = n.title
                          ?.toLowerCase()
                          .includes("order");
                        const isStock = n.title
                          ?.toLowerCase()
                          .includes("stock");
                        const isAlert = n.title
                          ?.toLowerCase()
                          .includes("alert");
                        const Icon = isOrder
                          ? ShoppingCart
                          : isStock
                            ? Package
                            : isAlert
                              ? AlertTriangle
                              : Bell;

                        return (
                          <div
                            key={n.id}
                            className={`group relative bg-white p-5 rounded-[2px] border flex items-start gap-4 transition-all duration-300 ${
                              n.isRead
                                ? "border-gray-100 shadow-sm hover:border-gray-200"
                                : "border-[#9a6bff]/40 shadow-md shadow-[#9a6bff]/5 hover:border-[#9a6bff]/60"
                            }`}
                          >
                            {!n.isRead && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-[#9a6bff] rounded-l-[2px]" />
                            )}
                            <div className="relative">
                              <div
                                className={`w-12 h-12 rounded-[2px] flex items-center justify-center shrink-0 border ${
                                  n.isRead
                                    ? "bg-gray-50 border-gray-100 text-gray-400"
                                    : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 text-[#9a6bff]"
                                }`}
                              >
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
                                  <p
                                    className={`text-sm tracking-tight ${n.isRead ? "font-bold text-gray-600" : "font-black text-[#151515]"}`}
                                  >
                                    {n.title}
                                  </p>
                                  <p
                                    className={`text-sm mt-1 leading-relaxed ${n.isRead ? "text-gray-500" : "text-gray-600"}`}
                                  >
                                    {n.message}
                                  </p>
                                </div>
                                {!n.isRead && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await fetch(
                                          `${API_URL}/vendors/notifications/${n.id}/read`,
                                          { method: "PATCH" },
                                        );
                                        setNotifications((prev) =>
                                          prev.map((x) =>
                                            x.id === n.id
                                              ? { ...x, isRead: true }
                                              : x,
                                          ),
                                        );
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
                                {new Date(n.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              }
            />

            <Route
              path="/settings"
              element={
                <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
                  <div>
                    <h2 className="text-2xl font-black text-[#151515]">
                      Store Settings
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Your store profile and information
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-[2px] border border-gray-100 space-y-5">
                    <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                      <div className="w-16 h-16 rounded-[2px] bg-gradient-to-tr from-[#9a6bff] to-purple-300 flex items-center justify-center text-white font-black text-2xl">
                        {currentVendor?.businessName?.charAt(0) || "V"}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#151515]">
                          {currentVendor?.businessName || "—"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {currentVendor?.businessCategory || "—"}
                        </p>
                        <span
                          className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-[2px] ${
                            currentVendor?.approvalStatus === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {currentVendor?.approvalStatus
                            ? statusLabel(currentVendor.approvalStatus)
                            : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                          Owner Name
                        </label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">
                          {currentVendor?.ownerName || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                          Contact Number
                        </label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">
                          {currentVendor?.contactNumber || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                          Email
                        </label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">
                          {currentVendor?.email || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                          Business Category
                        </label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">
                          {currentVendor?.businessCategory || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                          Assigned Outlet
                        </label>
                        <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">
                          {currentVendor?.outlet?.name || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">
                        Store Address
                      </label>
                      <p className="text-sm font-semibold text-[#151515] bg-gray-50 px-3 py-2.5 rounded-[2px]">
                        {currentVendor?.storeAddress || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2px] border border-gray-100">
                    <h3 className="text-lg font-black text-[#151515] mb-3">
                      Quick Stats
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-[2px]">
                        <p className="text-2xl font-black text-[#9a6bff]">
                          {analytics?.totalProducts || 0}
                        </p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          Products
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-[2px]">
                        <p className="text-2xl font-black text-[#9a6bff]">
                          {analytics?.orders?.total || 0}
                        </p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          Orders
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-[2px]">
                        <p className="text-2xl font-black text-[#9a6bff]">
                          {analytics?.totalCustomers || 0}
                        </p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          Customers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </main>

      {/* ═══ VENDOR LOGISTICS PROTOCOL DETAIL ═══ */}
      <Dialog
        open={isTransferDetailOpen}
        onOpenChange={setIsTransferDetailOpen}
      >
        <DialogContent className="sm:max-w-[1200px] w-[95vw] p-0 overflow-hidden border-none rounded-[2px] bg-white shadow-2xl flex flex-col h-[85vh] max-h-[85vh] [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Stock Transfer Details</DialogTitle>
            <DialogDescription>
              Itemized shipment manifest and logistics timeline.
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !viewingTransfer ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="h-16 w-16 rounded-2xl bg-white shadow-xl border border-stone-100 flex items-center justify-center relative z-10 animate-bounce">
                  <Package className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black tracking-[0.3em] text-stone-400 uppercase">
                  Logistics Sync
                </p>
                <p className="text-sm font-bold text-stone-900">
                  Synchronizing Secure Ledger... 
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Premium Workstation Header */}
              <div className="relative overflow-hidden bg-white border-b border-stone-100 px-10 py-6 shrink-0">
                {/* Mesh Gradient Accents */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -mr-20 -mt-20 pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 blur-[120px] -ml-20 -mb-20 pointer-events-none rounded-full" />

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-4">
                      <Badge
                        className="px-4 py-1.5 font-black text-[10px] tracking-[0.15em] uppercase bg-stone-900 text-white border-none shadow-lg shadow-stone-900/10 rounded-full"
                      >
                        PROTOCOL #{viewingTransfer.id.slice(-8).toUpperCase()}
                      </Badge>
                      {viewingTransfer.status === "DISPATCHED" && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 animate-pulse">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                            IN TRANSIT
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tight text-stone-900 flex items-center gap-3">
                        Transfer <span className="text-indigo-600">Manifest</span>
                      </h2>
                      <div className="flex items-center gap-4 text-[11px] font-bold text-stone-400 uppercase tracking-[0.1em]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(viewingTransfer.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-stone-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-900 font-black">
                            Value: {formatINR(viewingTransfer.items?.reduce((sum, item) => sum + (item.unitPrice || item.product?.price || 0) * item.quantity, 0) || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsTransferDetailOpen(false)}
                    className="h-12 w-12 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 hover:shadow-md transition-all duration-300 focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#fcfcfc] min-h-0 custom-scrollbar">
                <div className="p-10 pb-16">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
                    {/* Left: Manifest Ledger */}
                    <div className="lg:col-span-7 space-y-8">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                        <h3 className="text-xs font-black text-stone-900 flex items-center gap-3 uppercase tracking-[0.2em]">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Package className="h-4 w-4 text-indigo-600" />
                          </div>
                          Item Checklist
                        </h3>
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-md">
                          {viewingTransfer.items?.length || 0} SKUs DETECTED
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {viewingTransfer.items?.map((item, idx) => {
                          const isVerified = verifiedItems[viewingTransfer.id]?.[item.productId];
                          const canVerify = viewingTransfer.destinationVendorId === currentVendor?.id && viewingTransfer.status === "DISPATCHED";

                          return (
                            <div
                              key={idx}
                              onClick={() => canVerify && toggleItemVerification(viewingTransfer.id, item.productId)}
                              className={cn(
                                "group relative overflow-hidden bg-white rounded-3xl border transition-all duration-500 p-5",
                                isVerified ? "bg-emerald-50/30 border-emerald-200 shadow-lg shadow-emerald-500/5" : "border-stone-200/60 shadow-sm hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1 cursor-pointer"
                              )}
                            >
                              <div className="flex items-center gap-5">
                                <div className="h-20 w-20 rounded-2xl bg-stone-50 border border-stone-100 p-2 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                                  {item.product?.image || item.product?.imageUrls?.[0] ? (
                                    <img
                                      src={getMediaUrl(item.product.image || item.product.imageUrls[0])}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Box className="h-8 w-8 text-stone-200" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <p className="text-[10px] font-black tracking-[0.15em] text-indigo-500 uppercase">
                                      {item.product?.brand || "Premium SKU"}
                                    </p>
                                    {item.product?.sku && (
                                      <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest border-l border-stone-100 pl-2">
                                        {item.product.sku}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-lg font-black text-stone-900 leading-tight mb-2 truncate">
                                    {item.product?.name || item.product?.product?.name || "Secure Item"}
                                  </p>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                                      <span className="text-[10px] font-bold text-stone-400 uppercase">Qty:</span>
                                      <span className="text-sm font-black text-stone-900 tabular-nums">{item.quantity}</span>
                                    </div>
                                    <div className="text-[10px] font-black text-stone-400 italic">
                                      {formatINR(item.unitPrice || item.product?.price || 0)} / Unit
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end shrink-0 pl-6 border-l border-stone-100 space-y-2">
                                  <p className="text-[10px] font-black text-indigo-600 tabular-nums">
                                    {formatINR((item.unitPrice || item.product?.price || 0) * item.quantity)}
                                  </p>
                                  {canVerify && (
                                    <div className={cn(
                                      "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-300",
                                      isVerified ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white border-stone-200 text-stone-200"
                                    )}>
                                      <Check className={cn("h-4 w-4 transition-transform", isVerified && "scale-110")} />
                                    </div>
                                  )}
                                  {!canVerify && isVerified && (
                                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                      <Check className="h-3 w-3 text-emerald-600" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Logistics & Control */}
                    <div className="lg:col-span-5 space-y-10">
                      {/* Visual Routing */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-stone-900 flex items-center gap-2 uppercase tracking-[0.2em]">
                          <div className="h-6 w-6 rounded-md bg-rose-50 flex items-center justify-center border border-rose-100">
                            <MapPin className="h-3 w-3 text-rose-600" />
                          </div>
                          Transit Path
                        </h3>
                        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-4 relative overflow-hidden group">
                          <div className="relative z-10 flex items-center gap-3">
                            <div className="flex flex-col items-center gap-0.5 shrink-0">
                              <div className="h-7 w-7 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-sm">
                                <Building2 className="h-3.5 w-3.5" />
                              </div>
                              <div className="w-px h-5 border-l border-dashed border-stone-300 group-hover:border-indigo-300 transition-colors" />
                              <div className="h-5 w-5 rounded-full bg-white border border-stone-200 flex items-center justify-center group-hover:border-indigo-400 transition-all">
                                <ChevronDown className="h-3 w-3 text-stone-400 group-hover:text-indigo-500 transition-colors" />
                              </div>
                              <div className="w-px h-5 border-l border-dashed border-stone-300 group-hover:border-indigo-300 transition-colors" />
                              <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
                                <Store className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <div className="flex flex-col justify-between min-w-0 gap-6 py-0.5">
                              <div>
                                <p className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">From</p>
                                <p className="text-sm font-black text-stone-900 tracking-tight truncate">
                                  {viewingTransfer.sourceVendor?.businessName?.toLowerCase() === "omw global" ? "Central Command" : (viewingTransfer.sourceVendor?.businessName || "Source Station")}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase">To</p>
                                <p className="text-sm font-black text-stone-900 tracking-tight truncate">
                                  {viewingTransfer.destinationVendor?.businessName?.toLowerCase() === "omw global" ? "Central Command" : (viewingTransfer.destinationVendor?.businessName || "Target Terminal")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Log */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-stone-900 flex items-center gap-2 uppercase tracking-[0.2em]">
                          <div className="h-6 w-6 rounded-md bg-stone-50 flex items-center justify-center border border-stone-200">
                            <History className="h-3 w-3 text-stone-600" />
                          </div>
                          Protocol Ledger
                        </h3>
                        
                        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
                          <div className={cn(
                            "px-5 py-3 font-black uppercase tracking-[0.2em] text-[10px] border-b flex items-center justify-between",
                            viewingTransfer.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                            viewingTransfer.status === "DISPATCHED" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-stone-50 text-stone-500 border-stone-200"
                          )}>
                            <span>STATUS: {statusLabel(viewingTransfer.status)}</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          </div>

                          <div className="p-5 space-y-4">
                            {[
                              { label: "Initialized", date: viewingTransfer.createdAt, icon: Clock },
                              { label: "Dispatched", date: viewingTransfer.dispatchedAt, icon: Truck, color: "text-indigo-600" },
                              { label: "Finalized", date: viewingTransfer.receivedAt, icon: CheckCircle2, color: "text-emerald-600" },
                            ].map((phase, idx) => {
                              if (!phase.date) return null;
                              const PhaseIcon = phase.icon;
                              return (
                                <div key={idx} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <PhaseIcon className={cn("h-3.5 w-3.5", phase.color || "text-stone-400")} />
                                    <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">{phase.label}</span>
                                  </div>
                                  <span className={cn("text-[10px] font-black tabular-nums bg-stone-50 px-2 py-0.5 rounded-md", phase.color || "text-stone-900")}>
                                    {new Date(phase.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Command Footer */}
              <div className="p-8 bg-white border-t border-stone-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Secure Dispatch Protocol</span>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Verification Required</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {currentVendor?.id && (
                      <div className="flex items-center gap-6">
                        {viewingTransfer.status === "DISPATCHED" &&
                          viewingTransfer.destinationVendorId ===
                            currentVendor?.id && (
                            <div className="flex items-center gap-6">
                              {viewingTransfer.items?.length >
                                Object.keys(
                                  verifiedItems[viewingTransfer.id] || {},
                                ).filter(
                                  (k) => verifiedItems[viewingTransfer.id][k],
                                ).length && (
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] animate-pulse">
                                  WAITING FOR {viewingTransfer.items.length -
                                    Object.keys(
                                      verifiedItems[viewingTransfer.id] || {},
                                    ).filter(
                                      (k) => verifiedItems[viewingTransfer.id][k],
                                    ).length}{" "}
                                  SKUS
                                </span>
                              )}
                              <Button
                                disabled={
                                  viewingTransfer.items?.length !==
                                  Object.keys(
                                    verifiedItems[viewingTransfer.id] || {},
                                  ).filter(
                                    (k) => verifiedItems[viewingTransfer.id][k],
                                  ).length
                                }
                                onClick={() =>
                                  updateTransferStatus(
                                    viewingTransfer.id,
                                    "COMPLETED",
                                  )
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.2em] px-10 rounded-2xl h-14 disabled:opacity-20 transition-all shadow-xl shadow-emerald-500/20 hover:-translate-y-1 active:translate-y-0"
                              >
                                Commit Receipt
                              </Button>
                            </div>
                          )}

                        {viewingTransfer.status === "APPROVED" &&
                          viewingTransfer.sourceVendorId ===
                            currentVendor?.id && (
                            <Button
                              onClick={() =>
                                updateTransferStatus(
                                  viewingTransfer.id,
                                  "DISPATCHED",
                                )
                              }
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] px-12 rounded-2xl h-14 shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:translate-y-0"
                            >
                              Initiate Dispatch
                            </Button>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
