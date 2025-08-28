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

export default {
  API_BASE_URL,
  WS_URL,
  API_ENDPOINTS,
  getAuthHeaders
};