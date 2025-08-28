import { API_BASE_URL } from '../config/apiUrl';

// Helper function to get the correct image URL
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL (starts with http or https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, it's a local path, prepend the backend URL
  return `${API_BASE_URL}${imageUrl}`;
};