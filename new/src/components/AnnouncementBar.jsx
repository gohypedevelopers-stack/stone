import { motion } from "framer-motion";

const offers = [
  "✨ FREE Travel Size Mini on all orders above ₹999! ✨",
  "🚚 FREE Delivery on orders over ₹1499! 🚚",
  "💖 Get Flat 15% OFF on your first purchase! Use code: OMW15 💖",
  "🌟 New Arrivals from SKIN1004 & TIRTIR now live! 🌟"
];

const AnnouncementBar = () => {
  return (
    <div className="w-full bg-[#ff4fa3] overflow-hidden py-2 select-none relative h-[36px] flex items-center">
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: fit-content;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="animate-marquee whitespace-nowrap">
        {/* Render offers multiple times for a truly seamless loop */}
        {[...offers, ...offers, ...offers, ...offers, ...offers, ...offers, ...offers, ...offers].map((offer, index) => (
          <span
            key={index}
            className="text-white text-[13px] font-bold tracking-wide uppercase flex items-center gap-2 px-10"
          >
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
