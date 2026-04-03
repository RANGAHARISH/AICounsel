"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/analyze";

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user) router.replace(redirect);
  }, [session, isPending, router, redirect]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: err } = await authClient.signIn.email({ email, password });
      if (err) {
        if (err.code === "INVALID_EMAIL_OR_PASSWORD") {
          setError("Incorrect email or password. Please try again.");
        } else {
          setError(err.message ?? "Login failed. Please try again.");
        }
        return;
      }
      if (data) {
        router.push(redirect);
        router.refresh();
      }
    } catch (e) {
      if (e instanceof TypeError && e.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b-4 border-charcoal bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-anton text-2xl uppercase tracking-tighter text-charcoal flex items-baseline">
            AICOUNSEL<span className="text-golden">.</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href={`/signup${redirect !== "/analyze" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="font-satoshi text-xs font-black uppercase tracking-widest text-charcoal/50 hover:text-charcoal transition-colors"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 pt-20 pb-16">
        {/* Title */}
        <div className="text-center mb-10">
          <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/40 mb-3 block">
            Welcome Back
          </span>
          <h1 className="font-anton text-5xl uppercase text-charcoal leading-none">Log In</h1>
          <p className="mt-3 font-satoshi text-charcoal/60 text-sm">
            Enter your email and password to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border-2 border-charcoal/10 p-8 rounded-2xl shadow-xl">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-bold text-red-600 uppercase tracking-widest">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/50 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/50">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-satoshi text-[10px] font-black uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-all"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-golden text-charcoal font-anton text-2xl px-10 py-4 rounded-2xl hover:scale-[1.02] hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 shadow-xl mt-2"
          >
            {loading ? "LOGGING IN…" : "LOGIN"}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <p className="mt-8 text-center font-satoshi text-sm text-charcoal/50">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${redirect !== "/analyze" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-black text-charcoal hover:text-golden transition-colors uppercase tracking-widest text-xs"
          >
            Sign Up
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
