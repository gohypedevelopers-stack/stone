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
  const makeRow = (count) =>
    Array.from({ length: count }, (_, i) => BRANDS[i % BRANDS.length]);
  const firstRow = makeRow(12);
  const secondRow = makeRow(12);
  return (
    <section className="brandsSection">
      <div className="container">
        <div className="brandsHead">
          <h2>Brands You'll Love</h2>
          <p className="brandsSub">Explore best-loved brands and new beauty breakthroughs</p>
        </div>

        <div className="brandsRows">
          <div className="brandsRow">
            {firstRow.map((brand, idx) => (
              <div key={`r1-${brand}-${idx}`} className="brandCard">
                {brand}
              </div>
            ))}
          </div>
          <div className="brandsRow">
            {secondRow.map((brand, idx) => (
              <div key={`r2-${brand}-${idx}`} className="brandCard">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
