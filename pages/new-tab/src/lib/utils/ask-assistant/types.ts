export type AskAssistantOptions = {
  onAbort?: () => void;
  onError?: (error: Error) => void;
  onUpdate?: (response: string) => void;
  onComplete?: (fullResponse: string) => void;
};
