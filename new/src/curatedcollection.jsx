import img7 from "./assets/7.png";
import img5 from "./assets/5.png";
import img6 from "./assets/6.png";
import img4 from "./assets/4.png";

const FEATURED = [
  {
    key: "all",
    title: "All K-Beauty at Fingertip",
    caption: "Top trending products",
    theme: "ftLilac",
    image: img7,
  },
  {
    key: "masks",
    title: "Toner Pads + Sheet Masks",
    caption: "Toner pads + Sheet masks",
    theme: "ftPink",
    image: img5,
  },
  {
    key: "spf",
    title: "Sunscreen + Moisturisers",
    caption: "Sunscreen + Moisturisers",
    theme: "ftPeach",
    image: img6,
  },
  {
    key: "serums",
    title: "Serums + Ampoules",
    caption: "Serums + Ampoules",
    theme: "ftRose",
    image: img4,
  },
];

export default function CuratedCollection() {
  return (
    <section className="featured">
      <div className="container">
        <div className="featuredHead">
          <div className="featuredTitle">
            <span className="featuredTitleStrong">Curated</span>{" "}
            <span className="featuredTitleLight">Collection</span>
          </div>
          <p className="featuredSub">From viral faves to hidden gems, find your match!</p>
        </div>

        <div className="featuredGrid">
          {FEATURED.map((f) => (
            <div key={f.key} className="featuredItem">
              <div className={`featuredCard ${f.theme}`}>
                <div className="featuredTag">{f.title}</div>
                <div className="featuredImageBg" style={{ backgroundImage: `url(${f.image})` }} />
              </div>
              <div className="featuredCaption">{f.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
