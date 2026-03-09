"use client";

export default function Testimonials() {
    const testimonials = [
        {
            name: "ALEX RIVERA",
            role: "Ops Lead @ Hyper",
            content: "FLUX didn't just speed up our workflow—it completely redefined how we think about output. The bento builder is a game changer.",
            dark: false,
        },
        {
            name: "SARAH CHEN",
            role: "Founder @ Zenith",
            content: "The most aggressive productivity tool I've ever used. We compressed a 4-month project into 6 weeks using the flux engine.",
            dark: true,
        },
        {
            name: "MARCUS VANE",
            role: "CTO @ Nexus",
            content: "Finally, a platform that respects the complexity of B2C operations while providing a brutalist-lite simplicity. Unmatched.",
            dark: false,
        }
    ];

    return (
        <section className="py-24 px-6 bg-grid">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-charcoal/40 mb-4 block">Validation</span>
                    <h2 className="font-anton text-6xl md:text-8xl uppercase">Built For <br /><span className="text-golden highlight-rotated inline-block px-1">Performers</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className={`p-10 rounded-3xl flex flex-col gap-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-charcoal/5 ${t.dark ? 'bg-charcoal text-white md:scale-110 md:z-10' : 'bg-white text-charcoal shadow-xl'
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
                                <div className="w-12 h-12 rounded-full bg-charcoal/10 grayscale border border-charcoal/10 flex items-center justify-center font-anton text-lg">
                                    {t.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-anton text-sm uppercase tracking-wider">{t.name}</span>
                                    <span className={`font-satoshi text-xs font-medium ${t.dark ? 'text-sage/40' : 'text-charcoal/40'}`}>{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
