"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
    const { data: session } = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
    };

    // --- SCROLL LOGIC ---
    const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("/#") || href.startsWith("#")) {
            const id = href.split("#")[1];
            if (!id) return;

            // If we're on the homepage, scroll manually
            if (pathname === "/") {
                e.preventDefault();
                const element = document.getElementById(id);
                if (element) {
                    const headerOffset = 84; // Header height + border/shadow margin
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                    setMobileOpen(false);
                }
            }
        }
    };

    // Close mobile menu on route change / resize
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Subtle scroll shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navLinks = [
        { href: "/#features",    label: "Features" },
        { href: "/#solutions",   label: "Solutions" },
        { href: "/#pricing",     label: "Pricing" },
        { href: "/#how-it-works",label: "Process" },
        { href: "#",             label: "Resources", muted: true },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 h-20 z-50 bg-white border-b-4 border-charcoal transition-shadow duration-200 ${
                    scrolled ? "shadow-[0_4px_0_0_#171e19]" : ""
                }`}
            >
                <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">

                    {/* ── Logo ── */}
                    <Link
                        href="/"
                        className="font-anton text-3xl uppercase tracking-tight flex items-baseline shrink-0"
                    >
                        AICOUNSEL<span className="text-golden ml-0.5">.</span>
                    </Link>

                    {/* ── Desktop Nav ── */}
                    <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
                        {navLinks.map(({ href, label, muted }) => (
                            <Link
                                key={label}
                                href={href}
                                onClick={(e) => handleScrollClick(e, href)}
                                className={`font-satoshi text-xs font-bold transition-colors uppercase tracking-widest whitespace-nowrap ${
                                    muted
                                        ? "text-charcoal/30 hover:text-charcoal/50"
                                        : "text-charcoal hover:text-charcoal/60"
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* ── Desktop Right ── */}
                    <div className="hidden md:flex items-center gap-5 shrink-0">
                        {session ? (
                            <>
                                <button
                                    onClick={handleLogout}
                                    className="font-satoshi text-sm font-bold hover:text-charcoal/60 transition-colors uppercase tracking-wider"
                                >
                                    Logout
                                </button>
                                <Link
                                    href="/analyze"
                                    className="bg-golden text-charcoal px-6 py-2.5 font-satoshi text-sm font-black hover:bg-charcoal hover:text-golden transition-all uppercase tracking-widest border-2 border-charcoal brutal-shadow-sm hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                                >
                                    Analyze
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="font-satoshi text-sm font-bold hover:text-charcoal/60 transition-colors uppercase tracking-wider"
                                >
                                    Login / Sign Up
                                </Link>
                                <Link
                                    href="/analyze"
                                    className="bg-golden text-charcoal px-6 py-2.5 font-satoshi text-sm font-black hover:bg-charcoal hover:text-golden transition-all uppercase tracking-widest border-2 border-charcoal brutal-shadow-sm hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Mobile Hamburger ── */}
                    <button
                        id="navbar-mobile-toggle"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] border-2 border-charcoal shrink-0 hover:bg-golden transition-colors"
                    >
                        <span
                            className={`block w-5 h-0.5 bg-charcoal transition-all duration-200 origin-center ${
                                mobileOpen ? "rotate-45 translate-y-1.5" : ""
                            }`}
                        />
                        <span
                            className={`block w-5 h-0.5 bg-charcoal transition-all duration-200 ${
                                mobileOpen ? "opacity-0 scale-x-0" : ""
                            }`}
                        />
                        <span
                            className={`block w-5 h-0.5 bg-charcoal transition-all duration-200 origin-center ${
                                mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
                            }`}
                        />
                    </button>
                </div>
            </header>

            {/* ── Mobile Drawer ── */}
            <div
                className={`fixed top-20 left-0 right-0 z-40 bg-white border-b-4 border-charcoal overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
                    mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <nav className="flex flex-col divide-y-2 divide-charcoal/10">
                    {navLinks.map(({ href, label, muted }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={(e) => handleScrollClick(e, href)}
                            className={`font-satoshi text-sm font-bold uppercase tracking-widest px-6 py-4 transition-colors ${
                                muted
                                    ? "text-charcoal/30"
                                    : "text-charcoal hover:bg-golden/30"
                            }`}
                        >
                            {label}
                        </Link>
                    ))}

                    {/* Auth row */}
                    <div className="flex items-center gap-4 px-6 py-5">
                        {session ? (
                            <>
                                <button
                                    onClick={handleLogout}
                                    className="font-satoshi text-sm font-bold uppercase tracking-wider hover:text-charcoal/60 transition-colors"
                                >
                                    Logout
                                </button>
                                <Link
                                    href="/analyze"
                                    onClick={() => setMobileOpen(false)}
                                    className="bg-golden text-charcoal px-5 py-2.5 font-satoshi text-sm font-black hover:bg-charcoal hover:text-golden transition-all uppercase tracking-widest border-2 border-charcoal brutal-shadow-sm"
                                >
                                    Analyze
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="font-satoshi text-sm font-bold uppercase tracking-wider hover:text-charcoal/60 transition-colors"
                                >
                                    Login / Sign Up
                                </Link>
                                <Link
                                    href="/analyze"
                                    onClick={() => setMobileOpen(false)}
                                    className="bg-golden text-charcoal px-5 py-2.5 font-satoshi text-sm font-black hover:bg-charcoal hover:text-golden transition-all uppercase tracking-widest border-2 border-charcoal brutal-shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>

            {/* ── Mobile overlay backdrop ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 md:hidden"
                    style={{ top: "80px" }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}
