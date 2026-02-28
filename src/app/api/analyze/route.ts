import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import mammoth from "mammoth";
import { auth } from "@/lib/auth";

const RedFlagSchema = z.object({
  title: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  whyItMatters: z.string().min(1),
  suggestedEdit: z.string().optional().default(""),
  clauseExcerpt: z.string().optional().default(""),
  clauseLabel: z.string().optional().default(""),
  category: z.string().optional().default(""),
  recommendedActions: z.array(z.string()).optional().default([]),
});

const AnalysisSchema = z.object({
  // Original document text we analyzed (added on the server)
  sourceText: z.string().min(1),
  plainEnglishSummary: z.string().min(1),
  redFlags: z.array(RedFlagSchema).default([]),
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
  return `You are a Contract Review and Explanation System designed to help non-lawyers understand legal documents in simple, clear, human language. Your output must look like a refined, professional human-written contract analysis, not an AI output. It must be extremely simple and concise.

CRITICAL RULES FOR FORMATTING - YOU MUST OBEY THESE:
1. Do NOT use ANY bullet points. No asterisks (*), no hyphens (-), no bullet dots (•). NEVER use list markers.
2. Do NOT use hashtags (#), code fences, heavy emojis, or decorative symbols. You MAY use markdown bolding (**) for headers and emphasis only.
3. Write ONLY in short sentences and concise paragraphs.
4. Use clean section headings in bold (for example: **Document Review Summary**).
5. Explain everything in the simplest possible English.

Your Output Structure (Must Follow Exactly):

**Document Review Summary**
Should I Sign? Score: (0–100)
Immediate recommendation: (Yes / No / Fix Before Signing)
Reason: (One-sentence explanation of the score)

**High-Risk Issues**
1. Issue Name (Risk Level): Explain what the clause means and why it is risky in a couple of short sentences.
(Do not use bullet points or asterisks. Number each issue.)

**Medium-Risk Issues**
1. Issue Name (Risk Level): Short explanation for each. Give concise, plain text descriptions.

**Low-Risk Issues**
1. Issue Name (Risk Level): Short explanation for each.

**Plain English Summary**
Write a simple explanation of the entire agreement in easy English paragraph form, maximum 4 lines.

**Action Items Before Signing**
Number each item (e.g., 1., 2., 3.). List the key fixes, clarifications or negotiations required in plain text sentences. DO NOT use bullet points.

**Clause-by-Clause Analysis**
Format the name of each clause in bold. Then, write a very short, concise sentence explaining its Meaning. Then write its Risk Level. Finally, explicitly state if there is Missing Information. 
Example format:
**1. Demise, Term, and Rent Payment**
Meaning: The lessor grants the lease specifies duration, start date, and rent amount.
Risk Level: Medium.
Missing Information: Exact location, duration in years, and specific rent amount.

Style Requirements:  
Absolutely NO bullet points or asterisks (*). Plain English only. Neutral, factual, concise. Emphasize missing fields clearly by writing [Missing Information]. Avoid sounding like an AI.

Now analyze the uploaded legal document accordingly, keeping it extremely brief.

${documentText}`;
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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = buildPrompt(text.slice(0, 120_000));
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    return Response.json({ text: raw });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

