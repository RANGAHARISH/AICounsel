"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export default function Hero() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const handleAnalyze = () => {
        if (!isPending && !session?.user) {
            router.push("/login?redirect=/analyze");
        } else {
            router.push("/analyze");
        }
    };
    return (
        <section className="relative pt-40 pb-24 px-6 bg-grid">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Badge */}
                <div className="flex items-center gap-2 bg-golden px-4 py-2 mb-8 border-2 border-charcoal brutal-shadow-sm animate-fade-in group hover:bg-charcoal transition-colors">
                    <span className="w-2 h-2 bg-charcoal group-hover:bg-golden animate-pulse"></span>
                    <span className="font-satoshi text-xs font-black uppercase tracking-[0.2em] text-charcoal group-hover:text-white transition-colors">
                        AI-Powered Legal Intelligence
                    </span>
                </div>

                {/* Headline */}
                <h1 className="font-anton text-[4rem] md:text-[5rem] lg:text-[6rem] leading-[0.9] uppercase tracking-tighter mb-8 max-w-[12ch]">
                    Contracts <span className="text-charcoal/10">You</span> Can Actually <br />
                    <span className="highlight-rotated inline-block px-2">Understand</span>
                </h1>

                {/* Subheadline */}
                <p className="font-satoshi text-xl md:text-2xl text-charcoal/70 max-w-2xl mb-12 leading-relaxed">
                    Stop signing leases, NDAs, and employment agreements blind. Get instant plain English summaries, risk flags, and clear answers from our jurisdiction-aware legal engine.
                </p>

                <div className="flex items-center gap-6 mb-12 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                    <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.3em]">Institutional Grade Security</span>
                    <div className="h-4 w-[1px] bg-charcoal/20"></div>
                    <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.3em]">SOC2 COMPLIANT</span>
                    <div className="h-4 w-[1px] bg-charcoal/20"></div>
                    <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.3em]">GDPR READY</span>
                </div>

                {/* Action CTA */}
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl mb-24 group">
                    <Link
                        href="/analyze"
                        className="flex-1 bg-white border-2 border-charcoal px-6 py-5 font-satoshi text-lg outline-none hover:bg-charcoal/5 transition-all flex items-center justify-center text-charcoal/60 brutal-shadow font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                        Enter your email for early access
                    </Link>
                    <button
                        onClick={handleAnalyze}
                        className="flex-1 bg-golden text-charcoal font-anton text-2xl px-10 py-5 hover:bg-charcoal hover:text-golden transition-all flex items-center justify-center brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none border-2 border-charcoal"
                    >
                        ANALYZE DOCUMENT
                    </button>
                </div>
            </div>
        </section>
    );
}
