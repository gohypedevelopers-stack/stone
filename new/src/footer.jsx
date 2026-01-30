import logo from "./assets/logo.png";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer({ supportPhone }) {
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div>
          <div className="footerBrandRow">
            <img className="footerLogo" src={logo} alt="omwskincare logo" />
            <div className="footerBrand">omw</div>
          </div>
          <p className="muted">
            Curated skincare & cosmetics across Korean,<br /> Japanese and everyday essentials.
          </p>
          <div className="socialRow">
            <a href="#" className="socialIcon" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="socialIcon" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="socialIcon" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>

        <div>
          <div className="footerTitle">Shop</div>
          <a className="footerLink" href="#">Korean Skincare</a>
          <a className="footerLink" href="#">Japanese Skincare</a>
          <a className="footerLink" href="#">Sunscreens</a>
          <a className="footerLink" href="#">Serums</a>
        </div>

        <div>
          <div className="footerTitle">Support</div>
          <a className="footerLink" href={`tel:${supportPhone}`}>{supportPhone}</a>
          <a className="footerLink" href="#">Order tracking</a>
          <a className="footerLink" href="#">Returns & refunds</a>
          <a className="footerLink" href="#">Shipping</a>
        </div>

        <div>
          <div className="footerTitle">Account</div>
          <a className="footerLink" href="#">Login</a>
          <a className="footerLink" href="#">Wishlist</a>
          <a className="footerLink" href="#">Loyalty points</a>
          <a className="footerLink" href="#">Offers</a>
        </div>
      </div>

      <div className="container footerBottom">
        <span className="muted">Â© {new Date().getFullYear()} omwskincare</span>
        <span className="muted">Made for skincare lovers</span>
      </div>
    </footer >
  );
}
