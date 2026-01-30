import { useState } from "react";

export default function SkinQuiz() {
  const supportPhone = "+91 90000 00000";

  return (
    <section className="py-[64px]" aria-labelledby="quiz-heading">
      <div className="w-full px-0 sm:px-[10px]">
        <div className="bg-[linear-gradient(135deg,#fdfbfb_0%,#ebedee_100%)] rounded-[24px] overflow-hidden flex flex-col-reverse md:flex-row relative shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-black/4">
          <div className="flex-1 p-[32px_24px] md:p-[48px] flex flex-col justify-center z-[2] text-center md:text-left items-center md:items-stretch">
            <h2 id="quiz-heading" className="text-[32px] font-[900] mb-[12px] text-[#1b1b1b] tracking-[-0.5px]">Unlock Your Best Skin</h2>
            <p className="text-[16px] leading-[1.6] text-muted-custom mb-[32px] max-w-[440px]">
              Not sure where to start? Take our 2-minute quiz to build a personalized routine targeted to your concerns.
            </p>
            <div className="flex gap-[12px] flex-wrap justify-center md:justify-start">
              <button
                className="bg-[#1b1b1b] text-white p-[14px_28px] rounded-[99px] font-[700] text-[14px] uppercase tracking-[0.5px] border-none cursor-pointer transition-all duration-200 ease-out shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:bg-black"
                onClick={() => alert("Skin quiz functionality would open here")}
              >
                Start Skin Quiz
              </button>
              <a href={`tel:${supportPhone}`} className="bg-transparent text-[#1b1b1b] p-[14px_28px] rounded-[99px] font-[700] text-[14px] uppercase tracking-[0.5px] border border-black/10 cursor-pointer transition-all duration-200 ease-out inline-block no-underline hover:bg-white hover:border-[#1b1b1b]">
                Talk to an Expert
              </a>
            </div>
          </div>

          <div className="flex-1 bg-white relative grid place-items-center min-h-[200px] md:min-h-[300px] overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 left-0 w-full h-full opacity-60 bg-[radial-gradient(circle_at_80%_20%,#e0c3fc_0%,transparent_40%),radial-gradient(circle_at_20%_80%,#a8edea_0%,transparent_40%)]" />
            <div className="relative bg-white/80 backdrop-blur-[12px] p-[24px] rounded-[16px] border border-white/60 shadow-[0_12px_32px_rgba(0,0,0,0.08)] w-[280px] scale-90 md:scale-100 rotate-0 md:-rotate-2">
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: '#999', fontWeight: '700' }}>Your Personal Routine</div>
              <div className="flex items-center gap-[12px] mb-[12px]">
                <div className="w-[32px] h-[32px] bg-[#f1f5f9] rounded-full grid place-items-center text-[12px]">☀️</div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-[700] text-[#1b1b1b]">Morning Cleanse</span>
                  <span className="text-[10px] text-[#888]">Hydrating Foam</span>
                </div>
              </div>
              <div className="flex items-center gap-[12px] mb-[12px]">
                <div className="w-[32px] h-[32px] bg-[#f1f5f9] rounded-full grid place-items-center text-[12px]">💧</div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-[700] text-[#1b1b1b]">Treat</span>
                  <span className="text-[10px] text-[#888]">Vitamin C Serum</span>
                </div>
              </div>
              <div className="flex items-center gap-[12px] mb-0">
                <div className="w-[32px] h-[32px] bg-[#f1f5f9] rounded-full grid place-items-center text-[12px]">🛡️</div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-[700] text-[#1b1b1b]">Protect</span>
                  <span className="text-[10px] text-[#888]">Invisible SPF 50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
