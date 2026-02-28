"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl font-semibold text-stone-900">
          AICounsel
        </Link>
        <nav className="flex items-center gap-4">
          {!isPending &&
            (session?.user ? (
              <>
                <span className="text-sm text-stone-600">
                  {session.user.name ?? session.user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
                >
                  Log in
                </Link>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
