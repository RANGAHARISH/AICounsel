"use client";

type Severity = "low" | "medium" | "high";

export type RedFlagForViewer = {
  title: string;
  severity: Severity;
  clauseExcerpt?: string;
  clauseLabel?: string;
  whyItMatters?: string;
  recommendedActions?: string[];
};

type Highlight = {
  index: number;
  start: number;
  end: number;
  severity: Severity;
};

function orderHighlights(
  sourceText: string,
  flags: RedFlagForViewer[],
): Highlight[] {
  const highlights: Highlight[] = [];

  flags.forEach((rf, index) => {
    const excerpt = (rf.clauseExcerpt || "").trim();
    if (!excerpt) return;
    const pos = sourceText.indexOf(excerpt);
    if (pos === -1) return;
    highlights.push({
      index,
      start: pos,
      end: pos + excerpt.length,
      severity: rf.severity,
    });
  });

  return highlights.sort((a, b) => a.start - b.start);
}

function severityClass(severity: Severity) {
  switch (severity) {
    case "high":
      return "bg-red-100 border-red-300";
    case "medium":
      return "bg-amber-100 border-amber-300";
    default:
      return "bg-emerald-100 border-emerald-300";
  }
}

export function DocumentViewer({
  sourceText,
  redFlags,
}: {
  sourceText: string;
  redFlags: RedFlagForViewer[];
}) {
  const text = sourceText || "";
  const highlights = orderHighlights(text, redFlags);

  if (!text) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
        Upload or paste a document to view it here.
      </div>
    );
  }

  if (!highlights.length) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="font-serif text-lg font-semibold text-stone-900">
          Document preview
        </h3>
        <p className="mt-2 text-sm text-stone-500">
          No specific clauses were highlighted. You can still scroll the full
          text below.
        </p>
        <div className="mt-4 max-h-[480px] overflow-auto rounded-xl border border-stone-100 bg-stone-50 p-4 text-sm text-stone-800 whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  highlights.forEach((h, idx) => {
    if (h.start > cursor) {
      parts.push(text.slice(cursor, h.start));
    }
    const excerpt = text.slice(h.start, h.end);
    parts.push(
      <span
        key={`hl-${idx}`}
        id={`issue-${h.index}`}
        className={`inline-block rounded-md border px-1.5 py-0.5 text-xs font-medium ${severityClass(
          h.severity,
        )}`}
      >
        <span className="mr-1 align-middle text-[0.65rem] text-stone-600">
          #{h.index + 1}
        </span>
        <span className="align-middle">{excerpt}</span>
      </span>,
    );
    cursor = h.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="font-serif text-lg font-semibold text-stone-900">
        Document with highlighted issues
      </h3>
      <p className="mt-2 text-sm text-stone-600">
        Highlighted sections match the numbered issues on the right. Scroll and
        skim to see risks in context.
      </p>
      <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-stone-100 bg-stone-50 p-4 text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
        {parts}
      </div>
    </div>
  );
}

