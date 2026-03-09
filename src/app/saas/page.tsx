import Navbar from "@/components/SaaS/Navbar";
import Hero from "@/components/SaaS/Hero";
import ProblemSolution from "@/components/SaaS/ProblemSolution";
import BentoGrid from "@/components/SaaS/BentoGrid";
import HowItWorks from "@/components/SaaS/HowItWorks";
import Testimonials from "@/components/SaaS/Testimonials";
import FinalCTA from "@/components/SaaS/FinalCTA";

export const metadata = {
    title: "FLUX. | Next-Gen B2C SaaS",
    description: "Unleash the pure potential of your workflow with FLUX. The aggressive display of productivity.",
};

export default function SaaSPage() {
    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            <Navbar />
            <Hero />
            <ProblemSolution />
            <BentoGrid />
            <HowItWorks />
            <Testimonials />
            <FinalCTA />

            {/* Footer Minimal */}
            <footer className="py-12 px-6 border-t border-charcoal/5 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="font-anton text-2xl uppercase">FLUX<span className="text-golden">.</span></div>
                    <div className="flex gap-8 font-satoshi text-xs font-bold uppercase tracking-widest text-charcoal/40">
                        <a href="#" className="hover:text-charcoal transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-charcoal transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-charcoal transition-colors">Security</a>
                    </div>
                    <div className="font-satoshi text-[10px] uppercase font-black tracking-widest text-charcoal/20">
                        © 2026 FLUX ARCHITECTURE. ALL RIGHTS RESERVED.
                    </div>
                </div>
            </footer>
        </main>
    );
}
