import { memo } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  AlertCircle,
  UserPlus,
  Activity,
  Trophy,
  ArrowRightLeft,
  ShoppingBag,
  Star,
  RotateCcw,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Globe,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminKPICard, RevenueReport } from "../AdminUtils";

const OverviewSection = memo(
  ({
    stats,
    products,
    vendors,
    analyticsData,
    selectedTimeRange,
    handleVendorAnalyticsFilterChange,
    formatMoney,
    handleViewChange,
    setPreSelectedTransferSource,
    setPreSelectedTransferItems,
    deferredFilteredProducts,
    groupedProducts,
    getMediaUrl,
    toast,
  }) => {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard
            title="Total Revenue"
            value={formatMoney(analyticsData?.grossRevenue || 0)}
            icon={IndianRupee}
            trend="+12%"
            trendUp
            color="indigo"
          />
          <AdminKPICard
            title="Sales Units"
            value={(analyticsData?.totalSaleUnits || 0).toLocaleString()}
            icon={ShoppingCart}
            trend="+8%"
            trendUp
            color="emerald"
          />
          <AdminKPICard
            title="Products"
            value={(stats?.totalProducts || 0).toLocaleString()}
            icon={Package}
            trend="Stable"
            trendUp
            color="teal"
          />
          <AdminKPICard
            title="Customers"
            value={(stats?.totalUsers || 0).toLocaleString()}
            icon={Users}
            trend="+5%"
            trendUp
            color="sky"
          />
        </div>

        {/* Out of Stock Alert Strip */}
        {(() => {
          const outOfStockCount = products.filter(
            (p) => (p.stock || 0) <= 0,
          ).length;
          if (outOfStockCount === 0) return null;
          return (
            <div className="bg-rose-50 border border-rose-100/50 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-stone-900">
                    Inventory Alert
                  </h3>
                  <p className="text-[11px] font-medium text-stone-500">
                    {outOfStockCount} products are out of stock. Immediate action required.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewChange("out-of-stock")}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 h-9 text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  View Items
                </Button>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white border border-stone-100 shadow-sm rounded-2xl overflow-hidden p-5 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                   <h2 className="text-[18px] font-bold text-stone-900 tracking-tight">
                     Revenue Overview
                   </h2>
                  <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mt-1">
                    Monthly performance metrics
                  </p>
                </div>
                <select
                  value={selectedTimeRange}
                  onChange={(e) =>
                    handleVendorAnalyticsFilterChange(
                      "time",
                      e.target.value,
                    )
                  }
                  className="appearance-none bg-stone-50 border border-stone-100 rounded-lg px-4 py-2 text-[10px] font-bold text-stone-600 uppercase tracking-wider focus:outline-none cursor-pointer hover:bg-white transition-colors"
                >
                  <option value="7d">7 Days</option>
                  <option value="1m">30 Days</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50/50 p-3 rounded-xl border border-stone-100 relative overflow-hidden group/box">
                  <div className="flex items-center gap-3 mb-1">
                     <div className="h-6 w-6 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                        <Globe className="h-3 w-3" />
                     </div>
                     <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                       Digital
                     </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-stone-900 tabular-nums">
                      {formatMoney(analyticsData?.totalOnlineRevenue || 0)}
                    </span>
                    <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-bold border-none px-1.5 py-0.5 rounded-md">
                      +14%
                    </Badge>
                  </div>
                </div>
                <div className="bg-stone-50/50 p-3 rounded-xl border border-stone-100 relative overflow-hidden group/box">
                  <div className="flex items-center gap-3 mb-1">
                     <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Store className="h-3 w-3" />
                     </div>
                     <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                       POS Retail
                     </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-stone-900 tabular-nums">
                      {formatMoney(analyticsData?.totalOfflineRevenue || 0)}
                    </span>
                    <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-bold border-none px-1.5 py-0.5 rounded-md">
                      +8%
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-[180px]">
                <RevenueReport
                  analyticsData={analyticsData}
                  formatMoney={formatMoney}
                />
              </div>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card className="bg-white border border-stone-100 shadow-sm rounded-2xl overflow-hidden p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-stone-900">
                  Recent Ledger
                </h2>
                <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mt-0.5">
                  Latest transactions
                </p>
              </div>
              <Button 
                variant="ghost"
                className="h-8 px-4 rounded-lg bg-stone-50 text-[9px] font-bold text-stone-500 uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all"
              >
                View All
              </Button>
            </div>
            <div
              className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2 max-h-[350px] scrollbar-hide"
              data-lenis-prevent
            >
              {(stats?.recentActivity?.length > 0
                ? stats.recentActivity
                : [
                    {
                      title: "System Online",
                      description: "Awaiting data...",
                      time: new Date().toISOString(),
                      iconType: "activity",
                    },
                  ]
              ).map((act, idx) => {
                const iconMap = {
                  cart: {
                    icon: ShoppingCart,
                    color: "text-sky-500 bg-sky-50",
                  },
                  alert: {
                    icon: AlertCircle,
                    color: "text-amber-500 bg-amber-50",
                  },
                  user: {
                    icon: UserPlus,
                    color: "text-emerald-500 bg-emerald-50",
                  },
                  activity: {
                    icon: Activity,
                    color: "text-indigo-500 bg-indigo-50",
                  },
                };
                const iconObj = iconMap[act.iconType] || iconMap.activity;
                const diff = Math.floor(
                  (new Date() - new Date(act.time)) / 60000,
                );
                const timeStr =
                  diff < 1
                    ? "Now"
                    : diff < 60
                      ? `${diff}m`
                      : diff < 1440
                        ? `${Math.floor(diff / 60)}h`
                        : `${Math.floor(diff / 1440)}d`;

                return (
                  <div
                    key={act.id || idx}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors cursor-default group"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        iconObj.color,
                      )}
                    >
                      <iconObj.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-stone-900 truncate">
                        {act.title}
                      </p>
                      <p className="text-[9px] font-medium text-stone-400 truncate">
                        {act.description}
                      </p>
                    </div>
                    <span className="text-[8px] font-bold text-stone-300 tabular-nums">
                      {timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <Card className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-stone-900">
                    Best Sellers
                  </h2>
                  <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mt-0.5">
                    Top performance
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleViewChange("inventory")}
                className="h-8 px-4 rounded-lg bg-stone-50 text-[9px] font-bold text-stone-500 uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all flex items-center gap-1.5"
              >
                All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="p-6 pt-2 space-y-4">
              {(deferredFilteredProducts || [])
                .map((p) => {
                  const perf = analyticsData?.productPerformance?.find(
                    (pf) => pf.label === p.name,
                  );
                  return { ...p, _totalSold: perf ? perf.qty : 0 };
                })
                .sort((a, b) => b._totalSold - a._totalSold)
                .slice(0, 5)
                .map((p, i) => (
                  <div
                    key={p.id || p._id}
                    className="flex items-center justify-between group p-2 -mx-2 rounded-xl transition-all hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={getMediaUrl(p.imageUrls?.[0] || p.images?.[0])}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={p.name}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=P"; }}
                          />
                        </div>
                        <div className={cn(
                          "absolute -top-1.5 -left-1.5 w-5 h-5 rounded-md border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-sm",
                          i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-stone-400 text-white" : "bg-stone-100 text-stone-400"
                        )}>
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-stone-900 truncate leading-tight">
                          {p.name}
                        </p>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mt-1">{p._totalSold} units sold</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[12px] text-stone-900">
                        {formatMoney(p.price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Critical Inventory */}
          <Card className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-stone-900">
                    Stock Alerts
                  </h2>
                  <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest mt-0.5">
                    Items running low
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleViewChange("out-of-stock")}
                className="h-8 px-4 rounded-lg bg-rose-50 text-[9px] font-bold text-rose-500 uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5"
              >
                View
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>

            <div className="p-6 pt-2 space-y-4">
              {groupedProducts
                .filter((p) => (p.stock || 0) <= 5 && p.status === "ACTIVE")
                .slice(0, 5)
                .map((p) => (
                  <div
                    key={p.id || p._id}
                    className="flex items-center justify-between group p-2 -mx-2 rounded-xl hover:bg-rose-50/50"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-stone-100 flex items-center justify-center overflow-hidden">
                         <img 
                            src={getMediaUrl(p.imageUrls?.[0] || p.images?.[0])} 
                            className="h-full w-full object-cover" 
                            alt={p.name}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=P"; }}
                         />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-stone-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                          {p.categoryName || "SKU"}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-[9px] font-bold uppercase",
                      (p.stock || 0) === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {(p.stock || 0) === 0 ? "Empty" : `${p.stock} left`}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Vendor Approval Banner */}
        {stats?.pendingVendorApprovals > 0 && (
          <div className="bg-stone-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold tracking-tight">
                  Vendor Approvals Pending
                </h3>
                <p className="text-stone-400 text-[11px] font-medium">
                  {stats.pendingVendorApprovals} applications are waiting for your review.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleViewChange("vendors")}
              className="bg-white hover:bg-stone-100 text-stone-900 font-bold px-6 h-10 rounded-xl transition-all text-[11px] uppercase tracking-wider"
            >
              Review Now
            </Button>
          </div>
        )}
      </div>
    );
  },
);

export default OverviewSection;
