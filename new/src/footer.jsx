import logo from "./assets/logo.png";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer({ supportPhone }) {
  return (
    <footer className="border-t border-line-custom pt-[28px] pb-[18px] px-[10px]">
      <div className="w-full grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-[14px]">
        <div>
          <div className="flex items-center gap-[10px]">
            <img className="w-[50px] h-[50px] object-contain" src={logo} alt="omwskincare logo" />
            <div className="bg-gradient-to-r from-[#ff4fa3] to-[#ff77c8] bg-clip-text text-transparent font-[800] text-[35px]">omw</div>
          </div>
          <p className="text-muted-custom">
            Curated skincare & cosmetics across Korean,<br /> Japanese and everyday essentials.
          </p>
          <div className="flex gap-[12px] mt-[20px]">
            <a href="#" className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-[#222] text-white text-[18px] transition-all duration-200 border border-white/5 hover:-translate-y-[3px] hover:bg-gradient-to-br hover:from-[#ff4fa3] hover:to-[#ff77c8] hover:shadow-[0_6px_16px_rgba(255,79,163,0.3)] hover:border-transparent" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-[#222] text-white text-[18px] transition-all duration-200 border border-white/5 hover:-translate-y-[3px] hover:bg-gradient-to-br hover:from-[#ff4fa3] hover:to-[#ff77c8] hover:shadow-[0_6px_16px_rgba(255,79,163,0.3)] hover:border-transparent" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-[#222] text-white text-[18px] transition-all duration-200 border border-white/5 hover:-translate-y-[3px] hover:bg-gradient-to-br hover:from-[#ff4fa3] hover:to-[#ff77c8] hover:shadow-[0_6px_16px_rgba(255,79,163,0.3)] hover:border-transparent" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>

        <div>
          <div className="font-[800] mb-[10px]">Shop</div>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Korean Skincare</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Japanese Skincare</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Sunscreens</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Serums</a>
        </div>

        <div>
          <div className="font-[800] mb-[10px]">Support</div>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href={`tel:${supportPhone}`}>{supportPhone}</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Order tracking</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Returns & refunds</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Shipping</a>
        </div>

        <div>
          <div className="font-[800] mb-[10px]">Account</div>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Login</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Wishlist</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Loyalty points</a>
          <a className="block text-muted-custom py-[6px] text-[13px] hover:text-text-custom hover:underline" href="#">Offers</a>
        </div>
      </div>

      <div className="w-full border-t border-line-custom mt-[16px] pt-[14px] flex justify-between gap-[10px] flex-wrap text-muted-custom">
        <span>© {new Date().getFullYear()} omwskincare</span>
        <span>Made for skincare lovers</span>
      </div>
    </footer>
  );
}
