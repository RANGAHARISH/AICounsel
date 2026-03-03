"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user) router.replace("/");
  }, [session, isPending, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [method, setMethod] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOTP() {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { error: err } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in"
      });
      if (err) {
        setError(err.message ?? "Failed to send OTP.");
        return;
      }
      setOtpSent(true);
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (method === "password") {
        const { data, error: err } = await authClient.signIn.email({
          email,
          password,
        });
        if (err) {
          if (err.code === "INVALID_EMAIL_OR_PASSWORD") {
            setError("Incorrect email or password.");
          } else {
            setError(err.message ?? "Sign in failed");
          }
          return;
        }
        if (data) {
          router.push("/");
          router.refresh();
        }
      } else {
        // OTP Sign In
        const { data, error: err } = await authClient.signIn.emailOtp({
          email,
          otp,
        });
        if (err) {
          setError(err.message ?? "Failed to sign in with OTP.");
          return;
        }
        if (data) {
          router.push("/");
          router.refresh();
        }
      }
    } catch (e) {
      console.error("Login exception:", e);
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
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
            <Link href="/signup" className="text-sm font-medium text-stone-600 transition hover:text-stone-900">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 pt-16">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Log in</h1>
        <p className="mt-2 text-stone-600">Welcome back. Sign in to your account.</p>

        <h1 className="font-serif text-2xl font-semibold text-stone-900">Log in</h1>
        <p className="mt-2 text-stone-600">Welcome back. Sign in to your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex items-center justify-between">
                <span>{error}</span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent && method === "otp"}
              className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:bg-stone-50"
              placeholder="you@example.com"
            />
          </div>

          {method === "password" ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="••••••••"
              />
              <div className="mt-1.5 flex justify-start">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          ) : (
            otpSent && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <label htmlFor="otp" className="block text-sm font-medium text-stone-700">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    Change email
                  </button>
                </div>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="mt-2 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-mono text-center text-lg tracking-widest"
                  placeholder="000000"
                />
                <p className="mt-2 text-xs text-stone-500">
                  Please check your inbox for the 6-digit code.
                </p>
              </div>
            )
          )}

          {method === "otp" && !otpSent ? (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading || !email}
              className="w-full rounded-lg bg-stone-900 px-4 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? "Sending Code…" : "Send Verification Code"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-stone-900 px-4 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Sign in"}
            </button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[var(--accent)] hover:underline">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
