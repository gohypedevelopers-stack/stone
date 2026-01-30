import { useEffect, useState } from "react";
import logo from "./assets/logo.png";
import searchIcon from "./assets/search.png";
import discountIcon from "./assets/sale_16767126.gif";
import locationIcon from "./assets/location.png";
import favIcon from "./assets/favourite.png";
import accountIcon from "./assets/user-account.png";
import cartIcon from "./assets/shopping-cart.png";

const PLACEHOLDERS = [
  "Sunscreen",
  "Serums",
  "Moisturizer",
  "Lipstick",
  "Face Mists",
  "Exfoliate",
  "Concealer",
  "Cleanser",
  "Blender",
  "Blush",
];

export default function Navbar({ categories, query, onQueryChange, cartCount, onToggleCart, onNavigate }) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="header">
      <div className="w-full flex items-center justify-between gap-[14px] py-[6px] px-[10px]">
        <a className="flex items-center gap-[10px] leading-[1.05] mr-auto" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
          <img className="w-[60px] h-[60px] object-contain" src={logo} alt="omwskincare logo" />
          <div className="flex flex-col justify-center">
            <span className="bg-gradient-to-r from-[#ff4fa3] to-[#ff77c8] bg-clip-text text-transparent font-[800] text-[35px]">omw</span>
            <span className="text-[11px] text-muted-custom tracking-[1.2px] uppercase mt-[4px]">skin-first essentials</span>
          </div>
        </a>

        <div className="flex items-center gap-[8px] ml-auto">
          <a href="#" className="mr-[15px] font-bold" onClick={(e) => { e.preventDefault(); onNavigate('shop'); }}>
            Shop
          </a>

          <button className="border border-line-custom bg-white h-[40px] w-[40px] rounded-[999px] grid place-items-center cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]" aria-label="Wishlist">
            <img className="w-[30px] h-[30px] object-contain block" src={favIcon} alt="" />
          </button>
          <button className="border border-line-custom bg-white h-[40px] w-[40px] rounded-[999px] grid place-items-center cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]" aria-label="Account">
            <img className="w-[30px] h-[30px] object-contain block" src={accountIcon} alt="" />
          </button>

          <button className="relative border border-line-custom bg-white h-[40px] w-[44px] rounded-[999px] grid place-items-center cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]" onClick={onToggleCart} aria-label="Cart">
            <img className="w-[30px] h-[30px] object-contain block" src={cartIcon} alt="" />
            {cartCount > 0 && <span className="absolute -top-[6px] -right-[6px] bg-[#151515] text-white text-[11px] px-[6px] py-[3px] rounded-[999px]">{cartCount}</span>}
          </button>
        </div>
      </div>

      <nav className="border-t border-b border-line-custom" aria-label="Primary categories">
        <div className="w-full py-[8px] flex gap-[12px] items-center overflow-auto no-scrollbar px-[10px]">
          {categories.map((c) => (
            <a key={c.key} className="flex flex-col items-center gap-[2px] min-w-[70px] text-text-custom" href="#">
              <img className="w-[50px] h-[50px] rounded-full border border-black/6 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent_60%),linear-gradient(135deg,rgba(180,140,255,0.55),rgba(255,193,219,0.6))] shadow-[0_10px_22px_rgba(0,0,0,0.12)] object-cover" src={c.image} alt="" />
              <span className="text-[12px] text-text-custom whitespace-nowrap">{c.title}</span>
            </a>
          ))}
          <div className="ml-auto mr-[11px] flex items-center gap-[10px] px-[12px] py-[12px] rounded-[999px] border border-black/14 bg-white min-w-[340px] shadow-[0_8px_18px_rgba(0,0,0,0.06)] relative">
            <span className="w-[28px] h-[28px] rounded-[999px] grid place-items-center bg-[rgba(255,89,184,0.12)] text-[#ff59b8] text-[14px]" aria-hidden="true">
              <img className="w-[30px] h-[30px] object-contain block" src={searchIcon} alt="" />
            </span>
            <input
              className="border-none outline-none w-full text-[15px] bg-transparent text-text-custom placeholder-shown:opacity-100 peer"
              value={query}
              onChange={onQueryChange}
              placeholder=" "
              aria-label="Search products"
            />
            <span className="absolute left-[50px] top-1/2 -translate-y-1/2 flex gap-[11px] text-[15px] pointer-events-none transition-opacity duration-150 peer-not-placeholder-shown:opacity-0" aria-hidden="true">
              <span className="text-[#8e8e8e] font-normal">Search for</span>
              <span className="text-[#d1408e] font-bold">{PLACEHOLDERS[placeholderIndex]}</span>
            </span>
          </div>
          <div className="ml-0 inline-flex items-center gap-[8px]">
            <img className="w-[55px] h-[40px] object-contain block" src={locationIcon} alt="" />
            <a className="ml-0 self-center inline-flex items-center gap-[8px] px-[12px] py-[4px] rounded-[999px] border border-black/8 bg-white text-text-custom text-[16px] font-[700] whitespace-nowrap" href="#">
              <img className="w-[40px] h-[40px] object-contain block" src={discountIcon} alt="" />
              Offers
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
