// Centralized API URL configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get API URL from environment variables or use defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isProduction ? 'https://backend-aigelsboeck78s-projects.vercel.app' : 'http://localhost:3001');

const WS_URL = import.meta.env.VITE_WS_URL || 
  (isProduction ? 'wss://backend-aigelsboeck78s-projects.vercel.app' : 'ws://localhost:3001');

export { API_BASE_URL, WS_URL };