"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
interface AnalysisResult {
  document_type: string;
  country: string;
  key_clauses: { clause_name: string; description: string }[];
  obligations: string[];
  risks: { risk_name: string; severity: "low" | "medium" | "high"; explanation: string }[];
  missing_protections: string[];
  summary: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const countries = [
    "United States",
    "India",
    "United Kingdom",
    "Canada",
    "Australia",
    "European Union",
    "Singapore",
    "United Arab Emirates"
  ];

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/login");
  }, [session, isPending, router]);

  const canSubmit = useMemo(() => {
    if (mode === "file") return !!file;
    return text.trim().length >= 200;
  }, [mode, file, text]);

  async function safeJson(res: Response): Promise<unknown> {
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const raw = await res.text();
      console.error("Non-JSON response received. Status:", res.status, "Body preview:", raw.slice(0, 300));
      return { error: "The server returned an unexpected response. Please try again." };
    }
    try {
      return await res.json();
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return { error: "Failed to parse server response. Please try again." };
    }
  }

  async function onAnalyze() {
    setError("");
    setAnalysis(null);
    setLoading(true);
    try {
      const fd = new FormData();
      if (mode === "file" && file) fd.set("file", file);
      if (mode === "paste") fd.set("text", text);
      fd.set("country", country);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json = await safeJson(res) as any;

      if (!res.ok) {
        const errorMsg = json.error || "Request failed";
        const errorDetails = json.details || undefined;
        console.error("Analysis Request Failed:", errorMsg, errorDetails ? `Details: ${errorDetails}` : json);
        setError(errorMsg);
        return;
      }
      setAnalysis(json as AnalysisResult);
    } catch (err) {
      console.error("Frontend Analysis Error:", err);
      setError("Something went wrong with the connection. Please try again.");
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
              href="/compliance"
              className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
            >
              Compliance Manager
            </Link>
            <div className="text-sm font-medium text-stone-900 border-b-2 border-stone-900">
              Document Analysis
            </div>
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
              Select your jurisdiction and upload a document to get automated legal insights.
            </p>

            {/* Country Selector */}
            <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
              <label className="block text-sm font-medium text-stone-700">
                Select Jurisdiction (Country)
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-stone-500">Legal analysis will be tailored to this country&apos;s laws.</p>
            </div>

            <div className="mt-6 flex gap-2 rounded-lg border border-stone-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setMode("file")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${mode === "file" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-50"
                  }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setMode("paste")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${mode === "paste" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-50"
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
                <p className="mt-2 text-xs text-stone-500">Max 12MB. PDF, DOCX, TXT supported.</p>
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
              {loading ? "Analyzing Jurisdictional Laws…" : "Analyze"}
            </button>
          </section>

          <section className="flex-1">
            {!analysis ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Results
                </h2>
                <p className="mt-2 text-stone-600 leading-relaxed">
                  Upload or paste a document to see the jurisdictional analysis. Our AI will identify key clauses, risks, and missing protections based on the selected country&apos;s laws.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200 bg-white p-8">
                  <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-2xl font-bold text-stone-900">
                      Analysis Report
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-bold text-stone-600 uppercase tracking-widest">
                      {analysis.country} Jurisdiction
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                      <h3 className="text-xs font-bold text-stone-400 uppercase mb-1">Document Type</h3>
                      <p className="text-stone-900 font-medium">{analysis.document_type || "Unknown Legal Document"}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">Summary</h3>
                    <p className="text-stone-700 leading-relaxed italic">{analysis.summary}</p>
                  </div>

                  <div className="mt-10">
                    <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Key Clauses
                    </h3>
                    <div className="space-y-4">
                      {analysis.key_clauses?.map((clause, i) => (
                        <div key={i} className="p-4 rounded-xl border border-stone-100 bg-white">
                          <h4 className="font-bold text-stone-900 text-sm mb-1">{clause.clause_name}</h4>
                          <p className="text-stone-600 text-sm leading-snug">{clause.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10">
                    <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Legal Risks
                    </h3>
                    <div className="space-y-4">
                      {analysis.risks?.map((risk, i) => (
                        <div key={i} className="p-4 rounded-xl border border-stone-100 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-stone-900 text-sm">{risk.risk_name}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${risk.severity === 'high' ? 'bg-red-50 text-red-600' :
                              risk.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                              }`}>
                              {risk.severity} risk
                            </span>
                          </div>
                          <p className="text-stone-600 text-sm leading-snug">{risk.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10">
                    <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Missing Protections
                    </h3>
                    <ul className="space-y-2">
                      {analysis.missing_protections?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                          <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10">
                    <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-stone-900"></span>
                      Obligations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.obligations?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                          <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

