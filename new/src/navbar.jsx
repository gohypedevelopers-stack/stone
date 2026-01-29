import logo from "./assets/logo.png";

export default function Navbar({ categories, query, onQueryChange, cartCount, onToggleCart }) {
  return (
    <header className="header">
      <div className="container headerRow">
        <button className="iconBtn" aria-label="Open menu">
          {"\u2261"}
        </button>

        <a className="brand" href="#">
          <img className="brandLogo" src={logo} alt="omwskincare logo" />
          <div className="brandText">
            <span className="brandName">omwskincare</span>
            <span className="brandTag">skin-first essentials</span>
          </div>
        </a>

        <div className="headerActions">
          <div className="searchWrap">
            <input
              className="search"
              value={query}
              onChange={onQueryChange}
              placeholder="Search serums, sunscreen, K-beauty..."
              aria-label="Search products"
            />
            <span className="searchIcon" aria-hidden="true">
              {"\u{1F50D}"}
            </span>
          </div>

          <button className="iconBtn" aria-label="Wishlist">
            {"\u2661"}
          </button>
          <button className="iconBtn" aria-label="Account">
            {"\u{1F464}"}
          </button>

          <button className="cartBtn" onClick={onToggleCart} aria-label="Cart">
            {"\u{1F6D2}"}
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
          <a className="catOffer" href="#">
            Offers
          </a>
        </div>
      </nav>
    </header>
  );
}




