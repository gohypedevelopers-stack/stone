import React from "react";
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Trash2,
  ExternalLink,
  ShoppingCart,
  Zap,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { LiveTimeAgo } from "../AdminUtils";

const NotificationsSection = ({ 
  notifications, 
  loading, 
  onMarkRead, 
  onRefresh 
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-stone-100">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-black text-stone-900 tracking-tight uppercase">
              Transmission Ledger
            </h1>
          </div>
          <p className="text-stone-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-indigo-500" />
            End-to-End Encrypted Administrative Event Log
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Unread Alerts</span>
              <span className="text-sm font-black text-stone-900">
                {notifications.filter(n => !n.isRead).length}
              </span>
            </div>
            <div className="w-px h-6 bg-stone-200" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Total Transmissions</span>
              <span className="text-sm font-black text-stone-900">{notifications.length}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl text-[11px] font-black uppercase tracking-[0.2em] border-stone-200 bg-white hover:bg-stone-50 shadow-sm hover:shadow-md transition-all h-12 px-6"
          >
            {loading ? <Spinner className="h-4 w-4 mr-3" /> : <RefreshCw className="h-4 w-4 mr-3" />}
            Resync Feed
          </Button>
        </div>
      </header>

      {notifications.length === 0 ? (
        <Card className="border-none shadow-2xl rounded-3xl bg-white/40 backdrop-blur-3xl overflow-hidden min-h-[500px] flex items-center justify-center">
          <CardContent className="text-center p-20 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent)]" />
            <div className="relative z-10">
              <div className="h-24 w-24 rounded-[32px] bg-stone-50 border border-stone-100 mx-auto mb-8 flex items-center justify-center shadow-inner group">
                <Bell className="h-10 w-10 text-stone-200 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-black text-stone-900 mb-3 tracking-tight uppercase">
                System Status: Nominal
              </h3>
              <p className="text-stone-400 font-bold text-sm tracking-wide max-w-sm mx-auto uppercase">
                Protocol window is currently clear. No active alerts detected in the administrative layer.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {notifications.map((n, idx) => (
            <Card 
              key={n.id} 
              style={{ animationDelay: `${idx * 50}ms` }}
              className={cn(
                "border-none shadow-sm rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 group overflow-hidden",
                n.isRead ? "bg-white/60 opacity-80" : "bg-white border-l-8 border-l-indigo-500 shadow-xl shadow-indigo-500/5"
              )}
            >
              <CardContent className="p-8 flex items-start gap-8 relative">
                {!n.isRead && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                )}
                
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 shadow-sm",
                  n.isRead 
                    ? "bg-stone-50 border-stone-100 text-stone-300" 
                    : "bg-indigo-50 border-indigo-100 text-indigo-600 scale-110 shadow-indigo-100 group-hover:rotate-6"
                )}>
                  {n.title?.toLowerCase().includes("order") ? (
                    <ShoppingCart className="h-8 w-8" />
                  ) : n.title?.toLowerCase().includes("stock") ? (
                    <AlertCircle className="h-8 w-8" />
                  ) : (
                    <Bell className="h-8 w-8" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-6 mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className={cn(
                        "text-xl font-black tracking-tight uppercase",
                        n.isRead ? "text-stone-500" : "text-stone-900"
                      )}>
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <Badge className="bg-indigo-500 text-white border-none text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1">
                          Priority Alert
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <LiveTimeAgo updatedAt={n.createdAt} />
                      </span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-lg font-medium leading-relaxed max-w-4xl",
                    n.isRead ? "text-stone-400" : "text-stone-600"
                  )}>
                    {n.message}
                  </p>
                  
                  {!n.isRead && (
                    <div className="mt-8 flex items-center gap-6">
                      <Button
                        size="sm"
                        onClick={() => onMarkRead(n.id)}
                        className="rounded-xl text-[11px] font-black uppercase tracking-[0.2em] bg-stone-900 text-white hover:bg-black px-6 py-5 h-auto transition-all"
                      >
                        Acknowledge Transmission
                      </Button>
                      <button className="text-[11px] font-black text-stone-400 hover:text-stone-600 uppercase tracking-widest transition-colors">
                        Flag for Review
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const RefreshCw = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default NotificationsSection;
