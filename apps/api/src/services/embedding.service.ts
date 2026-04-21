import { Pinecone, type RecordMetadata } from '@pinecone-database/pinecone';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

let pineconeClient: Pinecone | null = null;

function getPinecone(): Pinecone | null {
  if (!env.PINECONE_API_KEY) return null;
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: env.PINECONE_API_KEY });
  }
  return pineconeClient;
}

export interface EmbeddingMetadata {
  jobId: string;
  title: string;
  company: string;
  location: string;
  source: string;
}

async function voyageEmbed(text: string): Promise<number[]> {
  if (!env.VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY not configured');
  }

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: 'voyage-large-2',
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.status}`);
  }

  const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return data.data[0]?.embedding ?? [];
}

export async function embed(text: string): Promise<number[]> {
  try {
    return await voyageEmbed(text);
  } catch (err) {
    logger.error({ err }, 'Embedding generation failed');
    throw err;
  }
}

export async function upsertToPinecone(
  id: string,
  vector: number[],
  metadata: EmbeddingMetadata
): Promise<void> {
  const pinecone = getPinecone();
  if (!pinecone) {
    logger.warn('Pinecone not configured, skipping upsert');
    return;
  }

  try {
    const index = pinecone.index(env.PINECONE_INDEX);
    await index.upsert([{ id, values: vector, metadata: metadata as unknown as RecordMetadata }]);
    logger.info({ id, jobId: metadata.jobId }, 'Vector upserted to Pinecone');
  } catch (err) {
    logger.error({ err, id }, 'Pinecone upsert failed');
    throw err;
  }
}

export async function querySimilar(
  vector: number[],
  topK = 10,
  filter?: Record<string, string>
): Promise<Array<{ id: string; score: number; metadata: EmbeddingMetadata }>> {
  const pinecone = getPinecone();
  if (!pinecone) {
    logger.warn('Pinecone not configured, returning empty results');
    return [];
  }

  try {
    const index = pinecone.index(env.PINECONE_INDEX);
    const result = await index.query({
      vector,
      topK,
      includeMetadata: true,
      ...(filter ? { filter } : {}),
    });

    return (result.matches ?? []).map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      metadata: match.metadata as unknown as EmbeddingMetadata,
    }));
  } catch (err) {
    logger.error({ err }, 'Pinecone query failed');
    return [];
  }
}
