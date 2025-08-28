// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get API URL from environment variables or use defaults
// Note: Backend is deployed at the root, not under /api path
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isProduction ? 'https://backend-aigelsboeck78s-projects.vercel.app' : 'http://localhost:3001');

export const WS_URL = import.meta.env.VITE_WS_URL || 
  (isProduction ? 'wss://hospitalityapp-backend.vercel.app' : 'ws://localhost:3001');

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  VERIFY: `${API_BASE_URL}/api/auth/verify`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  
  // Properties
  PROPERTIES: `${API_BASE_URL}/api/properties`,
  
  // Guests
  GUESTS: (propertyId) => `${API_BASE_URL}/api/properties/${propertyId}/guests`,
  
  // Activities
  ACTIVITIES: (propertyId) => `${API_BASE_URL}/api/properties/${propertyId}/activities`,
  
  // Other endpoints...
};

// Helper function to get headers with auth token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Function to refresh access token
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(API_ENDPOINTS.REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      return data.data.token;
    } else {
      throw new Error(data.message || 'Failed to refresh token');
    }
  } catch (error) {
    // Clear tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  }
};

// Enhanced fetch with automatic token refresh
export const authFetch = async (url, options = {}) => {
  const makeRequest = async (token) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    return fetch(url, {
      ...options,
      headers
    });
  };

  let response = await makeRequest(localStorage.getItem('token'));

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      response = await makeRequest(newToken);
    } catch (error) {
      // Refresh failed, user needs to login again
      return response;
    }
  }

  return response;
};

export default {
  API_BASE_URL,
  WS_URL,
  API_ENDPOINTS,
  getAuthHeaders,
  refreshAccessToken,
  authFetch
};