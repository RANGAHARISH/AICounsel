import { TokenManager } from "./token-manager";
import { LLMExecutor, LLMRequest } from "./llm-executor";

/**
 * ResultAggregator synthesizes multiple chunk responses into a final output.
 * Uses a recursive Map-Reduce approach for massive document sets.
 */
export class ResultAggregator {
    constructor(private executor: LLMExecutor) { }

    /**
     * Reduces an array of chunk responses into a single coherent response.
     * If the combined results are too large, it reduces them in stages.
     */
    async reduce(chunkResults: string[], originalGoal: string, model: string = "llama3-70b-8192"): Promise<string> {
        if (chunkResults.length === 0) return "";
        if (chunkResults.length === 1) return chunkResults[0];

        const combinedText = chunkResults.join("\n\n---\n\n");
        const combinedTokens = TokenManager.countTokens(combinedText);
        const maxTokens = TokenManager.getMaxChunkTokens(model);

        // If combined results fit, do a direct reduction
        if (combinedTokens < maxTokens * 0.8) {
            return this.synthesize(chunkResults, originalGoal, model);
        }

        // Otherwise, split results into smaller batches and reduce them hierarchically
        console.log(`Large result set (${combinedTokens} tokens). Performing hierarchical reduction...`);
        const midPoint = Math.ceil(chunkResults.length / 2);
        const [left, right] = [chunkResults.slice(0, midPoint), chunkResults.slice(midPoint)];

        const [leftSummary, rightSummary] = await Promise.all([
            this.reduce(left, originalGoal, model),
            this.reduce(right, originalGoal, model)
        ]);

        return this.synthesize([leftSummary, rightSummary], originalGoal, model);
    }

    /**
     * Internal synthesis step using the LLM.
     */
    private async synthesize(segments: string[], goal: string, model: string): Promise<string> {
        const prompt = `
            TASK: Synthesize the following partial legal analyses into a single comprehensive report.
            GOAL: ${goal}

            PARTIAL ANALYSES:
            ${segments.map((s, i) => `[SEGMENT ${i + 1}]\n${s}`).join("\n\n")}

            INSTRUCTIONS:
            1. Eliminate duplicates.
            2. Reconcile any conflicting findings (prioritize risk).
            3. Ensure logical continuity and executive-level tone.
            4. Preserve all specific legal references or clause numbers.
        `;

        return this.executor.execute({
            systemPrompt: "You are a senior legal strategist responsible for high-stakes document synthesis.",
            userPrompt: prompt,
            model,
            temperature: 0,
        });
    }

    /**
     * Aggregates JSON structures by merging fields logically.
     */
    async reduceJSON(chunkResults: string[], structure: string, model: string = "llama3-70b-8192"): Promise<any> {
        const prompt = `
            TASK: Merge the following JSON assessment components into a single valid JSON object.
            TARGET STRUCTURE: ${structure}

            DATA BLOCKS:
            ${chunkResults.join("\n---\n")}

            RULES:
            - Sum/Average numeric scores as appropriate.
            - Deduplicate lists (e.g., risks, missing protections).
            - Concatenate summaries into a single cohesive narrative.
            - Output ONLY raw JSON.
        `;

        const raw = await this.executor.execute({
            systemPrompt: "JSON AGGREGATOR ENGINE. OUTPUT JSON ONLY.",
            userPrompt: prompt,
            model,
        });

        try {
            // Remove markdown code blocks if present
            const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
            return JSON.parse(clean);
        } catch (e) {
            console.error("JSON Reduction Failed. Raw output:", raw);
            throw new Error("Aggregator failed to produce valid JSON");
        }
    }
}

