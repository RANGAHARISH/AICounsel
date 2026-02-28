"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Analysis = {
  plainEnglishSummary: string;
  redFlags: Array<{
    title: string;
    severity: "low" | "medium" | "high";
    whyItMatters: string;
    suggestedEdit?: string;
  }>;
  shouldISignScore: number;
  rationale: string;
  keyClauses: string[];
  nextSteps: string[];
  disclaimer: string;
};

function severityStyles(severity: Analysis["redFlags"][number]["severity"]) {
  switch (severity) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-800 border-amber-200";
    default:
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
}

export default function AnalyzePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/login");
  }, [session, isPending, router]);

  const canSubmit = useMemo(() => {
    if (mode === "file") return !!file;
    return text.trim().length >= 200;
  }, [mode, file, text]);

  async function onAnalyze() {
    setError("");
    setAnalysis(null);
    setLoading(true);
    try {
      const fd = new FormData();
      if (mode === "file" && file) fd.set("file", file);
      if (mode === "paste") fd.set("text", text);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as
        | { data: Analysis }
        | { error: string; raw?: string };
      if (!res.ok) {
        setError("error" in json ? json.error : "Request failed");
        return;
      }
      if ("data" in json) setAnalysis(json.data);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-xl font-semibold text-stone-900">
            AICounsel
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          <section className="lg:w-[420px]">
            <h1 className="font-serif text-2xl font-semibold text-stone-900">
              Analyze a legal document
            </h1>
            <p className="mt-2 text-stone-600">
              Upload a PDF/DOCX/TXT or paste text. You’ll get a plain-English summary,
              red flags, and a “Should I sign?” score.
            </p>

            <div className="mt-6 flex gap-2 rounded-lg border border-stone-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setMode("file")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                  mode === "file" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setMode("paste")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                  mode === "paste" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                Paste text
              </button>
            </div>

            {mode === "file" ? (
              <div className="mt-5 rounded-xl border border-stone-200 bg-white p-5">
                <label className="block text-sm font-medium text-stone-700">
                  Contract file
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm text-stone-700 file:mr-4 file:rounded-md file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-800 hover:file:bg-stone-200"
                />
                <p className="mt-2 text-xs text-stone-500">Max 12MB.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-stone-200 bg-white p-5">
                <label className="block text-sm font-medium text-stone-700">
                  Paste text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  placeholder="Paste the contract text here (minimum ~200 characters)..."
                />
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canSubmit || loading}
              className="mt-5 w-full rounded-lg bg-[var(--accent)] px-4 py-3 font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </section>

          <section className="flex-1">
            {!analysis ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Results
                </h2>
                <p className="mt-2 text-stone-600">
                  Upload or paste a document to see the plain-English summary, red flags,
                  and signing score.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200 bg-white p-8">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="font-serif text-lg font-semibold text-stone-900">
                      “Should I sign?” score
                    </h2>
                    <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2">
                      <span className="text-2xl font-semibold text-stone-900">
                        {analysis.shouldISignScore}
                      </span>
                      <span className="text-sm text-stone-600">/ 100</span>
                    </div>
                  </div>
                  <p className="mt-4 text-stone-700">{analysis.rationale}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-8">
                  <h3 className="font-serif text-lg font-semibold text-stone-900">
                    Plain-English summary
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap text-stone-700">
                    {analysis.plainEnglishSummary}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-8">
                  <h3 className="font-serif text-lg font-semibold text-stone-900">
                    Red flags
                  </h3>
                  {analysis.redFlags.length === 0 ? (
                    <p className="mt-3 text-stone-600">No obvious red flags detected.</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {analysis.redFlags.map((rf, idx) => (
                        <div key={idx} className="rounded-xl border border-stone-200 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium text-stone-900">{rf.title}</div>
                              <p className="mt-2 text-sm text-stone-700">{rf.whyItMatters}</p>
                              {rf.suggestedEdit ? (
                                <p className="mt-2 text-sm text-stone-600">
                                  <span className="font-medium text-stone-800">Suggested edit:</span>{" "}
                                  {rf.suggestedEdit}
                                </p>
                              ) : null}
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles(
                                rf.severity,
                              )}`}
                            >
                              {rf.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 bg-white p-8">
                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                      Key clauses to review
                    </h3>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-700">
                      {analysis.keyClauses.length ? (
                        analysis.keyClauses.map((c, i) => <li key={i}>{c}</li>)
                      ) : (
                        <li>Not specified (document may be incomplete).</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-8">
                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                      Next steps
                    </h3>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-700">
                      {analysis.nextSteps.length ? (
                        analysis.nextSteps.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li>Ask for clarification on ambiguous terms.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
                  {analysis.disclaimer}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

