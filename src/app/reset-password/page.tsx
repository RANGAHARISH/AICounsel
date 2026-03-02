"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [successMessage, setSuccessMessage] = useState("");

    // Handle resend cooldown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    async function handleResend() {
        if (resendCooldown > 0) return;

        setError("");
        setSuccessMessage("");
        setResendLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error ?? "Failed to resend code.");
                return;
            }

            setSuccessMessage("A new secure OTP has been sent to your email.");
            setResendCooldown(30); // 30 seconds cooldown
        } catch (e) {
            setError("Failed to resend. Please check your connection.");
        } finally {
            setResendLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!email || !otp) {
            setError("Email and Secure OTP are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error ?? "Failed to verify code.");
                return;
            }

            router.push("/login?message=Password reset successful. Please log in.");
        } catch (e) {
            setError("An unexpected error occurred. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                        {successMessage}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-stone-700">
                        6-Digit Secure OTP (Valid for 60s)
                    </label>
                    <input
                        id="otp"
                        type="text"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-mono text-center text-lg tracking-widest"
                        placeholder="000000"
                    />
                </div>

                <div>
                    <label htmlFor="password" title="Enter new password" data-testid="new-password-label" className="block text-sm font-medium text-stone-700">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        placeholder="At least 8 characters"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" title="Confirm your new password" data-testid="confirm-password-label" className="block text-sm font-medium text-stone-700">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-stone-900 px-4 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                    {loading ? "Processing Reset..." : "Reset Password"}
                </button>
            </form>

            <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-sm text-stone-600">Didn&apos;t receive the code?</p>
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-sm font-semibold text-[var(--accent)] hover:underline disabled:text-stone-400 disabled:no-underline"
                >
                    {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
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
                <h1 className="font-serif text-2xl font-semibold text-stone-900">Finalize Security Reset</h1>
                <p className="mt-2 text-stone-600">Enter your 6-digit code and choose a new password.</p>

                <Suspense fallback={<div className="mt-8 text-stone-600">Loading secure environment...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </main>
        </div>
    );
}
