import { memo } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  MapPin,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const OfflineStoresSection = memo(({
  offlineStores,
  handleOpenAddStore,
  handleDeleteStore,
  handleToggleStore,
  isAddStoreOpen,
  setIsAddStoreOpen,
  editingStoreId,
  storeFormData,
  setStoreFormData,
  handleSaveStore,
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-4 italic">
              Boutique Network <span className="not-italic text-stone-300 font-normal">/</span> <span className="text-pink-600 not-italic">Physical Presence</span>
            </h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage your brick-and-mortar storefronts and pickup locations</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleOpenAddStore}
              className="bg-stone-900 hover:bg-black text-white rounded-full px-10 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-stone-100 transition-all flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Boutique
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {offlineStores.map((store, i) => (
            <div key={store.id} className={cn(
              "group relative rounded-[3.5rem] p-10 border border-stone-100 bg-white transition-all duration-700 hover:-translate-y-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)]",
              !store.active && "opacity-60 grayscale"
            )}>
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "px-5 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-sm border",
                  store.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-stone-100 text-stone-400 border-stone-200"
                )}>
                  {store.active ? "Active Location" : "Inactive / Coming Soon"}
                </div>
                {store.distance && (
                  <div className="px-4 py-1.5 rounded-full bg-pink-50 text-pink-600 font-black text-[8px] uppercase tracking-tighter">
                    {store.distance}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">{store.name}</h3>
                <p className="text-sm font-medium text-stone-400 leading-relaxed min-h-[4rem]">{store.address}</p>
              </div>

              <div className="mt-12 flex items-center justify-between pt-8 border-t border-stone-50">
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => {
                      setStoreFormData({ name: store.name, address: store.address, active: store.active, distance: store.distance || "" });
                      setIsAddStoreOpen(true);
                    }}
                    className="h-10 w-10 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-900 hover:text-white transition-all flex items-center justify-center"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button 
                    onClick={() => handleDeleteStore(store.id)}
                    className="h-10 w-10 rounded-xl bg-stone-50 text-stone-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Visibility</span>
                  <Switch 
                    checked={store.active} 
                    onCheckedChange={() => handleToggleStore(store.id)}
                    className="data-[state=checked]:bg-emerald-500" 
                  />
                </div>
              </div>
            </div>
          ))}

          <div 
            onClick={handleOpenAddStore}
            className="border-2 border-dashed border-stone-100 rounded-[3.5rem] flex flex-col items-center justify-center p-16 text-center group hover:border-pink-400 hover:bg-pink-50/20 transition-all duration-500 cursor-pointer aspect-square bg-stone-50/30"
          >
            <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center text-stone-300 group-hover:bg-pink-600 group-hover:text-white group-hover:shadow-[0_20px_50px_rgba(236,72,153,0.3)] group-hover:rotate-6 transition-all duration-500 mb-8 border border-stone-100">
              <Store className="h-10 w-10" />
            </div>
            <h3 className="font-black text-stone-900 text-lg uppercase tracking-tight">Expand Network</h3>
            <p className="text-stone-400 text-[10px] mt-2 font-bold uppercase tracking-[0.2em] max-w-[160px]">Add a new physical touchpoint</p>
          </div>
        </div>
      </div>

      <Dialog open={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white flex flex-col">
          <header className="p-10 bg-stone-900 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter italic">
                  {editingStoreId ? "Edit" : "New"} <span className="not-italic text-pink-500 font-normal">Location</span>
                </h2>
                <p className="text-stone-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Boutique Profile Configuration</p>
              </div>
            </div>
          </header>

          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Boutique Name</Label>
                <Input 
                  value={storeFormData.name}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Ontario Mills Boutique" 
                  className="h-14 bg-stone-50 border-stone-100 focus:border-pink-300 rounded-xl font-bold text-sm px-6 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Address</Label>
                <textarea 
                  value={storeFormData.address}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address, city, state, zip..." 
                  className="w-full min-h-[120px] bg-stone-50 border border-stone-100 focus:border-pink-300 rounded-xl font-bold text-sm p-6 transition-all outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Proximity Badge (Distance)</Label>
                  <Input 
                    value={storeFormData.distance}
                    onChange={(e) => setStoreFormData(prev => ({ ...prev, distance: e.target.value }))}
                    placeholder="e.g. 1.2 km away" 
                    className="h-14 bg-stone-50 border-stone-100 focus:border-pink-300 rounded-xl font-bold text-sm px-6 transition-all"
                  />
                </div>
                <div className="flex flex-col justify-end pb-3">
                  <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <Switch 
                      checked={storeFormData.active}
                      onCheckedChange={(checked) => setStoreFormData(prev => ({ ...prev, active: checked }))}
                    />
                    <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Mark as Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-5">
            <Button 
              variant="ghost" 
              onClick={() => setIsAddStoreOpen(false)}
              className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] text-stone-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveStore}
              className="bg-stone-900 hover:bg-pink-600 text-white rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[11px] shadow-xl transition-all"
            >
              {editingStoreId ? "Save Changes" : "Confirm Boutique"}
            </Button>
          </footer>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default OfflineStoresSection;
