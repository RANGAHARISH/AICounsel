import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import mammoth from "mammoth";
import { auth } from "@/lib/auth";

const AnalysisSchema = z.object({
  plainEnglishSummary: z.string().min(1),
  redFlags: z
    .array(
      z.object({
        title: z.string().min(1),
        severity: z.enum(["low", "medium", "high"]),
        whyItMatters: z.string().min(1),
        suggestedEdit: z.string().optional().default(""),
      }),
    )
    .default([]),
  shouldISignScore: z.number().int().min(0).max(100),
  rationale: z.string().min(1),
  keyClauses: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  disclaimer: z.string().min(1),
});

function safeText(input: string) {
  return input.replace(/\u0000/g, "").trim();
}

async function extractTextFromFile(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buf) });
    const pdf = await loadingTask.promise;
    let out = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = (content.items as any[])
        .map((it) => (typeof it?.str === "string" ? it.str : ""))
        .filter(Boolean)
        .join(" ");
      out += pageText + "\n";
    }
    return safeText(out);
  }

  if (
    type.includes("word") ||
    type.includes("officedocument") ||
    name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: buf });
    return safeText(result.value || "");
  }

  if (type.startsWith("text/") || name.endsWith(".txt")) {
    return safeText(buf.toString("utf8"));
  }

  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}

function buildPrompt(documentText: string) {
  return [
    "You are AICounsel, a legal document analysis assistant.",
    "Task: explain the document in plain English and highlight risks.",
    "Be careful: do not hallucinate clauses not present. If missing, say so.",
    "Return STRICT JSON ONLY matching this schema:",
    "{",
    '  "plainEnglishSummary": string,',
    '  "redFlags": [{ "title": string, "severity": "low"|"medium"|"high", "whyItMatters": string, "suggestedEdit": string }],',
    '  "shouldISignScore": number (0-100),',
    '  "rationale": string,',
    '  "keyClauses": string[],',
    '  "nextSteps": string[],',
    '  "disclaimer": string',
    "}",
    "Scoring guidance:",
    "- 0 means extremely risky / do not sign; 100 means low risk / typical terms.",
    "- If the document is incomplete or too short, lower confidence and note it.",
    "Document text begins:",
    documentText,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const sessionRes = await auth.api.getSession({ headers: request.headers });
    const session = (sessionRes as any)?.data;
    const userId: string | null = session?.user?.id ?? null;

    const contentType = request.headers.get("content-type") || "";
    let text = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const pasted = form.get("text");
      if (typeof pasted === "string" && pasted.trim()) {
        text = safeText(pasted);
      } else if (file instanceof File && file.size > 0) {
        if (file.size > 12 * 1024 * 1024) {
          return Response.json(
            { error: "File too large (max 12MB)." },
            { status: 400 },
          );
        }
        text = await extractTextFromFile(file);
      }
    } else if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => ({}))) as {
        text?: string;
      };
      if (body?.text) text = safeText(body.text);
    }

    if (!text || text.length < 200) {
      return Response.json(
        {
          error:
            "Please provide more text (min ~200 characters) or upload a full document.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Server missing GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use a current, supported Gemini model for v1beta
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = buildPrompt(text.slice(0, 120_000));
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const jsonText = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = AnalysisSchema.safeParse(JSON.parse(jsonText));
    if (!parsed.success) {
      return Response.json(
        { error: "Model returned invalid output", raw },
        { status: 502 },
      );
    }

    return Response.json({ data: parsed.data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

