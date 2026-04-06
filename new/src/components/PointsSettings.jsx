import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Coins, Plus, Minus, Save, Sparkles, TrendingUp,
  Gift, Zap, Crown, ArrowRight, RotateCcw, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { THEME } from "../theme";
import { API_URL } from "@/utils/api";

export const PointsSettings = () => {
  const [pointsPerAmount, setPointsPerAmount] = useState(2);
  const [amountThreshold, setAmountThreshold] = useState(100);
  const [originalPoints, setOriginalPoints] = useState(2);
  const [originalThreshold, setOriginalThreshold] = useState(100);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasChanges = pointsPerAmount !== originalPoints || amountThreshold !== originalThreshold;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/settings/points`);
      const data = await resp.json();
      if (data.success) {
        setPointsPerAmount(data.data.pointsPerAmount);
        setAmountThreshold(data.data.amountThreshold);
        setOriginalPoints(data.data.pointsPerAmount);
        setOriginalThreshold(data.data.amountThreshold);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load points settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await fetch(`${API_URL}/admin/settings/points`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsPerAmount, amountThreshold }),
      });
      const data = await resp.json();
      if (data.success) {
        setOriginalPoints(pointsPerAmount);
        setOriginalThreshold(amountThreshold);
        toast.success("Points settings saved successfully!");
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving points settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPointsPerAmount(originalPoints);
    setAmountThreshold(originalThreshold);
  };

  const previewAmounts = [100, 250, 500, 1000, 2500, 5000];
  const calcPoints = (amt) => amountThreshold > 0 ? Math.floor(amt / amountThreshold) * pointsPerAmount : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-indigo-950" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 max-w-[1100px]">
      {/* Header Row */}
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>
              Reward Points
            </h1>
          </div>
          <p className="text-stone-400 text-sm font-medium ml-[52px]">
            Configure how customers earn loyalty points on purchases.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="rounded-xl h-11 px-5 text-stone-500 hover:text-stone-800 font-semibold text-xs gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-indigo-950 text-white rounded-xl h-11 px-8 font-bold text-xs flex items-center gap-2.5 shadow-xl shadow-indigo-950/20 hover:bg-[#1a0b2e] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      {/* Live Rate Banner */}
      <div className="relative rounded-[1.5rem] overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-violet-900 to-indigo-950 bg-[length:200%_100%]" 
          style={{ animation: "shimmer 8s ease-in-out infinite" }} 
        />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.08] backdrop-blur-xl flex items-center justify-center border border-white/[0.08] shadow-2xl">
              <Coins className="h-8 w-8 text-amber-300" />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-1.5">Active Reward Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-4xl font-black tracking-tight">{pointsPerAmount}</span>
                <span className="text-white/50 text-sm font-bold">
                  {pointsPerAmount === 1 ? "point" : "points"} per
                </span>
                <span className="text-amber-300 text-4xl font-black tracking-tight">₹{amountThreshold}</span>
                <span className="text-white/50 text-sm font-bold">spent</span>
              </div>
            </div>
          </div>

          {/* Mini stat */}
          <div className="hidden md:flex items-center gap-8">
            <div className="text-center">
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1">₹1,000 Purchase</p>
              <p className="text-white text-2xl font-black">{calcPoints(1000)} <span className="text-xs text-amber-300/80 font-bold">pts</span></p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1">₹5,000 Purchase</p>
              <p className="text-white text-2xl font-black">{calcPoints(5000)} <span className="text-xs text-amber-300/80 font-bold">pts</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Config Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Per Amount */}
        <Card className="border border-stone-200/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group bg-white">
          <CardContent className="p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-shadow">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-indigo-950 tracking-tight">Points to Award</h3>
                <p className="text-[11px] text-stone-400 font-medium">How many points per threshold</p>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setPointsPerAmount(Math.max(0, pointsPerAmount - 1))}
                disabled={pointsPerAmount <= 0}
                className="h-14 w-14 rounded-xl border-2 border-stone-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-90"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="flex-1 relative">
                <Input
                  type="number"
                  min="0"
                  value={pointsPerAmount}
                  onChange={(e) => setPointsPerAmount(Math.max(0, Number(e.target.value)))}
                  className="text-center text-4xl font-black h-14 rounded-xl border-2 border-stone-200 focus-visible:ring-0 focus-visible:border-indigo-400 bg-stone-50/50 shadow-none transition-colors"
                />
              </div>

              <button
                onClick={() => setPointsPerAmount(pointsPerAmount + 1)}
                className="h-14 w-14 rounded-xl border-2 border-stone-200 flex items-center justify-center hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Quick presets */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => setPointsPerAmount(val)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    pointsPerAmount === val
                      ? "bg-indigo-950 text-white shadow-lg shadow-indigo-950/25 scale-[1.02]"
                      : "bg-stone-100/80 text-stone-500 hover:bg-stone-200/80 hover:text-stone-700"
                  }`}
                >
                  {val} pt{val !== 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amount Threshold */}
        <Card className="border border-stone-200/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group bg-white">
          <CardContent className="p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-indigo-950 tracking-tight">Spend Threshold</h3>
                <p className="text-[11px] text-stone-400 font-medium">Amount (₹) required to earn points</p>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setAmountThreshold(Math.max(1, amountThreshold - 50))}
                disabled={amountThreshold <= 1}
                className="h-14 w-14 rounded-xl border-2 border-stone-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-90"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="flex-1 relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-stone-300 pointer-events-none">₹</span>
                <Input
                  type="number"
                  min="1"
                  value={amountThreshold}
                  onChange={(e) => setAmountThreshold(Math.max(1, Number(e.target.value)))}
                  className="text-center text-4xl font-black h-14 rounded-xl border-2 border-stone-200 focus-visible:ring-0 focus-visible:border-indigo-400 bg-stone-50/50 pl-10 shadow-none transition-colors"
                />
              </div>

              <button
                onClick={() => setAmountThreshold(amountThreshold + 50)}
                className="h-14 w-14 rounded-xl border-2 border-stone-200 flex items-center justify-center hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Quick presets */}
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmountThreshold(val)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    amountThreshold === val
                      ? "bg-indigo-950 text-white shadow-lg shadow-indigo-950/25 scale-[1.02]"
                      : "bg-stone-100/80 text-stone-500 hover:bg-stone-200/80 hover:text-stone-700"
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="bg-stone-50/80 border border-stone-200/60 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Info className="h-4 w-4 text-indigo-600" />
          <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">How It Works</h4>
        </div>
        <div className="flex items-center gap-0">
          {[
            { icon: "🛒", label: "Customer makes a purchase", color: "bg-blue-50 border-blue-100" },
            { icon: "⚡", label: `Every ₹${amountThreshold} spent`, color: "bg-amber-50 border-amber-100" },
            { icon: "🎁", label: `Earns ${pointsPerAmount} reward point${pointsPerAmount !== 1 ? "s" : ""}`, color: "bg-emerald-50 border-emerald-100" },
            { icon: "💰", label: "Points redeemable at checkout", color: "bg-purple-50 border-purple-100" },
          ].map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-2.5 ${step.color} border rounded-xl px-4 py-3 flex-1`}>
                <span className="text-lg">{step.icon}</span>
                <span className="text-[11px] font-semibold text-stone-600 leading-tight">{step.label}</span>
              </div>
              {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-stone-300 mx-2 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Preview */}
      <Card className="border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm bg-white">
        <CardHeader className="px-7 py-5 border-b border-stone-100 bg-stone-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-indigo-950">Earnings Simulator</CardTitle>
                <CardDescription className="text-[11px] text-stone-400 mt-0.5">Preview points at different purchase amounts</CardDescription>
              </div>
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold text-[10px] rounded-lg px-3 py-1 border">
              Live Preview
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-stone-100">
            {previewAmounts.map((amount) => {
              const earned = calcPoints(amount);
              return (
                <div
                  key={amount}
                  className="p-5 flex flex-col items-center gap-1 hover:bg-indigo-50/30 transition-colors group/cell cursor-default"
                >
                  <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider group-hover/cell:text-stone-600 transition-colors">
                    Purchase
                  </span>
                  <span className="text-indigo-950 text-lg font-black group-hover/cell:scale-105 transition-transform">
                    ₹{amount.toLocaleString()}
                  </span>
                  <div className="w-6 h-px bg-stone-200 my-1 group-hover/cell:bg-indigo-300 group-hover/cell:w-8 transition-all" />
                  <div className={`flex items-center gap-1.5 mt-0.5 ${earned > 0 ? "text-amber-600" : "text-stone-300"}`}>
                    <Coins className="h-3.5 w-3.5" />
                    <span className="text-xl font-black">{earned}</span>
                  </div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                    {earned === 1 ? "point" : "points"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};
