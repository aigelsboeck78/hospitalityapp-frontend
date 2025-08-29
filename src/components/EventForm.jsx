import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tag, Link, Camera } from 'lucide-react';

const EventForm = ({ event, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    category: 'general',
    is_featured: false,
    image_url: '',
    source_url: '',
    price_info: '',
    contact_info: '',
    season: 'all',
    season_start_month: 1,
    season_end_month: 12,
    weather_dependent: false,
    min_temperature: null,
    max_temperature: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageImporting, setImageImporting] = useState(false);

  const categories = [
    { id: 'general', name: 'General', icon: '🎉' },
    { id: 'sports', name: 'Sports', icon: '⛷️' },
    { id: 'winter_sports', name: 'Winter Sports', icon: '🎿' },
    { id: 'summer_sports', name: 'Summer Sports', icon: '🚴' },
    { id: 'culture', name: 'Culture', icon: '🎭' },
    { id: 'culinary', name: 'Culinary', icon: '🍽️' },
    { id: 'market', name: 'Markets', icon: '🛒' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'wellness', name: 'Wellness', icon: '🧘' }
  ];
  
  const seasons = [
    { id: 'all', name: 'All Year', icon: '📅' },
    { id: 'winter', name: 'Winter (Dec-Mar)', icon: '❄️' },
    { id: 'summer', name: 'Summer (Jun-Sep)', icon: '☀️' },
    { id: 'spring', name: 'Spring (Apr-May)', icon: '🌸' },
    { id: 'autumn', name: 'Autumn (Oct-Nov)', icon: '🍂' },
    { id: 'winter_summer', name: 'Winter & Summer', icon: '🏔️' }
  ];
  
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    if (event) {
      // Convert dates from backend format to datetime-local format
      const startDate = event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '';
      const endDate = event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '';
      
      setFormData({
        name: event.name || '',
        description: event.description || '',
        location: event.location || '',
        start_date: startDate,
        end_date: endDate,
        category: categories.find(c => c.id === event.category) ? event.category : 'general',
        is_featured: event.is_featured || false,
        image_url: event.image_url || '',
        source_url: event.source_url || '',
        price_info: event.price_info || '',
        contact_info: event.contact_info || '',
        season: event.season || 'all',
        season_start_month: event.season_start_month || 1,
        season_end_month: event.season_end_month || 12,
        weather_dependent: event.weather_dependent || false,
        min_temperature: event.min_temperature || null,
        max_temperature: event.max_temperature || null
      });
    } else {
      // Reset form for new event
      setFormData({
        name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        category: 'general',
        is_featured: false,
        image_url: '',
        source_url: '',
        price_info: '',
        contact_info: '',
        season: 'all',
        season_start_month: 1,
        season_end_month: 12,
        weather_dependent: false,
        min_temperature: null,
        max_temperature: null
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (formData.end_date && formData.start_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate < startDate) {
        newErrors.end_date = 'End date cannot be before start date';
      }
    }

    if (formData.source_url && !isValidUrl(formData.source_url)) {
      newErrors.source_url = 'Please enter a valid URL';
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Show importing indicator if external URL
    if (formData.image_url && !formData.image_url.includes('blob.vercel-storage.com') && formData.image_url.startsWith('http')) {
      setImageImporting(true);
    }
    
    try {
      // Convert datetime-local format back to ISO string
      const eventData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      };

      await onSave(eventData);
      setImageImporting(false);
    } catch (error) {
      console.error('Error saving event:', error);
      setImageImporting(false);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-indigo-600" />
            {event ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="Enter event name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter event description"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.location ? 'border-red-300' : ''
                }`}
                placeholder="Enter event location"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4 inline mr-1" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.start_date ? 'border-red-300' : ''
                }`}
              />
              {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.end_date ? 'border-red-300' : ''
                }`}
              />
              {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                <Camera className="h-4 w-4 inline mr-1" />
                Image URL
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.image_url ? 'border-red-300' : ''
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>}
            </div>

            {/* Source URL */}
            <div>
              <label htmlFor="source_url" className="block text-sm font-medium text-gray-700">
                <Link className="h-4 w-4 inline mr-1" />
                Source URL
              </label>
              <input
                type="url"
                id="source_url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.source_url ? 'border-red-300' : ''
                }`}
                placeholder="https://example.com/event-details"
              />
              {errors.source_url && <p className="mt-1 text-sm text-red-600">{errors.source_url}</p>}
            </div>

            {/* Price Info */}
            <div>
              <label htmlFor="price_info" className="block text-sm font-medium text-gray-700">
                Price Information
              </label>
              <input
                type="text"
                id="price_info"
                name="price_info"
                value={formData.price_info}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., €15 per person, Free entry"
              />
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700">
                Contact Information
              </label>
              <input
                type="text"
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Phone, email, or website"
              />
            </div>

            {/* Season Selection */}
            <div>
              <label htmlFor="season" className="block text-sm font-medium text-gray-700">
                Season Availability
              </label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.icon} {season.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Season Months */}
            {formData.season === 'custom' && (
              <>
                <div>
                  <label htmlFor="season_start_month" className="block text-sm font-medium text-gray-700">
                    Season Start Month
                  </label>
                  <select
                    id="season_start_month"
                    name="season_start_month"
                    value={formData.season_start_month}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="season_end_month" className="block text-sm font-medium text-gray-700">
                    Season End Month
                  </label>
                  <select
                    id="season_end_month"
                    name="season_end_month"
                    value={formData.season_end_month}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Weather Dependency */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weather_dependent"
                  name="weather_dependent"
                  checked={formData.weather_dependent}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="weather_dependent" className="ml-2 block text-sm text-gray-700">
                  🌡️ Weather dependent event
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Check if this event requires specific weather conditions
              </p>
            </div>

            {/* Temperature Range (if weather dependent) */}
            {formData.weather_dependent && (
              <>
                <div>
                  <label htmlFor="min_temperature" className="block text-sm font-medium text-gray-700">
                    Min Temperature (°C)
                  </label>
                  <input
                    type="number"
                    id="min_temperature"
                    name="min_temperature"
                    value={formData.min_temperature || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., -10"
                  />
                </div>
                <div>
                  <label htmlFor="max_temperature" className="block text-sm font-medium text-gray-700">
                    Max Temperature (°C)
                  </label>
                  <input
                    type="number"
                    id="max_temperature"
                    name="max_temperature"
                    value={formData.max_temperature || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., 5"
                  />
                </div>
              </>
            )}

            {/* Featured Event Checkbox */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                  ⭐ Mark as featured event
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Featured events will be highlighted and shown prominently in the tvOS app
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  {event ? 'Update Event' : 'Create Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;