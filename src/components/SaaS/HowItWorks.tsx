"use client";

export default function HowItWorks() {
    const steps = [
        {
            title: "Integrate Your Stack",
            description: "Connect all your existing tools in minutes. Our engine maps your data flows automatically, creating a unified source of truth.",
        },
        {
            title: "Define Your Logic",
            description: "Use our visual builder to orchestrate complex operations. Set triggers, conditions, and actions with total precision.",
        },
        {
            title: "Activate Flux Mode",
            description: "Deploy your workflows and watch the output soar. Real-time monitoring ensures you're always operating at peak potential.",
        }
    ];

    return (
        <section className="py-24 px-6 bg-charcoal text-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
                {/* Left Column - Sticky Title */}
                <div className="md:w-1/3">
                    <div className="md:sticky md:top-32">
                        <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-golden mb-4 block">Process</span>
                        <h2 className="font-anton text-7xl md:text-8xl uppercase leading-[0.85] mb-8">How <br />It <span className="text-golden">Works</span></h2>
                        <p className="font-satoshi text-sage/40 text-lg max-w-xs">A three-step sequence to total operational dominance.</p>
                    </div>
                </div>

                {/* Right Column - Steps */}
                <div className="md:w-2/3 space-y-24">
                    {steps.map((step, i) => (
                        <div key={i} className="group flex flex-col gap-6 border-t border-white/5 pt-12 first:border-t-0 first:pt-0">
                            <div className="flex items-baseline gap-6">
                                <span className="font-anton text-8xl md:text-9xl leading-none text-golden/20 group-hover:text-golden transition-all duration-700">
                                    0{i + 1}
                                </span>
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-anton text-4xl md:text-5xl uppercase group-hover:text-golden transition-colors duration-500">
                                        {step.title}
                                    </h3>
                                    <p className="font-satoshi text-xl text-sage/60 max-w-xl leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
