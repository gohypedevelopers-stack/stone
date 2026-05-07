import { memo } from "react";
import {
  Eye,
  PlusCircle,
  Pencil,
  Trash2,
  ImageIcon,
  X,
  UploadCloud,
  Globe,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const BannerManagementSection = memo(({
  banners,
  handleOpenAddBanner,
  handleEditBanner,
  handleDeleteBanner,
  handleToggleBanner,
  isAddBannerOpen,
  setIsAddBannerOpen,
  editingBannerId,
  bannerFormData,
  setBannerFormData,
  handleFileUpload,
  handleRemoveAsset,
  handleSaveBanner,
  fileInputRef,
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-4 italic">
              Hero Carousel <span className="not-italic text-stone-300 font-normal">/</span> <span className="text-indigo-600 not-italic">Main Sequences</span>
            </h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage high-impact visual assets for your landing page</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-stone-200 text-stone-600 hover:text-stone-900 rounded-full px-8 h-12 font-black uppercase tracking-widest text-[10px] bg-white shadow-sm transition-all">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button 
              onClick={handleOpenAddBanner}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Slide
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {banners.map((banner, i) => (
            <div key={banner.id} className={cn(
              "group relative rounded-[3.5rem] overflow-hidden border border-stone-100 bg-white transition-all duration-700 hover:-translate-y-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)]",
              !banner.active && "opacity-80"
            )}>
              <div className="aspect-[16/10] overflow-hidden relative">
                <img src={banner.img} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={`Sequence ${i+1}`} />
                
                <div className="absolute top-8 left-8 z-10">
                  <div className="px-5 py-2 rounded-2xl bg-[#151515]/40 backdrop-blur-xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl">
                    #{i+1} Sequence
                  </div>
                </div>

                <div className="absolute inset-0 bg-[#151515]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-6">
                  <div className="flex items-center gap-4 translate-y-6 group-hover:translate-y-0 transition-all duration-700 delay-75">
                    <Button 
                      onClick={() => handleEditBanner(banner)}
                      className="h-14 w-14 rounded-2xl bg-white text-stone-900 hover:bg-indigo-600 hover:text-white shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
                    >
                      <Pencil size={20} />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="h-14 w-14 rounded-2xl bg-white text-rose-500 hover:bg-rose-500 hover:text-white shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-3 translate-y-10 group-hover:translate-y-0 transition-all duration-700 delay-150">
                    <Switch 
                      checked={banner.active} 
                      onCheckedChange={() => handleToggleBanner(banner.id)}
                      className="data-[state=checked]:bg-emerald-500 scale-110" 
                    />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                      {banner.active ? "Online & Live" : "Draft Hidden"}
                    </span>
                  </div>
                </div>

                {!banner.active && (
                  <div className="absolute top-8 right-8 z-10 group-hover:opacity-0 transition-opacity">
                    <div className="px-5 py-2 rounded-2xl bg-stone-900/80 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest border border-white/10">
                      Draft
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div 
            onClick={handleOpenAddBanner}
            className="border-2 border-dashed border-stone-200 rounded-[3.5rem] flex flex-col items-center justify-center p-16 text-center group hover:border-indigo-400 hover:bg-indigo-50/20 transition-all duration-500 cursor-pointer relative overflow-hidden aspect-[16/10] bg-stone-50/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center text-stone-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] group-hover:rotate-6 transition-all duration-500 mb-8 relative z-10 border border-stone-100">
              <PlusCircle className="h-12 w-12" />
            </div>
            <h3 className="font-black text-stone-900 text-xl uppercase tracking-tight relative z-10">New Sequence</h3>
            <p className="text-stone-400 text-[11px] mt-3 font-bold uppercase tracking-[0.2em] relative z-10 max-w-[200px] mx-auto leading-relaxed">Expand your store's visual horizon with new slides</p>
          </div>
        </div>
      </div>

      <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] p-0 overflow-hidden border-none shadow-[0_50px_120px_-30px_rgba(0,0,0,0.3)] rounded-[2.5rem] bg-white ring-1 ring-stone-100 flex flex-col">
          <header className="p-10 bg-[#151515] relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter italic">
                    {editingBannerId ? "Refine" : "Deploy"} <span className="not-italic text-indigo-400 font-normal">Asset</span>
                  </h2>
                  <p className="text-stone-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Sequence Management Module</p>
                </div>
              </div>
              <button onClick={() => setIsAddBannerOpen(false)} className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-500 transition-colors">
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="p-10 space-y-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Source Selection</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 border-2 border-dashed border-stone-100 rounded-xl flex items-center px-6 gap-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group/upload"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload} 
                  />
                  <div className="h-10 w-10 rounded-lg bg-stone-50 flex items-center justify-center group-hover/upload:bg-white transition-colors">
                    <UploadCloud className="h-5 w-5 text-stone-400 group-hover/upload:text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-stone-900 uppercase tracking-tight">Direct Upload</p>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Local Asset</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Remote Path / URL</Label>
                <div className="relative group">
                  <Input 
                    value={bannerFormData.img?.startsWith("data:") ? "LOCAL_ASSET_ENCODED" : bannerFormData.img}
                    onChange={(e) => setBannerFormData(prev => ({ ...prev, img: e.target.value }))}
                    placeholder="https://images.unsplash.com/..." 
                    className={cn(
                      "h-20 bg-stone-50/50 border-stone-100 focus:border-indigo-300 rounded-xl font-bold text-[11px] pr-12 transition-all",
                      bannerFormData.img?.startsWith("data:") && "text-indigo-600 bg-indigo-50/30 border-indigo-100"
                    )}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {bannerFormData.img?.startsWith("data:") && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveAsset(); }}
                        className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <Globe className="h-5 w-5 text-stone-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-50">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Real-time Visualization</Label>
                {bannerFormData.img && (
                  <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Active Link</span>
                )}
              </div>
              <div className="aspect-[21/9] rounded-[2rem] overflow-hidden bg-stone-50 border border-stone-100 relative group/preview shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                {bannerFormData.img ? (
                  <img src={bannerFormData.img} className="w-full h-full object-cover transition-transform duration-[3s] group-hover/preview:scale-105" alt="Preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-4">
                    <Monitor size={48} className="opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Waiting for Asset</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <footer className="p-8 bg-stone-50/80 backdrop-blur-md border-t border-stone-100 flex justify-end gap-5 shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => setIsAddBannerOpen(false)}
              className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] text-stone-400 hover:bg-white hover:text-stone-900 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveBanner}
              className="bg-[#151515] hover:bg-indigo-600 text-white rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              {editingBannerId ? "Save Changes" : "Deploy Sequence"}
            </Button>
          </footer>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default BannerManagementSection;
