"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-black/10">
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="font-anton text-3xl uppercase tracking-tight flex items-baseline">
                    FLUX<span className="text-golden ml-0.5">.</span>
                </Link>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#" className="font-satoshi text-sm font-medium hover:text-charcoal/70 transition-colors uppercase tracking-wider">Features</Link>
                    <Link href="#" className="font-satoshi text-sm font-medium hover:text-charcoal/70 transition-colors uppercase tracking-wider">Solutions</Link>
                    <Link href="#" className="font-satoshi text-sm font-medium hover:text-charcoal/70 transition-colors uppercase tracking-wider">Pricing</Link>
                    <Link href="#" className="font-satoshi text-sm font-medium hover:text-charcoal/70 transition-colors uppercase tracking-wider">Resources</Link>
                </nav>

                {/* Right Corner */}
                <div className="flex items-center gap-6">
                    <Link href="#" className="font-satoshi text-sm font-medium hover:text-charcoal/70 transition-colors uppercase tracking-wider">Login</Link>
                    <Link
                        href="#"
                        className="bg-charcoal text-white px-6 py-2 rounded-full font-satoshi text-sm font-bold hover:bg-charcoal/90 transition-all uppercase tracking-widest shadow-lg active:scale-95"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}
