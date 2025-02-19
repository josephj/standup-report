// embedding-service.ts
import { HfInference } from '@huggingface/inference';
import { createClient } from '@supabase/supabase-js';
import { get_encoding } from 'tiktoken';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const HF_API_KEY = process.env.HF_API_KEY || '';
const EMBEDDING_MODEL = 'intfloat/multilingual-e5-small';
const EMBED_CHUNK_SIZE = 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const hf = new HfInference(HF_API_KEY);

type MatchEmbeddingResult = {
  content: string;
  similarity: number;
};

export function splitText(text: string, chunkSize: number = EMBED_CHUNK_SIZE): string[] {
  const encoder = get_encoding('cl100k_base');

  try {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentTokens: number[] = [];

    for (const sentence of sentences) {
      const sentenceTokens = Array.from(encoder.encode(sentence));

      if ([...currentTokens, ...sentenceTokens].length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [sentence];
        currentTokens = sentenceTokens;
      } else {
        currentChunk.push(sentence);
        currentTokens = [...currentTokens, ...sentenceTokens];
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  } finally {
    encoder.free();
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text,
    });

    if (Array.isArray(response) && response.every(n => typeof n === 'number')) {
      return response;
    }
    throw new Error('Unexpected embedding format');
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function storeEmbeddings(contentId: string, chunks: string[], ttl: number = 48): Promise<void> {
  try {
    const embeddingPromises = chunks.map(chunk => generateEmbedding(chunk));
    const embeddings = await Promise.all(embeddingPromises);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 60 * 60 * 1000);

    const records = chunks.map((chunk, index) => ({
      content_id: contentId,
      chunk_index: index,
      content: chunk,
      embedding: embeddings[index],
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }));

    const { error } = await supabase.from('embeddings').upsert(records, { onConflict: 'content_id,chunk_index' });

    if (error) throw error;
  } catch (error) {
    console.error('Error storing embeddings:', error);
    throw error;
  }
}

export async function retrieveRelevantChunks(query: string, contentId: string, limit: number = 5): Promise<string[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      match_content_id: contentId,
      match_threshold: 0.7,
      match_limit: limit,
    });

    if (error) throw error;

    return data.map((item: MatchEmbeddingResult) => item.content);
  } catch (error) {
    console.error('Error retrieving chunks:', error);
    throw error;
  }
}

export async function cleanupExpiredEmbeddings(): Promise<void> {
  try {
    const { error } = await supabase.from('embeddings').delete().lt('expires_at', new Date().toISOString());

    if (error) throw error;
  } catch (error) {
    console.error('Error cleaning up embeddings:', error);
    throw error;
  }
}
