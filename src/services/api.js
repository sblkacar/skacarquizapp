const API_URL = process.env.REACT_APP_API_URL;

const fetchWithCORS = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const getPublicStats = async () => {
  return fetchWithCORS(`${API_URL}/api/stats/public`);
};

export const login = async (credentials) => {
  return fetchWithCORS(`${API_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

// Diğer API çağrıları... 