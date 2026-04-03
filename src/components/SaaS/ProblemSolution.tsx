"use client";

export default function ProblemSolution() {
    const problems = [
        "Indecipherable legalese that hides critical risks.",
        "Manual review cycles that take days, not minutes.",
        "Unforeseen costs buried in complex clauses.",
        "Zero confidence in what you're actually signing."
    ];

    const solutions = [
        "Instant plain English summaries of every clause.",
        "Automated risk detection with high-impact flags.",
        "Clear financial breakdown of obligations.",
        "Deterministic scores to guide your signature."
    ];

    return (
        <section className="flex flex-col md:flex-row w-full min-h-[600px]">
            {/* Problem - Left Half */}
            <div className="flex-1 bg-charcoal text-white p-12 md:p-24 flex flex-col items-start justify-start relative border-y-4 md:border-y-0 md:border-l-0 md:border-r border-charcoal brutal-shadow-sm overflow-hidden z-10">
                <div className="bg-noise"></div>
                <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-red-400 mb-6">Reality Check</span>
                <h2 className="font-anton text-5xl md:text-7xl uppercase leading-none mb-12">The Old <br />Way</h2>

                <ul className="space-y-8 max-w-md">
                    {problems.map((text, i) => (i === 0 || i === problems.length - 1 ? (
                        <li key={i} className="flex gap-4 items-start">
                            <span className="text-red-400 mt-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </span>
                            <p className="font-satoshi text-lg text-sage/60 leading-tight">{text}</p>
                        </li>
                    ) : (
                        <li key={i} className="flex gap-4 items-start">
                            <span className="text-red-400 mt-1">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </span>
                            <p className="font-satoshi text-lg text-sage/60 leading-tight">{text}</p>
                        </li>
                    )))}
                </ul>
            </div>

            {/* Solution - Right Half */}
            <div className="flex-1 bg-white text-charcoal p-12 md:p-24 flex flex-col items-start justify-start relative overflow-hidden border-4 border-charcoal brutal-shadow border-l-0 z-20">
                <div className="bg-noise"></div>
                {/* Yellow Accent Border */}
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-golden border-l-4 border-charcoal"></div>
                <div className="absolute top-0 left-0 right-0 h-4 bg-golden border-b-4 border-charcoal z-20"></div>

                <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-charcoal/40 mb-6 bg-golden px-2 py-1 border-2 border-charcoal brutal-shadow-sm z-20">The Future</span>
                <h2 className="font-anton text-5xl md:text-7xl uppercase leading-none mb-12 z-20">The <span className="text-charcoal highlight-rotated inline-block px-1">AICounsel</span> <br />Way</h2>

                <ul className="space-y-8 max-w-md z-10">
                    {solutions.map((text, i) => (
                        <li key={i} className="flex gap-4 items-start">
                            <span className="text-white mt-1 w-8 h-8 rounded-full bg-charcoal border-2 border-charcoal flex items-center justify-center p-1 brutal-shadow-sm z-20">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </span>
                            <p className="font-satoshi text-lg text-charcoal leading-tight font-bold z-20">{text}</p>
                        </li>
                    ))}
                </ul>

                {/* Decorative Grid Overlay for Solution Side */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid rotate-12 scale-150"></div>
            </div>
        </section>
    );
}
