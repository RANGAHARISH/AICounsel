"use client";

export default function BentoGrid() {
    return (
        <section className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <span className="font-satoshi text-xs font-black uppercase tracking-[0.3em] text-charcoal/40 mb-4 block">Capabilities</span>
                    <h2 className="font-anton text-5xl md:text-7xl uppercase">Bending The <span className="text-golden highlight-rotated inline-block px-1">Rules</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[400px] gap-6">
                    {/* Card 1 - Spans 2 */}
                    <div className="md:col-span-2 bg-charcoal rounded-3xl p-1   0 flex flex-col justify-between overflow-hidden group">
                        <div className="max-w-md">
                            <h3 className="font-anton text-3xl md:text-5xl text-white uppercase mb-4 group-hover:text-golden transition-colors">Hyper-Scale <br />Automation</h3>
                            <p className="font-satoshi text-sage/60 text-lg">Push your workflows beyond human limits with our proprietary flux-engine.</p>
                        </div>
                        <div className="relative h-40 mt-8">
                            <div className="absolute inset-0 bg-[#272727] rounded-xl border border-white/5 p-4 overflow-hidden">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-full h-2 bg-golden/20 rounded animate-pulse"></div>
                                    <div className="w-1/2 h-2 bg-golden/40 rounded"></div>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center font-anton text-[10px] text-white/20">{i}</div>
                                            <div className="flex-1 h-3 bg-white/5 rounded"></div>
                                            <div className="w-12 h-3 bg-golden/20 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#f8f9fa] rounded-3xl p-10 flex flex-col justify-between border border-charcoal/5 hover:border-golden/50 transition-all group">
                        <h3 className="font-anton text-3xl text-charcoal uppercase group-hover:text-golden transition-colors">Real-time <br />Sync</h3>
                        <div className="relative h-full flex items-center justify-center mt-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-[8px] border-charcoal/5 border-t-golden animate-spin-slow"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-charcoal rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                        <p className="font-satoshi text-charcoal/60 text-sm mt-4 uppercase tracking-widest font-black">Zero Latency Guaranteed</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#f8f9fa] rounded-3xl p-10 flex flex-col justify-between border border-charcoal/5 hover:border-golden/50 transition-all group">
                        <h3 className="font-anton text-3xl text-charcoal uppercase group-hover:text-golden transition-colors">Global <br />Safety</h3>
                        <div className="flex flex-col gap-2 mt-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`h-2 rounded transition-all duration-1000 ${i < 4 ? 'bg-golden w-full' : 'bg-charcoal/10 w-2/3'}`}></div>
                            ))}
                        </div>
                        <p className="font-satoshi text-charcoal/60 text-lg">Bank-grade encryption for every byte of data.</p>
                    </div>

                    {/* Card 4 - Spans 2 */}
                    <div className="md:col-span-2 bg-golden rounded-3xl p-10 flex flex-col md:flex-row gap-10 overflow-hidden group">
                        <div className="flex-1 flex flex-col justify-between">
                            <h3 className="font-anton text-3xl md:text-5xl text-charcoal uppercase leading-none mb-4">Visual <br />Logic Builder</h3>
                            <p className="font-satoshi text-charcoal/70 text-lg">If you can dream it, you can drag and drop it into existence.</p>
                        </div>
                        <div className="flex-1 relative flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square bg-white/40 rounded-2xl border border-charcoal/5 shadow-sm hover:scale-105 transition-transform flex items-center justify-center">
                                        <div className={`w-8 h-8 rounded-full ${i % 2 === 0 ? 'bg-charcoal' : 'bg-charcoal/20'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
        </section>
    );
}
