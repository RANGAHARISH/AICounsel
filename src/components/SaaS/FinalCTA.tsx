"use client";

import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="relative py-32 px-6 bg-golden overflow-hidden">
            {/* Decorative Background Text */}
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
                <span className="font-anton text-[25vw] leading-none text-charcoal/5 uppercase">UNDERSTAND</span>
            </div>

            <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
                <span className="font-satoshi text-xs font-black uppercase tracking-[0.4em] text-charcoal/60 mb-8">Final Step</span>
                <h2 className="font-anton text-7xl md:text-9xl uppercase leading-[0.85] mb-10">
                    Ready To <br />Know <span className="bg-charcoal text-golden px-4 py-1 inline-block -rotate-1">EXACTLY.</span>
                </h2>

                <p className="font-satoshi text-xl md:text-2xl text-charcoal/80 mb-12 max-w-2xl leading-relaxed">
                    Stop signing blind. Join 10,000+ professionals using AICounsel to de-risk their legal obligations instantly.
                </p>

                <Link
                    href="/analyze"
                    className="w-full max-w-2xl bg-charcoal text-white font-anton text-2xl px-12 py-5 outline-none border-4 border-charcoal brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-2 active:translate-y-2 active:shadow-none whitespace-nowrap text-center"
                >
                    GET EARLY ACCESS
                </Link>

                <div className="mt-8 flex items-center gap-2 opacity-60">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-4 border-charcoal bg-white flex items-center justify-center font-anton text-[10px] text-charcoal">{i}</div>
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
