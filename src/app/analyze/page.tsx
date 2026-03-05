"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export default function AnalyzePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/login");
  }, [session, isPending, router]);

  const canSubmit = useMemo(() => {
    if (mode === "file") return !!file;
    return text.trim().length >= 200;
  }, [mode, file, text]);

  async function onAnalyze() {
    setError("");
    setAnalysisText(null);
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
        | { text: string }
        | { error: string; raw?: string };
      if (!res.ok) {
        const errorMsg = "error" in json ? json.error : "Request failed";
        console.error("Analysis Request Failed:", errorMsg, json);
        setError(errorMsg);
        return;
      }
      if ("text" in json) setAnalysisText(json.text);
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
              Upload a PDF/DOCX/TXT or paste text. You’ll get a plain-English summary,
              red flags, and a “Should I sign?” score.
            </p>

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
            {!analysisText ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8">
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Results
                </h2>
                <p className="mt-2 text-stone-600">
                  Upload or paste a document to see the plain-English summary, risks,
                  and a focused view of issues.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200 bg-white p-8 font-sans text-sm text-stone-700 leading-relaxed">
                  {analysisText.split("\n").map((line, i) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return <div key={i} className="h-4" />;

                    const renderInlineFormatting = (text: string) => {
                      const parts = text.split(/(\*\*.*?\*\*)/g);
                      return parts.map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={index} className="text-stone-900">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });
                    };

                    const rawText = trimmedLine.replace(/\*\*/g, "").trim();

                    // Main section headers
                    const mainHeaders = [
                      "Document Review Summary",
                      "High-Risk Issues",
                      "Medium-Risk Issues",
                      "Low-Risk Issues",
                      "Plain English Summary (maximum 4 lines)",
                      "Plain English Summary",
                      "Action Items Before Signing",
                      "Clause-by-Clause Analysis"
                    ];

                    if (mainHeaders.includes(rawText) || trimmedLine.startsWith("------")) {
                      return (
                        <h2 key={i} className="font-serif text-lg font-bold text-stone-900 mt-6 mb-2">
                          {rawText}
                        </h2>
                      );
                    }

                    // Numbered lists or bold start lines
                    if (trimmedLine.match(/^(\d+\.\s+)(.*)/)) {
                      return <div key={i} className="mt-4 mb-1">{renderInlineFormatting(trimmedLine)}</div>;
                    }

                    return <p key={i} className="mb-2">{renderInlineFormatting(trimmedLine)}</p>;
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

