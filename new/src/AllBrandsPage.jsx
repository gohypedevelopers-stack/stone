import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BRANDS } from "./shopbybrand.jsx";
import { ChevronRight, ArrowLeft, Search } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function AllBrandsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [customBrands, setCustomBrands] = useState([]);

  // Fetch saved brand settings from homepage API to include custom brands
  useEffect(() => {
    fetch(`${API_URL}/homepage`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.sections) {
          const brandSection = d.data.sections.find(s => s.componentId === "shop-by-brand");
          if (brandSection?.settings?.brands) {
            // Find custom brands that aren't in default BRANDS list
            const savedBrands = brandSection.settings.brands
              .map(b => typeof b === 'string' ? { name: b, logo: '' } : b)
              .filter(b => !BRANDS.some(d => d.name === b.name));
            setCustomBrands(savedBrands);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Combine default + custom brands
  const allBrands = useMemo(() => [...BRANDS, ...customBrands], [customBrands]);

  const filteredBrands = useMemo(() => {
    return allBrands.filter(brand => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, allBrands]);

  // Sort brands and group by alphabet
  const groups = filteredBrands.reduce((acc, brand) => {
    const firstLetter = brand.name[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(brand);
    return acc;
  }, {});

  const alphabet = Object.keys(groups).sort();

  return (
    <div className="min-h-screen bg-[#fffefc] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-6 lg:py-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
            <h1 className="text-4xl lg:text-5xl font-black text-[#151515] tracking-tight mb-2">
              ALL BRANDS
            </h1>
            <p className="text-gray-500 font-medium">Explore our curated collection of luxury beauty brands</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-200 transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
            
            {alphabet.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {alphabet.map(letter => (
                  <a 
                    key={letter} 
                    href={`#letter-${letter}`}
                    className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-[10px] font-black hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    {letter}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {alphabet.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-300 mb-6 border border-gray-100">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-black text-[#151515] mb-2">No brands found</h2>
            <p className="text-gray-500">Try searching for a different brand name.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-6 text-pink-600 font-bold uppercase text-xs tracking-widest hover:underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {alphabet.map(letter => (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-5xl font-black text-pink-600">{letter}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {groups[letter].map((brand, bIdx) => (
                    <div
                      key={`${letter}-${bIdx}`}
                      onClick={() => navigate(`/brand/${brand.name}`)}
                      className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-4"
                    >
                      <div className="h-20 w-full flex items-center justify-center p-2">
                        {brand.logo ? (
                          <img 
                            src={brand.logo} 
                            alt={brand.name} 
                            className="max-h-full max-w-full object-contain transition-all duration-500"
                          />
                        ) : (
                          <span className="text-3xl font-black text-zinc-300">{brand.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-[#151515] group-hover:text-pink-600 transition-colors">
                          {brand.name}
                        </h3>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all text-pink-500">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
