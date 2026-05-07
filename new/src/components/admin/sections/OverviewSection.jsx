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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <AdminKPICard
            title="Total Revenue"
            value={formatMoney(analyticsData?.totalRevenue || 0)}
            icon={Activity}
            trend="+12.5%"
            trendUp
            color="indigo"
          />
          <AdminKPICard
            title="Total Orders"
            value={(stats?.totalOrders || 0).toLocaleString()}
            icon={ShoppingCart}
            trend="+5.2%"
            trendUp
            color="emerald"
          />
          <AdminKPICard
            title="Active Products"
            value={(stats?.totalProducts || 0).toLocaleString()}
            icon={Package}
            color="teal"
          />
          <AdminKPICard
            title="Total Customers"
            value={(stats?.totalUsers || 0).toLocaleString()}
            icon={Users}
            trend="+8.9%"
            trendUp
            color="teal"
          />
        </div>

        {/* Out of Stock Alert Strip */}
        {(() => {
          const outOfStockCount = products.filter(
            (p) => (p.stock || 0) <= 0,
          ).length;
          if (outOfStockCount === 0) return null;
          return (
            <div className="bg-rose-50 border border-rose-100/50 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in duration-500">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500 border border-rose-100">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-900 uppercase tracking-tighter">
                    Critical Inventory Alert
                  </h3>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">
                    {outOfStockCount} Product
                    {outOfStockCount !== 1 ? "s are" : " is"} currently out of
                    stock and requires immediate attention.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const globalVendor = vendors.find((v) =>
                      v.businessName.toLowerCase().includes("global"),
                    );
                    if (globalVendor) {
                      setPreSelectedTransferSource(globalVendor.id);
                      setPreSelectedTransferItems([]);
                      handleViewChange("create-transfer");
                    } else {
                      toast.error("Global Inventory source not found");
                    }
                  }}
                  className="bg-stone-900 border border-stone-800 hover:bg-stone-800 text-white rounded-full px-6 h-9 text-[10px] uppercase font-black tracking-widest shadow-lg shadow-stone-200"
                >
                  Transfer from Global
                </Button>
                <Button
                  onClick={() => handleViewChange("out-of-stock")}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6 h-9 text-[10px] uppercase font-black tracking-widest shadow-lg shadow-rose-200"
                >
                  View Details
                </Button>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-full">
            <div className="relative bg-white pl-10 pr-6 pt-8 pb-8 rounded-[12px] border border-stone-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-[20px] font-black text-stone-900 tracking-tight flex items-center gap-2">
                    Revenue Overview
                    <Sparkles className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                  </h2>
                  <p className="text-[12px] font-bold text-stone-400 uppercase tracking-widest">
                    Global platform performance
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedTimeRange}
                      onChange={(e) =>
                        handleVendorAnalyticsFilterChange(
                          "time",
                          e.target.value,
                        )
                      }
                      className="appearance-none bg-stone-50 border border-stone-200 rounded-xl px-4 py-1.5 pr-9 text-[11px] font-bold text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer shadow-sm transition-all hover:bg-white"
                    >
                      <option value="7d">7 Days</option>
                      <option value="1m">1 Month</option>
                      <option value="1y">1 Year</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
                  </div>
                  <div className="bg-emerald-50 px-3.5 py-1.5 rounded-full flex items-center justify-center border border-emerald-100/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-linear-to-br from-sky-50 to-white p-5 rounded-2xl border border-sky-100/50 shadow-xs relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 bg-sky-100/20 blur-2xl -mr-4 -mt-4 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1.5">
                      Online Sales
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-stone-900">
                        {formatMoney(analyticsData?.totalOnlineRevenue || 0)}
                      </span>
                      <span className="text-[10px] font-black text-emerald-600">
                        +12%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100/50 shadow-xs relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 bg-indigo-100/20 blur-2xl -mr-4 -mt-4 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                      Offline Sales
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-stone-900">
                        {formatMoney(analyticsData?.totalOfflineRevenue || 0)}
                      </span>
                      <span className="text-[10px] font-black text-emerald-600">
                        +5%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 mt-2 pl-2">
                <RevenueReport
                  analyticsData={analyticsData}
                  formatMoney={formatMoney}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex flex-col max-h-[580px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[18px] font-black text-stone-900 tracking-tight">
                  Recent Activity
                </h2>
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                  Live system events
                </p>
              </div>
              <button className="h-8 px-4 flex items-center justify-center rounded-full bg-stone-50 text-[10px] font-black text-stone-600 uppercase tracking-widest hover:bg-stone-100 transition-colors">
                View All
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto space-y-3 pr-1"
              data-lenis-prevent
            >
              {(stats?.recentActivity?.length > 0
                ? stats.recentActivity
                : [
                    {
                      title: "System Ready",
                      description: "Listening for new platform activity...",
                      time: new Date().toISOString(),
                      iconType: "activity",
                    },
                  ]
              ).map((act, idx) => {
                const iconMap = {
                  cart: {
                    icon: ShoppingCart,
                    color: "text-sky-500",
                    bg: "bg-sky-50",
                  },
                  alert: {
                    icon: AlertCircle,
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                  },
                  user: {
                    icon: UserPlus,
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                  },
                  activity: {
                    icon: Activity,
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                  },
                };
                const iconObj = iconMap[act.iconType] || iconMap.activity;
                const diff = Math.floor(
                  (new Date() - new Date(act.time)) / 60000,
                );
                const timeStr =
                  diff < 1
                    ? "Just now"
                    : diff < 60
                      ? `${diff} min ago`
                      : diff < 1440
                        ? `${Math.floor(diff / 60)} hr ago`
                        : `${Math.floor(diff / 1440)} d ago`;

                return (
                  <div
                    key={act.id || idx}
                    className="flex items-center gap-4 p-4 bg-stone-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-stone-100 transition-all duration-300 group"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        iconObj.bg,
                        iconObj.color,
                      )}
                    >
                      <iconObj.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#151515] truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {act.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide shrink-0">
                      {timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Top Selling Products */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden transition-all hover:shadow-lg group">
            <div className="p-7 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#4f46e5]">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-[#151515] tracking-tight">
                    Top Selling Products
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="bg-[#eeeaff] text-[#6366f1] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Trending Now
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleViewChange("inventory")}
                className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-colors"
              >
                View All
                <ArrowRightLeft className="h-3 w-3" />
              </button>
            </div>

            <div className="px-7">
              <div className="h-px bg-slate-50 w-full" />
            </div>

            <div className="p-7 pt-6 space-y-4">
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
                    className="flex items-center justify-between group/item p-1-mx-1 rounded-2xl transition-all hover:bg-slate-50/20"
                  >
                    <div className="flex items-center gap-5">
                      <span
                        className={cn(
                          "text-[13px] font-black w-7 text-center transition-colors",
                          i === 0
                            ? "text-amber-500"
                            : i === 1
                              ? "text-slate-400"
                              : "text-slate-200",
                        )}
                      >
                        #0{i + 1}
                      </span>
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-slate-50 flex items-center justify-center overflow-hidden p-1.5 transition-transform group-hover/item:scale-105">
                          {p.images?.[0] || p.imageUrls?.[0] ? (
                            <img
                              src={getMediaUrl(
                                p.images?.[0] || p.imageUrls?.[0],
                              )}
                              className="w-full h-full rounded-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center">
                              <Package className="h-5 w-5 text-indigo-300" />
                            </div>
                          )}
                        </div>
                        {i === 0 && (
                          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-400 rounded-full border-[2.5px] border-white flex items-center justify-center shadow-sm">
                            <Star className="h-2.5 w-2.5 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[14px] font-[800] text-slate-800 tracking-tight group-hover/item:text-[#4f46e5] transition-colors leading-tight truncate max-w-[180px]">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic opacity-80">
                          <span>{p._totalSold} units sold</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#e8f5e9]/80 px-4 py-1.5 rounded-full flex items-center shadow-[0_2px_8px_rgba(46,125,50,0.04)] border border-emerald-100/30 transition-transform group-hover/item:translate-x-1 shrink-0">
                      <span className="font-black text-[12px] text-[#2e7d32] tracking-tight">
                        {formatMoney(p.price || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              {(!deferredFilteredProducts ||
                deferredFilteredProducts.length === 0) && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                    <ShoppingBag className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    No sales detected yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden transition-all hover:shadow-lg group">
            <div className="p-7 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#fff1f2] flex items-center justify-center text-[#e11d48]">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-black text-[#151515] tracking-tight">
                    Critical Inventory
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {groupedProducts.filter(
                      (p) => (p.stock || 0) <= 5 && p.status === "ACTIVE",
                    ).length > 0 && (
                      <span className="bg-[#ffe4e6] text-[#e11d48] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        {
                          groupedProducts.filter(
                            (p) => (p.stock || 0) <= 5 && p.status === "ACTIVE",
                          ).length
                        }{" "}
                        Alerts
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleViewChange("out-of-stock")}
                className="flex items-center gap-1.5 text-[11px] font-black text-[#e11d48] hover:text-rose-700 uppercase tracking-widest transition-colors"
              >
                Resolve
                <ArrowRightLeft className="h-3 w-3" />
              </button>
            </div>

            <div className="px-7">
              <div className="h-px bg-slate-50 w-full" />
            </div>

            <div
              className="p-7 pt-6 space-y-4 max-h-[420px] overflow-y-auto"
              data-lenis-prevent
            >
              {groupedProducts
                .filter((p) => (p.stock || 0) <= 5 && p.status === "ACTIVE")
                .slice(0, 5)
                .map((p) => (
                  <div
                    key={p.id || p._id}
                    className="flex items-center justify-between group/item p-1 -mx-1 rounded-2xl transition-all hover:bg-rose-50/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100/50">
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-[#151515] tracking-tight truncate max-w-[140px] md:max-w-none">
                          {p.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {p.categoryName || p.category?.name || "General"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "px-3 py-1.5 rounded-full flex items-center shadow-sm",
                          (p.stock || 0) === 0
                            ? "bg-rose-50 border border-rose-100"
                            : "bg-amber-50 border border-amber-100",
                        )}
                      >
                        <span
                          className={cn(
                            "font-black text-[10px] uppercase tracking-widest",
                            (p.stock || 0) === 0
                              ? "text-rose-600"
                              : "text-amber-600",
                          )}
                        >
                          {(p.stock || 0) === 0 ? "OUT" : `${p.stock} units`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewChange("inventory")}
                        className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-[#4f46e5] transition-all hover:scale-110 active:scale-90 shadow-md"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              {groupedProducts.filter(
                (p) => (p.stock || 0) <= 5 && p.status === "ACTIVE",
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Inventory Healthy
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    No critical stock alerts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Approval Banner */}
        {stats?.pendingVendorApprovals > 0 && (
          <div className="bg-[#151515] text-white border border-emerald-500/20 p-6 rounded-[5px] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-sky-500" />
            <div className="flex items-center gap-4 pl-4">
              <div className="h-12 w-12 rounded-[5px] bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                  Pending Approvals
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  <strong className="text-white">
                    {stats.pendingVendorApprovals}
                  </strong>{" "}
                  vendor profiles awaiting authorization.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleViewChange("vendors")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 h-11 rounded-[5px] shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0 text-sm"
            >
              Authorize Now
            </Button>
          </div>
        )}
      </div>
    );
  },
);

export default OverviewSection;
