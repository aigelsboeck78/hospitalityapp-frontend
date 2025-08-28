import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/apiUrl';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error occurred. Please try again.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

// Property API
export const propertyApi = {
  getAll: () => api.get('/properties'),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  getCurrentGuest: (id) => api.get(`/properties/${id}/guests/current`),
  getActivities: (id, guestType) => api.get(`/properties/${id}/activities${guestType ? `?guest_type=${guestType}` : ''}`),
  getStreamingServices: (id) => api.get(`/properties/${id}/streaming-services`),
};

// Guest API
export const guestApi = {
  getAll: (propertyId) => api.get(`/guests?property_id=${propertyId}`),
  getById: (id) => api.get(`/guests/${id}`),
  create: (data) => api.post('/guests', data),
  update: (id, data) => api.put(`/guests/${id}`, data),
  delete: (id) => api.delete(`/guests/${id}`),
  checkIn: (id) => api.post(`/guests/${id}/checkin`),
  checkOut: (id) => api.post(`/guests/${id}/checkout`),
  getSessions: (id) => api.get(`/guests/${id}/sessions`),
  createSession: (id, data) => api.post(`/guests/${id}/sessions`, data),
  endSession: (sessionId) => api.delete(`/guests/sessions/${sessionId}`),
};

// Activity API
export const activityApi = {
  getAll: (propertyId, guestType) => {
    let url = `/activities?property_id=${propertyId}`;
    if (guestType) url += `&guest_type=${guestType}`;
    return api.get(url);
  },
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  updateOrder: (id, displayOrder) => api.patch(`/activities/${id}/order`, { display_order: displayOrder }),
  toggleStatus: (id) => api.patch(`/activities/${id}/toggle`),
};

// Streaming Service API
export const streamingApi = {
  getAll: (propertyId, serviceType, activeOnly) => {
    let url = `/streaming-services?property_id=${propertyId}`;
    if (serviceType) url += `&service_type=${serviceType}`;
    if (activeOnly) url += `&active_only=true`;
    return api.get(url);
  },
  getById: (id) => api.get(`/streaming-services/${id}`),
  create: (data) => api.post('/streaming-services', data),
  update: (id, data) => api.put(`/streaming-services/${id}`, data),
  delete: (id) => api.delete(`/streaming-services/${id}`),
  updateOrder: (id, displayOrder) => api.patch(`/streaming-services/${id}/order`, { display_order: displayOrder }),
  toggleStatus: (id) => api.patch(`/streaming-services/${id}/toggle`),
  getSessions: (id) => api.get(`/streaming-services/${id}/sessions`),
};

// Cleanup Service API
export const cleanupApi = {
  getStatus: () => api.get('/cleanup/status'),
  forceCleanup: () => api.post('/cleanup/force'),
  runManualCleanup: (guestId) => {
    const url = guestId ? `/cleanup/manual/${guestId}` : '/cleanup/manual';
    return api.post(url);
  },
};

export default api;