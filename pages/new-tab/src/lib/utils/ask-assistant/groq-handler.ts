import { type AskAssistantOptions } from './types';

export const handleGroqStream = async (
  systemPrompt: string,
  userPrompt: string,
  options: AskAssistantOptions,
  abortController: AbortController,
) => {
  let fullResponse = '';

  const response = await fetch(
    'https://australia-southeast1-automatic-stand-up-report.cloudfunctions.net/chatCompletions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        stream: true,
      }),
      signal: abortController.signal,
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is null');

  const decoder = new TextDecoder();

  let isReading = true;
  while (isReading) {
    const { done, value } = await reader.read();
    if (done) {
      isReading = false;
      break;
    }

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.content || '';
          fullResponse += content;
          options.onUpdate?.(fullResponse);
        } catch (e) {
          console.error('Error parsing JSON:', e, 'Line:', line);
        }
      }
    }
  }

  return fullResponse;
};
