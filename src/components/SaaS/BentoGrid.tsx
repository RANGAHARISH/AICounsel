"use client";

export default function BentoGrid() {
    return (
        <section className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-charcoal/40 mb-4 block">Capabilities</span>
                    <h2 className="font-anton text-5xl md:text-7xl uppercase">Bending The <span className="text-golden highlight-rotated inline-block px-1">Rules</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[400px] gap-8">
                    {/* Card 1 - Spans 2 */}
                    <div className="md:col-span-2 bg-charcoal p-10 flex flex-col justify-between overflow-hidden group border-4 border-charcoal brutal-shadow relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-golden brutal-shadow border-l-4 border-b-4 border-charcoal flex items-center justify-center font-anton text-2xl z-10">01</div>
                        <div className="max-w-md">
                            <h3 className="font-anton text-3xl md:text-5xl text-white uppercase mb-4 group-hover:text-golden transition-colors">Plain English <br />Summaries</h3>
                            <p className="font-satoshi text-sage/60 text-lg">Our AI translates dense legalese into actionable insights. Analyze complex Indemnification, Non-Compete, and Liability Limitation clauses in seconds. No JD required.</p>
                        </div>

                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#f8f9fa] p-10 flex flex-col justify-between border-4 border-charcoal brutal-shadow hover:bg-sage/10 transition-all group relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white brutal-shadow border-l-4 border-b-4 border-charcoal flex items-center justify-center font-anton text-2xl z-10">02</div>
                        <h3 className="font-anton text-3xl text-charcoal uppercase group-hover:text-golden transition-colors">Risk <br />Flagging</h3>
                        <p className="font-satoshi text-charcoal/60 text-sm mt-4 uppercase tracking-widest font-black">Instant Threat Detection</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#f8f9fa] p-10 flex flex-col justify-between border-4 border-charcoal brutal-shadow hover:bg-sage/10 transition-all group relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white brutal-shadow border-l-4 border-b-4 border-charcoal flex items-center justify-center font-anton text-2xl z-10">03</div>
                        <h3 className="font-anton text-3xl text-charcoal uppercase group-hover:text-golden transition-colors">Global <br />Compliance</h3>
                        <p className="font-satoshi text-charcoal/60 text-lg">Jurisdiction-aware logic for 150+ countries.</p>
                    </div>

                    {/* Card 4 - Spans 2 */}
                    <div className="md:col-span-2 bg-golden p-10 flex flex-col md:flex-row gap-10 overflow-hidden group border-4 border-charcoal brutal-shadow relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white brutal-shadow border-l-4 border-b-4 border-charcoal flex items-center justify-center font-anton text-2xl z-10">04</div>
                        <div className="flex-1 flex flex-col justify-between">
                            <h3 className="font-anton text-3xl md:text-5xl text-charcoal uppercase leading-none mb-4">&quot;Should I Sign?&quot; <br />Score</h3>
                            <p className="font-satoshi text-charcoal/70 text-lg">A deterministic, data-driven score to give you the green light on any agreement.</p>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
        
      `}</style>
        </section>
    );
}
