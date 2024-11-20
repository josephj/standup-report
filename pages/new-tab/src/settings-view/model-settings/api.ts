import OpenAI from 'openai';

const API_URL = 'https://api.openai.com/v1/models';

type ModelOption = {
  value: string;
  label: string;
};

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating OpenAI token:', error);
    return false;
  }
};

export const fetchOpenAIModels = async (token: string): Promise<ModelOption[]> => {
  try {
    const openai = new OpenAI({
      apiKey: token,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.models.list();
    return response.data.map(model => ({
      value: model.id,
      label: model.id,
    }));
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
};
