import { memo } from "react";
import {
  Tag,
  PlusCircle,
  Clock,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  Type,
  Link as LinkIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const OffersSection = memo(({
  offers,
  handleOpenAddOffer,
  handleDeleteOffer,
  handleToggleOffer,
  isAddOfferOpen,
  setIsAddOfferOpen,
  editingOfferId,
  offerFormData,
  setOfferFormData,
  offerMainImageFile,
  setOfferMainImageFile,
  offerFreeImageFile,
  setOfferFreeImageFile,
  offerMainImageRef,
  offerFreeImageRef,
  productSearchQuery,
  setProductSearchQuery,
  filteredProductOptions,
  handleSaveOffer,
  loading,
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-4 italic">
              Promotion Engine <span className="not-italic text-stone-300 font-normal">/</span> <span className="text-orange-600 not-italic">Active Offers</span>
            </h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Configure high-conversion BOGO and discount campaigns</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleOpenAddOffer}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-10 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-100 transition-all flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Create Offer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div key={offer.id} className={cn(
              "group relative rounded-[2.5rem] bg-white border border-stone-100 p-8 transition-all duration-500 hover:shadow-2xl hover:border-orange-100",
              !offer.isActive && "opacity-60"
            )}>
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Tag size={20} />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-orange-50/50 border-orange-100 text-orange-600 font-black text-[8px] uppercase tracking-widest">
                      {offer.type?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" variant="ghost" 
                    onClick={() => {
                      // handleEditOffer logic
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-stone-50"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button 
                    size="icon" variant="ghost" 
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-500"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-stone-900 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">{offer.title}</h3>
                <p className="text-xs font-medium text-stone-400 line-clamp-2">{offer.description}</p>
                
                <div className="flex items-center gap-4 py-4">
                  <div className="flex -space-x-3">
                    <div className="h-12 w-12 rounded-xl border-2 border-white overflow-hidden bg-stone-100">
                      <img src={offer.mainProductImage} className="w-full h-full object-cover" />
                    </div>
                    {offer.type === "bogo" && (
                      <div className="h-12 w-12 rounded-xl border-2 border-white overflow-hidden bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600 uppercase">
                        FREE
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-stone-900 uppercase tracking-tight">Promotional Pair</p>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Ends: {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : 'Continuous'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-stone-50">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Campaign</span>
                  <Switch 
                    checked={offer.isActive} 
                    onCheckedChange={() => handleToggleOffer(offer.id)}
                    className="data-[state=checked]:bg-orange-500" 
                  />
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>
          ))}

          {offers.length === 0 && (
            <div className="col-span-full py-24 border-2 border-dashed border-stone-100 rounded-[3.5rem] flex flex-col items-center justify-center text-center bg-stone-50/20">
               <div className="h-20 w-20 rounded-[2rem] bg-white flex items-center justify-center text-stone-200 mb-6 border border-stone-100">
                  <Tag size={40} />
               </div>
               <h3 className="text-xl font-black text-stone-900 uppercase">No Active Campaigns</h3>
               <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">Initialize your first promotion to drive storefront conversion</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
        <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white flex flex-col max-h-[90vh]">
          <header className="p-10 bg-stone-900 shrink-0">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="h-16 w-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-600/30">
                      <Tag size={28} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-white tracking-tight italic">Offer <span className="not-italic text-stone-500 font-normal">Architect</span></h2>
                      <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.4em] mt-1">Conversion Optimization Module</p>
                   </div>
                </div>
                <button onClick={() => setIsAddOfferOpen(false)} className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-stone-500 transition-all">
                   <X size={20} />
                </button>
             </div>
          </header>

          <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
             <div className="grid grid-cols-12 gap-10">
                {/* Configuration Left */}
                <div className="col-span-7 space-y-8">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Campaign Type</Label>
                      <div className="grid grid-cols-2 gap-4">
                         {['bogo', 'discount', 'bundle'].map(type => (
                           <button 
                             key={type}
                             onClick={() => setOfferFormData(prev => ({ ...prev, type }))}
                             className={cn(
                               "px-6 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                               offerFormData.type === type ? "bg-orange-50 border-orange-500 text-orange-600" : "bg-stone-50 border-stone-100 text-stone-400 hover:border-orange-200"
                             )}
                           >
                              {type}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Editorial Content</Label>
                      <div className="space-y-4">
                         <div className="relative group">
                            <Type className="absolute left-4 top-4 h-4 w-4 text-stone-300" />
                            <Input 
                              placeholder="Offer Headline (e.g. Summer Glow BOGO)"
                              value={offerFormData.title}
                              onChange={(e) => setOfferFormData(prev => ({ ...prev, title: e.target.value }))}
                              className="h-14 bg-stone-50 border-stone-100 focus:border-orange-300 rounded-xl pl-12 font-bold text-sm"
                            />
                         </div>
                         <Textarea 
                           placeholder="Compelling offer description..."
                           value={offerFormData.description}
                           onChange={(e) => setOfferFormData(prev => ({ ...prev, description: e.target.value }))}
                           className="min-h-[100px] bg-stone-50 border-stone-100 focus:border-orange-300 rounded-xl p-5 font-bold text-sm resize-none"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Expiration Protocol</Label>
                         <Input 
                           type="date"
                           value={offerFormData.endsAt}
                           onChange={(e) => setOfferFormData(prev => ({ ...prev, endsAt: e.target.value }))}
                           className="h-14 bg-stone-50 border-stone-100 focus:border-orange-300 rounded-xl font-bold text-sm"
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">CTA Label</Label>
                         <div className="relative group">
                            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                            <Input 
                              placeholder="CLAIM OFFER"
                              value={offerFormData.ctaText}
                              onChange={(e) => setOfferFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                              className="h-14 bg-stone-50 border-stone-100 focus:border-orange-300 rounded-xl pl-12 font-bold text-sm"
                            />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Product Mapping Right */}
                <div className="col-span-5 space-y-8">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Primary Product Integration</Label>
                      <div className="space-y-4">
                         <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                            <Input 
                              placeholder="Find product..."
                              value={productSearchQuery}
                              onChange={(e) => setProductSearchQuery(e.target.value)}
                              className="h-12 bg-stone-50 border-stone-100 rounded-xl pl-10 font-bold text-xs"
                            />
                         </div>
                         <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredProductOptions.map(p => (
                              <div 
                                key={p.id}
                                onClick={() => setOfferFormData(prev => ({ ...prev, mainProductId: p.id, mainProductImage: p.images?.[0] || "" }))}
                                className={cn(
                                  "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all",
                                  offerFormData.mainProductId === p.id ? "bg-orange-50 border-orange-200" : "bg-white border-transparent hover:bg-stone-50"
                                )}
                              >
                                 <div className="h-10 w-10 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                                    {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-stone-900 truncate tracking-tight">{p.name}</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">₹{p.price}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="p-6 rounded-3xl bg-orange-50/50 border border-orange-100">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-orange-500 shadow-sm">
                            <LinkIcon size={14} />
                         </div>
                         <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Selected Anchor</span>
                      </div>
                      {offerFormData.mainProductId ? (
                        <div className="flex items-center gap-4">
                           <div className="h-16 w-16 rounded-2xl bg-white border border-orange-100 overflow-hidden">
                              <img src={offerFormData.mainProductImage} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-stone-900 truncate tracking-tight">Active for Campaign</p>
                              <button onClick={() => setOfferFormData(prev => ({ ...prev, mainProductId: "", mainProductImage: "" }))} className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1 hover:underline">De-link Product</button>
                           </div>
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center py-4 italic">No product connected</p>
                      )}
                   </div>
                </div>
             </div>
          </div>

          <footer className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-5 shrink-0">
             <Button variant="ghost" onClick={() => setIsAddOfferOpen(false)} className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] text-stone-400 hover:bg-white hover:text-stone-900 transition-all">Cancel</Button>
             <Button 
               disabled={loading || !offerFormData.title || !offerFormData.mainProductId}
               onClick={handleSaveOffer}
               className="bg-[#151515] hover:bg-orange-600 text-white rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all hover:scale-105 active:scale-95"
             >
                {loading ? "Processing..." : editingOfferId ? "Update Campaign" : "Deploy Campaign"}
             </Button>
          </footer>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default OffersSection;
