const API_URL = 'https://api.github.com';

export const fetchRepos = async (token: string, search: string): Promise<string[]> => {
  if (!token) return [];

  try {
    const response = await fetch(
      `${API_URL}/search/repositories?q=${encodeURIComponent(`user:@me ${search}`)}+in:name`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );
    if (!response.ok) throw new Error('Failed to fetch repos');
    const repos = await response.json();
    return repos.items.map((repo: { full_name: string }) => repo.full_name);
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
};

export const validateToken = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
