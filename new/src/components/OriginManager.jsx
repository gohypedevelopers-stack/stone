import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  MoveUp, 
  MoveDown, 
  ChevronRight
} from "lucide-react";
import { THEME } from "../theme";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { API_URL, SERVER_URL } from "../utils/api";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

export default function OriginManager() {
  const navigate = useNavigate();
  const [sectionConfig, setSectionConfig] = useState(null);
  const [originList, setOriginList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/homepage/sections`);
      const sections = res.data.data || [];
      const originSection = sections.find(s => s.componentId === "shop-by-origin");
      
      if (originSection) {
        setSectionConfig(originSection);
        setOriginList(originSection.settings?.origins || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load origin data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedOrigins = originList) => {
    if (!sectionConfig) return;
    try {
      await axios.put(`${API_URL}/admin/homepage/sections/${sectionConfig.id}`, {
        settings: {
          ...sectionConfig.settings,
          origins: updatedOrigins
        }
      });
      toast.success("Shop By Origin updated globally");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    }
  };

  const removeOrigin = (id) => {
    if (!confirm("Are you sure you want to decommission this regional ritual?")) return;
    const updated = originList.filter(o => o.id !== id);
    setOriginList(updated);
    handleSave(updated);
  };

  const seedDefaults = () => {
    const defaults = [
      {
        id: "origin-korean",
        name: "Korean",
        title: "K-Beauty Rituals",
        subtitle: "Experience the glass skin glow with our curated Korean skincare selection.",
        heroImage: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=1200",
        productIds: [],
        sourceMode: "Manual"
      },
      {
        id: "origin-japanese",
        name: "Japanese",
        title: "J-Beauty Zen",
        subtitle: "Minimalist formulas and high-tech hydration from the heart of Japan.",
        heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
        productIds: [],
        sourceMode: "Manual"
      },
      {
        id: "origin-indian",
        name: "Indian",
        title: "Ayurvedic Wisdom",
        subtitle: "Ancient botanical secrets meeting modern dermatological science.",
        heroImage: "https://images.unsplash.com/photo-1600880210819-bf941797c8b3?auto=format&fit=crop&q=80&w=1200",
        productIds: [],
        sourceMode: "Manual"
      }
    ];
    setOriginList(defaults);
    handleSave(defaults);
  };

  const moveOrigin = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= originList.length) return;

    const newList = [...originList];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setOriginList(newList);
    handleSave(newList);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12 min-h-[60vh]">
      <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-400 pb-1 flex items-center gap-3`}>
            Origin & Regional Hub
          </h1>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
            Manage product collections by geographical origin and curated regional rituals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate("/admin/origin-editor/new")}
            className="rounded-full font-black h-12 px-6 bg-[#151515] hover:bg-black text-white shadow-xl shadow-stone-900/20 text-[11px] uppercase tracking-widest"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Origin
          </Button>
        </div>
      </header>

      {originList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-20 text-center shadow-sm">
          <Sparkles className="h-16 w-16 text-emerald-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-stone-900 mb-2 uppercase tracking-tight">No Regions Defined</h3>
          <p className="text-stone-500 mb-8 max-w-sm mx-auto text-sm">
            Add your first regional collection like Korean, Japanese, or Indian to showcase them on the homepage.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => navigate("/admin/origin-editor/new")} variant="outline" className="rounded-full px-8 border-stone-200 font-bold">
              Get Started
            </Button>
            <Button onClick={seedDefaults} className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Seed Sample Origins
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {originList.map((origin, index) => (
            <div key={origin.id} className="group relative bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-stone-200 transition-all duration-500 overflow-hidden flex flex-col">
              
              {/* Image Preview */}
              <div className="aspect-[16/10] relative overflow-hidden">
                <img 
                  src={getMediaUrl(origin.heroImage)} 
                  alt={origin.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-80" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">{origin.name}</span>
                  <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">{origin.title}</h3>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={() => navigate(`/admin/origin-editor/${origin.id}`)} 
                    className="h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-xl flex items-center justify-center text-stone-900 hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => removeOrigin(origin.id)} className="h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-xl flex items-center justify-center text-stone-900 hover:bg-rose-500 hover:text-white transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                   <button onClick={() => moveOrigin(index, "up")} disabled={index === 0} className="h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-xl flex items-center justify-center text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-all">
                      <MoveUp className="h-4 w-4" />
                   </button>
                   <button onClick={() => moveOrigin(index, "down")} disabled={index === originList.length - 1} className="h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-xl flex items-center justify-center text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-all">
                      <MoveDown className="h-4 w-4" />
                   </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-zinc-500 text-[12px] font-medium leading-relaxed line-clamp-2 italic">
                  "{origin.subtitle}"
                </p>
                
                <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Package className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-black text-stone-900 uppercase tracking-widest">
                      {(origin.productIds?.length || 0) + (origin.customProducts?.length || 0)} Products Attached
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
