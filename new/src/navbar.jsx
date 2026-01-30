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
      <div className="container headerRow">


        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
          <img className="brandLogo" src={logo} alt="omwskincare logo" />
          <div className="brandText">
            <span className="brandName">omw</span>
            <span className="brandTag">skin-first essentials</span>
          </div>
        </a>

        <div className="headerActions">

          <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); onNavigate('shop'); }} style={{ marginRight: '15px', fontWeight: 'bold' }}>
            Shop
          </a>

          <button className="iconBtn" aria-label="Wishlist">
            <img className="iconImg" src={favIcon} alt="" />
          </button>
          <button className="iconBtn" aria-label="Account">
            <img className="iconImg" src={accountIcon} alt="" />
          </button>

          <button className="cartBtn" onClick={onToggleCart} aria-label="Cart">
            <img className="iconImg" src={cartIcon} alt="" />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      <nav className="catbar" aria-label="Primary categories">
        <div className="container catbarInner">
          {categories.map((c) => (
            <a key={c.key} className="catItem" href="#">
              <img className="catThumb" src={c.image} alt="" style={{ objectFit: "cover" }} />
              <span className="catLabel">{c.title}</span>
            </a>
          ))}
          <div className="catSearch">
            <span className="catSearchIcon" aria-hidden="true">
              <img className="catSearchIconImg" src={searchIcon} alt="" />
            </span>
            <input
              className="catSearchInput"
              value={query}
              onChange={onQueryChange}
              placeholder=" "
              aria-label="Search products"
            />
            <span className="catSearchHint" aria-hidden="true">
              <span className="catSearchHintPrefix">Search for</span>
              <span className="catSearchHintValue">{PLACEHOLDERS[placeholderIndex]}</span>
            </span>
          </div>
          <div className="catOfferWrap">
            <img className="catOfferOuterIcon" src={locationIcon} alt="" />
            <a className="catOffer" href="#">
              <img className="catOfferIcon" src={discountIcon} alt="" />
              Offers
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
