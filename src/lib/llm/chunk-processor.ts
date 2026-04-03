import { TokenManager } from "./token-manager";

export interface ChunkOptions {
    model?: string;
    maxTokens?: number;
    overlapTokens?: number;
}

/**
 * ChunkProcessor splits large documents into semantically coherent segments.
 * Focuses on maintaining logical continuity for legal and technical documents.
 */
export class ChunkProcessor {
    private static DEFAULT_OVERLAP_TOKENS = 300;

    /**
     * Splits text into chunks based on semantic boundaries.
     * Hierarchy: Double Newlines (Sections) > Single Newlines (Paragraphs) > Sentences > Words.
     */
    static split(text: string, options: ChunkOptions = {}): string[] {
        const model = options.model || "llama3-70b-8192";
        const maxTokens = options.maxTokens || TokenManager.getMaxChunkTokens(model);
        const overlapTokens = options.overlapTokens ?? this.DEFAULT_OVERLAP_TOKENS;

        const totalTokens = TokenManager.countTokens(text);
        if (totalTokens <= maxTokens) {
            return [text];
        }

        return this.recursiveSplit(text, maxTokens, overlapTokens);
    }

    /**
     * Recursively splits text until all pieces fit within the token limit.
     */
    private static recursiveSplit(
        text: string,
        maxTokens: number,
        overlapTokens: number,
        delimiters: string[] = ["\n\n\n", "\n\n", "\n", ". ", " "]
    ): string[] {
        const total = TokenManager.countTokens(text);
        if (total <= maxTokens) return [text];

        if (delimiters.length === 0) {
            // Hard split at word/token level if no delimiters left
            return this.hardSplit(text, maxTokens, overlapTokens);
        }

        const delimiter = delimiters[0];
        const parts = text.split(delimiter);
        const chunks: string[] = [];
        let currentBuffer = "";

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const partWithDelimiter = i < parts.length - 1 ? part + delimiter : part;
            const bufferPotential = currentBuffer + partWithDelimiter;

            if (TokenManager.countTokens(bufferPotential) > maxTokens) {
                if (currentBuffer) {
                    chunks.push(currentBuffer.trim());
                    // Create overlap from current buffer
                    currentBuffer = this.getOverlapText(currentBuffer, overlapTokens) + partWithDelimiter;
                } else {
                    // Single part is already too big, need deeper split
                    const subChunks = this.recursiveSplit(partWithDelimiter, maxTokens, overlapTokens, delimiters.slice(1));
                    if (subChunks.length > 0) {
                        const lastSubChunk = subChunks.pop()!;
                        chunks.push(...subChunks);
                        currentBuffer = lastSubChunk;
                    }
                }
            } else {
                currentBuffer = bufferPotential;
            }
        }

        if (currentBuffer) {
            chunks.push(currentBuffer.trim());
        }

        return chunks;
    }

    /**
     * Provides a safety net for extremely long strings without natural breaks.
     */
    private static hardSplit(text: string, maxTokens: number, overlapTokens: number): string[] {
        const words = text.split(/\s+/);
        const chunks: string[] = [];
        let current = "";

        for (const word of words) {
            const next = current ? current + " " + word : word;
            if (TokenManager.countTokens(next) > maxTokens) {
                chunks.push(current);
                current = this.getOverlapText(current, overlapTokens) + " " + word;
            } else {
                current = next;
            }
        }
        if (current) chunks.push(current);
        return chunks;
    }

    /**
     * Extracts overlapping text from the end of a chunk to preserve context in the next.
     */
    private static getOverlapText(text: string, overlapTokens: number): string {
        if (overlapTokens <= 0) return "";

        const words = text.split(/\s+/);
        let overlap = "";

        // Take words from the end until reaching target overlap
        for (let i = words.length - 1; i >= 0; i--) {
            const test = words.slice(i).join(" ") + " ";
            if (TokenManager.countTokens(test) > overlapTokens) break;
            overlap = test;
        }
        return overlap;
    }
}

