"use client";

export default function ProblemSolution() {
    const problems = [
        "Fragmented tools that don't talk to each other.",
        "Manual data entry that kills your momentum.",
        "Opaque processes that hide your bottlenecks.",
        "Slow feedback loops between teams."
    ];

    const solutions = [
        "Unified ecosystem where everything is synced.",
        "Automated pipelines that do the heavy lifting.",
        "Granular visibility into every workflow step.",
        "Instant collaboration with zero friction."
    ];

    return (
        <section className="flex flex-col md:flex-row w-full min-h-[600px]">
            {/* Problem - Left Half */}
            <div className="flex-1 bg-charcoal text-white p-12 md:p-24 flex flex-col items-start justify-start border-b md:border-b-0 md:border-r border-white/5">
                <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-red-400 mb-6">Reality Check</span>
                <h2 className="font-anton text-5xl md:text-7xl uppercase leading-none mb-12">The Old <br />Way</h2>

                <ul className="space-y-8 max-w-md">
                    {problems.map((text, i) => (
                        <li key={i} className="flex gap-4 items-start">
                            <span className="text-red-400 mt-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </span>
                            <p className="font-satoshi text-lg text-sage/60 leading-tight">{text}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Solution - Right Half */}
            <div className="flex-1 bg-dark-gray text-white p-12 md:p-24 flex flex-col items-start justify-start relative overflow-hidden">
                {/* Yellow Accent Border */}
                <div className="absolute top-0 right-0 bottom-0 w-2 bg-golden"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-golden"></div>

                <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-golden mb-6">The Future</span>
                <h2 className="font-anton text-5xl md:text-7xl uppercase leading-none mb-12">The <span className="text-golden">Flux</span> <br />Way</h2>

                <ul className="space-y-8 max-w-md z-10">
                    {solutions.map((text, i) => (
                        <li key={i} className="flex gap-4 items-start">
                            <span className="text-golden mt-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </span>
                            <p className="font-satoshi text-lg text-white leading-tight font-medium">{text}</p>
                        </li>
                    ))}
                </ul>

                {/* Decorative Grid Overlay for Solution Side */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid rotate-12 scale-150"></div>
            </div>
        </section>
    );
}
