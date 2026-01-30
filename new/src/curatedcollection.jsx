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
    <section className="pt-[34px] pb-[40px]">
      <div className="w-full px-0 sm:px-[10px]">
        <div className="text-center mb-[18px]">
          <div className="text-[32px] tracking-[2px] uppercase">
            <span className="font-[900]">Curated</span>{" "}
            <span className="italic font-[500] ml-[6px]">Collection</span>
          </div>
          <p className="m-[8px_0_0] text-muted-custom text-[15px]">From viral faves to hidden gems, find your match!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {FEATURED.map((f) => (
            <div key={f.key} className="flex flex-col items-center">
              <div className={`relative w-full rounded-[28px] p-[8px] h-[360px] overflow-hidden flex flex-col gap-[4px] border border-black/6 bg-white transition-all duration-200 hover:-translate-y-[4px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)] group bg-${f.theme}`}>
                <div className="self-start px-[8px] py-[5px] rounded-[12px] font-[800] text-[13px] tracking-[0.6px] uppercase bg-white/80 border border-black/6 backdrop-blur-sm z-10">{f.title}</div>
                <div className="flex-1 rounded-[22px] border border-black/6 bg-cover bg-center transition-all duration-250 group-hover:scale-[1.03] group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]" style={{ backgroundImage: `url(${f.image})` }} />
              </div>
              <div className="mt-[10px] font-[800] text-[16px] text-center">{f.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
