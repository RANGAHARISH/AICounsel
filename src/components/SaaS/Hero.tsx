"use client";

import AbstractUI from "./AbstractUI";

export default function Hero() {
    return (
        <section className="relative pt-40 pb-24 px-6 bg-grid">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Badge */}
                <div className="flex items-center gap-2 bg-charcoal/5 px-4 py-2 rounded-full mb-8 border border-charcoal/10 shadow-sm animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-golden animate-pulse"></span>
                    <span className="font-satoshi text-xs font-bold uppercase tracking-[0.2em] text-charcoal/80">
                        Next-Gen Workflow for Teams
                    </span>
                </div>

                {/* Headline */}
                <h1 className="font-anton text-[6rem] md:text-[8rem] lg:text-[10rem] leading-[0.9] uppercase tracking-tighter mb-8 max-w-[12ch]">
                    Unleash <span className="text-charcoal/10">The</span> Pure <br />
                    <span className="highlight-rotated inline-block px-2">Potential</span>
                </h1>

                {/* Subheadline */}
                <p className="font-satoshi text-xl md:text-2xl text-charcoal/70 max-w-2xl mb-12 leading-relaxed">
                    The only B2C platform designed to compress your complex operations into high-speed, high-output results. No bloat. Just flux.
                </p>

                {/* Waitlist Form */}
                <form className="flex flex-col md:flex-row gap-4 w-full max-w-2xl mb-20 group">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="flex-1 bg-white border-2 border-charcoal/10 rounded-xl px-6 py-5 font-satoshi text-lg outline-none focus:border-golden transition-all shadow-inner"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-golden text-charcoal font-anton text-2xl px-10 py-5 rounded-xl hover:scale-[1.02] hover:shadow-2xl transition-all active:scale-95 whitespace-nowrap"
                    >
                        JOIN THE WAITLIST
                    </button>
                </form>

                {/* Hero Image / Mockup */}
                <div className="w-full max-w-5xl h-[400px] md:h-[650px] rounded-2xl overflow-hidden border border-charcoal/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white animate-slide-up">
                    <AbstractUI />
                </div>
            </div>
        </section>
    );
}
