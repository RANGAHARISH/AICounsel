"use client";

export default function AbstractUI() {
    return (
        <div className="w-full h-full bg-white flex flex-col overflow-hidden font-satoshi">
            {/* Browser Header */}
            <div className="h-12 border-b border-charcoal/10 flex items-center px-4 bg-charcoal/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/40"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400/40"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/40"></div>
                </div>
                <div className="flex-1 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">flux_v2.0_canvas</span>
                </div>
            </div>

            {/* App Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-16 md:w-48 border-r border-charcoal/10 bg-charcoal/5 p-4 flex flex-col gap-6">
                    <div className="h-4 w-2/3 bg-charcoal/10 rounded"></div>
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-charcoal/10 rounded"></div>
                                <div className="hidden md:block h-2 w-1/2 bg-charcoal/5 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Canvas */}
                <div className="flex-1 bg-grid relative flex items-center justify-center p-8">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-charcoal/5 p-8 flex flex-col gap-4 animate-float">
                        <div className="h-3 w-1/4 bg-golden/40 rounded"></div>
                        <div className="h-8 w-full bg-charcoal/5 rounded font-anton flex items-center px-4 text-xs tracking-widest">
                            DYNAMIC_HEADER_O1
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-charcoal/5 rounded"></div>
                            <div className="h-2 w-full bg-charcoal/5 rounded"></div>
                            <div className="h-2 w-2/3 bg-charcoal/5 rounded"></div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-charcoal/10 grayscale"></div>
                                ))}
                            </div>
                            <div className="h-8 w-24 bg-golden rounded flex items-center justify-center text-[10px] font-black tracking-widest">
                                SYNCED
                            </div>
                        </div>
                    </div>

                    {/* Floating Cursor */}
                    <div className="absolute top-1/4 left-3/4 flex flex-col gap-1 pointer-events-none translate-x-10 translate-y-10">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 1.5L16.5 13.5L10 14.5L7.5 18.5L4.5 1.5Z" fill="#171e19" stroke="white" strokeWidth="2" />
                        </svg>
                        <div className="bg-charcoal text-white text-[10px] font-bold px-2 py-1 rounded-sm whitespace-nowrap">
                            Sarah Flux
                        </div>
                    </div>
                </div>

                {/* Properties Panel */}
                <div className="hidden lg:flex w-64 border-l border-charcoal/10 p-6 flex-col gap-8">
                    <div className="space-y-4">
                        <p className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40">Typography</p>
                        <div className="flex items-center justify-between border-b border-charcoal/5 pb-2">
                            <span className="text-xs font-bold font-anton tracking-tight">ANTON DISPLAY</span>
                            <div className="w-6 h-6 bg-charcoal/5 rounded flex items-center justify-center">
                                <div className="w-2 h-2 border-t-2 border-r-2 border-charcoal/40 rotate-45 translate-y-0.5"></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40">Appearance</p>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded border border-charcoal/10 flex items-center justify-center bg-charcoal text-white text-[10px]">A</div>
                            <div className="w-8 h-8 rounded border border-charcoal/10 flex items-center justify-center text-[10px]">A</div>
                            <div className="w-8 h-8 rounded border border-charcoal/10 flex items-center justify-center text-[10px]">A</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40">Primary Accent</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-golden shadow-sm"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black">#FFE17C</span>
                                <span className="text-[10px] text-charcoal/40 uppercase">Golden Highlight</span>
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
