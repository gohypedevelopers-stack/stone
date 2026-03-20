import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, LayoutTemplate, Save, Edit3, Settings2, Check, X, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
      await fetch(`${API_URL}/admin/homepage/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTitle = async (id) => {
    try {
      await fetch(`${API_URL}/admin/homepage/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle })
      });
      setEditingId(null);
      fetchSections();
    } catch (e) {
      console.error(e);
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
    // Initialize default structure if empty
    let initialSettings = section.settings || {};
    
    // Seed defaults based on componentId
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
        body: JSON.stringify({ settings: draftSettings })
      });
      setSettingsOpen(false);
      setActiveConfig(null);
      fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  const renderConfigurator = () => {
    if (!activeConfig) return null;
    const cid = activeConfig.componentId;

    if (cid === 'hero-slider') {
      const slides = draftSettings.slides || [];
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">Manage Slides ({slides.length})</h3>
            <Button size="sm" onClick={() => setDraftSettings({...draftSettings, slides: [...slides, { imageUrl: '', title: '', subtitle: '', link: '' }]})} className="bg-stone-900 text-white rounded-lg px-4 gap-2 text-xs font-bold">
              <Plus className="h-3 w-3" /> Add Slide
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {slides.length === 0 ? <p className="text-stone-400 text-sm font-bold text-center py-6">No slides configured. Add one.</p> : slides.map((slide, idx) => (
              <div key={idx} className="p-4 border border-stone-100 rounded-xl relative group bg-white shadow-sm">
                <Button size="icon" variant="destructive" className="absolute -top-3 -right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                  const s = [...slides]; s.splice(idx, 1); setDraftSettings({...draftSettings, slides: s});
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Image Asset URL</Label>
                    <Input value={slide.imageUrl} onChange={e => { const s = [...slides]; s[idx].imageUrl = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="mt-1 h-10 bg-stone-50" placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Main Title</Label>
                    <Input value={slide.title} onChange={e => { const s = [...slides]; s[idx].title = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="mt-1 h-10 bg-stone-50" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Subtitle (Overlay)</Label>
                    <Input value={slide.subtitle} onChange={e => { const s = [...slides]; s[idx].subtitle = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="mt-1 h-10 bg-stone-50" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Click Target URL</Label>
                    <Input value={slide.link} onChange={e => { const s = [...slides]; s[idx].link = e.target.value; setDraftSettings({...draftSettings, slides: s}); }} className="mt-1 h-10 bg-stone-50" placeholder="/product/123" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (cid === 'offer-timer' || cid === 'limited-offer' || cid === 'upcoming-drops') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Countdown Deadline</Label>
            <Input type="date" value={draftSettings.deadline || ''} onChange={e => setDraftSettings({...draftSettings, deadline: e.target.value})} className="h-12 bg-stone-50 font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Promotion Header</Label>
            <Input value={draftSettings.promoText || ''} onChange={e => setDraftSettings({...draftSettings, promoText: e.target.value})} className="h-12 bg-stone-50 font-bold" placeholder="Flash Sale Details!" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Max Items to show</Label>
            <Input type="number" min="1" max="24" value={draftSettings.maxItems || 8} onChange={e => setDraftSettings({...draftSettings, maxItems: Number(e.target.value)})} className="h-12 bg-stone-50 font-bold" />
          </div>
        </div>
      );
    }

    if (cid === 'watch-and-shop') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Video Embed URL</Label>
            <Input value={draftSettings.videoUrl || ''} onChange={e => setDraftSettings({...draftSettings, videoUrl: e.target.value})} className="h-12 bg-stone-50 font-bold" placeholder="https://youtube.com/embed/..." />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Featured Product IDs (Comma Separated)</Label>
            <Input value={draftSettings.productsCsv || ''} onChange={e => setDraftSettings({...draftSettings, productsCsv: e.target.value})} className="h-12 bg-stone-50 font-bold placeholder:font-normal" placeholder="cmm..., ckm..." />
          </div>
        </div>
      );
    }

    if (cid === 'skin-quiz') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Quiz Headline</Label>
            <Input value={draftSettings.headline || ''} onChange={e => setDraftSettings({...draftSettings, headline: e.target.value})} className="h-12 bg-stone-50 font-bold" placeholder="Find your routine" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Quiz Link Target</Label>
            <Input value={draftSettings.link || ''} onChange={e => setDraftSettings({...draftSettings, link: e.target.value})} className="h-12 bg-stone-50 font-bold" placeholder="/quiz" />
          </div>
        </div>
      );
    }

    // Default generic configurator
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Max Products Displayed</Label>
          <Input type="number" min="1" max="100" value={draftSettings.maxItems || 12} onChange={e => setDraftSettings({...draftSettings, maxItems: Number(e.target.value)})} className="h-12 bg-stone-50 font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Custom Subheading</Label>
          <Input value={draftSettings.subheading || ''} onChange={e => setDraftSettings({...draftSettings, subheading: e.target.value})} className="h-12 bg-stone-50 font-bold" placeholder="Optional descriptor" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Background Accent Color HEX</Label>
          <Input value={draftSettings.bgColor || ''} onChange={e => setDraftSettings({...draftSettings, bgColor: e.target.value})} className="h-12 bg-stone-50 font-bold font-mono uppercase" placeholder="#FFFFFF (Leaves transparent if blank)" />
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-12 text-stone-400 font-bold">Loading Builder...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
      <header className="flex items-center justify-between gap-6 mb-12">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase leading-none mb-3">Homepage Builder</h1>
          <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px]">Customize layout, section visibility, rendering order, and interior data.</p>
        </div>
        {hasUnsavedOrder && (
          <Button onClick={handleSaveOrder} className="rounded-2xl h-14 px-8 shadow-2xl shadow-emerald-500/40 bg-emerald-500 hover:bg-emerald-600 font-black uppercase tracking-widest text-[10px] text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
            <Save className="h-4 w-4" /> Save Layout Order
          </Button>
        )}
      </header>

      <div className="max-w-4xl mx-auto space-y-4 pb-24">
        {sections.map((section, idx) => (
          <Card key={section.id} className={`border border-stone-100 shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ${!section.isActive ? 'opacity-50 grayscale bg-stone-50/50' : 'bg-white hover:shadow-md'}`}>
            <CardContent className="p-5 flex items-center gap-6">
              
              {/* Drag handles (Up/Down) */}
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-stone-100" onClick={() => moveSection(idx, -1)} disabled={idx === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-stone-100" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Type Badge */}
              <div className="h-12 w-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center">
                <LayoutTemplate className="h-5 w-5" />
              </div>

              {/* Editing logic */}
              <div className="flex-1 flex items-center gap-3">
                {editingId === section.id ? (
                  <div className="flex items-center gap-2 flex-1 relative animate-in zoom-in-95">
                    <Input 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      className="h-10 rounded-xl max-w-[300px] font-black font-mono shadow-inner border-stone-200"
                    />
                    <Button onClick={() => handleUpdateTitle(section.id)} size="sm" className="h-10 w-10 p-0 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"><Check className="h-4 w-4" /></Button>
                    <Button onClick={() => setEditingId(null)} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-stone-100"><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setEditingId(section.id); setEditTitle(section.title); }}>
                      <p className="font-black text-stone-900 text-lg tracking-tight group-hover:text-pink-600 transition-colors">{section.title}</p>
                      <Edit3 className="h-3 w-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-1">{section.componentId}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 border-l border-stone-100 pl-6 ml-auto">
                <Button 
                  onClick={() => openSettings(section)}
                  variant="outline" 
                  className="rounded-xl h-10 border-stone-200 gap-2 font-bold uppercase text-[10px] tracking-widest text-stone-600 hover:bg-stone-900 hover:text-white transition-all shadow-sm"
                >
                  <Settings2 className="h-4 w-4" /> Configure
                </Button>

                <div className="flex flex-col items-end gap-1.5 w-24">
                  <Switch 
                    checked={section.isActive} 
                    onCheckedChange={() => handleToggleActive(section.id, section.isActive)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                  <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                    {section.isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 rounded-[2rem] overflow-hidden border-stone-100 shadow-2xl bg-white">
          <DialogHeader className="p-8 bg-stone-50/50 border-b border-stone-100">
            <DialogTitle className="text-2xl font-black text-stone-900 tracking-tighter flex items-center gap-3">
              <Settings2 className="h-6 w-6 text-stone-400" />
              Configuring: {activeConfig?.title}
            </DialogTitle>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-2">{activeConfig?.componentId} settings internal payload</p>
          </DialogHeader>
          
          <div className="p-8">
            {renderConfigurator()}
          </div>

          <DialogFooter className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)} className="rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest">Cancel</Button>
            <Button type="button" onClick={saveSettings} className="rounded-xl h-12 px-8 bg-stone-900 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-stone-900/20 hover:bg-black transition-all">Save Context</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
