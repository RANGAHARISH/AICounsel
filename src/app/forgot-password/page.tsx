"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.debug ? `${data.error} (${data.debug})` : (data.error ?? "Failed to send reset code.");
                setError(errorMsg);
                return;
            }

            setMessage(data.message);
            // Pass email to reset-password page for convenience
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (e) {
            setError("An unexpected error occurred. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="font-serif text-xl font-semibold text-stone-900">
                        AICounsel
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-stone-600 transition hover:text-stone-900">
                            Back to login
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-md px-6 pt-16">
                <h1 className="font-serif text-2xl font-semibold text-stone-900">Request Reset OTP</h1>
                <p className="mt-2 text-stone-600">Enter your email address and we&apos;ll send you a 6-digit secure code.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {message} Redirecting to verification...
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            placeholder="you@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-stone-900 px-4 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Continue"}
                    </button>
                </form>
            </main>
        </div>
    );
}
