// Sabit API URL kullan
const API_URL = 'https://skacarquizapp.vercel.app/api';

const fetchWithCORS = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    mode: 'cors',
    credentials: 'include'
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Network response was not ok');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getPublicStats = async () => {
  return fetchWithCORS(`${API_URL}/stats/public`);
};

export const login = async (credentials) => {
  return fetchWithCORS(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

// Diğer API çağrıları... 