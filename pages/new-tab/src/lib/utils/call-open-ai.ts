import OpenAI from 'openai';

type CallOpenAIOptions = {
  onAbort?: () => void;
  onError?: (error: Error) => void;
  onUpdate?: (response: string) => void;
  onComplete?: (fullResponse: string) => void;
};

export const callOpenAI = async (systemPrompt: string, userPrompt: string, options: CallOpenAIOptions) => {
  const { openaiToken } = await chrome.storage.local.get('openaiToken');
  if (!openaiToken) {
    const error = new Error('OpenAI API key not found');
    options.onError?.(error);
    return;
  }

  const openai = new OpenAI({
    apiKey: openaiToken,
    dangerouslyAllowBrowser: true,
  });

  const abortController = new AbortController();

  try {
    const stream = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        stream: true,
      },
      { signal: abortController.signal },
    );

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      options.onUpdate?.(fullResponse);

      if (chunk.choices[0]?.finish_reason === 'stop') {
        break;
      }
    }

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
