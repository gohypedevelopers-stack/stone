import { InfiniteSlider } from "./components/ui/infinite-slider.jsx";

const BRANDS = [
  "COSRX",
  "Beauty of Joseon",
  "LANEIGE",
  "innisfree",
  "SKIN1004",
  "SOME BY MI",
  "etude",
  "Torriden",
  "Dr.Jart+",
  "ROUND LAB",
];

export default function ShopByBrand() {
  return (
    <section className="brandsSection">
      <div className="container">
        <div className="brandsHead">
          <h2>Brands You'll Love</h2>
          <p className="brandsSub">Explore best-loved brands and new beauty breakthroughs</p>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InfiniteSlider gap={16} duration={30}>
            {BRANDS.map((brand, idx) => (
              <div key={`r1-${brand}-${idx}`} className="brandCard" style={{ width: '160px', flex: '0 0 auto' }}>
                {brand}
              </div>
            ))}
          </InfiniteSlider>

          <InfiniteSlider gap={16} duration={35} reverse>
            {BRANDS.map((brand, idx) => (
              <div key={`r2-${brand}-${idx}`} className="brandCard" style={{ width: '160px', flex: '0 0 auto' }}>
                {brand}
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}
