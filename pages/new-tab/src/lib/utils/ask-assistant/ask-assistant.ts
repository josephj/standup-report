import { handleGroqStream } from './groq-handler';
import { handleOpenAIStream } from './openai-handler';
import { type AskAssistantOptions } from './types';

export const askAssistant = async (systemPrompt: string, userPrompt: string, options: AskAssistantOptions) => {
  const { openaiToken } = await chrome.storage.local.get('openaiToken');
  const abortController = new AbortController();

  try {
    const fullResponse = openaiToken
      ? await handleOpenAIStream(systemPrompt, userPrompt, openaiToken, options, abortController)
      : await handleGroqStream(systemPrompt, userPrompt, options, abortController);

    options.onComplete?.(fullResponse);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        options.onAbort?.();
      } else {
        options.onError?.(error);
      }
    }
  }

  return abortController;
};
