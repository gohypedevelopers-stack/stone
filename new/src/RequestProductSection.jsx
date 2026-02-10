export default function RequestProductSection() {
    return (
        <section className="w-full py-16 px-4 bg-gradient-to-b from-white via-[#fdf2f8] to-[#fce7f3]/30">
            <div className="max-w-[600px] mx-auto text-center">
                <h2 className="text-[32px] md:text-[40px] font-[900] mb-4 text-[#111] tracking-tight">
                    Want Something Special?
                </h2>

                <p className="text-[#666] text-[15px] leading-[1.6] mb-8">
                    Tell us what you want — we’ll try to stock it.<br />
                    Help us curate the perfect shelf for you.
                </p>

                <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        placeholder="Product Name or Link *"
                        className="w-full h-[56px] px-6 rounded-[16px] border border-black/10 bg-white text-[15px] outline-none focus:border-[#d1408e] focus:shadow-[0_0_0_4px_rgba(209,64,142,0.1)] transition-all placeholder:text-[#999]"
                        required
                    />

                    <input
                        type="text"
                        placeholder="Any specific shades or notes? (Optional)"
                        className="w-full h-[56px] px-6 rounded-[16px] border border-black/10 bg-white text-[15px] outline-none focus:border-[#d1408e] focus:shadow-[0_0_0_4px_rgba(209,64,142,0.1)] transition-all placeholder:text-[#999]"
                    />

                    <button
                        type="submit"
                        className="w-full h-[56px] mt-2 bg-[#222] text-white rounded-[16px] font-[800] text-[14px] tracking-[1px] uppercase hover:bg-[#000] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >
                        Request Product
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="group-hover:rotate-12 transition-transform"
                        >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </section>
    );
}
