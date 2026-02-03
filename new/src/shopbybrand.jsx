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

const BRANDS = [
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

export default function ShopByBrand() {
  return (
    <section className="pt-[50px] pb-[60px] rounded-[24px] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.7),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.6),transparent_55%),linear-gradient(180deg,rgba(235,215,255,0.55),rgba(255,225,243,0.45))]">
      <div className="w-full px-0 sm:px-[10px]">
        <div className="text-center">
          <h2 className="m-0 text-[28px] font-bold">SHOP BY BRAND</h2>
          <p className="mt-2 text-[#7a6b86] text-base tracking-[0.2px] italic">Explore best-loved brands and new beauty breakthroughs</p>
        </div>

        <div className="mt-4 flex flex-col gap-[50px]">
          <InfiniteSlider gap={40} duration={40}>
            {BRANDS.slice(0, 17).map((brand, idx) => (
              <div
                key={`r1-${brand.name}-${idx}`}
                className="group w-[270px] h-[140px] p-2 flex items-center justify-center rounded-[10px] bg-white/65 border border-white/80 shadow-[0_10px_22px_rgba(0,0,0,0.08)] snap-center transition-transform duration-300 ease-out overflow-hidden hover:scale-105 hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)] hover:border-white hover:bg-white hover:z-10 shrink-0"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain grayscale opacity-70 transition-all duration-300 ease-out group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>
            ))}
          </InfiniteSlider>

          <InfiniteSlider gap={40} duration={45} reverse>
            {BRANDS.slice(17).map((brand, idx) => (
              <div
                key={`r2-${brand.name}-${idx}`}
                className="group w-[270px] h-[140px] p-2 flex items-center justify-center rounded-[10px] bg-white/65 border border-white/80 shadow-[0_10px_22px_rgba(0,0,0,0.08)] snap-center transition-transform duration-300 ease-out overflow-hidden hover:scale-105 hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)] hover:border-white hover:bg-white hover:z-10 shrink-0"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain grayscale opacity-70 transition-all duration-300 ease-out group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}
