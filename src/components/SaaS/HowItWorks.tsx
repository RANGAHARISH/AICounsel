"use client";

export default function HowItWorks() {
    const steps = [
        {
            title: "Upload Your Document",
            description: "Drag and drop any legal document—PDF, DOCX, or TXT. Our secure pipeline immediately begins the extraction process.",
        },
        {
            title: "AI Semantic Analysis",
            description: "Our LLM-powered engine breaks down every clause, identifies risks, and normalizes the text according to your jurisdiction.",
        },
        {
            title: "Get Actionable Insights",
            description: "Receive a clear summary, risk flags, and a final 'Should I Sign?' score. Decide with confidence in minutes.",
        }
    ];

    return (
        <section className="py-24 px-6 bg-charcoal text-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
                {/* Left Column - Sticky Title */}
                <div className="md:w-1/3">
                    <div className="md:sticky md:top-32 bg-golden p-8 border-4 border-charcoal brutal-shadow text-charcoal">
                        <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-white bg-charcoal px-2 py-1 border-2 border-charcoal brutal-shadow-sm mb-4 block inline-block">Process</span>
                        <h2 className="font-anton text-7xl md:text-8xl uppercase leading-[0.85] mb-8">How <br />It <span className="text-white">Works</span></h2>
                        <p className="font-satoshi text-charcoal/80 font-bold text-lg max-w-xs">A three-step sequence to total operational dominance.</p>
                    </div>
                </div>

                {/* Right Column - Steps */}
                <div className="md:w-2/3 space-y-12">
                    {steps.map((step, i) => (
                        <div key={i} className="group flex flex-col gap-6 bg-white text-charcoal p-8 border-4 border-charcoal brutal-shadow relative hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_var(--charcoal)] transition-all overflow-hidden">
                            <div className="absolute -right-12 -top-12 opacity-5 font-anton text-[200px] leading-none text-charcoal pointer-events-none group-hover:opacity-10 transition-opacity">
                                0{i + 1}
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-baseline gap-6 relative z-10">
                                <span className="font-anton text-8xl md:text-9xl leading-none text-golden group-hover:text-charcoal transition-colors duration-500 brutal-shadow-sm px-4 border-4 border-charcoal bg-white inline-block">
                                    0{i + 1}
                                </span>
                                <div className="flex flex-col gap-4 mt-4 md:mt-0">
                                    <h3 className="font-anton text-4xl md:text-5xl uppercase group-hover:text-golden transition-colors duration-500">
                                        {step.title}
                                    </h3>
                                    <p className="font-satoshi text-xl text-charcoal/80 font-bold max-w-xl leading-relaxed">
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
