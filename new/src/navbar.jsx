import React, { useState, useEffect, memo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu as MenuIcon, 
  X as CloseIcon, 
  Search as SearchIcon, 
  ShoppingBag, 
  Heart, 
  User, 
  ChevronRight,
  Gift,
  ArrowRight
} from "lucide-react";
import logo from "./assets/logo.png";
import searchIcon from "./assets/search.png";
import favIcon from "./assets/favourite.png";
import accountIcon from "./assets/user-account.png";
import cartIcon from "./assets/shopping-cart.png";

import AnnouncementBar from "./components/AnnouncementBar";
import ByCategory, { CATEGORY_IMAGES, categorySphere } from "./bycategory";

function SearchPlaceholder({ searchTerms }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % searchTerms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [searchTerms]);

  return (
    <div className="absolute inset-0 flex items-center pointer-events-none text-[16px] text-text-custom whitespace-nowrap overflow-hidden">
      <span className="opacity-50 mr-1">Search for</span>
      <span key={index} className="text-pink-500 font-bold animate-fade-in-up">
        {searchTerms[index]}
      </span>
    </div>
  );
}

import { useAuth } from "./context/AuthContext";

const Navbar = memo(function Navbar({
  categories,
  dynamicCategories,
  query,
  onQueryChange,
  cartCount,
  onToggleCart,
  onNavigate,
  onSelectCategory,
  wishlistCount,
  onOpenAuth,
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        onQueryChange({ target: { value: localQuery } });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [localQuery, onQueryChange, query]);

  const searchTerms = [
    "B.b cream",
    "Blender",
    "Blush",
    "Brush",
    "Cleanser",
    "cleansing oil",
    "compact powders",
    "Concealer",
    "Cushion foundation",
    "Essence",
    "Exfoliate",
    "Eye cream",
    "Face mists",
    "Foundation",
    "Hair set",
    "International makeup",
    "International skincare",
    "Japanese Skincare",
    "Korean skincare",
    "Lip blam",
    "Lipstick",
    "Makeup remover",
    "Mascara",
    "Moisturizer",
    "Primer",
    "Razor",
    "Serums",
    "Sheet masks",
    "SKIN1004",
    "Sunscreen",
    "Sunspray",
    "Sunstick",
    "toner",
    "toner pads",
    "Treatment mask",
  ];

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-white shadow-sm md:shadow-none">
        <AnnouncementBar />
        
        <header className="header relative">
          <div className="w-full flex items-center justify-between py-2 md:py-3 px-4 md:px-8 border-b border-stone-100 bg-white">
            
            {/* --- MOBILE LEFT: Hamburger --- */}
            <div className="flex md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-stone-800 hover:text-pink-500 transition-colors"
                aria-label="Toggle Menu"
              >
                <MenuIcon size={24} />
              </button>
            </div>

            {/* --- LOGO BLOCK --- */}
            <div className="flex md:flex-1 justify-center md:justify-start items-center">
              <a
                className="flex items-center gap-2 md:gap-3 leading-none w-fit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("home");
                }}
              >
                <img
                  className="w-10 h-10 md:w-12 md:h-12 object-contain"
                  src={logo}
                  alt="omwskincare logo"
                />
                <div className="flex flex-col justify-center">
                  <span className="bg-linear-to-r from-[#ff4fa3] to-[#ff77c8] bg-clip-text text-transparent font-black text-xl md:text-2xl tracking-tight leading-none">
                    OMW
                  </span>
                  <span className="hidden md:block text-[9px] text-stone-400 tracking-[1.5px] uppercase font-bold mt-0.5">
                    skin-first essentials
                  </span>
                </div>
              </a>
            </div>

            {/* --- DESKTOP SEARCH: Center Block --- */}
            <div className="hidden md:flex flex-1 max-w-xl justify-center px-4">
              <div className="w-full flex items-center gap-3 px-5 py-2.5 rounded-[2px] border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 hover:shadow-sm transition-all relative">
                <span className="w-5 h-5 grid place-items-center opacity-70" aria-hidden="true">
                  <img className="w-full h-full object-contain" src={searchIcon} alt="" />
                </span>
                <div className="relative w-full">
                  {!localQuery && <SearchPlaceholder searchTerms={searchTerms} />}
                  <input
                    className="border-none outline-none w-full text-sm bg-transparent text-stone-800 placeholder-transparent relative z-10"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && localQuery.trim()) {
                        onNavigate(`shop?q=${encodeURIComponent(localQuery.trim())}`);
                      }
                    }}
                    placeholder=""
                    aria-label="Search products"
                  />
                </div>
              </div>
            </div>

            {/* --- ACTIONS BLOCK --- */}
            <div className="flex md:flex-1 items-center justify-end gap-3 md:gap-6">
              
              {/* Desktop Shop Link */}
              <a
                href="#"
                className="hidden md:block text-sm font-black text-stone-800 hover:text-pink-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("shop");
                }}
              >
                Shop
              </a>

              {/* Mobile Search Icon Toggle */}
              <button 
                className="flex md:hidden p-2 text-stone-800 hover:text-pink-500"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label="Toggle Search"
              >
                <SearchIcon size={22} />
              </button>

              {/* User / Rewards Icon */}
              {user && (
                <button
                  className="group/pts h-[34px] md:h-[38px] flex items-center gap-2 pl-3 md:pl-4 pr-1 bg-white border border-stone-100 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                  onClick={() => onNavigate("rewards")}
                  title="Reward Points"
                >
                  <span className="text-[13px] md:text-[15px] font-black text-stone-800 tabular-nums tracking-tight">
                    ₹{(user.rewardPoints || 0).toLocaleString()}
                  </span>
                  <div className="relative w-6 h-6 md:w-7 md:h-7 bg-[#ff4fa3] rounded-[6px] md:rounded-[8px] flex items-center justify-center transform -rotate-6 shadow-md group-hover/pts:rotate-0 transition-all duration-300">
                    <span className="text-white text-[12px] md:text-[14px] font-black italic">₹</span>
                  </div>
                </button>
              )}

              <div className="flex items-center gap-2 md:gap-4">
                {/* Wishlist Icon */}
                <button
                  className="hidden md:block p-1 relative group"
                  onClick={() => onNavigate("wishlist")}
                  aria-label="Wishlist"
                >
                  <img className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" src={favIcon} alt="" />
                  {wishlistCount > 0 && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#ff4fa3] text-white text-[9px] font-black rounded-[2px] flex items-center justify-center border-2 border-white pointer-events-none">
                      {wishlistCount}
                    </div>
                  )}
                </button>

                {/* Account / Login - Desktop Label */}
                <div className="relative">
                  <button
                    className="p-1 group flex items-center gap-2"
                    aria-label="Account"
                    onClick={() =>
                      user ? setShowProfileMenu(!showProfileMenu) : onOpenAuth()
                    }
                  >
                    <img className="w-6 h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform" src={accountIcon} alt="" />
                    {user && (
                      <span className="hidden md:block text-xs font-bold text-stone-700 max-w-[80px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {user && showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-stone-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-stone-50 bg-stone-50/50">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                          <p className="text-sm font-black text-stone-800 truncate">{user.name}</p>
                        </div>

                        <div className="p-1">
                          <button
                            onClick={() => { onNavigate("account"); setShowProfileMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors font-bold"
                          >
                            My Orders
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors font-bold"
                            onClick={() => { onNavigate("admin"); setShowProfileMenu(false); }}
                          >
                            Admin Dashboard
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors font-bold"
                            onClick={() => { onNavigate("vendor-dashboard"); setShowProfileMenu(false); }}
                          >
                            Vendor Dashboard
                          </button>
                          <div className="h-px bg-stone-100 my-1 mx-2" />
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-black"
                            onClick={() => { logout(); setShowProfileMenu(false); }}
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Cart Icon */}
                <button
                  className="p-1 relative group"
                  onClick={onToggleCart}
                  aria-label="Cart"
                >
                  <img className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" src={cartIcon} alt="" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-[2px] font-bold border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* --- MOBILE SEARCH OVERLAY --- */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden w-full bg-white border-b border-stone-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/30 focus-within:bg-white focus-within:border-pink-500 transition-all relative">
                    <SearchIcon size={18} className="text-pink-400" />
                    <div className="relative w-full">
                      {!localQuery && <SearchPlaceholder searchTerms={searchTerms} />}
                      <input
                        autoFocus
                        className="border-none outline-none w-full text-base bg-transparent text-stone-800 placeholder-transparent relative z-10"
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && localQuery.trim()) {
                            onNavigate(`shop?q=${encodeURIComponent(localQuery.trim())}`);
                            setIsMobileSearchOpen(false);
                          }
                        }}
                        placeholder=""
                      />
                    </div>
                    {localQuery && (
                      <button onClick={() => setLocalQuery("")} className="text-stone-400">
                        <CloseIcon size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      {/* --- MOBILE DRAWER MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-100 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-stone-50">
                <div className="flex items-center gap-2">
                  <span className="bg-linear-to-r from-[#ff4fa3] to-[#ff77c8] bg-clip-text text-transparent font-black text-2xl tracking-tight">OMW</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-6 py-2">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[2px] mb-4">Explore</p>
                  <nav className="space-y-4">
                    <button 
                      onClick={() => { onNavigate("shop"); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between text-xl font-black text-stone-800 hover:text-pink-500 transition-colors"
                    >
                      Shop All <ChevronRight size={20} className="text-stone-300" />
                    </button>
                    <button 
                      onClick={() => { onNavigate("new-arrivals"); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between text-xl font-black text-stone-800 hover:text-pink-500 transition-colors"
                    >
                      New Arrivals <ChevronRight size={20} className="text-stone-300" />
                    </button>
                    <button 
                      onClick={() => { onNavigate("best-sellers"); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between text-xl font-black text-stone-800 hover:text-pink-500 transition-colors"
                    >
                      Best Sellers <ChevronRight size={20} className="text-stone-300" />
                    </button>
                    <button 
                      onClick={() => { onNavigate("categories"); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between text-xl font-black text-stone-800 hover:text-pink-500 transition-colors"
                    >
                      Categories <ChevronRight size={20} className="text-stone-300" />
                    </button>
                  </nav>
                </div>

                <div className="h-px bg-stone-100 my-6 mx-6" />

                <div className="px-6 py-2">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[2px] mb-4">Personal</p>
                  <nav className="space-y-4">
                    <button 
                      onClick={() => { onNavigate("rewards"); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 text-lg font-bold text-stone-700"
                    >
                      <Gift size={20} className="text-pink-500" /> Rewards Wallet
                    </button>
                    <button 
                      onClick={() => { onNavigate("wishlist"); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 text-lg font-bold text-stone-700"
                    >
                      <Heart size={20} className="text-pink-500" /> my Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    </button>
                    <button 
                      onClick={() => { onNavigate("account"); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 text-lg font-bold text-stone-700"
                    >
                      <User size={20} className="text-stone-400" /> Account Settings
                    </button>
                  </nav>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 bg-stone-50 border-t border-stone-100">
                {user ? (
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all"
                  >
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                    className="w-full py-4 bg-[#1b1b1b] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-stone-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Login / Sign up <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    {location.pathname === "/" && (
      <nav
        className="border-b border-stone-100 bg-white relative overflow-x-auto no-scrollbar py-3 md:py-4 scroll-smooth"
        aria-label="Primary categories"
      >
        <div className="flex items-center gap-6 md:gap-12 px-4 md:px-10 w-max min-w-full justify-center">
          {categories.map((c) => {
            const isDirectLink = ["New Arrivals", "Best Sellers"].includes(c.title);
            const targetView = c.title === "New Arrivals" ? "new-arrivals" : "best-sellers";

            return (
              <div key={c.key} className="flex-none">
                <a
                  className="flex flex-col items-center gap-2.5 md:gap-3 text-stone-900 cursor-pointer hover:text-pink-500 transition-all group"
                  href={isDirectLink ? `#${targetView}` : "#"}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isDirectLink) {
                      onNavigate(targetView);
                    } else {
                      onNavigate(`category/${c.title}`);
                    }
                  }}
                >
                  <div className="w-[100px] h-[80px] md:w-[140px] md:h-[110px] rounded-[24px] md:rounded-[32px] overflow-hidden border border-stone-50 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 optimize-gpu shrink-0">
                    <img
                      src={c.image || CATEGORY_IMAGES[c.title] || categorySphere}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-[10px] md:text-[12px] uppercase tracking-[0.05em] text-center whitespace-nowrap">
                    {c.title}
                    {!isDirectLink && (
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 opacity-60 group-hover:rotate-180 transition-transform duration-300">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </nav>
    )}
    </>
  );
});

export default Navbar;
