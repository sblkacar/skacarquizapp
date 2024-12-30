const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5003'
  : 'https://skacarquizapp.vercel.app';

class ApiService {
  constructor() {
    this.baseUrl = BASE_URL;
    console.log('API Service initialized with baseUrl:', this.baseUrl);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    console.log('Making request to:', url);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Public endpoints
  getPublicStats() {
    return this.request('/stats/public');
  }

  // Auth endpoints
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }
}

const api = new ApiService();
export default api; 