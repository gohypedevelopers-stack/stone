import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import searchIcon from "./assets/search.png";
import locationIcon from "./assets/location.png";
import discountIcon from "./assets/sale_16767126.gif";
import favIcon from "./assets/favourite.png";
import accountIcon from "./assets/user-account.png";
import cartIcon from "./assets/shopping-cart.png";



import AddressModal from "./components/AddressModal";
import AnnouncementBar from "./components/AnnouncementBar";


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

export default function Navbar({ categories, query, onQueryChange, cartCount, onToggleCart, onNavigate, wishlistCount, onToggleWishlist, onOpenAuth }) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchTerms = [
    "B.b cream", "Blender", "Blush", "Brush", "Cleanser", "cleansing oil", "compact powders",
    "Concealer", "Cushion foundation", "Essence", "Exfoliate", "Eye cream", "Face mists",
    "Foundation", "Hair set", "International makeup", "International skincare", "Japanese Skincare",
    "Korean skincare", "Lip blam", "Lipstick", "Makeup remover", "Mascara", "Moisturizer",
    "Primer", "Razor", "Serums", "Sheet masks", "SKIN1004", "Sunscreen", "Sunspray",
    "Sunstick", "toner", "toner pads", "Treatment mask"
  ];

  return (
    <>
      <AnnouncementBar />
      <header className="header">
        <div className="w-full flex items-center justify-between py-2 px-6 border-b border-stone-100">
          {/* Left Block: Logo */}
          <div className="flex-1">
            <a className="flex items-center gap-3 leading-none w-fit" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
              <img className="w-12 h-12 object-contain" src={logo} alt="omwskincare logo" />
              <div className="flex flex-col justify-center">
                <span className="bg-linear-to-r from-[#ff4fa3] to-[#ff77c8] bg-clip-text text-transparent font-black text-2xl tracking-tight">OMW</span>
                <span className="text-[9px] text-stone-400 tracking-[1.5px] uppercase font-bold">skin-first essentials</span>
              </div>
            </a>
          </div>

          {/* Center Block: Search Bar */}
          <div className="flex-[4] flex justify-center px-2">
            <div className="w-full flex items-center gap-3 px-5 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 hover:shadow-sm transition-all relative">
              <span className="w-5 h-5 grid place-items-center opacity-70" aria-hidden="true">
                <img className="w-full h-full object-contain" src={searchIcon} alt="" />
              </span>
              <div className="relative w-full">
                {!query && <SearchPlaceholder searchTerms={searchTerms} />}
                <input
                  className="border-none outline-none w-full text-sm bg-transparent text-stone-800 placeholder-transparent relative z-10"
                  value={query}
                  onChange={onQueryChange}
                  placeholder=""
                  aria-label="Search products"
                />
              </div>
            </div>
          </div>

          {/* Right Block: Actions */}
          <div className="flex-1 flex items-center justify-end gap-5">
            <a href="#" className="text-sm font-black text-stone-800 hover:text-pink-500 transition-colors" onClick={(e) => { e.preventDefault(); onNavigate('shop'); }}>
              Shop
            </a>

            <div className="flex items-center gap-2">
              <button className="p-2 relative group" onClick={onToggleWishlist} aria-label="Wishlist">
                <img className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" src={favIcon} alt="" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <button 
                  className="p-2 group flex items-center gap-2" 
                  aria-label="Account"
                  onClick={() => user ? setShowProfileMenu(!showProfileMenu) : onOpenAuth()}
                >
                  <img className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" src={accountIcon} alt="" />
                  {user && (
                    <span className="text-xs font-bold text-stone-700 max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                </button>

                {user && showProfileMenu && (
                  <div className="absolute top-[100%] right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-stone-50 mb-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-bold text-stone-800 truncate">{user.name}</p>
                    </div>
                    <button onClick={() => { onNavigate('account'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors font-medium">My Orders</button>
                    <button onClick={() => { onNavigate('account'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors font-medium">Rewards</button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors font-bold mt-2 pt-2 border-t border-stone-50"
                      onClick={() => {
                        onNavigate('admin');
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

              <button className="p-2 relative group" onClick={onToggleCart} aria-label="Cart">
                <img className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" src={cartIcon} alt="" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-stone-100">
              <button
                className="hover:scale-110 transition-transform"
                onClick={(e) => { e.preventDefault(); setIsAddressModalOpen(true); }}
                title="Change Location"
              >
                <img className="w-7 h-7 object-contain" src={locationIcon} alt="Location" />
              </button>
              <img className="w-10 h-10 object-contain animate-pulse" src={discountIcon} alt="Offers" />
            </div>
          </div>
        </div>

        <nav className="border-t border-b border-line-custom relative" aria-label="Primary categories">
          <div className="w-full py-[14px] flex gap-[28px] items-center px-[20px]">
            {categories.map((c) => {
              const isDirectLink = ["New Arrivals", "Best Sellers"].includes(c.title);

              if (isDirectLink) {
                const targetView = c.title === "New Arrivals" ? 'new-arrivals' : 'best-sellers';
                return (
                  <div key={c.key} className="static">
                    <a
                      className="flex flex-col items-center gap-[6px] text-text-custom font-[700] text-[15px] cursor-pointer hover:text-[#d1408e] transition-colors py-[0px]"
                      href={`#${targetView}`}
                      onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(targetView); }}
                    >
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden border border-gray-200 ">
                        <img src={c.image} alt={c.title} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span>{c.title}</span>
                    </a>
                  </div>
                );
              }

              return (
                <div key={c.key} className="group static">
                  <a
                    className="flex flex-col items-center gap-[6px] text-text-custom font-[700] text-[15px] cursor-pointer hover:text-[#d1408e] transition-colors py-[0px]"
                    href="#"
                  >
                    <div className="w-[60px] h-[60px] rounded-full overflow-hidden border border-gray-200 ">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="flex items-center gap-[4px]">
                      {c.title}
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-180 transition-transform duration-200">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </a>

                  {/* Mega Dropdown */}
                  <div className="absolute left-0 right-0 top-[100%] w-full bg-white border-b border-black/6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="max-w-[1240px] mx-auto p-[30px] grid grid-cols-[300px_1fr] gap-[40px]">
                      {/* Featured Image */}
                      <div>
                        <img src={c.image} alt="" className="w-full h-[180px] object-cover rounded-[12px] shadow-sm" />
                      </div>

                      {/* Description & Links */}
                      <div className="flex flex-col justify-center">
                        <h3 className="text-[24px] font-[800] mb-[8px]">{c.title}</h3>
                        <p className="text-muted-custom text-[15px] leading-[1.6] max-w-[400px] mb-[20px]">
                          {c.desc || "Explore our premium collection curated just for you. Find the best products to enhance your beauty routine."}
                        </p>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(`/category/${c.title}`); }}
                          className="text-[#d1408e] font-[700] text-[14px] flex items-center gap-[6px] hover:underline"
                        >
                          Shop {c.title}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}


          </div>
        </nav>
      </header>

      <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
    </>
  );
}
