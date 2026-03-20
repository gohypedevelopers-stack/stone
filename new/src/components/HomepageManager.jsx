import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUp, 
  ArrowDown, 
  LayoutTemplate, 
  Save, 
  Edit3, 
  Settings2, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  Eye, 
  EyeOff, 
  MonitorSmartphone, 
  Image as ImageIcon, 
  Timer, 
  Rocket, 
  LayoutGrid, 
  Trophy, 
  Star, 
  Sparkles, 
  PlaySquare, 
  Tag, 
  Ticket,
  Upload,
  GripVertical, 
  ArrowLeft, 
  Layout 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

import slide1 from "../assets/1.png";
import slide2 from "../assets/2.png";
import slide3 from "../assets/3.png";

const DEFAULT_HERO_SLIDES = [
  { imageUrl: slide1, title: "", subtitle: "", link: "" },
  { imageUrl: slide2, title: "", subtitle: "", link: "" },
  { imageUrl: slide3, title: "", subtitle: "", link: "" },
];

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
import { THEME } from "../theme.js";


const API_URL = "http://localhost:5000/api";

const getSectionIcon = (id) => {
  if (id === 'hero-slider') return <ImageIcon className="h-5 w-5" />;
  if (id === 'offer-timer' || id === 'limited-offer') return <Timer className="h-5 w-5" />;
  if (id === 'upcoming-drops') return <Rocket className="h-5 w-5" />;
  if (id === 'shop-by-category') return <LayoutGrid className="h-5 w-5" />;
  if (id === 'best-sellers') return <Trophy className="h-5 w-5" />;
  if (id === 'shop-by-brand') return <Star className="h-5 w-5" />;
  if (id === 'watch-and-shop') return <PlaySquare className="h-5 w-5" />;
  if (id === 'shop-by-offer') return <Tag className="h-5 w-5" />;
  return <Sparkles className="h-5 w-5" />;
};

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
  const [allProducts, setAllProducts] = useState([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

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

  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/products`);
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchAllProducts();
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
    if (section.componentId === 'hero-slider' && (!initialSettings.slides || initialSettings.slides.length === 0)) {
      initialSettings.slides = JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES));
    }
    if (section.componentId === 'offer-timer') {
      if (!initialSettings.deadline) {
        initialSettings.deadline = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      }
      if (!initialSettings.promoText) {
        initialSettings.promoText = "Flash Sale Ends Soon!";
      }
      if (!initialSettings.offers) {
        initialSettings.offers = [{ text: "20% OFF on orders over $100", code: "SAVE20" }];
      }
    }
    if (section.componentId === 'upcoming-drops') {
      if (!initialSettings.deadline) {
        initialSettings.deadline = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      }
      if (!initialSettings.promoText) {
        initialSettings.promoText = "Upcoming Beauty Drop";
      }
      if (!initialSettings.products || initialSettings.products.length === 0) {
        // We use the same mock products as defaults to maintain visual consistency
        initialSettings.products = [
          { name: "Sakura Silk Essence", imageUrl: slide1, launchDate: "Feb 10, 10:00 AM", qty: 120 },
          { name: "Glass Skin Barrier", imageUrl: slide2, launchDate: "Feb 12, 12:00 PM", qty: 80 }
        ];
      }
    }
    if (section.componentId === 'watch-and-shop' && !initialSettings.videoUrl) {
      initialSettings.videoUrl = "https://youtube.com/watch?v=123";
      initialSettings.productsCsv = "";
    }

    setDraftSettings(initialSettings);
    setSettingsOpen(true);
  };

  const deleteFileFromServer = async (url) => {
    if (!url || !url.includes('/uploads/')) return;
    try {
      const filename = url.split('/').pop();
      await fetch(`${API_URL}/upload/${filename}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.error("Failed to delete file from server:", e);
    }
  };

  const handleImageUpload = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Delete old image if it was an upload
    const oldUrl = draftSettings.slides?.[idx]?.imageUrl;
    if (oldUrl) {
      await deleteFileFromServer(oldUrl);
    }

    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const newUrl = data.data[0];
        const s = [...(draftSettings.slides || [])];
        s[idx] = { ...s[idx], imageUrl: newUrl };
        setDraftSettings({ ...draftSettings, slides: s });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProductImageUpload = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;

    const oldUrl = draftSettings.products?.[idx]?.imageUrl;
    if (oldUrl) {
      await deleteFileFromServer(oldUrl);
    }

    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const newUrl = data.data[0];
        const p = [...(draftSettings.products || [])];
        p[idx] = { ...p[idx], imageUrl: newUrl };
        setDraftSettings({ ...draftSettings, products: p });
      }
    } catch (e) {
      console.error(e);
    }
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

    const noop = () => { };
    const mockWishlist = [];

    return (
      <div className="w-full bg-white relative rounded-2xl border border-zinc-200 overflow-hidden shadow-md origin-top transform-gpu" style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
        <div className="pointer-events-none w-full">
          {componentId === "hero-slider" && <HeroSlider customSlides={draftSettings?.slides?.length > 0 ? draftSettings.slides : null} />}
          {componentId === "offer-timer" && <div className="p-4 w-full"><OfferTimer offers={draftSettings?.offers} /></div>}
          {componentId === "upcoming-drops" && <UpcomingDrops onNavigate={noop} wishlist={mockWishlist} toggleWishlist={noop} deadline={draftSettings?.deadline} title={draftSettings?.promoText} products={draftSettings?.products} />}
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
          <div className="flex justify-between items-center bg-indigo-950/5 p-5 rounded-2xl border border-zinc-200/50">
            <div>
              <h3 className="text-sm font-bold text-indigo-950">Manage Slides</h3>
              <p className="text-xs text-zinc-500 mt-1">{slides.length} slide{slides.length !== 1 && 's'} configured</p>
            </div>
            <Button size="sm" onClick={() => setDraftSettings({ ...draftSettings, slides: [...slides, { imageUrl: '', title: '', subtitle: '', link: '' }] })} className="bg-indigo-950 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 px-4 gap-2 text-xs font-semibold">
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
                <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[13px] font-black text-indigo-950 uppercase tracking-wider">Slide #{idx + 1}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Configure visuals & overlays</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    onClick={() => {
                      const slide = slides[idx];
                      if (slide.imageUrl) {
                        deleteFileFromServer(slide.imageUrl);
                      }
                      const s = [...slides];
                      s.splice(idx, 1);
                      setDraftSettings({ ...draftSettings, slides: s });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-zinc-50/50 rounded-2xl border border-zinc-100 p-6 space-y-6 shadow-sm">
                  {/* Image Section */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block ml-1">Banner Asset</Label>
                    <div className="flex gap-5 items-start">
                      <div className="w-32 h-20 rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0 group/img relative">
                        {slide.imageUrl ? (
                          <>
                            <img src={slide.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg scale-90 group-hover/img:scale-100 transition-all" onClick={() => {
                                deleteFileFromServer(slide.imageUrl);
                                const s = [...slides]; s[idx].imageUrl = ''; setDraftSettings({ ...draftSettings, slides: s });
                              }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-6 w-6 text-zinc-200" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-4 pt-1">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Internal Asset URL</Label>
                            <Input 
                              value={slide.imageUrl} 
                              onChange={e => { 
                                const s = [...slides]; 
                                s[idx].imageUrl = e.target.value; 
                                setDraftSettings({ ...draftSettings, slides: s }); 
                              }} 
                              onBlur={(e) => {
                                // If the user has replaced an upload with something else manually, clean it up
                                // This is tricky as we don't have the 'prev' value here easily.
                                // I'll skip complex change-tracking for manual edits to avoid over-deleting.
                                // Instead, I'll focus on making the 'Upload' button do the replacement correctly.
                              }}
                              className="h-10 w-full rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm px-4" 
                              placeholder="Paste path or URL..." 
                            />
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer flex-1">
                              <div className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]">
                                <Plus className="h-4 w-4" />
                                <span>Upload New Image</span>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} />
                            </label>
                          </div>
                        </div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed ml-1">
                          Recommended: 1920x600px. PNG, JPG supported.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-100 w-full" />

                  {/* Text Overlay Section */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-1 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block ml-1">Main Heading</Label>
                      <Input 
                        value={slide.title} 
                        onChange={e => { const s = [...slides]; s[idx].title = e.target.value; setDraftSettings({ ...draftSettings, slides: s }); }} 
                        className="h-11 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm" 
                        placeholder="e.g. Summer Sale" 
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block ml-1">Subtitle</Label>
                      <Input 
                        value={slide.subtitle} 
                        onChange={e => { const s = [...slides]; s[idx].subtitle = e.target.value; setDraftSettings({ ...draftSettings, slides: s }); }} 
                        className="h-11 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm" 
                        placeholder="e.g. Up to 50% OFF" 
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block ml-1">Button Navigation Link</Label>
                      <Input 
                        value={slide.link} 
                        onChange={e => { const s = [...slides]; s[idx].link = e.target.value; setDraftSettings({ ...draftSettings, slides: s }); }} 
                        className="h-11 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm" 
                        placeholder="/shop/new-arrivals" 
                      />
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest pl-1 mt-1">Leave empty to hide CTA button</p>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (cid === 'offer-timer' || cid === 'limited-offer') {
      const offers = draftSettings.offers || [];
      return (
        <div className="space-y-8">
          <CommonHeaderInput />
          
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <div>
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-950">Active Promotions</Label>
                <p className="text-[10px] text-zinc-400 font-medium mt-1">Manage the content of your scrolling marquee</p>
              </div>
              <Button 
                onClick={() => {
                  const s = { ...draftSettings, offers: [...offers, { text: "New Offer Text", code: "CODE20" }] };
                  setDraftSettings(s);
                }}
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold text-[9px] uppercase tracking-widest gap-2"
              >
                <Plus className="h-3 w-3" /> Add Promotion
              </Button>
            </div>

            <div className="space-y-4">
              {offers.map((offer, idx) => (
                <div key={idx} className="group relative bg-zinc-50 border border-zinc-200 rounded-2xl p-5 transition-all hover:bg-white hover:shadow-md hover:border-indigo-100">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-7 space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 ml-1">
                        <Tag className="h-2.5 w-2.5" /> Promotion Text
                      </Label>
                      <Input 
                        value={offer.text} 
                        onChange={e => {
                          const newOffers = [...offers];
                          newOffers[idx].text = e.target.value;
                          setDraftSettings({ ...draftSettings, offers: newOffers });
                        }}
                        className="h-10 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm"
                        placeholder="e.g. 20% OFF on orders over $100"
                      />
                    </div>
                    <div className="col-span-9 md:col-span-4 space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 ml-1">
                        <Ticket className="h-2.5 w-2.5" /> Coupon Code
                      </Label>
                      <Input 
                        value={offer.code} 
                        onChange={e => {
                          const newOffers = [...offers];
                          newOffers[idx].code = e.target.value;
                          setDraftSettings({ ...draftSettings, offers: newOffers });
                        }}
                        className="h-10 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm font-mono"
                        placeholder="CODE"
                      />
                    </div>
                    <div className="col-span-3 md:col-span-1 flex items-end justify-end">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-10 w-10 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        onClick={() => {
                          const newOffers = [...offers];
                          newOffers.splice(idx, 1);
                          setDraftSettings({ ...draftSettings, offers: newOffers });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-100 w-full" />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block ml-1">Countdown Deadline</Label>
              <Input type="date" value={draftSettings.deadline || ''} onChange={e => setDraftSettings({ ...draftSettings, deadline: e.target.value })} className="h-11 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 shadow-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block ml-1">Max Grid Items</Label>
              <Input type="number" min="1" max="24" value={draftSettings.maxItems || 8} onChange={e => setDraftSettings({ ...draftSettings, maxItems: Number(e.target.value) })} className="h-11 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 shadow-sm" />
            </div>
          </div>
        </div>
      );
    }

    if (cid === 'upcoming-drops') {
      const dropProducts = draftSettings.products || [];

      const filteredPickerProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(pickerSearch.toLowerCase())
      ).slice(0, 10);

      const addFromCatalog = (product) => {
        const newP = {
          id: product.id,
          name: product.name,
          imageUrl: product.image || product.imageUrl || "",
          launchDate: "Coming Soon",
          qty: product.inventoryCount || 0
        };
        setDraftSettings({ ...draftSettings, products: [...dropProducts, newP] });
        setShowPicker(false);
        setPickerSearch("");
      };

      return (
        <div className="space-y-8">
          <CommonHeaderInput />

          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-950">Drop Products</Label>
                <p className="text-[10px] text-zinc-400 font-medium mt-1">Add items featured in this upcoming drop</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowPicker(!showPicker)}
                  variant="outline" 
                  size="sm" 
                  className={`h-8 rounded-lg border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold text-[9px] uppercase tracking-widest gap-2 ${showPicker ? 'bg-emerald-50 ring-2 ring-emerald-500/20' : ''}`}
                >
                  <LayoutGrid className="h-3 w-3" /> {showPicker ? 'Close Picker' : 'Pick from Store'}
                </Button>
                <Button 
                  onClick={() => {
                    const s = { ...draftSettings, products: [...dropProducts, { name: "New Product", imageUrl: "", launchDate: "Coming Soon", qty: 100 }] };
                    setDraftSettings(s);
                  }}
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold text-[9px] uppercase tracking-widest gap-2"
                >
                  <Plus className="h-3 w-3" /> Add Custom
                </Button>
              </div>
            </div>

            {showPicker && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="relative mb-4">
                  <Input 
                    placeholder="Search your store catalog..." 
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    className="h-11 rounded-2xl bg-white border-emerald-200 focus-visible:ring-emerald-500 pl-10 shadow-sm"
                  />
                  <LayoutGrid className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredPickerProducts.length > 0 ? (
                    filteredPickerProducts.map(product => (
                      <button 
                        key={product.id}
                        onClick={() => addFromCatalog(product)}
                        className="flex items-center gap-3 p-2 rounded-xl bg-white border border-emerald-100/50 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-emerald-50">
                          <img src={product.image || product.imageUrl} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-emerald-950 truncate">{product.name}</p>
                          <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-tight">Stock: {product.inventoryCount || 0}</p>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      </button>
                    ))
                  ) : (
                    <p className="text-center py-8 text-[11px] font-bold text-emerald-800/50 uppercase tracking-widest">No products found</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {dropProducts.length > 0 ? dropProducts.map((p, pIdx) => (
                <div key={pIdx} className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                  <div className="p-4 bg-zinc-100/50 border-b border-zinc-200/50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Drop Item #{pIdx + 1}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                      onClick={() => {
                        const product = dropProducts[pIdx];
                        if (product.imageUrl) {
                          deleteFileFromServer(product.imageUrl);
                        }
                        const newP = [...dropProducts];
                        newP.splice(pIdx, 1);
                        setDraftSettings({ ...draftSettings, products: newP });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="p-5 space-y-4 text-left">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Drop Product Name</Label>
                      <Input 
                        value={p.name} 
                        onChange={e => {
                          const newP = [...dropProducts];
                          newP[pIdx].name = e.target.value;
                          setDraftSettings({ ...draftSettings, products: newP });
                        }}
                        className="h-10 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm transition-all focus:bg-white"
                        placeholder="e.g. Sakura Silk Essence"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Expected Launch</Label>
                        <Input 
                          value={p.launchDate} 
                          onChange={e => {
                            const newP = [...dropProducts];
                            newP[pIdx].launchDate = e.target.value;
                            setDraftSettings({ ...draftSettings, products: newP });
                          }}
                          className="h-10 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm"
                          placeholder="e.g. Feb 10, 10:00 AM"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Launch Qty</Label>
                        <Input 
                          type="number"
                          value={p.qty} 
                          onChange={e => {
                            const newP = [...dropProducts];
                            newP[pIdx].qty = Number(e.target.value);
                            setDraftSettings({ ...draftSettings, products: newP });
                          }}
                          className="h-10 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[13px] font-medium shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Promotion Image</Label>
                      <div className="flex gap-3">
                        <div className="relative group/img h-11 w-11 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 shadow-inner">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-300" />
                          )}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <Input 
                            value={p.imageUrl} 
                            onChange={e => {
                              const newP = [...dropProducts];
                              newP[pIdx].imageUrl = e.target.value;
                              setDraftSettings({ ...draftSettings, products: newP });
                            }}
                            className="h-11 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 text-[12px] font-medium shadow-sm flex-1"
                            placeholder="Paste image URL here..."
                          />
                          <label className="cursor-pointer">
                            <div className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200 transition-all font-bold text-[10px] uppercase tracking-widest">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload</span>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleProductImageUpload(e, pIdx)} 
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-12 px-6 border-2 border-dashed border-zinc-100 rounded-[2rem] text-center bg-zinc-50/50">
                   <LayoutGrid className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
                   <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">No products in this drop yet</p>
                   <p className="text-[10px] text-zinc-400 mt-2 font-medium">Use the buttons above to start adding products</p>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-zinc-100 w-full" />

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block ml-1">Global Drop Deadline</Label>
            <Input type="date" value={draftSettings.deadline || ''} onChange={e => setDraftSettings({ ...draftSettings, deadline: e.target.value })} className="h-11 rounded-xl bg-white border-zinc-200 focus-visible:ring-indigo-500 shadow-sm" />
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
            <Input value={draftSettings.videoUrl || ''} onChange={e => setDraftSettings({ ...draftSettings, videoUrl: e.target.value })} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium text-indigo-600" placeholder="https://youtube.com/embed/..." />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Featured Product IDs (Comma Separated)</Label>
            <Input value={draftSettings.productsCsv || ''} onChange={e => setDraftSettings({ ...draftSettings, productsCsv: e.target.value })} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner placeholder:font-normal" placeholder="cmm..., ckm..." />
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
          <Input value={draftSettings.subheading || ''} onChange={e => setDraftSettings({ ...draftSettings, subheading: e.target.value })} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium text-zinc-600" placeholder="Optional brief description or subtitle" />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Max Products Shown</Label>
          <Input type="number" min="1" max="100" value={draftSettings.maxItems || 12} onChange={e => setDraftSettings({ ...draftSettings, maxItems: Number(e.target.value) })} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium" />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Custom Background (HEX or tailwind class)</Label>
          <Input value={draftSettings.bgColor || ''} onChange={e => setDraftSettings({ ...draftSettings, bgColor: e.target.value })} className="h-12 rounded-xl bg-zinc-50/50 focus-visible:ring-emerald-500 shadow-inner font-medium font-mono" placeholder="#FFFFFF or transparent" />
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 border-4 border-zinc-200 border-t-indigo-950 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-zinc-500 uppercase tracking-widest">Loading Builder...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 animate-in fade-in duration-500 relative" style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)' }}>
      {/* Background Enhancement pattern layer (opacity 5%) */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-multiply"></div>

      <div className="w-full relative z-10">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-[#f9fafb]/80 backdrop-blur-3xl border-b border-stone-200/50 pb-8 pt-10 mb-12 px-8 md:px-12 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100/80 text-stone-600 text-[9px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-stone-200/50">
              <LayoutDashboard className="h-3.5 w-3.5 text-indigo-950" /> SITE ARCHITECTURE
            </div>
            <h1 className={`${THEME.typography.headings.h1} uppercase leading-none mb-4 bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>
              Homepage Builder
            </h1>
            <p className="text-stone-500 font-medium tracking-wide text-sm max-w-lg leading-relaxed mix-blend-multiply">
              Drag to reorder dynamic sections, toggle visibility, and completely configure the master component hierarchy of the storefront.
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
                  className="rounded-[1.25rem] h-14 px-8 shadow-2xl shadow-indigo-950/30 bg-indigo-950 hover:bg-[#1a0b2e] border border-indigo-900 text-white font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <Save className="h-4 w-4" /> Commit Layout
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>

      {/* List Section */}
      <div className="space-y-6 px-4 md:px-12 w-full mx-auto relative z-10">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: idx * 0.15
            }}
          >
           <div className={`group relative bg-white border border-stone-100 rounded-[18px] transition-all duration-300 ease-out overflow-hidden
              ${section.isActive ? 'shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1' : 'opacity-[0.85] bg-stone-50/50 shadow-sm'}
            `}>
              {/* Left highlight border (Active state feedback) */}
              <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-colors ${section.isActive ? 'bg-indigo-500' : 'bg-transparent'}`} />

              <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 ml-2">

                {/* Left Side: Drag, Icon, Title, Tag */}
                <div className="flex flex-1 items-center gap-5 min-w-0">
                  {/* Drag handles (Up/Down) */}
                  <div className="flex flex-col bg-white rounded-[10px] overflow-hidden shrink-0 border border-stone-200/60 shadow-sm">
                    <button className="h-7 w-8 flex items-center justify-center hover:bg-stone-100 text-stone-400 hover:text-purple-900 transition-colors" onClick={() => moveSection(idx, -1)} disabled={idx === 0}>
                      <ArrowUp className="h-[14px] w-[14px]" />
                    </button>
                    <div className="h-[1px] bg-stone-100 w-full"></div>
                    <button className="h-7 w-8 flex items-center justify-center hover:bg-stone-100 text-stone-400 hover:text-purple-900 transition-colors" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1}>
                      <ArrowDown className="h-[14px] w-[14px]" />
                    </button>
                  </div>

                  {/* Type Icon */}
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-all ${section.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-400'}`}>
                    {getSectionIcon(section.componentId)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className={`font-semibold text-[18px] tracking-tight mb-1.5 transition-colors ${section.isActive ? 'text-indigo-950' : 'text-stone-500'}`}>
                      {section.title}
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                        {section.componentId}
                      </span>
                      {/* Active Status Badge */}
                      <div className="flex items-center gap-1.5 bg-stone-100/60 px-2 py-0.5 rounded-full border border-stone-200/50">
                        <span className={`h-1.5 w-1.5 rounded-full ${section.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-stone-300'}`}></span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">{section.isActive ? 'Active' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-4 shrink-0 pl-4 sm:border-l border-stone-100">
                  <Button
                    onClick={() => openSettings(section)}
                    variant="ghost"
                    className="rounded-full h-10 px-5 bg-stone-100 hover:bg-stone-200 text-purple-900 font-semibold text-[13px] shadow-sm transition-all hover:scale-105 active:scale-95 border border-stone-200/50"
                  >
                    Configure
                  </Button>

                  <div className="flex items-center">
                    <Switch
                      checked={section.isActive}
                      onCheckedChange={() => handleToggleActive(section.id, section.isActive)}
                      className="data-[state=checked]:bg-indigo-500 scale-110 shadow-sm"
                    />
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="!max-w-[95vw] sm:!max-w-[95vw] md:!max-w-[95vw] lg:!max-w-[95vw] !w-[95vw] p-0 rounded-[2rem] overflow-hidden border-zinc-200/60 shadow-2xl bg-zinc-100 gap-0">
          <DialogHeader className="px-8 py-5 bg-white border-b border-zinc-200 z-10 w-full shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <MonitorSmartphone className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-indigo-950 tracking-tight">
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

          <div className="flex flex-col lg:flex-row h-[88vh] w-full items-stretch">
            {/* Split Screen Left: Configurator Form */}
            <div className="w-full lg:w-[480px] bg-white border-r border-zinc-200 flex flex-col shrink-0 relative z-10">
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {renderConfigurator()}
              </div>
              <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex gap-3">
                <Button variant="ghost" onClick={() => setSettingsOpen(false)} className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-[10px] bg-white border border-zinc-200 hover:bg-zinc-100 transition-colors">
                  Cancel
                </Button>
                <Button onClick={saveSettings} className="flex-2 rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Save className="h-3.5 w-3.5 mr-2" /> Save Changes
                </Button>
              </div>
            </div>

            {/* Split Screen Right: Live Preview Rendering Area */}
            <div className="flex-1 bg-zinc-50/50 p-8 flex items-start justify-center overflow-y-auto relative hidden lg:flex rounded-br-[2rem] min-w-[700px]">
              <div className="absolute inset-x-0 top-0 text-center py-4 text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] select-none">Live Component Preview</div>
              {renderLivePreview()}
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}
