import OpenAI from 'openai';
import { type AskAssistantOptions } from './types';

export const handleOpenAIStream = async (
  systemPrompt: string,
  userPrompt: string,
  openaiToken: string,
  options: AskAssistantOptions,
  abortController: AbortController,
) => {
  let fullResponse = '';
  const openai = new OpenAI({
    apiKey: openaiToken,
    dangerouslyAllowBrowser: true,
  });

  const stream = await openai.chat.completions.create(
    {
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      stream: true,
    },
    { signal: abortController.signal },
  );

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;
    options.onUpdate?.(fullResponse);
  }

  return fullResponse;
};
