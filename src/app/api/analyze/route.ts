// NOTE: pdf-parse is imported dynamically inside extractTextFromFile().
// Top-level import causes a crash in Next.js because pdf-parse runs
// fs.readFileSync() on a test PDF at module load time.
import mammoth from "mammoth";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";


// AnalysisSchema is currently unused on the server side but defined for reference
// It can be added back if structured JSON response schema mapping is needed


function safeText(input: string) {
  return input.replace(/\u0000/g, "").trim();
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

      let dataText = "";

      // The new pdf-parse (v2+) often exports a PDFParse class.
      // We look for it in the module object or its .default property.
      const PDFParseClass = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse;

      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: buf });
        const result = await parser.getText();
        dataText = result.text;
      } else {
        // Fallback for older pdf-parse or different export structures
        const pdfParseFn = typeof pdfParseModule.default === "function"
          ? pdfParseModule.default
          : (typeof pdfParseModule === "function" ? pdfParseModule : null);

        if (!pdfParseFn) {
          // One last check: maybe it's pdfParseModule.pdfParse
          const altFn = pdfParseModule.pdfParse || pdfParseModule.default?.pdfParse;
          if (typeof altFn === "function") {
            const data = await altFn(buf);
            dataText = data.text;
          } else {
            throw new Error(`PDF parser initialization failed. Module keys: ${Object.keys(pdfParseModule).join(", ")}`);
          }
        } else {
          const data = await pdfParseFn(buf);
          dataText = data.text;
        }
      }

      const extracted = safeText(dataText);
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

  throw new Error(`Unsupported file type "${file.type || name.split('.').pop()}". Please upload a PDF, DOCX, or TXT file.`);
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

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const pasted = form.get("text");
      if (typeof pasted === "string" && pasted.trim()) {
        text = safeText(pasted);
      } else if (file instanceof File && file.size > 0) {
        console.log("File uploaded:", { name: file.name, type: file.type, size: file.size });
        if (file.size > 12 * 1024 * 1024) {
          return NextResponse.json(
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

    if (!text) {
      return NextResponse.json(
        { error: "No text could be extracted. Please upload a PDF, DOCX, or TXT file with readable text." },
        { status: 400 },
      );
    }

    if (text.length < 200) {
      return NextResponse.json(
        { error: `The document is too short (${text.length} chars). Please provide at least ~200 characters of content.` },
        { status: 400 },
      );
    }
    console.log("Extracted text length:", text.length);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error: API key missing. Please contact support." },
        { status: 500 },
      );
    }

    const prompt = buildPrompt(text.slice(0, 100_000)); // limit length

    console.log("Sending request to Groq API...");
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API returned an error:", groqResponse.status, errorText);
      throw new Error(`Groq API Error: ${groqResponse.status} ${errorText}`);
    }

    const chatCompletion = await groqResponse.json();
    const raw = chatCompletion.choices?.[0]?.message?.content?.trim() || "";
    console.log("Groq API response received successfully.");

    if (!raw) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ text: raw });
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


