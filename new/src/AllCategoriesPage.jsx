import { CATEGORIES, CATEGORY_IMAGES, DEFAULT_CATEGORY_DATA, categorySphere } from "./bycategory";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AllCategoriesPage({ onNavigate, onSelectCategory, dynamicCategories }) {
  const handleCategoryClick = (label) => {
    if (onSelectCategory) onSelectCategory(label);
    if (onNavigate) onNavigate("category-page");
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-32 pb-20 px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button 
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-stone-500 hover:text-black transition-colors font-bold uppercase tracking-widest text-xs mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-[#b36cff]" size={24} />
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#151515]">
              Shop by <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1] italic">Category</span>
            </h1>
          </div>
          <p className="text-stone-500 max-w-2xl text-lg font-medium">
            Explore our curated selection of premium skincare and beauty essentials, organized to help you find exactly what your skin needs.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {(dynamicCategories?.length > 0 
            ? dynamicCategories.map(c => ({ label: c.name, image: CATEGORY_IMAGES[c.name] || categorySphere }))
            : DEFAULT_CATEGORY_DATA
          ).map((cat, idx) => (
            <div
              key={cat.label || idx}
              className="text-center cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => handleCategoryClick(cat.label)}
            >
              <div className="relative aspect-square rounded-[32px] overflow-hidden border border-black/5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:-translate-y-2">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  src={cat.image || categorySphere}
                  alt={cat.label}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="mt-4 font-black text-sm md:text-base text-[#151515] group-hover:text-[#b36cff] transition-colors uppercase tracking-tight">
                {cat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
