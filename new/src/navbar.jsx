import { useState } from "react";
import logo from "./assets/logo.png";
import searchIcon from "./assets/search.png";
import discountIcon from "./assets/sale_16767126.gif";
import favIcon from "./assets/favourite.png";
import accountIcon from "./assets/user-account.png";
import cartIcon from "./assets/shopping-cart.png";



export default function Navbar({ categories, query, onQueryChange, cartCount, onToggleCart, onNavigate }) {

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

      <nav className="border-t border-b border-line-custom relative" aria-label="Primary categories">
        <div className="w-full py-[14px] flex gap-[28px] items-center px-[20px]">
          {categories.map((c) => {
            const isDirectLink = ["New Arrivals", "Best Sellers"].includes(c.title);

            if (isDirectLink) {
              const targetView = c.title === "New Arrivals" ? 'new-arrivals' : 'best-sellers';
              return (
                <div key={c.key} className="static">
                  <a
                    className="flex items-center gap-[6px] text-text-custom font-[700] text-[15px] cursor-pointer hover:text-[#d1408e] transition-colors py-[4px]"
                    href={`#${targetView}`}
                    onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(targetView); }}
                  >
                    {c.title}
                  </a>
                </div>
              );
            }

            return (
              <div key={c.key} className="group static">
                <a
                  className="flex items-center gap-[6px] text-text-custom font-[700] text-[15px] cursor-pointer hover:text-[#d1408e] transition-colors py-[4px]"
                  href="#"
                >
                  {c.title}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-180 transition-transform duration-200">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
                      <a href="#" className="text-[#d1408e] font-[700] text-[14px] flex items-center gap-[6px] hover:underline">
                        Shop {c.title}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="ml-auto flex items-center gap-[10px] px-[12px] py-[8px] rounded-[999px] border border-black/14 bg-white min-w-[300px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] relative">
            <span className="w-[24px] h-[24px] rounded-[999px] grid place-items-center text-[#888]" aria-hidden="true">
              <img className="w-[20px] h-[20px] object-contain block opacity-60" src={searchIcon} alt="" />
            </span>
            <input
              className="border-none outline-none w-full text-[14px] bg-transparent text-text-custom placeholder-shown:opacity-100 peer"
              value={query}
              onChange={onQueryChange}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </div>

          <div className="ml-0 inline-flex items-center gap-[8px]">
            <a className="ml-0 self-center inline-flex items-center gap-[8px] text-text-custom text-[15px] font-[700] whitespace-nowrap hover:text-[#d1408e] transition-colors" href="#">
              <img className="w-[24px] h-[24px] object-contain block" src={discountIcon} alt="" />
              Offers
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
