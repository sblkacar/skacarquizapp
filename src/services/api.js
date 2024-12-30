const API_URL = process.env.REACT_APP_API_URL || 'https://skacarquizapp.vercel.app/api';

console.log('Current API_URL:', API_URL); // Debug için

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
    console.log('Fetching from:', url); // Debug için
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
  console.log('Getting public stats from:', `${API_URL}/stats/public`); // Debug için
  return fetchWithCORS(`${API_URL}/stats/public`);
};

export const login = async (credentials) => {
  console.log('Logging in at:', `${API_URL}/auth/login`); // Debug için
  return fetchWithCORS(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

// Diğer API çağrıları... 