import { useState } from "react";

const OFFERS = [
    {
        id: "flat20",
        label: "Flat 20% Off",
        sub: "On orders above ₹999",
        badge: "Hot",
        gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        link: "flat-20",
    },
    {
        id: "bogo",
        label: "Buy 1 Get 1",
        sub: "Select serums only",
        badge: "Ends Today",
        gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
        link: "bogo",
    },
    {
        id: "under499",
        label: "Under ₹499",
        sub: "Budget friendly picks",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        link: "under-499",
    },
    {
        id: "combo",
        label: "Combo Deals",
        sub: "routine bundles",
        badge: "Value",
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        link: "combo-deals",
    },
    {
        id: "freegift",
        label: "Free Gifts",
        sub: "With all orders ₹1500+",
        badge: "Limited",
        gradient: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
        link: "free-gifts",
    },
    {
        id: "clearance",
        label: "Clearance",
        sub: "Up to 50% off",
        gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        link: "clearance",
    },
    {
        id: "newuser",
        label: "New User Offer",
        sub: "Extra 10% off first order",
        badge: "New",
        gradient: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
        link: "new-user",
    },
    {
        id: "weekend",
        label: "Weekend Specials",
        sub: "Flash sale live now",
        gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        link: "weekend-specials",
    },
    {
        id: "limited",
        label: "Limited Time",
        sub: "Grab before it's gone",
        badge: "Urgent",
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        link: "limited-time",
    },
];

const FEATURED = {
    id: "mega",
    label: "Mega Sale — Up to 60% Off",
    sub: "Shop Deals",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    link: "mega-sale",
};

const styles = `
.offersSection {
  padding: 56px 0;
}
.offersHeader {
  text-align: center;
  margin-bottom: 32px;
}
.offersHeader h2 {
  font-size: 28px;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}
.offersHeader p {
  color: #6f6f6f;
  margin: 0;
  font-size: 15px;
}
.offersGrid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, 1fr);
}
.offerCard {
  position: relative;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  text-decoration: none;
  color: #1b1b1b;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  cursor: pointer;
}
.offerCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}
.offerCard.featured {
  grid-column: span 2;
  background: ${FEATURED.gradient};
}
.offerCard.featured .offerLabel {
  font-size: 24px;
  max-width: 80%;
}
.offerBadge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #1b1b1b;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.offerContent {
  margin-top: auto;
}
.offerLabel {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 4px;
  line-height: 1.2;
}
.offerSub {
  font-size: 13px;
  color: rgba(0,0,0,0.7);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.offerArrow {
  transition: transform 0.2s ease;
}
.offerCard:hover .offerArrow {
  transform: translateX(4px);
}

/* Mobile Scroll Layout */
@media (max-width: 980px) {
  .offersGrid {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(2, 180px); /* 2 rows */
    grid-auto-columns: 240px; /* Width of each card */
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 12px;
    scrollbar-width: none; /* Hide scrollbar Firefox */
  }
  .offersGrid::-webkit-scrollbar {
    display: none; /* Hide scrollbar Chrome/Safari */
  }
  .offerCard {
    scroll-snap-align: start;
    min-height: 100%;
  }
  .offerCard.featured {
    grid-column: span 1; /* Reset specific spans if needed, or keep for irregular grid */
    min-width: 240px;
  }
  .offerCard:active {
    transform: scale(0.98);
  }
}
`;

export default function ByOffer() {
    function handleOfferClick(link) {
        if (typeof window !== "undefined") {
            window.location.href = `/shop?offer=${link}`;
        }
    }

    return (
        <section className="offersSection">
            <style>{styles}</style>
            <div className="container">
                <div className="offersHeader">
                    <h2>Deals for You</h2>
                    <p>Save more with limited-time offers, bundles, and best-value picks.</p>
                </div>

                <div className="offersGrid">
                    {/* Featured Card */}
                    <div
                        className="offerCard featured"
                        onClick={() => handleOfferClick(FEATURED.link)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="offerContent">
                            <div className="offerLabel">{FEATURED.label}</div>
                            <div className="offerSub">
                                {FEATURED.sub} <span className="offerArrow">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Regular Cards */}
                    {OFFERS.map((offer) => (
                        <div
                            key={offer.id}
                            className="offerCard"
                            style={{ background: offer.gradient }}
                            onClick={() => handleOfferClick(offer.link)}
                            role="button"
                            tabIndex={0}
                        >
                            {offer.badge && <span className="offerBadge">{offer.badge}</span>}
                            <div className="offerContent">
                                <div className="offerLabel">{offer.label}</div>
                                <div className="offerSub">
                                    {offer.sub} <span className="offerArrow">→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
