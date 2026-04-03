"use client";

export default function AbstractUI() {
    return (
        <div className="w-full h-full bg-white flex flex-col overflow-hidden font-satoshi">
            {/* Browser Header */}
            <div className="h-12 border-b-4 border-charcoal flex items-center px-4 bg-sage/20">
                <div className="flex gap-2">
                    <div className="w-4 h-4 bg-charcoal border-2 border-charcoal"></div>
                    <div className="w-4 h-4 bg-white border-2 border-charcoal"></div>
                    <div className="w-4 h-4 bg-golden border-2 border-charcoal"></div>
                </div>
                <div className="flex-1 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-charcoal bg-white border-2 border-charcoal px-4 py-1 brutal-shadow-sm">aicounsel_analyzer_v1.0</span>
                </div>
            </div>

            {/* App Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-16 md:w-48 border-r-4 border-charcoal bg-white p-4 flex flex-col gap-6">
                    <div className="h-6 w-full bg-charcoal border-2 border-charcoal brutal-shadow-sm"></div>
                    <div className="flex flex-col gap-4">
                        {["Dashboard", "Analytics", "Archive", "Settings"].map((label, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-golden border-2 border-charcoal brutal-shadow-sm"></div>
                                <div className="hidden md:block text-xs font-black uppercase tracking-widest text-charcoal">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Canvas */}
                <div className="flex-1 bg-grid relative flex items-center justify-center p-8 bg-charcoal">
                    <div className="w-full max-w-md bg-white border-4 border-charcoal p-8 flex flex-col gap-4 animate-float brutal-shadow relative">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-golden border-b-4 border-l-4 border-charcoal brutal-shadow-sm"></div>
                        <div className="h-4 w-1/3 bg-sage border-2 border-charcoal"></div>
                        <div className="h-10 w-full bg-charcoal border-2 border-charcoal text-white font-anton flex items-center px-4 tracking-widest uppercase">
                            Commercial_Lease_Agrmt
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="h-3 w-full bg-charcoal/10"></div>
                            <div className="h-3 w-full bg-charcoal/10"></div>
                            <div className="h-3 w-2/3 bg-golden"></div>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 border-4 border-charcoal bg-white flex items-center justify-center font-anton text-xs brutal-shadow-sm">{i}</div>
                                ))}
                            </div>
                            <div className="h-10 px-4 bg-golden border-2 border-charcoal flex items-center justify-center text-xs font-black tracking-widest uppercase brutal-shadow-sm">
                                ANALYZED
                            </div>
                        </div>
                    </div>


                </div>

                {/* Properties Panel */}
                <div className="hidden lg:flex w-64 border-l-4 border-charcoal bg-white p-6 flex-col gap-8">
                    <div className="space-y-4">
                        <p className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40">Typography</p>
                        <div className="flex items-center justify-between border-b-4 border-charcoal pb-2">
                            <span className="text-xs font-bold font-anton tracking-tight text-charcoal">ANTON DISPLAY</span>
                            <div className="w-6 h-6 bg-golden border-2 border-charcoal flex items-center justify-center brutal-shadow-sm">
                                <span className="font-black text-[10px]">+</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40">Appearance</p>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 border-4 border-charcoal flex items-center justify-center bg-charcoal text-white font-anton text-xs brutal-shadow-sm">A</div>
                            <div className="w-10 h-10 border-4 border-charcoal flex items-center justify-center bg-white text-charcoal font-anton text-xs brutal-shadow-sm">A</div>
                            <div className="w-10 h-10 border-4 border-charcoal flex items-center justify-center bg-sage/20 text-charcoal font-anton text-xs brutal-shadow-sm">A</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40">Primary Accent</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-golden border-4 border-charcoal brutal-shadow-sm"></div>
                            <div className="flex flex-col">
                                <span className="font-anton uppercase text-xs tracking-widest text-charcoal">#FFE17C</span>
                                <span className="font-satoshi font-black text-[10px] text-charcoal uppercase mt-1">Golden Highlight</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
