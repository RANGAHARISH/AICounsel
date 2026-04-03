"use client";

export default function Testimonials() {
    const testimonials = [
        {
            name: "THOMAS WRIGHT",
            role: "Real Estate Attorney",
            content: "AICounsel has fundamentally changed how I review tenant leases. What used to take two hours now takes ten minutes, with higher accuracy.",
            dark: false,
        },
        {
            name: "ELENA RODRIGUEZ",
            role: "Founder @ Scaleup",
            content: "Most aggressive legal tool I've used. We analyzed 50+ vendor contracts in a single afternoon. The risk flagging is scarily accurate.",
            dark: true,
        },
        {
            name: "JULIAN BARNES",
            role: "Compliance Officer",
            content: "Finally, a platform that respects the complexity of international law while providing a brutalist-lite simplicity. Indispensable.",
            dark: false,
        }
    ];

    return (
        <section className="py-24 px-6 bg-grid">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-charcoal bg-golden px-2 py-1 border-2 border-charcoal brutal-shadow-sm mb-4 inline-block">Validation</span>
                    <h2 className="font-anton text-6xl md:text-8xl uppercase text-charcoal">Built For <br /><span className="text-charcoal highlight-rotated inline-block px-1">Performers</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className={`p-10 flex flex-col gap-8 transition-all duration-500 hover:-translate-y-2 border-4 border-charcoal brutal-shadow ${t.dark ? 'bg-charcoal text-white md:scale-110 md:z-10' : 'bg-white text-charcoal'
                                }`}
                        >
                            {/* Stars */}
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill={t.dark ? "#ffe17c" : "#171e19"} className="opacity-80"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                ))}
                            </div>

                            {/* Content */}
                            <p className="font-satoshi text-xl italic leading-relaxed">
                                &quot;{t.content}&quot;
                            </p>

                            {/* Footer */}
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 bg-golden text-charcoal border-2 border-charcoal brutal-shadow-sm flex items-center justify-center font-anton text-lg">
                                    {t.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-anton text-sm uppercase tracking-wider">{t.name}</span>
                                    <span className={`font-satoshi text-xs font-black uppercase ${t.dark ? 'text-sage/40' : 'text-charcoal/60'}`}>{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
