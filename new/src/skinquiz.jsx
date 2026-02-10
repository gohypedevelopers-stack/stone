import { Droplet, ShieldCheck, Sun } from "lucide-react";
import DisplayCards from "./components/ui/display-cards.jsx";

export default function SkinQuiz() {
  const supportPhone = "+91 90000 00000";
  const routineCards = [
    {
      title: "Morning Cleanse",
      description: "Hydrating Foam",
      date: "AM",
      icon: <Sun className="size-4 text-amber-200" />,
      titleClassName: "text-[#1b1b1b]",
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      title: "Treat",
      description: "Vitamin C Serum",
      date: "AM",
      icon: <Droplet className="size-4 text-sky-200" />,
      titleClassName: "text-[#1b1b1b]",
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      title: "Protect",
      description: "Invisible SPF 50",
      date: "Daily",
      icon: <ShieldCheck className="size-4 text-emerald-200" />,
      titleClassName: "text-[#1b1b1b]",
      className:
        "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  return (
    <section className="py-[70px]" aria-labelledby="quiz-heading">
      <div className="w-full px-0 sm:px-[10px]">
        <div className="bg-[linear-gradient(135deg,#fdfbfb_0%,#ebedee_100%)] rounded-[24px] overflow-hidden flex flex-col-reverse md:flex-row relative shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-black/4">
          <div className="flex-1 p-[32px_24px] md:p-[48px] flex flex-col justify-center z-[2] text-center md:text-left items-center md:items-stretch">
            <h2 id="quiz-heading" className="text-[32px] font-[900] mb-[12px] text-[#1b1b1b] tracking-[-0.5px]">Unlock Your Best Skin</h2>
            <p className="text-[16px] leading-[1.6] text-muted-custom mb-[32px] max-w-[440px]">
              Not sure where to start? Take our 2-minute quiz to build a personalized routine targeted to your concerns.
            </p>
            <div className="flex gap-[12px] flex-wrap justify-center md:justify-start">

              <a href={`tel:${supportPhone}`} className="bg-transparent text-[#1b1b1b] p-[14px_28px] rounded-[99px] font-[700] text-[14px] uppercase tracking-[0.5px] border border-black/10 cursor-pointer transition-all duration-200 ease-out inline-block no-underline hover:bg-white hover:border-[#1b1b1b]">
                Talk to an Expert
              </a>
            </div>
          </div>

          <div className="flex-1 bg-white relative grid place-items-center min-h-[240px] md:min-h-[320px] overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 left-0 w-full h-full opacity-60 bg-[radial-gradient(circle_at_80%_20%,#e0c3fc_0%,transparent_40%),radial-gradient(circle_at_20%_80%,#a8edea_0%,transparent_40%)]" />
            <div className="relative z-[1] flex flex-col items-center">
              <div className="text-[10px] uppercase tracking-[1px] mb-[12px] text-[#999] font-[700]">
                Your Personal Routine
              </div>
              <div className="scale-[0.9] md:scale-100 -rotate-1 -translate-y-8 md:-translate-y-10">
                <DisplayCards cards={routineCards} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
