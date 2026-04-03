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
      <header className="border-b-4 border-charcoal bg-white sticky top-0 z-50 brutal-shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-anton text-2xl uppercase tracking-tighter text-charcoal flex items-baseline">
            AICOUNSEL<span className="text-[var(--accent)]">.</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link
              href="/compliance"
              className="font-satoshi text-xs font-bold uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-colors"
            >
              Compliance
            </Link>
            <div className="font-satoshi text-xs font-black uppercase tracking-widest text-charcoal border-b-4 border-charcoal pb-1">
              Analysis
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-12 lg:flex-row">
          <section className="lg:w-[450px] space-y-8">
            <div>
              <h1 className="font-anton text-4xl md:text-5xl uppercase leading-none mb-4">
                Operational <span className="text-[var(--accent)]">Intelligence</span>
              </h1>
              <p className="font-satoshi text-lg text-charcoal/60 leading-relaxed">
                Upload your contracts for deterministic, jurisdiction-aware risk analysis.
              </p>
            </div>

            {/* Jurisdiction Select */}
            <div className="bg-white border-4 border-charcoal p-6 brutal-shadow">
              <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal mb-3">
                Target Jurisdiction
              </label>
              <div className="relative group/select">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-sage/10 border-2 border-charcoal px-4 py-3 font-satoshi text-sm focus:ring-0 focus:bg-white outline-none appearance-none cursor-pointer brutal-shadow-sm font-bold"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="absolute right-4 bottom-3.5 pointer-events-none text-charcoal group-hover/select:text-golden transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
            </div>


            <div className="flex gap-2 p-1 bg-charcoal">
              <button
                type="button"
                onClick={() => setMode("file")}
                className={`flex-1 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${mode === "file" ? "bg-golden text-charcoal border-2 border-charcoal brutal-shadow-sm" : "text-white/40 hover:text-white"
                  }`}
              >
                Upload Document
              </button>
              <button
                type="button"
                onClick={() => setMode("paste")}
                className={`flex-1 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${mode === "paste" ? "bg-golden text-charcoal border-2 border-charcoal brutal-shadow-sm" : "text-white/40 hover:text-white"
                  }`}
              >
                Paste Direct
              </button>
            </div>

            {mode === "file" ? (
              <div className="group relative border-4 border-dashed border-charcoal bg-sage/5 p-8 text-center hover:border-[var(--accent)] hover:bg-sage/10 transition-all brutal-shadow">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-charcoal text-golden flex items-center justify-center mb-4 border-2 border-charcoal brutal-shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <p className="font-satoshi text-sm font-black text-charcoal uppercase tracking-widest">
                    {file ? file.name : "Select Legal Document"}
                  </p>
                  <p className="font-satoshi text-xs text-charcoal/60 font-bold">PDF, DOCX, TXT UP TO 12MB</p>
                </div>
              </div>
            ) : (
              <div className="border-4 border-charcoal bg-white p-6 brutal-shadow">
                <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal mb-3">
                  Text Input
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="w-full bg-sage/10 border-2 border-charcoal px-4 py-3 font-satoshi text-sm focus:bg-white outline-none resize-none brutal-shadow-sm font-bold"
                  placeholder="Paste clause matter here..."
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-bold text-red-600 uppercase tracking-widest">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canSubmit || loading}
              className="w-full bg-golden text-charcoal font-anton text-2xl px-10 py-5 transition-all outline-none border-4 border-charcoal brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 active:shadow-none disabled:opacity-50 disabled:grayscale disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[8px_8px_0px_0px_var(--charcoal)]"
            >
              {loading ? "INITIALIZING SEMANTIC ENGINE…" : "ANALYZE DOCUMENT"}
            </button>
          </section>

          <section className="flex-1">
            {!analysis ? (
              <div className="border-4 border-charcoal bg-white p-12 h-full flex flex-col items-center justify-center text-center brutal-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sage/20 rounded-bl-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-golden/20 rounded-tr-full pointer-events-none"></div>
                <div className="w-20 h-20 bg-charcoal text-white flex items-center justify-center mb-8 rotate-12 border-4 border-white brutal-shadow">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white transition-transform group-hover:rotate-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h2 className="font-anton text-3xl uppercase mb-4 text-charcoal">
                  Awaiting Input
                </h2>
                <p className="font-satoshi text-charcoal/60 text-lg max-w-sm font-bold">
                  Upload a document to trigger the AI analysis protocol.
                </p>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in mb-8">
                <div className="border-4 border-charcoal bg-white p-10 brutal-shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-4 bg-golden border-b-4 border-charcoal"></div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-charcoal/5 pb-8">
                    <div>
                      <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/40 mb-2 block">Intelligence Report</span>
                      <h2 className="font-anton text-5xl uppercase leading-none">
                        {analysis.document_type || "Legal Document"}
                      </h2>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-4 py-2 bg-golden text-charcoal text-[10px] font-black uppercase tracking-widest border-2 border-charcoal brutal-shadow-sm">
                        {analysis.country} Jurisdiction
                      </span>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h3 className="font-anton text-2xl uppercase mb-6 flex items-center gap-4 text-charcoal">
                        <span className="flex-1 h-1 bg-charcoal"></span>
                        Summary
                        <span className="flex-1 h-1 bg-charcoal"></span>
                      </h3>
                      <p className="font-satoshi text-xl text-charcoal font-bold leading-relaxed border-l-8 border-golden pl-8 py-2 bg-sage/5 pr-4 border-r-2 border-y-2 border-r-transparent border-y-transparent">
                        {analysis.summary}
                      </p>
                    </div>

                    <div className="grid gap-10 md:grid-cols-2">
                      <div>
                        <h3 className="font-anton text-xl uppercase mb-6 flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          Strategic Clauses
                        </h3>
                        <div className="space-y-4">
                          {analysis.key_clauses?.map((clause, i) => (
                            <div key={i} className="p-6 bg-white border-4 border-charcoal brutal-shadow group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_var(--charcoal)] transition-all">
                              <h4 className="font-anton text-lg uppercase tracking-widest mb-2 text-charcoal">{clause.clause_name}</h4>
                              <p className="font-satoshi text-sm text-charcoal/80 font-bold leading-relaxed">{clause.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-anton text-xl uppercase mb-6 flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>
                          Risk Vectors
                        </h3>
                        <div className="space-y-4">
                          {analysis.risks?.map((risk, i) => (
                            <div key={i} className="p-6 bg-white border-4 border-charcoal brutal-shadow relative group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_var(--charcoal)] transition-all overflow-hidden pr-8">
                              <div className={`absolute right-0 top-0 bottom-0 w-2 border-l-4 border-charcoal ${risk.severity === 'high' ? 'bg-red-500' : risk.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-anton text-lg uppercase tracking-widest text-charcoal">{risk.risk_name}</h4>
                                <span className={`text-[10px] bg-charcoal px-2 py-1 border-2 border-charcoal brutal-shadow-sm font-black uppercase tracking-[0.2em] ${risk.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                                  {risk.severity} Severity
                                </span>
                              </div>
                              <p className="font-satoshi text-sm font-bold text-charcoal/80 leading-relaxed">{risk.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-10 md:grid-cols-2 border-t border-charcoal/5 pt-12">
                      <div>
                        <h3 className="font-anton text-xl uppercase mb-6 flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-golden"></span>
                          Missing Guardrails
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-8">
                          {analysis.missing_protections?.map((item: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-sage text-charcoal text-[10px] font-black uppercase tracking-widest border-2 border-charcoal brutal-shadow-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-anton text-xl uppercase mb-6 flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-charcoal"></span>
                          Active Obligations
                        </h3>
                        <ul className="space-y-3">
                          {analysis.obligations?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 font-satoshi text-sm text-charcoal/70">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-charcoal/20 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
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

