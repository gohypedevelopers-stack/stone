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
      emerald: {
        icon: "bg-emerald-50 text-emerald-600",
        trend: trendUp
          ? "text-emerald-700 bg-emerald-50"
          : "text-rose-700 bg-rose-50",
      },
      sky: {
        icon: "bg-blue-50 text-blue-600",
        trend: trendUp
          ? "text-emerald-700 bg-emerald-50"
          : "text-rose-700 bg-rose-50",
      },
      teal: {
        icon: "bg-teal-50 text-teal-600",
        trend: trendUp
          ? "text-emerald-700 bg-emerald-50"
          : "text-rose-700 bg-rose-50",
      },
      indigo: {
        icon: "bg-indigo-50 text-indigo-600",
        trend: trendUp
          ? "text-emerald-700 bg-emerald-50"
          : "text-rose-700 bg-rose-50",
      },
    };
    const c = colorMap[color] || colorMap.emerald;

    const ArrowUp = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-0.5"
      >
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    );
    const ArrowDown = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-0.5"
      >
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </svg>
    );

    return (
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[115px] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex justify-between items-start w-full">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}
          >
            <Icon className="h-4 w-4 stroke-[2.5px]" />
          </div>
          {trend && (
            <div
              className={`flex items-center text-[9px] font-black px-2 py-0.5 rounded-full ${c.trend}`}
            >
              {trendUp ? <ArrowUp /> : <ArrowDown />}
              {trend}
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-5">
          <div className="text-2xl font-black text-[#151515] tracking-tight leading-none">
            {value}
          </div>
          <div className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-1.5">
            {title}
          </div>
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
      <div className="h-48 sm:h-56 relative w-full mb-4 bg-stone-50/50 rounded-[12px] animate-pulse" />
    );

  const COLORS = {
    invested: "#43a047",
    online: "#0ea5e9",
    offline: "#6366f1",
  };
  const maxAmt = Math.max(
    ...rawData.map((d) => (d.onlineAmount || 0) + (d.offlineAmount || 0)),
    1,
  );

  const getPoints = (data) =>
    data.map((d, i) => ({
      x: data.length > 1 ? (i / (data.length - 1)) * 100 : 50,
      y:
        100 - (((d.onlineAmount || 0) + (d.offlineAmount || 0)) / maxAmt) * 100,
    }));

  const totalPoints = getPoints(rawData);
  const barWidth = rawData.length > 0 ? 50 / rawData.length : 4;

  const getSmoothPath = (points) => {
    if (!points || points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cp1x = p1.x + (p2.x - p1.x) / 3;
      const cp2x = p2.x - (p2.x - p1.x) / 3;
      d += ` C ${cp1x},${p1.y} ${cp2x},${p2.y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const getAreaPath = (points) => {
    if (!points || points.length === 0) return "";
    const baseLine = getSmoothPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${baseLine} L ${last.x},100 L ${first.x},100 Z`;
  };

  const activeData = rawData[activeIndex];

  return (
    <div
      className="w-full relative group/chart cursor-crosshair h-full flex flex-col pt-2"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <div className="h-48 sm:h-56 relative w-full mb-4">
        <div className="absolute -left-12 w-10 top-0 bottom-0 flex flex-col justify-between text-[11px] font-medium text-slate-400 pb-0">
          <span className="leading-none text-right">{formatMoney(maxAmt)}</span>
          <span className="leading-none text-right">0</span>
        </div>

        {activeIndex !== null && activeData && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-200"
            style={{
              left: `${totalPoints[activeIndex].x}%`,
              top: `${totalPoints[activeIndex].y}%`,
              transform: `translate(${totalPoints[activeIndex].x > 50 ? "-105%" : "5%"}, -110%)`,
            }}
          >
            <div className="bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl rounded-xl p-3 min-w-[140px]">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-2">
                {activeData.label || activeData.date}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS.online }}
                    />
                    <span className="text-[11px] font-bold text-stone-600">
                      Online
                     </span>
                  </div>
                  <span className="text-[11px] font-black text-stone-900">
                    {formatMoney(activeData.onlineAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS.offline }}
                    />
                    <span className="text-[11px] font-bold text-stone-600">
                      Offline
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-stone-900">
                    {formatMoney(activeData.offlineAmount || 0)}
                  </span>
                </div>
                <div className="pt-1.5 mt-1.5 border-t border-stone-100 flex items-center justify-between gap-4">
                  <span className="text-[11px] font-black text-stone-400 uppercase">
                    Total
                  </span>
                  <span className="text-[12px] font-black text-[#43a047]">
                    {formatMoney(
                      (activeData.onlineAmount || 0) +
                        (activeData.offlineAmount || 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradientTotal" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={COLORS.invested}
                stopOpacity="0.15"
              />
              <stop
                offset="100%"
                stopColor={COLORS.invested}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          <path
            d={getAreaPath(totalPoints)}
            fill="url(#areaGradientTotal)"
            className="transition-all duration-1000"
          />
          <path
            d={getSmoothPath(totalPoints)}
            fill="none"
            stroke={COLORS.invested}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {totalPoints.map((p, i) => (
            <rect
              key={i}
              x={p.x - barWidth / 2}
              y="0"
              width={barWidth}
              height="100"
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {activeIndex !== null && totalPoints[activeIndex] && (
            <g>
              <line
                x1={totalPoints[activeIndex].x}
                y1="0"
                x2={totalPoints[activeIndex].x}
                y2="100"
                stroke="#cbd5e1"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={totalPoints[activeIndex].x}
                cy={totalPoints[activeIndex].y}
                r="2.5"
                fill={COLORS.invested}
                stroke="white"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>
      </div>

      <div className="relative h-6 mt-4 w-full px-2">
        {(() => {
          const maxLabels = 7;
          const indices = [];
          if (rawData.length <= maxLabels) {
            for (let i = 0; i < rawData.length; i++) indices.push(i);
          } else {
            for (let i = 0; i < maxLabels; i++) {
              indices.push(
                Math.floor((i * (rawData.length - 1)) / (maxLabels - 1)),
              );
            }
          }
          return indices.map((idx) => {
            const d = rawData[idx];
            const p = totalPoints[idx];
            if (!p) return null;
            return (
              <span
                key={idx}
                className={`absolute text-[9px] font-black transition-colors ${idx === activeIndex ? "text-stone-900" : "text-stone-300"} whitespace-nowrap`}
                style={{
                  left: `${p.x}%`,
                  transform: `translateX(${p.x < 10 ? "0" : p.x > 90 ? "-100%" : "-50%"})`,
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
