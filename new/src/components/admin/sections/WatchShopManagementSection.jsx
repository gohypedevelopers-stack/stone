import { memo } from "react";
import {
  Video,
  PlusCircle,
  Eye,
  Trash2,
  X,
  UploadCloud,
  Search,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const WatchShopManagementSection = memo(({
  watchShopItems,
  handleOpenAddWatch,
  handleDeleteWatch,
  handleToggleWatch,
  isAddWatchOpen,
  setIsAddWatchOpen,
  editingWatchId,
  watchFormData,
  setWatchFormData,
  watchVideoFile,
  setWatchVideoFile,
  productSearchQuery,
  setProductSearchQuery,
  filteredProductOptions,
  handleSaveWatch,
  watchVideoInputRef,
  loading,
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      {/* Visual Header */}
      <div className="relative p-12 rounded-[3.5rem] bg-[#151515] overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
              <Video className="h-4 w-4" /> Immersive Commerce
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight italic">
              Watch <span className="not-italic text-indigo-400">&</span> Shop
            </h2>
            <p className="text-stone-400 font-medium leading-relaxed">
              Curate an engaging video feed that connects customers directly with products through high-impact, short-form storytelling.
            </p>
          </div>
          <Button 
            onClick={handleOpenAddWatch}
            className="h-20 px-12 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
          >
            <PlusCircle className="h-6 w-6" /> Add New Story
          </Button>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
        {watchShopItems.map((item) => (
          <div key={item.id} className="group relative rounded-[2.5rem] overflow-hidden bg-white border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
            <div className="aspect-[9/16] relative overflow-hidden bg-stone-900">
              <video 
                src={item.video} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" 
                muted 
                loop 
                onMouseOver={(e) => e.target.play()} 
                onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
              />
              
              {/* Context Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Tagged Product</p>
                    <h3 className="text-white font-black text-sm tracking-tight truncate">{item.productName}</h3>
                 </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-6 left-6">
                 <div className={cn(
                   "px-4 py-1.5 rounded-full border backdrop-blur-md text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
                   item.active ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-rose-500/20 border-rose-500/30 text-rose-400"
                 )}>
                   <div className={cn("h-1.5 w-1.5 rounded-full", item.active ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
                   {item.active ? "Live" : "Paused"}
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                 <Button 
                   onClick={() => handleDeleteWatch(item.id)}
                   className="h-10 w-10 rounded-xl bg-white/10 hover:bg-rose-600 backdrop-blur-md border border-white/20 text-white transition-all p-0"
                 >
                    <Trash2 size={16} />
                 </Button>
                 <button 
                   onClick={() => handleToggleWatch(item.id)}
                   className="h-10 w-10 rounded-xl bg-white/10 hover:bg-emerald-600 backdrop-blur-md border border-white/20 text-white transition-all flex items-center justify-center"
                 >
                    <Eye size={16} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Story Dialog */}
      <Dialog open={isAddWatchOpen} onOpenChange={setIsAddWatchOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-[0_50px_100px_rgba(0,0,0,0.2)] rounded-[3rem] bg-white ring-1 ring-stone-100 flex flex-col max-h-[90vh]">
          <header className="p-10 bg-[#151515] shrink-0">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
                      <Video size={28} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-white tracking-tight italic">Story <span className="not-italic text-stone-500 font-normal">Architect</span></h2>
                      <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.4em] mt-1">Immersive Experience Module</p>
                   </div>
                </div>
                <button onClick={() => setIsAddWatchOpen(false)} className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-500 transition-all">
                   <X size={20} />
                </button>
             </div>
          </header>

          <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
             <div className="grid grid-cols-2 gap-10">
                {/* Product Tagging */}
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Connect Product</Label>
                      <div className="relative group">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 group-focus-within:text-indigo-500 transition-colors" />
                         <Input 
                           placeholder="Search inventory..."
                           value={productSearchQuery}
                           onChange={(e) => setProductSearchQuery(e.target.value)}
                           className="h-14 bg-stone-50 border-stone-100 focus:border-indigo-300 rounded-xl pl-12 font-bold text-xs transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredProductOptions.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setWatchFormData(prev => ({ ...prev, productName: p.name, productId: p.id }))}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all",
                            watchFormData.productId === p.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-transparent hover:bg-stone-50"
                          )}
                        >
                           <div className="h-10 w-10 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                              {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-stone-900 truncate tracking-tight">{p.name}</p>
                              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{p.categoryName || "General"}</p>
                           </div>
                           {watchFormData.productId === p.id && <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200" />}
                        </div>
                      ))}
                   </div>
                </div>

                {/* Video Asset Upload */}
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Story Asset</Label>
                      <div 
                        onClick={() => watchVideoInputRef.current?.click()}
                        className="aspect-[9/12] border-2 border-dashed border-stone-100 rounded-[2.5rem] flex flex-col items-center justify-center bg-stone-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer group/upload relative overflow-hidden"
                      >
                         <input 
                           type="file" 
                           ref={watchVideoInputRef} 
                           className="hidden" 
                           accept="video/*"
                           onChange={(e) => setWatchVideoFile(e.target.files[0])} 
                         />
                         
                         {watchVideoFile ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
                              <div className="h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                 <PlusCircle size={32} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-stone-900 uppercase truncate max-w-full px-4">{watchVideoFile.name}</p>
                                 <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Ready for Sync</p>
                              </div>
                           </div>
                         ) : (
                           <>
                              <div className="h-16 w-16 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-300 group-hover/upload:text-indigo-500 group-hover/upload:rotate-12 transition-all duration-500 shadow-sm">
                                 <UploadCloud size={32} />
                              </div>
                              <div className="mt-6 text-center">
                                 <p className="text-[11px] font-black text-stone-900 uppercase">Drop Story MP4</p>
                                 <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">Max Resolution: 1080p</p>
                              </div>
                           </>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <footer className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-5 shrink-0">
             <Button variant="ghost" onClick={() => setIsAddWatchOpen(false)} className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] text-stone-400 hover:bg-white hover:text-stone-900 transition-all">Cancel</Button>
             <Button 
               disabled={loading || (!watchVideoFile && !watchFormData.video) || !watchFormData.productId}
               onClick={handleSaveWatch}
               className="bg-[#151515] hover:bg-indigo-600 text-white rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
             >
                {loading ? "Processing..." : editingWatchId ? "Update Story" : "Initialize Story"}
             </Button>
          </footer>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default WatchShopManagementSection;
