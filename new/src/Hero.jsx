import slide1 from "./assets/1.png";
import slide2 from "./assets/2.png";
import slide3 from "./assets/3.png";

const SLIDES = [
  { src: slide1, alt: "Skincare essentials" },
  { src: slide2, alt: "Sun protection and hydration" },
  { src: slide3, alt: "Luxury skincare essentials" },
];

export default function HeroSlider() {
  return (
    <section className="heroSlider">
      <div className="container">
        <div className="heroSliderInner" aria-label="Featured banner">
          <div className="heroSliderTrack">
            {SLIDES.map((slide) => (
              <div key={slide.alt} className="heroSlide">
                <img src={slide.src} alt={slide.alt} />
              </div>
            ))}
          </div>
          <div className="heroDots" aria-hidden="true">
            <span className="heroDot" />
            <span className="heroDot" />
            <span className="heroDot" />
          </div>
        </div>
      </div>
    </section>
  );
}
