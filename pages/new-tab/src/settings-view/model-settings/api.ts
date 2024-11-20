const API_URL = 'https://api.openai.com/v1/models';

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
