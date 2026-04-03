import Link from "next/link";
import Navbar from "@/components/SaaS/Navbar";
import Hero from "@/components/SaaS/Hero";
import ProblemSolution from "@/components/SaaS/ProblemSolution";
import HowItWorks from "@/components/SaaS/HowItWorks";
import Testimonials from "@/components/SaaS/Testimonials";
import FinalCTA from "@/components/SaaS/FinalCTA";

export const metadata = {
  title: "AICOUNSEL. | High-Contrast Legal Intelligence",
  description: "Contracts you can actually understand. AI-powered document analysis for professionals who value clarity and speed.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <div id="hero">
        <Hero />
      </div>
      <div id="solutions">
        <ProblemSolution />
      </div>

      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <div id="pricing">
        <FinalCTA />
      </div>

      {/* Footer Minimal */}
      <footer className="py-12 px-6 border-t-8 border-charcoal bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-anton text-2xl uppercase text-charcoal">AICOUNSEL<span className="text-golden">.</span></div>
          <div className="flex gap-8 font-satoshi text-xs font-bold uppercase tracking-widest text-charcoal/40">
            <Link href="/#features" className="hover:text-charcoal transition-colors">Features</Link>
            <Link href="/#solutions" className="hover:text-charcoal transition-colors">Solutions</Link>
            <Link href="/#pricing" className="hover:text-charcoal transition-colors">Pricing</Link>
            <a href="#" className="hover:text-charcoal transition-colors">Security</a>
          </div>
          <div className="font-satoshi text-[10px] uppercase font-black tracking-widest text-charcoal/20">
            © 2026 AICOUNSEL ARCHITECTURE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </main>
  );
}
