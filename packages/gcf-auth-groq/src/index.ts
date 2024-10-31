import type { HttpFunction } from '@google-cloud/functions-framework';
import * as admin from 'firebase-admin';
import { Groq } from 'groq-sdk';
import 'dotenv/config';

import { corsMiddleware } from './middlewares';
import { schema } from './schema';
import type { ErrorResponse } from './types';
import { handleStreamResponse, handleRegularResponse } from './handlers';

if (process.env.NODE_ENV !== 'development') {
  admin.initializeApp();
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    const { model, messages, stream, temperature, max_tokens } = result.data;
    const options = {
      model,
      messages,
      temperature,
      stream,
      ...(max_tokens && { max_tokens }),
    };

    if (stream) {
      await handleStreamResponse(res, groq, options, req.headers.origin);
    } else {
      await handleRegularResponse(res, groq, options);
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
