import { encode } from "gpt-tokenizer";

/**
 * TokenManager handles token counting and context limit calculations.
 * While Groq models use different tokenizers, gpt-tokenizer (cl100k_base) 
 * provides a sufficiently accurate upper-bound for safety.
 */
export class TokenManager {
    // Limits for common Groq models
    private static LIMITS: Record<string, number> = {
        "llama-3.3-70b-versatile": 8192, // Even though model has larger context, TPM limits often restrict us to ~12k
        "llama3-70b-8192": 8192,
        "llama3-8b-8192": 8192,
        "mixtral-8x7b-32768": 32768,
        "gemma-7b-it": 8192,
    };


    private static DEFAULT_LIMIT = 8192;
    private static SAFETY_MARGIN = 1000; // Increased buffer for complex system prompts and multi-part reasoning

    /**
     * Counts the number of tokens in a string.
     */
    static countTokens(text: string): number {
        if (!text) return 0;
        return encode(text).length;
    }

    /**
     * Returns the maximum tokens allowed for a single chunk for a specific model.
     */
    static getMaxChunkTokens(model: string = "llama3-70b-8192"): number {
        const limit = this.LIMITS[model] || this.DEFAULT_LIMIT;
        return limit - this.SAFETY_MARGIN;
    }

    /**
     * Checks if a prompt exceeds the model's capacity.
     */
    static exceedsLimit(prompt: string, model: string = "llama3-70b-8192"): boolean {
        const limit = this.LIMITS[model] || this.DEFAULT_LIMIT;
        return this.countTokens(prompt) > (limit - this.SAFETY_MARGIN);
    }
}

