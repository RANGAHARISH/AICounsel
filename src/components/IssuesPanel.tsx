"use client";

import type { RedFlagForViewer } from "./DocumentViewer";

function severityPill(severity: RedFlagForViewer["severity"]) {
  switch (severity) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-800 border-amber-200";
    default:
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
}

export function IssuesPanel({ redFlags }: { redFlags: RedFlagForViewer[] }) {
  if (!redFlags.length) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="font-serif text-lg font-semibold text-stone-900">
          Issues & warnings
        </h3>
        <p className="mt-2 text-sm text-stone-600">
          No major issues were flagged in this document.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="font-serif text-lg font-semibold text-stone-900">
        Issues & warnings
      </h3>
      <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">
        Click an item to jump to the clause
      </p>
      <div className="mt-4 space-y-3">
        {redFlags.map((rf, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              const el = document.getElementById(`issue-${index}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm transition hover:border-stone-300 hover:bg-stone-100"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[0.65rem] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="font-medium text-stone-900">
                    {rf.clauseLabel || rf.title}
                  </span>
                </div>
                <p className="mt-1 line-clamp-3 text-xs text-stone-700">
                  {rf.whyItMatters}
                </p>
                {rf.recommendedActions && rf.recommendedActions.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[0.7rem] text-stone-600">
                    {rf.recommendedActions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${severityPill(
                  rf.severity,
                )}`}
              >
                {rf.severity.toUpperCase()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

