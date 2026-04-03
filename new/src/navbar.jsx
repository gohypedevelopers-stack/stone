import React, { useState, useEffect, memo } from "react";
import { useLocation } from "react-router-dom";
import logo from "./assets/logo.png";
import searchIcon from "./assets/search.png";

import favIcon from "./assets/favourite.png";
import accountIcon from "./assets/user-account.png";
import cartIcon from "./assets/shopping-cart.png";

import AnnouncementBar from "./components/AnnouncementBar";
import { CATEGORY_IMAGES, categorySphere } from "./bycategory";

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
  query,
  onQueryChange,
  cartCount,
  onToggleCart,
  onNavigate,
  wishlistCount,
  onToggleWishlist,
  onOpenAuth,
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
      <div className="sticky top-0 z-50 w-full bg-white">
        <AnnouncementBar />
      <header className="header">
        <div className="w-full flex items-center justify-between py-2 px-8 border-b border-stone-100">
          {/* Left Block: Logo */}
          <div className="flex-1">
            <a
              className="flex items-center gap-3 leading-none w-fit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("home");
              }}
            >
              <img
                className="w-12 h-12 object-contain"
                src={logo}
                alt="omwskincare logo"
              />
              <div className="flex flex-col justify-center">
                <span className="bg-linear-to-r from-[#ff4fa3] to-[#ff77c8] bg-clip-text text-transparent font-black text-2xl tracking-tight">
                  OMW
                </span>
                <span className="text-[9px] text-stone-400 tracking-[1.5px] uppercase font-bold">
                  skin-first essentials
                </span>
              </div>
            </a>
          </div>

          {/* Center Block: Search Bar */}
          <div className="flex-1 max-w-xl flex justify-center px-4">
            <div className="w-full flex items-center gap-3 px-5 py-2.5 rounded-[2px] border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 hover:shadow-sm transition-all relative">
              <span
                className="w-5 h-5 grid place-items-center opacity-70"
                aria-hidden="true"
              >
                <img
                  className="w-full h-full object-contain"
                  src={searchIcon}
                  alt=""
                />
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

          {/* Right Block: Actions */}
          <div className="flex-1 flex items-center justify-end gap-6">
            <a
              href="#"
              className="text-sm font-black text-stone-800 hover:text-pink-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("shop");
              }}
            >
              Shop
            </a>

            {user && (
              <button
                className="group/pts h-[38px] flex items-center gap-2.5 pl-4 pr-1.5 bg-white border border-stone-100 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:border-pink-100 transition-all active:scale-95"
                onClick={() => onNavigate("rewards")}
                title="Reward Points"
              >
                <span className="text-[15px] font-black text-stone-800 tabular-nums tracking-tight">
                  ₹{(user.rewardPoints || 0).toLocaleString()}
                </span>
                <div className="relative w-7 h-7 bg-[#ff4fa3] rounded-[8px] flex items-center justify-center transform rotate-[-6deg] shadow-[0_3px_8px_rgba(255,79,163,0.3)] group-hover/pts:rotate-0 group-hover/pts:scale-110 transition-all duration-300">
                  <span className="text-white text-[14px] font-black italic select-none">₹</span>
                  {/* Glass highlight */}
                  <div className="absolute top-0 left-0 w-full h-[40%] bg-white/20 rounded-t-[8px]" />
                </div>
              </button>
            )}

            <div className="flex items-center gap-4">
              <button
                className="p-1 relative group"
                onClick={onToggleWishlist}
                aria-label="Wishlist"
              >
                <img
                  className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                  src={favIcon}
                  alt=""
                />
                {wishlistCount > 0 && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-linear-to-r from-[#ff4fa3] to-[#ff77c8] text-white text-[9px] font-black rounded-[2px] flex items-center justify-center border-2 border-white pointer-events-none">
                    {wishlistCount}
                  </div>
                )}
              </button>

              <div className="relative">
                <button
                  className="p-1 group flex items-center gap-2"
                  aria-label="Account"
                  onClick={() =>
                    user ? setShowProfileMenu(!showProfileMenu) : onOpenAuth()
                  }
                >
                  <img
                    className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                    src={accountIcon}
                    alt=""
                  />
                  {user && (
                    <span className="text-xs font-bold text-stone-700 max-w-[80px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  )}
                </button>

                {user && showProfileMenu && (
                  <div className="absolute top-[100%] right-0 mt-2 w-48 bg-white rounded-[2px] shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-stone-50 mb-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-stone-800 truncate">
                        {user.name}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate("account");
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors font-medium"
                    >
                      My Orders
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors font-bold mt-2 pt-2 border-t border-stone-50"
                      onClick={() => {
                        onNavigate("admin");
                        setShowProfileMenu(false);
                      }}
                    >
                      Admin Dashboard
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold mt-2 pt-2 border-t border-stone-100"
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                className="p-1 relative group"
                onClick={onToggleCart}
                aria-label="Cart"
              >
                <img
                  className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                  src={cartIcon}
                  alt=""
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-[2px] font-bold border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>

    {location.pathname === "/" && (
      <nav
        className="border-b border-stone-100 bg-white relative overflow-x-auto no-scrollbar"
        aria-label="Primary categories"
      >
            <div className="w-fit mx-auto py-6 flex gap-8 items-center px-10">
              {categories.map((c) => {
                const isDirectLink = ["New Arrivals", "Best Sellers"].includes(
                  c.title,
                );

                if (isDirectLink) {
                  const targetView =
                    c.title === "New Arrivals"
                      ? "new-arrivals"
                      : "best-sellers";
                  return (
                    <div key={c.key} className="static">
                      <a
                        className="flex flex-col items-center gap-3 text-stone-900 font-extrabold text-[13px] cursor-pointer hover:text-pink-500 transition-all group"
                        href={`#${targetView}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate && onNavigate(targetView);
                        }}
                      >
                        <div className="w-[140px] h-[110px] rounded-[28px] overflow-hidden border border-stone-100 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 optimize-gpu">
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 optimize-gpu"
                          />
                        </div>
                        <span className="uppercase tracking-widest">
                          {c.title}
                        </span>
                      </a>
                    </div>
                  );
                }

                return (
                  <div key={c.key} className="group static">
                    <a
                      className="flex flex-col items-center gap-3 text-stone-900 font-extrabold text-[13px] cursor-pointer hover:text-pink-500 transition-all group"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate && onNavigate(`category/${c.title}`);
                      }}
                    >
                      <div className="w-[140px] h-[110px] rounded-[28px] overflow-hidden border border-stone-100 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 optimize-gpu">
                        <img
                          src={
                            c.image ||
                            CATEGORY_IMAGES[c.title] ||
                            categorySphere
                          }
                          alt={c.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 optimize-gpu"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 uppercase tracking-widest">
                        {c.title}
                        <svg
                          width="10"
                          height="6"
                          viewBox="0 0 10 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="group-hover:rotate-180 transition-transform duration-200"
                        >
                          <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
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
