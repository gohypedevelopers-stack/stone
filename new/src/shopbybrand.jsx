import React from "react";
import { useNavigate } from "react-router-dom";
import { InfiniteSlider } from "./components/ui/infinite-slider.jsx";

// Import Brand Logos
import loreal from "./assets/productlogo/brands/l-oreal-professionnel.svg";
import estee from "./assets/productlogo/brands/estee-lauder-2.svg";
import lancome from "./assets/productlogo/brands/lancome-logo-1.svg";
import dior from "./assets/productlogo/brands/dior-2.svg";
import chanel from "./assets/productlogo/brands/chanel-2.svg";
import cerave from "./assets/productlogo/brands/cerave-logo-brandlogos.net_33gnh8sqy.svg";
import maybelline from "./assets/productlogo/brands/maybelline-1.svg";
import mac from "./assets/productlogo/brands/mac-cosmetics-logo-brandlogos.net_lmgdfauhd.svg";
import clinique from "./assets/productlogo/brands/clinique.svg";
import lamer from "./assets/productlogo/brands/la-mer.svg";
import shiseido from "./assets/productlogo/brands/shiseido-logo.svg";
import nivea from "./assets/productlogo/brands/nivea-1.svg";
import garnier from "./assets/productlogo/brands/garnier-2.svg";
import dove from "./assets/productlogo/brands/dove.svg";
import fenty from "./assets/productlogo/brands/fenty-beauty.svg";
import rare from "./assets/productlogo/brands/rare-beauty-1.svg";
import charlotte from "./assets/productlogo/brands/charlotte-tilbury-cosmetics-logo-brandlogos.net_3iilit5vd.svg";
import ordinary from "./assets/productlogo/brands/the-ordinary-logo-brandlogos.net_izgih7s4y.svg";
import skinceuticals from "./assets/productlogo/brands/skinceuticals-logo-vector.svg";
import laroche from "./assets/productlogo/brands/la-roche-posay.svg";
import drunkelephant from "./assets/productlogo/brands/drunk-elephant-logo-brandlogos.net_nem6r4kz5.svg";
import glossier from "./assets/productlogo/brands/glossier-1.svg";
import augustinus from "./assets/productlogo/brands/augustinus-bader-logo-brandlogos.net_h5833ru6d.svg";
import elf from "./assets/productlogo/brands/e.l.f._Beauty-logo_brandlogos.net_a2b05a.svg";
import nyx from "./assets/productlogo/brands/nyx-cosmetics.svg";
import huda from "./assets/productlogo/brands/huda-1.svg";
import laneige from "./assets/productlogo/brands/laneige-logo-brandlogos.net_hveh22jp8.svg";
import lakme from "./assets/productlogo/brands/lakme-cosmetics-logo-brandlogos.net_d27qnapyn.svg";
import mamaearth from "./assets/productlogo/brands/688f0a84d390c-Mamaearth.svg";
import nykaa from "./assets/productlogo/brands/nykaa-1.svg";
import dotandkey from "./assets/productlogo/brands/Dot & Key_idmtCza6DA_1.png";
import minimalist from "./assets/productlogo/brands/Minimalistinc_idImyDscM9_0.jpeg";
// Placeholder/Fallback for potentially missing or misnamed files
import unknown1 from "./assets/productlogo/brands/1713911.svg";

export const BRANDS = [
  { name: "L'Oréal Paris", logo: loreal },
  { name: "Estée Lauder", logo: estee },
  { name: "Lancôme", logo: lancome },
  { name: "Dior", logo: dior },
  { name: "Chanel", logo: chanel },
  { name: "CeraVe", logo: cerave },
  { name: "Maybelline", logo: maybelline },
  { name: "MAC Cosmetics", logo: mac },
  { name: "Clinique", logo: clinique },
  { name: "La Mer", logo: lamer },
  { name: "Shiseido", logo: shiseido },
  { name: "Nivea", logo: nivea },
  { name: "Garnier", logo: garnier },
  { name: "Dove", logo: dove },
  { name: "Fenty Beauty", logo: fenty },
  { name: "Rare Beauty", logo: rare },
  { name: "Charlotte Tilbury", logo: charlotte },
  { name: "The Ordinary", logo: ordinary },
  { name: "SkinCeuticals", logo: skinceuticals },
  { name: "La Roche-Posay", logo: laroche },
  { name: "Tatcha", logo: unknown1 }, // Mapped to the numeric file
  { name: "Drunk Elephant", logo: drunkelephant },
  { name: "Glossier", logo: glossier },
  { name: "Augustinus Bader", logo: augustinus },
  { name: "e.l.f. Cosmetics", logo: elf },
  { name: "NYX Professional Makeup", logo: nyx },
  { name: "Huda Beauty", logo: huda },
  { name: "Sol de Janeiro", logo: unknown1 },
  { name: "Laneige", logo: laneige },
  { name: "Lakmé", logo: lakme },
  { name: "Mamaearth", logo: mamaearth },
  { name: "Sugar Cosmetics", logo: unknown1 },
  { name: "Nykaa Cosmetics", logo: nykaa },
  { name: "Dot & Key", logo: dotandkey },
  { name: "Minimalist", logo: minimalist },
];

export default React.memo(function ShopByBrand({ onSelectBrand, isAdmin, selectedBrands, title, maxItems, bgColor, hiddenBrands }) {
  const navigate = useNavigate();
  const [dbBrands, setDbBrands] = React.useState([]);
  const API_URL = "http://localhost:5000/api";
  const SERVER_URL = "http://localhost:5000";

  React.useEffect(() => {
    fetch(`${API_URL}/products/brands`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbBrands(data.data || []);
        }
      })
      .catch(err => console.error("Error fetching brands for slider:", err));
  }, []);

  const hidden = hiddenBrands || [];
  const rawBrands = (selectedBrands && selectedBrands.length > 0)
    ? selectedBrands.filter(b => !hidden.includes(typeof b === 'string' ? b : b.name))
        .map(b => typeof b === 'string' ? (BRANDS.find(x => x.name === b) || { name: b, logo: '' }) : b)
    : (dbBrands.length > 0 
        ? dbBrands.filter(name => !hidden.includes(name)).map(name => BRANDS.find(x => x.name === name) || { name, logo: '' })
        : BRANDS.filter(b => !hidden.includes(b.name))
      );

  const adminBrands = maxItems ? rawBrands.slice(0, maxItems) : rawBrands;


  return (
    <section 
      style={{ background: bgColor || undefined }}
      className={`section pt-[50px] pb-[60px] rounded-[24px] ${!bgColor ? 'bg-white' : ''}`}
    >
      <div className="w-full px-0 sm:px-[10px]">
        <div className="text-center">
          <h2 className="m-0 text-[28px] font-bold uppercase">{title || "SHOP BY BRAND"}</h2>
          <p className="mt-2 text-[#7a6b86] text-base tracking-[0.2px]">Explore best-loved brands and new beauty breakthroughs</p>
        </div>

        <div className="mt-4 flex flex-col gap-[50px]">
          {isAdmin ? (
            <div className="flex flex-col gap-3 px-4 w-full">
              {adminBrands.map((brand, idx) => (
                <div
                  key={`admin-${brand.name}-${idx}`}
                  onClick={() => onSelectBrand && onSelectBrand(brand.name)}
                  className="group w-full h-[70px] px-5 py-3 flex items-center gap-4 rounded-[14px] bg-white border border-stone-200 shadow-sm transition-all duration-300 ease-out overflow-hidden hover:shadow-md hover:border-indigo-100 cursor-pointer transform-gpu optimize-gpu"
                >
                  <div className="h-[50px] w-[80px] flex items-center justify-center shrink-0">
                    {brand.logo ? (
                      <img
                        src={brand.logo.startsWith('/uploads') ? `${SERVER_URL}${brand.logo}` : brand.logo}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="h-full w-full bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-300 text-[10px] font-bold uppercase" style={{ display: brand.logo ? 'none' : 'flex' }}>No Logo</div>
                  </div>

                  <span className="text-[12px] font-bold text-stone-700 tracking-wide">{brand.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <InfiniteSlider gap={40} duration={60}>
                {adminBrands.slice(0, Math.ceil(adminBrands.length / 2)).map((brand, idx) => (
                    <div
                      key={`r1-${brand.name}-${idx}`}
                      onClick={() => onSelectBrand && onSelectBrand(brand.name)}
                      className="group w-[270px] h-[140px] p-2 flex items-center justify-center rounded-[10px] bg-white/65 border border-white/80 shadow-sm snap-center transition-transform duration-300 ease-out overflow-hidden hover:scale-105 hover:shadow-md hover:border-white hover:bg-white hover:z-10 shrink-0 cursor-pointer transform-gpu optimize-gpu"
                    >
                      {brand.logo ? (
                        <img
                          src={brand.logo.startsWith('/uploads') ? `${SERVER_URL}${brand.logo}` : brand.logo}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain transition-all duration-300 ease-out optimize-gpu"
                          loading="lazy"
                        />
                    ) : (
                      <span className="text-sm font-bold text-zinc-400">{brand.name}</span>
                    )}
                  </div>
                ))}
              </InfiniteSlider>

              <InfiniteSlider gap={40} duration={70} reverse>
                {adminBrands.slice(Math.ceil(adminBrands.length / 2)).map((brand, idx) => (
                    <div
                      key={`r2-${brand.name}-${idx}`}
                      onClick={() => onSelectBrand && onSelectBrand(brand.name)}
                      className="group w-[270px] h-[140px] p-2 flex items-center justify-center rounded-[10px] bg-white/65 border border-white/80 shadow-sm snap-center transition-transform duration-300 ease-out overflow-hidden hover:scale-105 hover:shadow-md hover:border-white hover:bg-white hover:z-10 shrink-0 cursor-pointer transform-gpu optimize-gpu"
                    >
                      {brand.logo ? (
                        <img
                          src={brand.logo.startsWith('/uploads') ? `${SERVER_URL}${brand.logo}` : brand.logo}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain transition-all duration-300 ease-out optimize-gpu"
                          loading="lazy"
                        />
                    ) : (
                      <span className="text-sm font-bold text-zinc-400">{brand.name}</span>
                    )}
                  </div>
                ))}
              </InfiniteSlider>
            </>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/brands")}
            className="px-8 py-3 rounded-full bg-[#151515] text-white font-black text-sm uppercase tracking-widest hover:bg-pink-600 hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            View All Brands
          </button>
        </div>
      </div>
    </section>
  );
});
