import { useState, useEffect, useMemo, memo } from "react";
import {
  Package,
  Sparkles,
  Zap,
  Phone,
  Mail,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Info,
  Globe,
  Store,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SERVER_URL } from "@/utils/api";

export const getMediaUrl = (url) => {
  if (!url) return "";
  const normalized = String(url).trim();

  if (
    normalized.includes("localhost:5000") ||
    normalized.includes("stone-backend.vercel.app")
  ) {
    return normalized.replace(
      /^https?:\/\/(localhost:5000|stone-backend\.vercel\.app)/i,
      SERVER_URL,
    );
  }

  if (normalized.startsWith("http") || normalized.startsWith("data:") || normalized.startsWith("/src/") || normalized.startsWith("/@fs/")) {
    return normalized;
  }

  if (normalized.startsWith("/app/")) {
    return `${SERVER_URL}/uploads/${normalized.split("/").pop()}`;
  }

  return `${SERVER_URL}/${normalized.replace(/^\//, "")}`;
};

export const QuickRestockDialog = ({
  open,
  onOpenChange,
  product,
  onRestock,
  loading,
  vendors = [],
}) => {
  const [amount, setAmount] = useState(0);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  useEffect(() => {
    if (open) {
      setAmount(0);
      if (product?.stockRecords?.length > 0) {
        setSelectedVendorId(product.stockRecords[0].vendorId);
      }
    }
  }, [open, product]);

  const vendorStock = useMemo(() => {
    if (!product || !product.stockRecords) return [];
    const counts = product.stockRecords.reduce((acc, rec) => {
      const vid = rec.vendorId;
      acc[vid] = (acc[vid] || 0) + rec.quantity;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([vid, qty]) => {
        const vendor = vendors.find(
          (v) => String(v.id) === String(vid) || String(v._id) === String(vid),
        );
        return {
          id: vid,
          name: vendor
            ? vendor.businessName || vendor.ownerName
            : `Vendor ${vid}`,
          stock: qty,
        };
      })
      .filter((v) => v.stock > 0);
  }, [product, vendors]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] rounded-[20px] bg-white ring-1 ring-stone-200">
        <header className="p-8 bg-linear-to-br from-indigo-50/50 via-white to-rose-50/30 border-b border-stone-100 relative">
          <div className="relative z-10 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-stone-100 ring-4 ring-indigo-50/50">
              <Package className="h-7 w-7 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[22px] font-black text-stone-900 tracking-tight leading-tight">
                Inventory Refill
              </h2>
              <p className="text-stone-400 text-[11px] font-bold uppercase tracking-[0.1em] mt-1">
                Targeting <span className="text-indigo-600">{product?.name}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
              Select Destination Vendor
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {vendorStock.map((vs) => (
                <button
                  key={vs.id}
                  onClick={() => setSelectedVendorId(vs.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                    selectedVendorId === vs.id
                      ? "bg-indigo-50/80 border-indigo-200 ring-2 ring-indigo-100 shadow-sm"
                      : "bg-stone-50/50 border-stone-100 hover:border-stone-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        selectedVendorId === vs.id
                          ? "bg-indigo-500 scale-125"
                          : "bg-stone-300",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[13px] font-bold transition-all",
                        selectedVendorId === vs.id
                          ? "text-indigo-900"
                          : "text-stone-600",
                      )}
                    >
                      {vs.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-stone-900 block">
                      {vs.stock} UNITS
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                      Current Stock
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">
              Add Stock Units
            </Label>
            <div className="relative group">
              <Input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="h-16 bg-stone-50/50 border-stone-100 focus:border-indigo-300 focus:ring-indigo-100/50 rounded-2xl font-black text-2xl transition-all pl-6"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="h-6 w-px bg-stone-200" />
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest pointer-events-none">
                  Units
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-6 bg-stone-50/50 border-t border-stone-100 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] text-stone-500 hover:bg-white transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onRestock(amount, selectedVendorId)}
            disabled={loading || !selectedVendorId}
            className="bg-stone-900 hover:bg-black text-white rounded-xl px-10 h-12 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-stone-900/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                <Zap size={14} className="fill-current" />
                Authorize Restock
              </>
            )}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export const SystemClock = memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const ticker = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  return (
    <div className="hidden md:block">
      <div className="text-[9px] font-black text-[#9a6bff] uppercase tracking-[0.3em] opacity-80 mb-0.5">
        Live System Clock
      </div>
      <div className="text-[13px] font-black text-[#151515] tracking-tight">
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    </div>
  );
});

export const LiveTimeAgo = memo(({ updatedAt, serverSkew }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const effectiveNow = now + (serverSkew || 0);
  const lastActive = new Date(updatedAt);
  const diffMs = effectiveNow - lastActive.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const minsAgo = Math.floor(diffSecs / 60);

  let timeAgo = "";
  if (diffSecs < 60) {
    timeAgo = `${diffSecs}s ago`;
  } else if (minsAgo < 60) {
    timeAgo = `${minsAgo}m ${diffSecs % 60}s ago`;
  } else if (minsAgo < 1440) {
    timeAgo = `${Math.floor(minsAgo / 60)}h ${minsAgo % 60}m ago`;
  } else {
    timeAgo = `${Math.floor(minsAgo / 1440)}d ago`;
  }

  const urgency =
    minsAgo > 360
      ? "text-rose-600 bg-rose-50"
      : minsAgo > 60
        ? "text-amber-600 bg-amber-50"
        : "text-sky-600 bg-sky-50";

  return (
    <Badge
      className={`${urgency} font-black text-[10px] uppercase tracking-widest border-none rounded-full px-3 py-1`}
    >
      {timeAgo}
    </Badge>
  );
});

export const AdminKPICard = memo(
  ({ title, value, icon: Icon, trend, trendUp, color = "emerald" }) => {
    const colorMap = {
      emerald: { icon: "bg-emerald-50 text-emerald-600", trend: "text-emerald-600 bg-emerald-50" },
      sky: { icon: "bg-blue-50 text-blue-600", trend: "text-emerald-600 bg-emerald-50" },
      teal: { icon: "bg-teal-50 text-teal-600", trend: "text-emerald-600 bg-emerald-50" },
      indigo: { icon: "bg-indigo-50 text-indigo-600", trend: "text-emerald-600 bg-emerald-50" },
    };
    const c = colorMap[color] || colorMap.emerald;

    return (
      <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", c.icon)}>
            <Icon className="h-4 w-4" />
          </div>
          {trend && (
            <div className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-md", c.trend)}>
              {trend}
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
            {title}
          </p>
          <p className="text-xl font-bold text-stone-900 tracking-tight">
            {value}
          </p>
        </div>
      </div>
    );
  },
);

export const RevenueReport = memo(({ analyticsData, formatMoney }) => {
  const rawData = analyticsData?.graphData || [];
  const [hoverIndex, setHoverIndex] = useState(null);
  const activeIndex = hoverIndex !== null ? hoverIndex : rawData.length - 1;

  if (rawData.length === 0)
    return (
      <div className="h-48 sm:h-56 relative w-full mb-4 bg-stone-50/20 rounded-xl flex items-center justify-center border border-dashed border-stone-200/50">
        <div className="text-center space-y-1 opacity-30">
           <Zap className="h-6 w-6 mx-auto text-stone-300" />
           <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Loading Analytics...</p>
        </div>
      </div>
    );

  const COLORS = {
    invested: "#6366f1",
    online: "#0ea5e9",
    offline: "#f43f5e",
  };
  const maxAmt = Math.max(
    ...rawData.map((d) => (d.onlineAmount || 0) + (d.offlineAmount || 0)),
    1,
  );

  const getPoints = (data) =>
    data.map((d, i) => ({
      x: data.length > 1 ? (i / (data.length - 1)) * 100 : 50,
      totalY: 100 - (((d.onlineAmount || 0) + (d.offlineAmount || 0)) / maxAmt) * 100,
      onlineY: 100 - ((d.onlineAmount || 0) / maxAmt) * 100,
      offlineY: 100 - ((d.offlineAmount || 0) / maxAmt) * 100,
    }));

  const points = getPoints(rawData);
  const barWidth = rawData.length > 0 ? 100 / rawData.length : 4;

  const getSmoothPath = (pts, key) => {
    if (!pts || pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x},${pts[0][key]}`;
    let d = `M ${pts[0].x},${pts[0][key]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const cp1x = p1.x + (p2.x - p1.x) / 2;
      const cp2x = p1.x + (p2.x - p1.x) / 2;
      d += ` C ${cp1x},${p1[key]} ${cp2x},${p2[key]} ${p2.x},${p2[key]}`;
    }
    return d;
  };

  const getAreaPath = (pts, key) => {
    if (!pts || pts.length === 0) return "";
    const baseLine = getSmoothPath(pts, key);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${baseLine} L ${last.x},100 L ${first.x},100 Z`;
  };

  const activeData = rawData[activeIndex];

  return (
    <div
      className="w-full relative group/chart cursor-crosshair h-full flex flex-col pt-2"
      onMouseLeave={() => setHoverIndex(null)}
    >
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Online</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-stone-300 shadow-[0_0_8px_rgba(0,0,0,0.1)]" />
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Offline</span>
        </div>
      </div>

      <div className="h-32 sm:h-40 relative w-full mb-2">
        {/* Y-Axis Labels - Minimalist */}
        <div className="absolute left-0 w-full h-full pointer-events-none flex flex-col justify-between py-0">
          {[1, 0.5, 0].map((level) => (
            <div key={level} className="flex items-center gap-2">
               <div className="h-px bg-stone-100 flex-1 border-t border-stone-200/30" />
               <span className="text-[7.5px] font-medium text-stone-300 tabular-nums">
                  {formatMoney(maxAmt * level)}
               </span>
            </div>
          ))}
        </div>

        {activeIndex !== null && activeData && (
          <div
            className="absolute z-40 pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: `${points[activeIndex].x}%`,
              top: `${points[activeIndex].totalY}%`,
              transform: `translate(${points[activeIndex].x > 50 ? "-100%" : "0%"}, -100%)`,
            }}
          >
            <div className="bg-white/95 backdrop-blur-md border border-stone-100 shadow-xl rounded-2xl p-3 min-w-[140px] ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-stone-50">
                <p className="text-[9px] font-bold text-stone-900 uppercase tracking-wider">
                  {activeData.label || activeData.date}
                </p>
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter">Online</span>
                  </div>
                  <span className="text-[10px] font-black text-stone-900 tabular-nums">
                    {formatMoney(activeData.onlineAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                    <span className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter">Offline</span>
                  </div>
                  <span className="text-[10px] font-black text-stone-900 tabular-nums">
                    {formatMoney(activeData.offlineAmount || 0)}
                  </span>
                </div>
                <div className="pt-1.5 mt-1 border-t border-stone-50 flex items-center justify-between">
                   <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Total Yield</span>
                   <span className="text-[11px] font-black text-indigo-600 tabular-nums">
                    {formatMoney((activeData.onlineAmount || 0) + (activeData.offlineAmount || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible relative z-10"
        >
          <defs>
            <linearGradient id="areaGradientOnline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur stdDeviation="1.5" result="blur" />
               <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Offline Line (Subtle Background) */}
          <path
            d={getSmoothPath(points, "offlineY")}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
            className="opacity-50"
          />

          {/* Online Area */}
          <path
            d={getAreaPath(points, "onlineY")}
            fill="url(#areaGradientOnline)"
            className="transition-all duration-700 ease-in-out"
          />
          
          {/* Online Line */}
          <path
            d={getSmoothPath(points, "onlineY")}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="opacity-90 drop-shadow-[0_2px_4px_rgba(99,102,241,0.2)]"
          />

          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - barWidth / 2}
                y="0"
                width={barWidth}
                height="100"
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                className="cursor-pointer"
              />
              {activeIndex === i && (
                <line
                  x1={p.x}
                  y1="0"
                  x2={p.x}
                  y2="100"
                  stroke="#6366f1"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                  className="opacity-20"
                />
              )}
            </g>
          ))}

          {activeIndex !== null && points[activeIndex] && (
            <g className="transition-all duration-300">
              <circle
                cx={points[activeIndex].x}
                cy={points[activeIndex].onlineY}
                r="2"
                fill="#6366f1"
                className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              />
              <circle
                cx={points[activeIndex].x}
                cy={points[activeIndex].onlineY}
                r="0.8"
                fill="white"
              />
            </g>
          )}
        </svg>
      </div>

      <div className="relative h-3 w-full flex justify-between px-1">
        {(() => {
          const maxLabels = 6;
          const indices = [];
          if (rawData.length <= maxLabels) {
            for (let i = 0; i < rawData.length; i++) indices.push(i);
          } else {
            const step = Math.ceil(rawData.length / maxLabels);
            for (let i = 0; i < rawData.length; i += step) indices.push(i);
            if (indices[indices.length - 1] !== rawData.length - 1) indices.push(rawData.length - 1);
          }
          
          return indices.map((idx) => {
            const d = rawData[idx];
            const p = points[idx];
            if (!p) return null;
            return (
              <span
                key={idx}
                className={`text-[7px] font-medium transition-all duration-300 ${idx === activeIndex ? "text-stone-800" : "text-stone-300"} whitespace-nowrap uppercase tracking-tight`}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  transform: `translateX(-50%)`,
                }}
              >
                {d.label}
              </span>
            );
          });
        })()}
      </div>
    </div>
  );
});

export const AbandonedCartDetailModal = ({
  open,
  onOpenChange,
  cart,
  getMediaUrl,
  formatMoney,
}) => {
  if (!cart) return null;
  const items = Array.isArray(cart.items) ? cart.items : [];
  const lastActive = new Date(cart.updatedAt);
  const cartValue = items.reduce(
    (s, i) => s + (Number(i.price) || 0) * (i.qty || 1),
    0,
  );

  const timeSince = (() => {
    const diff = Date.now() - lastActive.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border border-stone-200 shadow-2xl rounded-2xl bg-white [&>button:last-child]:hidden">
        <header className="px-6 pt-8 pb-5 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 rounded-xl border border-stone-200 bg-stone-50">
                <AvatarFallback className="text-lg font-bold text-stone-600">
                  {(cart.customer?.name || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-stone-900 leading-tight">
                  {cart.customer?.name || "Unknown Customer"}
                </h2>
                <p className="text-sm text-stone-500">
                  {cart.customer?.mobile || "No phone"}
                  <span className="text-stone-300 mx-2">·</span>
                  <span className="text-amber-600 font-medium">Last active {timeSince}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-stone-900 tabular-nums">
                {formatMoney(cartValue)}
              </p>
              <p className="text-xs text-stone-400 font-medium">Cart Total</p>
            </div>
          </div>
        </header>

        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Items in Cart ({items.length})
          </h3>
          <ScrollArea className="max-h-[360px]">
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-white border border-stone-200">
                      <img
                        src={getMediaUrl(item.image)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                    {(item.qty || 1) > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                        {item.qty}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 text-sm truncate capitalize">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {formatMoney(Number(item.price))} × {item.qty || 1}
                    </p>
                  </div>

                  <p className="font-bold text-stone-900 text-sm tabular-nums shrink-0">
                    {formatMoney(Number(item.price) * (item.qty || 1))}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
          <p className="text-xs text-stone-400">
            Cart updated {lastActive.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" at "}
            {lastActive.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-4 h-9 text-xs font-semibold text-stone-500 hover:text-stone-900"
            >
              Close
            </Button>
            <a href={`tel:${cart.customer?.mobile}`}>
              <Button className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg px-5 h-9 text-xs font-semibold flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                Call Customer
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
