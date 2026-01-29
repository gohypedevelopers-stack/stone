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

export default function Navbar({ categories, query, onQueryChange, cartCount, onToggleCart }) {
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
        

        <a className="brand" href="#">
          <img className="brandLogo" src={logo} alt="omwskincare logo" />
          <div className="brandText">
            <span className="brandName">omw</span>
            <span className="brandTag">skin-first essentials</span>
          </div>
        </a>

        <div className="headerActions">
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
              <span className="catThumb" aria-hidden="true" />
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
              placeholder={`Search for ${PLACEHOLDERS[placeholderIndex]}`}
              aria-label="Search products"
            />
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
