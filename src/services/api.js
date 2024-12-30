const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://skacarquizapp.vercel.app/api'
  : 'http://localhost:5003/api';

const fetchWithCORS = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
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
      const error = await response.json();
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