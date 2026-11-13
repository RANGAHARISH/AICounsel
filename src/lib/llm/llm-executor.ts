import { Groq } from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export interface LLMRequest {
    systemPrompt?: string;
    userPrompt: string;
    model?: string;
    temperature?: number;
    stream?: boolean;
}

/**
 * LLMExecutor handles communication with Groq API with resilience and high performance.
 */
export class LLMExecutor {
    private groq: Groq;
    private static DEFAULT_MODEL = "llama3-70b-8192";
    private static MAX_RETRIES = 3;
    private static CONCURRENCY_LIMIT = 2;


    constructor(apiKey: string) {
        this.groq = new Groq({ apiKey });
    }

    /**
     * Executes a single prompt with retry logic.
     */
    async execute(req: LLMRequest, retryCount = 0): Promise<string> {
        const messages: ChatCompletionMessageParam[] = [];
        if (req.systemPrompt) {
            messages.push({ role: "system", content: req.systemPrompt });
        }
        messages.push({ role: "user", content: req.userPrompt });

        try {
            const response = await this.groq.chat.completions.create({
                model: req.model || LLMExecutor.DEFAULT_MODEL,
                messages,
                temperature: req.temperature ?? 0,
                stream: false,
            });

            return response.choices[0]?.message?.content || "";
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const status =
                typeof error === "object" && error !== null && "status" in error
                    ? error.status
                    : undefined;
            const isRateLimit = status === 429 ||
                errorMessage.includes("rate_limit_exceeded") ||
                errorMessage.includes("TPM") ||
                errorMessage.includes("Request too large");

            // Handle Rate Limit or Overloaded
            if ((isRateLimit || status === 503) && retryCount < LLMExecutor.MAX_RETRIES) {
                // For TPM/Rate limits, we use a more aggressive backoff
                const wait = Math.pow(3, retryCount) * 2000;
                console.warn(`LLM Rate Limited/TPM Exceeded. Retrying in ${wait}ms...`);
                await new Promise(resolve => setTimeout(resolve, wait));
                return this.execute(req, retryCount + 1);
            }
            console.error("LLM Execution error:", error);
            throw error;
        }

    }

    /**
     * Executes multiple chunks with concurrency control (Map Phase).
     */
    async executeBatch(chunks: string[], baseRequest: LLMRequest): Promise<string[]> {
        const results: string[] = new Array(chunks.length);
        const taskQueue = chunks.map((chunk, index) => ({ chunk, index }));

        const worker = async () => {
            while (taskQueue.length > 0) {
                const task = taskQueue.shift();
                if (!task) break;

                results[task.index] = await this.execute({
                    ...baseRequest,
                    userPrompt: `[DOCUMENT SEGMENT ${task.index + 1}/${chunks.length}]\n\n${task.chunk}\n\nTASK: ${baseRequest.userPrompt}`
                });
            }
        };

        // Run workers in parallel up to concurrency limit
        const workers = Array(Math.min(LLMExecutor.CONCURRENCY_LIMIT, chunks.length))
            .fill(null)
            .map(() => worker());

        await Promise.all(workers);
        return results;
    }

    /**
     * Provides a generator for streaming responses (for final output UX).
     */
    async *streamExecute(req: LLMRequest) {
        const messages: ChatCompletionMessageParam[] = [];
        if (req.systemPrompt) {
            messages.push({ role: "system", content: req.systemPrompt });
        }
        messages.push({ role: "user", content: req.userPrompt });

        const stream = await this.groq.chat.completions.create({
            model: req.model || LLMExecutor.DEFAULT_MODEL,
            messages,
            temperature: req.temperature ?? 0,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) yield content;
        }
    }
}

