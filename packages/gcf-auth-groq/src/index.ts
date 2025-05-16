import type { HttpFunction } from '@google-cloud/functions-framework';
import * as admin from 'firebase-admin';
import { Groq } from 'groq-sdk';
import 'dotenv/config';
import { get_encoding } from 'tiktoken';

import { corsMiddleware } from './middlewares';
import { schema } from './schema';
import type { ErrorResponse } from './types';
import { handleStreamResponse, handleRegularResponse, handleLongContentResponse } from './handlers';
import { cleanupExpiredEmbeddings } from './embedding-service';

const TOKEN_LIMIT = 50000;

const requiredEnvVars = ['GROQ_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Missing environment variable: ${envVar}`);
  }
}

if (process.env.NODE_ENV !== 'development') {
  admin.initializeApp();
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const countTokens = (text: string): number => {
  try {
    const encoder = get_encoding('cl100k_base');
    const tokens = encoder.encode(text);
    const count = tokens.length;
    encoder.free();
    return count;
  } catch (error) {
    console.warn('Tiktoken error, falling back to estimate:', error);
    return Math.ceil(text.length / 4);
  }
};

export const chatCompletions: HttpFunction = async (req, res) => {
  await new Promise(resolve => corsMiddleware(req, res, resolve));

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: {
          message: 'Method not allowed',
          type: 'invalid_request_error',
        },
      });
    }

    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const { model, messages, stream, temperature, max_tokens, reasoning_format } = result.data;
    const options = {
      model,
      messages,
      temperature,
      stream,
      ...(reasoning_format && { reasoning_format }),
      ...(max_tokens && { max_tokens }),
    };

    const totalTokens = messages.reduce((sum, msg) => sum + countTokens(msg.content), 0);

    if (totalTokens <= TOKEN_LIMIT) {
      if (stream) {
        await handleStreamResponse(res, groq, options, req.headers.origin);
      } else {
        await handleRegularResponse(res, groq, options);
      }
    } else {
      console.log(`Request exceeds token limit (${totalTokens}/${TOKEN_LIMIT}), using embedding processing`);
      await handleLongContentResponse(res, groq, options, req.headers.origin);
    }
  } catch (error) {
    console.error('Error:', error);

    const err = error as Error & { status?: number; type?: string; param?: string; code?: string };
    const statusCode = err.status || (err.message.includes('Invalid') ? 400 : 500);

    const errorResponse: ErrorResponse = {
      error: {
        message: err.message,
        type: err.type || 'api_error',
        ...(err.param && { param: err.param }),
        ...(err.code && { code: err.code }),
      },
    };

    res.status(statusCode).json(errorResponse);
  }
};

export const cleanupEmbeddings: HttpFunction = async (_req, res) => {
  try {
    await cleanupExpiredEmbeddings();
    res.status(200).json({ success: true, message: 'Expired embeddings cleaned up' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
