import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, LayoutTemplate, Save, Edit3, Settings2, Check, X, Plus, Trash2, LayoutDashboard, Eye, EyeOff, MonitorSmartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

// Import real frontend components for live preview
import HeroSlider from "../Hero.jsx";
import OfferTimer from "../OfferTimer.jsx";
import UpcomingDrops from "../UpcomingDrops.jsx";
import WatchAndShop from "../WatchAndShop.jsx";
import ByCategory from "../bycategory.jsx";
import ShopByBrand from "../shopbybrand.jsx";
import BySkinConcern from "../byskinconcern.jsx";
import ByOffer from "../byoffer.jsx";
import SkinQuiz from "../skinquiz.jsx";
import ProductCard from "../components/card.jsx";
import NewArrivalsSection from "../NewArrivalsSection.jsx";
import LimitedOfferBanner from "../LimitedOfferBanner.jsx";
import RequestProductSection from "../RequestProductSection.jsx";
import PreOrderSection from "../PreOrderSection.jsx";

const API_URL = "http://localhost:5000/api";

export function HomepageManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  
  // Settings Modal State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeConfig, setActiveConfig] = useState(null);
  const [draftSettings, setDraftSettings] = useState({});
  const [draftTitle, setDraftTitle] = useState("");

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/homepage/sections`);
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setSections(sections.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      await fetch(`${API_URL}/admin/homepage/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
    } catch (e) {
      console.error(e);
      fetchSections();
    }
  };

  const handleUpdateTitleInline = async (id) => {
    try {
      setSections(sections.map(s => s.id === id ? { ...s, title: editTitle } : s));
      await fetch(`${API_URL}/admin/homepage/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle })
      });
      setEditingId(null);
    } catch (e) {
      console.error(e);
      fetchSections();
    }
  };

  const moveSection = (index, dir) => {
    if (dir === -1 && index === 0) return;
    if (dir === 1 && index === sections.length - 1) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + dir];
    newSections[index + dir] = temp;
    
    setSections(newSections);
    setHasUnsavedOrder(true);
  };

  const handleSaveOrder = async () => {
    try {
      const orderedIds = sections.map(s => s.id);
      await fetch(`${API_URL}/admin/homepage/sections/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds })
      });
      setHasUnsavedOrder(false);
      fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  // Open settings overlay
  const openSettings = (section) => {
    setActiveConfig(section);
    setDraftTitle(section.title || "");
    let initialSettings = section.settings || {};
    
    if (section.componentId === 'hero-slider' && !initialSettings.slides) {
      initialSettings.slides = [];
    }
    if (section.componentId === 'offer-timer' && !initialSettings.deadline) {
      initialSettings.deadline = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      initialSettings.promoText = "Flash Sale Ends Soon!";
    }
    if (section.componentId === 'watch-and-shop' && !initialSettings.videoUrl) {
      initialSettings.videoUrl = "https://youtube.com/watch?v=123";
      initialSettings.productsCsv = "";
    }
    
    setDraftSettings(initialSettings);
    setSettingsOpen(true);
  };

  const saveSettings = async () => {
    try {
      await fetch(`${API_URL}/admin/homepage/sections/${activeConfig.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: draftSettings, title: draftTitle })
      });
      setSettingsOpen(false);
      setActiveConfig(null);
      fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  // --------------------------------------------------------------------------------
  // LIVE PREVIEW DISPATCHER
  // --------------------------------------------------------------------------------
  const renderLivePreview = () => {
    if (!activeConfig) return null;
    const { componentId } = activeConfig;
    
    const noop = () => {};
    const mockWishlist = [];

    return (
      <div className="w-full bg-white relative rounded-xl border border-zinc-200 overflow-hidden shadow-sm origin-top" style={{ transform: 'scale(0.85)', width: '117%' }}>
        <div className="pointer-events-none">
          {componentId === "hero-slider" && <HeroSlider customSlides={draftSettings?.slides?.length > 0 ? draftSettings.slides : null} />}
          {componentId === "offer-timer" && <OfferTimer deadline={draftSettings?.deadline} title={draftTitle || draftSettings?.promoText} maxItems={draftSettings?.maxItems || 8} />}
          {componentId === "upcoming-drops" && <UpcomingDrops onNavigate={noop} wishlist={mockWishlist} toggleWishlist={noop} deadline={draftSettings?.deadline} title={draftTitle || draftSettings?.promoText} maxItems={draftSettings?.maxItems || 8} />}
          {componentId === "shop-by-category" && <ByCategory onNavigate={noop} onSelectCategory={noop} bgColor={draftSettings?.bgColor} title={draftTitle} maxItems={draftSettings?.maxItems || 8} />}
          
          {componentId === "best-sellers" && (
            <div className="py-12 px-6 text-center border-y border-zinc-100" style={{ backgroundColor: draftSettings?.bgColor || 'transparent' }}>
               <h2 className="text-3xl font-black uppercase tracking-widest">{draftTitle || "Best Sellers"}</h2>
               {draftSettings?.subheading && <p className="text-zinc-500 font-bold mt-2 tracking-widest uppercase text-xs">{draftSettings.subheading}</p>}
               <div className="mt-8 flex gap-4 justify-center overflow-hidden opacity-50">
                  <div className="h-64 w-48 bg-zinc-100 rounded-xl"></div>
                  <div className="h-64 w-48 bg-zinc-100 rounded-xl"></div>
                  <div className="h-64 w-48 bg-zinc-100 rounded-xl"></div>
               </div>
            </div>
          )}

          {componentId === "shop-by-brand" && <ShopByBrand onSelectBrand={noop} title={draftTitle} maxItems={draftSettings?.maxItems || 8} bgColor={draftSettings?.bgColor} />}
          {componentId === "by-skin-concern" && <BySkinConcern onSelectConcern={noop} title={draftTitle} bgColor={draftSettings?.bgColor} />}
          {componentId === "new-arrivals" && <NewArrivalsSection onNavigate={noop} title={draftTitle} maxItems={draftSettings?.maxItems || 8} bgColor={draftSettings?.bgColor} />}
          {componentId === "watch-and-shop" && <WatchAndShop onNavigate={noop} videoUrl={draftSettings?.videoUrl} includedProducts={draftSettings?.productsCsv} title={draftTitle} />}
          {componentId === "limited-offer" && <LimitedOfferBanner deadline={draftSettings?.deadline} title={draftTitle || draftSettings?.promoText} />}
          {componentId === "shop-by-offer" && <ByOffer onNavigate={noop} onSelectOffer={noop} title={draftTitle} maxItems={draftSettings?.maxItems || 8} bgColor={draftSettings?.bgColor} />}
          {componentId === "pre-order" && <PreOrderSection wishlist={mockWishlist} toggleWishlist={noop} title={draftTitle} />}
          {componentId === "skin-quiz" && <SkinQuiz headline={draftTitle || draftSettings?.headline} targetUrl={draftSettings?.link} />}
          {componentId === "request-product" && <RequestProductSection bgColor={draftSettings?.bgColor} title={draftTitle} />}
        </div>
      </div>
    );
  };

  const renderConfigurator = () => {
    if (!activeConfig) return null;
    const cid = activeConfig.componentId;

    const CommonHeaderInput = () => (
      <div className="space-y-3 mb-8 pb-8 border-b border-zinc-100">
        <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Main Section Title</Label>
        <Input value={draftTitle} onChange={e => setDraftTitle(e.target.value)} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-bold text-lg" placeholder="e.g. Best Sellers" />
        <p className="text-[10px] text-zinc-400">This updates the global title for this module block.</p>
      </div>
    );

    if (cid === 'hero-slider') {
      const slides = draftSettings.slides || [];
      return (
        <div className="space-y-6">
          <CommonHeaderInput />
          <div className="flex justify-between items-center bg-zinc-900/5 p-5 rounded-2xl border border-zinc-200/50">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Manage Slides</h3>
              <p className="text-xs text-zinc-500 mt-1">{slides.length} slide{slides.length !== 1 && 's'} configured</p>
            </div>
            <Button size="sm" onClick={() => setDraftSettings({...draftSettings, slides: [...slides, { imageUrl: '', title: '', subtitle: '', link: '' }]})} className="bg-zinc-900 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 px-4 gap-2 text-xs font-semibold">
              <Plus className="h-4 w-4" /> Add Slide
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {slides.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 rounded-3xl text-zinc-400 bg-zinc-50/50">
                  <LayoutTemplate className="h-10 w-10 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No slides configured yet.</p>
               </div>
            ) : slides.map((slide, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className="p-5 border border-zinc-200/60 rounded-2xl relative group bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
              >
                <div className="absolute -top-3 -right-3">
                  <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100" onClick={() => {
                    const s = [...slides]; s.splice(idx, 1); setDraftSettings({...draftSettings, slides: s});
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Image Asset URL (Desktop)</Label>
                    <Input value={slide.imageUrl} onChange={e => { const s = [...slides]; s[idx].imageUrl = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="h-11 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner" placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Main Heading Overlay</Label>
                    <Input value={slide.title} onChange={e => { const s = [...slides]; s[idx].title = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="h-11 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner" placeholder="New Collection" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Subtitle Overlay</Label>
                    <Input value={slide.subtitle} onChange={e => { const s = [...slides]; s[idx].subtitle = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="h-11 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner" placeholder="Shop now" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Button Link Target</Label>
                    <Input value={slide.link} onChange={e => { const s = [...slides]; s[idx].link = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="h-11 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner" placeholder="/category/accessories" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (cid === 'offer-timer' || cid === 'limited-offer' || cid === 'upcoming-drops') {
      return (
        <div className="space-y-6">
          <CommonHeaderInput />
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Countdown Deadline</Label>
            <Input type="date" value={draftSettings.deadline || ''} onChange={e => setDraftSettings({...draftSettings, deadline: e.target.value})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Promotion Helper Text (Alternative to Title)</Label>
            <Input value={draftSettings.promoText || ''} onChange={e => setDraftSettings({...draftSettings, promoText: e.target.value})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium" placeholder="Flash Sale Details!" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Max Grid Items</Label>
            <Input type="number" min="1" max="24" value={draftSettings.maxItems || 8} onChange={e => setDraftSettings({...draftSettings, maxItems: Number(e.target.value)})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium" />
          </div>
        </div>
      );
    }

    if (cid === 'watch-and-shop') {
      return (
        <div className="space-y-6">
          <CommonHeaderInput />
           <div className="p-4 bg-indigo-50/50 text-indigo-600 rounded-2xl border border-indigo-100 flex gap-3 text-sm">
             <div className="mt-0.5"><LayoutTemplate className="h-4 w-4" /></div>
             <p>Embed a video and list the products featured inside it to create an interactive shoppable experience.</p>
           </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">YouTube/Vimeo Embed URL</Label>
            <Input value={draftSettings.videoUrl || ''} onChange={e => setDraftSettings({...draftSettings, videoUrl: e.target.value})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium text-indigo-600" placeholder="https://youtube.com/embed/..." />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Featured Product IDs (Comma Separated)</Label>
            <Input value={draftSettings.productsCsv || ''} onChange={e => setDraftSettings({...draftSettings, productsCsv: e.target.value})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner placeholder:font-normal" placeholder="cmm..., ckm..." />
          </div>
        </div>
      );
    }

    // Default generic configurator for Category, Brand, Best Sellers, etc.
    return (
      <div className="space-y-6">
        <CommonHeaderInput />
        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Section Subheading / Description</Label>
          <Input value={draftSettings.subheading || ''} onChange={e => setDraftSettings({...draftSettings, subheading: e.target.value})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium text-zinc-600" placeholder="Optional brief description or subtitle" />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Max Products Shown</Label>
          <Input type="number" min="1" max="100" value={draftSettings.maxItems || 12} onChange={e => setDraftSettings({...draftSettings, maxItems: Number(e.target.value)})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium" />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Custom Background (HEX or tailwind class)</Label>
          <Input value={draftSettings.bgColor || ''} onChange={e => setDraftSettings({...draftSettings, bgColor: e.target.value})} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium font-mono" placeholder="#FFFFFF or transparent" />
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-zinc-500 uppercase tracking-widest">Loading Builder...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-100 pb-6 pt-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-4">
              <LayoutDashboard className="h-3.5 w-3.5" /> Site Structure
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-none mb-3 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
              Homepage Builder
            </h1>
            <p className="text-zinc-500 text-sm max-w-lg leading-relaxed">
              Drag to reorder sections, toggle visibility, and completely configure the interior text, images, and logic dynamically.
            </p>
          </div>
          
          <AnimatePresence>
            {hasUnsavedOrder && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
              >
                <Button 
                  onClick={handleSaveOrder} 
                  className="rounded-full h-12 px-8 shadow-xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 text-white font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Save Order Layout
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-3 px-2 max-w-4xl">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className={`border-0 shadow-sm rounded-[24px] overflow-hidden transition-all duration-300 ring-1 ring-inset ${!section.isActive ? 'ring-zinc-200 bg-zinc-50/50' : 'ring-zinc-200/60 bg-white hover:shadow-md hover:ring-zinc-300'}`}>
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                
                {/* Drag handles (Up/Down) */}
                <div className="flex bg-zinc-100 rounded-xl overflow-hidden self-start sm:self-auto shrink-0">
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-none hover:bg-zinc-200 text-zinc-500" onClick={() => moveSection(idx, -1)} disabled={idx === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <div className="w-[1px] bg-zinc-200 border-x"></div>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-none hover:bg-zinc-200 text-zinc-500" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Type Icon */}
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${section.isActive ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50' : 'bg-zinc-100 text-zinc-400 border-transparent'}`}>
                  <LayoutTemplate className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col items-start w-fit">
                    <div className="flex items-center gap-2">
                       <h3 className={`font-bold text-lg tracking-tight transition-colors ${section.isActive ? 'text-zinc-900 hover:text-indigo-600' : 'text-zinc-400'}`}>
                         {section.title}
                       </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded-md">
                        {section.componentId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-zinc-100 sm:pl-6 shrink-0 mt-2 sm:mt-0">
                  <Button 
                    onClick={() => openSettings(section)}
                    variant="outline" 
                    className="rounded-xl h-10 px-5 border-zinc-200 font-bold text-xs uppercase tracking-widest text-zinc-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm group/btn"
                  >
                    Edit Layout & Text
                  </Button>

                  <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-full">
                    {section.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-500" /> : <EyeOff className="h-3.5 w-3.5 text-zinc-400" />}
                    <Switch 
                      checked={section.isActive} 
                      onCheckedChange={() => handleToggleActive(section.id, section.isActive)}
                      className="data-[state=checked]:bg-emerald-500 shadow-sm cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-[1240px] p-0 rounded-[2rem] overflow-hidden border-zinc-200/60 shadow-2xl bg-zinc-100 gap-0">
          <DialogHeader className="px-8 py-5 bg-white border-b border-zinc-200 z-10 w-full shrink-0">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <MonitorSmartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">
                      Editing Form & Preview // {activeConfig?.componentId}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">
                      See your changes applied in real-time
                    </DialogDescription>
                  </div>
               </div>
               <div className="flex gap-3">
                 <Button variant="ghost" onClick={() => setSettingsOpen(false)} className="rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px] bg-zinc-100 hover:bg-zinc-200 transition-colors">
                   Cancel
                 </Button>
                 <Button onClick={saveSettings} className="rounded-xl h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                   Publish Changes Let's Go
                 </Button>
               </div>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col lg:flex-row h-[75vh] w-full items-stretch">
            {/* Split Screen Left: Configurator Form */}
            <div className="w-full lg:w-[480px] bg-white border-r border-zinc-200 p-8 overflow-y-auto shrink-0 relative custom-scrollbar z-10">
               {renderConfigurator()}
            </div>

            {/* Split Screen Right: Live Preview Rendering Area */}
            <div className="flex-1 bg-zinc-50/50 p-8 flex items-center justify-center overflow-y-auto relative hidden lg:flex rounded-br-[2rem]">
               <div className="absolute inset-x-0 top-0 text-center py-4 text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] select-none">Live Component Preview</div>
               {renderLivePreview()}
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}
