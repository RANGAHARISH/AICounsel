"use client";

export default function FinalCTA() {
    return (
        <section className="relative py-32 px-6 bg-golden overflow-hidden">
            {/* Decorative Background Text */}
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
                <span className="font-anton text-[25vw] leading-none text-charcoal/5 uppercase">FLUX</span>
            </div>

            <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
                <span className="font-satoshi text-xs font-black uppercase tracking-[0.4em] text-charcoal/60 mb-8">Final Step</span>
                <h2 className="font-anton text-7xl md:text-9xl uppercase leading-[0.85] mb-10">
                    Ready To <br />Go <span className="bg-charcoal text-golden px-4 py-1 inline-block -rotate-1">DARK?</span>
                </h2>

                <p className="font-satoshi text-xl md:text-2xl text-charcoal/80 mb-12 max-w-2xl leading-relaxed">
                    The waitlist is filling up fast. Join the top 1% of operators who are already redefining the limits of B2C SaaS.
                </p>

                <form className="flex flex-col md:flex-row gap-4 w-full group">
                    <input
                        type="email"
                        placeholder="Your professional email"
                        className="flex-1 bg-white border-2 border-charcoal/10 rounded-xl px-6 py-5 font-satoshi text-lg outline-none focus:border-charcoal transition-all shadow-xl"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-charcoal text-white font-anton text-2xl px-12 py-5 rounded-xl hover:scale-[1.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all active:scale-95 whitespace-nowrap"
                    >
                        GET EARLY ACCESS
                    </button>
                </form>

                <div className="mt-8 flex items-center gap-2 opacity-60">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-golden bg-charcoal grayscale"></div>
                        ))}
                    </div>
                    <span className="font-satoshi text-[10px] uppercase font-black tracking-widest text-charcoal">
                        +420 operators joined today
                    </span>
                </div>
            </div>
        </section>
    );
}
