import { TokenManager } from "./token-manager";
import { ChunkProcessor } from "./chunk-processor";
import { LLMExecutor } from "./llm-executor";
import { ResultAggregator } from "./result-aggregator";

export interface AnalysisOptions {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
    jsonStructure?: string;
}

/**
 * AnalysisService provides a high-level API for processing large documents.
 * It automatically decides whether to use a single request or a Map-Reduce pipeline.
 */
export class AnalysisService {
    private executor: LLMExecutor;
    private aggregator: ResultAggregator;

    constructor(apiKey: string) {
        this.executor = new LLMExecutor(apiKey);
        this.aggregator = new ResultAggregator(this.executor);
    }

    /**
     * Analyzes a document, handling massive inputs gracefully.
     */
    async analyzeDocument(text: string, goal: string, options: AnalysisOptions = {}): Promise<string> {
        const model = options.model || "llama3-70b-8192";
        const tokens = TokenManager.countTokens(text);
        const limit = TokenManager.getMaxChunkTokens(model);

        console.log(`Analyzing document (${tokens} tokens) for goal: ${goal}`);

        // If it fits in one shot, keep it simple
        if (tokens <= limit) {
            return this.executor.execute({
                systemPrompt: options.systemPrompt,
                userPrompt: `GOAL: ${goal}\n\nDOCUMENT:\n${text}`,
                model,
                temperature: options.temperature
            });
        }

        // Map Phase: Split and Process
        console.log("Document exceeds limit. Triggering Map-Reduce pipeline...");
        const chunks = ChunkProcessor.split(text, { model });
        console.log(`Split into ${chunks.length} semantic chunks.`);

        const chunkResults = await this.executor.executeBatch(chunks, {
            systemPrompt: options.systemPrompt,
            userPrompt: goal,
            model,
            temperature: options.temperature
        });

        // Reduce Phase: Synthesize
        console.log("Synthesizing chunk results...");
        return this.aggregator.reduce(chunkResults, goal, model);
    }

    /**
     * Analyzes a document and returns structured JSON.
     */
    async analyzeDocumentJSON(text: string, goal: string, structure: string, options: AnalysisOptions = {}): Promise<any> {
        const model = options.model || "llama3-70b-8192";
        const tokens = TokenManager.countTokens(text);
        const limit = TokenManager.getMaxChunkTokens(model);

        if (tokens <= limit) {
            const raw = await this.executor.execute({
                systemPrompt: (options.systemPrompt || "") + "\nReturn ONLY raw JSON.",
                userPrompt: `GOAL: ${goal}\n\nDOCUMENT:\n${text}\n\nOUTPUT STRUCTURE: ${structure}`,
                model,
                temperature: options.temperature
            });
            return JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
        }

        // Map-Reduce for JSON
        const chunks = ChunkProcessor.split(text, { model });
        const chunkResults = await this.executor.executeBatch(chunks, {
            systemPrompt: options.systemPrompt + "\nOutput your segment analysis in JSON format.",
            userPrompt: goal,
            model,
            temperature: options.temperature
        });

        return this.aggregator.reduceJSON(chunkResults, structure, model);
    }
}
