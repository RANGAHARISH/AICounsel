// NOTE: pdf-parse is imported dynamically inside extractTextFromFile().
// Top-level import causes a crash in Next.js because pdf-parse runs
// fs.readFileSync() on a test PDF at module load time.
import mammoth from "mammoth";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";


// AnalysisSchema is currently unused on the server side but defined for reference
// It can be added back if structured JSON response schema mapping is needed

import crypto from "crypto";

interface AnalysisResult {
  document_type: string;
  country: string;
  key_clauses: { clause_name: string; description: string }[];
  obligations: string[];
  risks: { risk_name: string; severity: "low" | "medium" | "high"; explanation: string }[];
  missing_protections: string[];
  summary: string;
}

function safeText(input: string) {
  return input.replace(/\u0000/g, "").trim();
}

/**
 * Normalizes text to ensure consistency between different file formats.
 * Removes extra whitespace, standardizes punctuation, and strips artifacts.
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n") // Collapse triple+ newlines
    .replace(/[ \t]+/g, " ")      // Collapse multiple spaces/tabs
    .replace(/[“”]/g, '"')       // Standardize quotes
    .replace(/[‘’]/g, "'")
    .trim();
}

/**
 * Generates a SHA-256 hash of the normalized text.
 */
function generateHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function extractTextFromFile(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = (file.name || "").toLowerCase().trim();
  const type = (file.type || "").toLowerCase().trim();
  console.log("EXTRACT START:", { name, type, bufLen: buf.length });

  // --- PDF ---
  if (type.includes("pdf") || name.endsWith(".pdf")) {
    try {
      // Dynamic import avoids pdf-parse running fs.readFileSync on a test
      // file at module load time, which crashes in Next.js server routes.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseModule = await import("pdf-parse") as any;

      // pdf-parse v1.1.1 usually exposes a default function or is the module itself
      const pdfParseFn = typeof pdfParseModule === "function" ? pdfParseModule : pdfParseModule.default;

      if (typeof pdfParseFn !== "function") {
        throw new Error("Cannot load PDF parser engine. pdf-parse export is not recognized.");
      }

      const data = await pdfParseFn(buf);
      const extracted = safeText(data.text || "");
      if (!extracted) throw new Error("PDF appears to be empty or image-only (scanned). Please use a text-based PDF.");
      return extracted;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Re-throw our own descriptive messages directly
      if (msg.includes("scanned") || msg.includes("empty") || msg.includes("PDF parser")) throw err;
      throw new Error(`Could not read PDF: ${msg}`);
    }
  }

  // --- DOCX ---
  if (
    type.includes("word") ||
    type.includes("officedocument") ||
    name.endsWith(".docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: buf });
      const extracted = safeText(result.value || "");
      if (!extracted) throw new Error("The Word document appears to be empty.");
      return extracted;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("empty")) throw err;
      throw new Error(`Could not read DOCX: ${msg}`);
    }
  }

  // --- TXT ---
  // Browsers sometimes send empty or generic content-type for .txt files,
  // so we check the filename extension as the primary signal.
  if (name.endsWith(".txt") || type.startsWith("text/") || type === "application/octet-stream") {
    // Try UTF-8 first, fall back to latin1 for legacy documents
    let decoded = buf.toString("utf8");
    // Basic validation: if there are too many replacement chars, it's likely binary
    if ((decoded.match(/\uFFFD/g) || []).length > 10) {
      decoded = buf.toString("latin1");
    }
    const extracted = safeText(decoded);
    if (!extracted) throw new Error("The text file appears to be empty.");
    return extracted;
  }

  throw new Error(`Unsupported file type. Please upload a PDF, DOCX, or TXT file.`);
}

/**
 * Main parser entry point that returns normalized text.
 */
async function parseDocument(file: File): Promise<{ text: string; hash: string }> {
  const rawText = await extractTextFromFile(file);
  const normalized = normalizeText(rawText);
  const hash = generateHash(normalized);
  return { text: normalized, hash };
}

function buildPrompt(documentText: string, country: string) {
  return `You are a professional legal analyst specializing in the jurisdiction of ${country}.

Analyze the following legal document strictly according to the laws and legal framework of ${country}.

Your goal is to provide a structured, accurate, and deterministic legal analysis.

Return your analysis strictly as a JSON object following this schema:
{
  "document_type": "string",
  "country": "string",
  "key_clauses": [
    { "clause_name": "string", "description": "string" }
  ],
  "obligations": ["string"],
  "risks": [
    { "risk_name": "string", "severity": "low|medium|high", "explanation": "string" }
  ],
  "missing_protections": ["string"],
  "summary": "string"
}

Rules:
1. Do not include any text before or after the JSON object.
2. Use plain, professional English.
3. Be concise and accurate.
4. If a field is not applicable, use an empty array or empty string.

Document Content:
${documentText}`;
}

// Simple in-memory cache for analysis results
const analysisCache = new Map<string, AnalysisResult>();

function getFriendlyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // API key / authentication errors
  if (message.includes("401") || message.includes("invalid_api_key") || message.includes("Authentication") || message.includes("Unauthorized")) {
    return "API key authentication failed. Please check your GROQ_API_KEY configuration.";
  }

  // API specific quota errors
  if (message.includes("429") || message.includes("Quota") || message.includes("rate_limit") || message.includes("Too Many Requests")) {
    return "The AI analysis quota has been reached. Please try again later.";
  }

  // Safety/content errors
  if (message.includes("SAFETY") || message.includes("blocked")) {
    return "The document could not be analyzed due to safety filters. Please ensure the content is appropriate.";
  }

  // Connection/Server errors
  if (message.includes("fetch failed") || message.includes("ECONNRESET") || message.includes("ENOTFOUND") || message.includes("network socket disconnected")) {
    return "There was a connection issue with the AI service. Please check your internet and try again.";
  }

  // Unexpected HTML response from upstream (groq returning an error page)
  if (message.includes("<!DOCTYPE") || message.includes("Unexpected token")) {
    return "The AI service returned an unexpected response. Please try again in a moment.";
  }

  // PDF specific extraction errors or Word errors
  if (message.includes("Could not read PDF") || message.includes("Could not read DOCX") || message.includes("scanned") || message.includes("empty") || message.includes("parser initialization")) {
    return message;
  }

  // File size errors
  if (message.includes("File too large")) {
    return message;
  }

  // Default fallback
  return "We couldn't analyze the document right now. Please try again in a few minutes.";
}

export async function POST(request: Request) {
  console.log("Checking GROQ_API_KEY presence:", !!process.env.GROQ_API_KEY);
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId: string | null = session?.user?.id ?? null;

    // Suppress unused variable warning — userId reserved for future per-user logging/rate-limiting
    void userId;

    const contentType = request.headers.get("content-type") || "";
    let text = "";
    let country = "United States"; // Default
    let docHash = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const pasted = form.get("text");
      const countryInput = form.get("country");

      if (typeof countryInput === "string" && countryInput.trim()) {
        country = countryInput.trim();
      }

      if (typeof pasted === "string" && pasted.trim()) {
        text = normalizeText(pasted);
        docHash = generateHash(text);
      } else if (file instanceof File && file.size > 0) {
        console.log("File uploaded:", { name: file.name, type: file.type, size: file.size });
        if (file.size > 12 * 1024 * 1024) {
          return NextResponse.json(
            { error: "File too large (max 12MB)." },
            { status: 400 },
          );
        }
        const { text: extractedText, hash } = await parseDocument(file);
        text = extractedText;
        docHash = hash;
      }
    } else if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => ({}))) as {
        text?: string;
        country?: string;
      };
      if (body?.country) country = body.country;
      if (body?.text) {
        text = normalizeText(body.text);
        docHash = generateHash(text);
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: "No text could be extracted. Please upload a PDF, DOCX, or TXT file with readable text." },
        { status: 400 },
      );
    }

    // Check Cache
    const cacheKey = `${docHash}_${country}`;
    if (analysisCache.has(cacheKey)) {
      console.log("Returning cached analysis for hash:", docHash);
      return NextResponse.json(analysisCache.get(cacheKey));
    }

    if (text.length < 200) {
      return NextResponse.json(
        { error: `The document is too short (${text.length} chars). Please provide at least ~200 characters of content.` },
        { status: 400 },
      );
    }
    console.log("Extracted text length:", text.length, "Hash:", docHash, "Jurisdiction:", country);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error: API key missing. Please contact support." },
        { status: 500 },
      );
    }

    const { AnalysisService } = await import("@/lib/llm/analysis-service");
    const analysisService = new AnalysisService(apiKey);

    console.log("Processing document via AnalysisService Map-Reduce pipeline...");

    const goal = `Analyze the provided legal document for the jurisdiction of ${country}. 
    Focus on strategic key clauses, concrete obligations, severe risk vectors, and missing protections. 
    Produce a summary that captures the operational intelligence of the document.`;

    const structure = JSON.stringify({
      document_type: "string",
      country: "string",
      key_clauses: [{ clause_name: "string", description: "string" }],
      obligations: ["string"],
      risks: [{ risk_name: "string", severity: "low|medium|high", explanation: "string" }],
      missing_protections: ["string"],
      summary: "string"
    });

    const finalResult = await analysisService.analyzeDocumentJSON<AnalysisResult>(text, goal, structure, {
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      systemPrompt: "You are a professional legal analyst specializing in jurisdiction-aware document intelligence. Return only valid JSON."
    });

    console.log("Analysis completed successfully.");
    analysisCache.set(cacheKey, finalResult);

    return NextResponse.json(finalResult);
  } catch (e) {
    console.error("ANALYSIS ERROR:", e);
    const friendlyMessage = getFriendlyErrorMessage(e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: friendlyMessage,
        details: errorMessage
      },
      { status: 500 }
    );
  }

}


