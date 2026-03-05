import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
            Contracts you can actually{" "}
            <span className="text-[var(--accent)]">understand</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone-600 md:text-xl">
            Stop signing leases, NDAs, and employment agreements blind. Get instant
            plain English summaries, risk flags, and a clear answer:{" "}
            <strong className="text-stone-800">should I sign this?</strong>
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="rounded-lg bg-stone-900 px-6 py-3 text-base font-medium text-white transition hover:bg-stone-800"
            >
              Document Analysis
            </Link>
            <Link
              href="/compliance"
              className="flex flex-col items-center rounded-lg border border-stone-300 px-6 py-3 transition hover:border-stone-400 hover:bg-stone-50"
            >
              <span className="text-base font-medium text-stone-700">Compliance Manager</span>
              <span className="text-xs text-stone-500 font-normal">In Development</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-stone-200/80 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-center text-2xl font-semibold text-stone-900 md:text-3xl">
            What you get
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                Plain English summaries
              </h3>
              <p className="mt-2 text-stone-600">
                No more legalese. Every clause explained in simple language so you
                know exactly what you&apos;re agreeing to.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                Risk highlights
              </h3>
              <p className="mt-2 text-stone-600">
                Unfair clauses, hidden fees, and financial risks surfaced before you
                sign. Know what to watch out for.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-6 md:col-span-2 lg:col-span-1">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                &quot;Should I sign?&quot; score
              </h3>
              <p className="mt-2 text-stone-600">
                A clear, data-driven takeaway so you can decide confidently—without
                a $500/hour lawyer.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-stone-200/80 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-stone-500">
          AICounsel – Legal document analysis in plain English.
        </div>
      </footer>
    </div>
  );
}
