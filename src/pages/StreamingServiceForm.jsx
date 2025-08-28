import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Tv, Globe, Lock, Image, Info, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const StreamingServiceForm = () => {
  const { propertyId, id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    service_type: 'streaming',
    app_url_scheme: '',
    logo_url: '',
    instructions: '',
    requires_login: true,
    is_active: true,
    display_order: 0
  });

  const serviceTypes = [
    { value: 'streaming', label: 'Video Streaming' },
    { value: 'music', label: 'Music' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'sports', label: 'Sports' },
    { value: 'news', label: 'News' },
    { value: 'kids', label: 'Kids' },
    { value: 'education', label: 'Education' },
    { value: 'lifestyle', label: 'Lifestyle' }
  ];

  const popularServices = {
    'Netflix': { 
      urlScheme: 'nflx://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/netflix.png',
      type: 'streaming'
    },
    'Disney+': { 
      urlScheme: 'disneyplus://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/disney-plus.png',
      type: 'streaming'
    },
    'Prime Video': { 
      urlScheme: 'aiv://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/prime-video.png',
      type: 'streaming'
    },
    'Apple TV+': { 
      urlScheme: 'videos://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/apple-tv-plus.png',
      type: 'streaming'
    },
    'Max': { 
      urlScheme: 'hbomax://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/max.png',
      type: 'streaming'
    },
    'Paramount+': { 
      urlScheme: 'paramountplus://', 
      logo: 'https://via.placeholder.com/100x100/0068FF/FFFFFF?text=P%2B',
      type: 'streaming'
    },
    'YouTube': { 
      urlScheme: 'youtube://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/youtube.png',
      type: 'streaming'
    },
    'Spotify': { 
      urlScheme: 'spotify://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/spotify.png',
      type: 'music'
    },
    'Apple Music': { 
      urlScheme: 'music://', 
      logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/apple-music.png',
      type: 'music'
    },
    'DAZN': { 
      urlScheme: 'dazn://', 
      logo: 'https://via.placeholder.com/100x100/F8F8F8/000000?text=DAZN',
      type: 'sports'
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/streaming-services/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch service');
      
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch service');
      }
    } catch (error) {
      toast.error('Failed to load service details');
      console.error('Error fetching service:', error);
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
  };

  const handleServiceNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      service_name: name
    }));

    // Auto-fill if it's a popular service
    if (popularServices[name]) {
      const service = popularServices[name];
      setFormData(prev => ({
        ...prev,
        app_url_scheme: service.urlScheme,
        logo_url: service.logo,
        service_type: service.type,
        instructions: `Launch ${name} from the Entertainment section`
      }));
      toast.success(`Auto-filled details for ${name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.service_name) {
      toast.error('Service name is required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = isEditMode 
        ? `${API_BASE_URL}/api/streaming-services/${id}`
        : `${API_BASE_URL}/api/streaming-services`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        property_id: propertyId,
        display_order: parseInt(formData.display_order) || 0
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(isEditMode ? 'Service updated successfully' : 'Service added successfully');
        navigate(`/properties/${propertyId}/streaming`);
      } else {
        throw new Error(data.message || 'Failed to save service');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save service');
      console.error('Error saving service:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <Link
                to={`/properties/${propertyId}/streaming`}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Streaming Service' : 'Add Streaming Service'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Configure streaming service for guest entertainment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Tv className="h-5 w-5 mr-2 text-blue-600" />
              Service Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Service Name with datalist */}
              <div>
                <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">
                  Service Name *
                </label>
                <input
                  type="text"
                  id="service_name"
                  name="service_name"
                  list="popular-services"
                  value={formData.service_name}
                  onChange={handleServiceNameChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Netflix, Disney+, Spotify"
                  required
                />
                <datalist id="popular-services">
                  {Object.keys(popularServices).map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-gray-500">
                  Select from popular services for auto-fill or enter custom name
                </p>
              </div>

              {/* Service Type */}
              <div>
                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {serviceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">
                  Display Order
                </label>
                <input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first in the list
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Launch Configuration
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* URL Scheme */}
              <div>
                <label htmlFor="app_url_scheme" className="block text-sm font-medium text-gray-700">
                  App URL Scheme
                </label>
                <input
                  type="text"
                  id="app_url_scheme"
                  name="app_url_scheme"
                  value={formData.app_url_scheme}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., nflx://, spotify://"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL scheme to launch the app on Apple TV
                </p>
              </div>

              {/* Logo URL */}
              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    type="url"
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                  {formData.logo_url && (
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview" 
                      className="h-10 w-10 object-contain border rounded"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  URL to the service logo image
                </p>
              </div>

              {/* Instructions */}
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows={3}
                  value={formData.instructions}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Instructions for guests on how to use this service"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Settings
            </h2>
            
            <div className="space-y-4">
              {/* Requires Login */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_login"
                  name="requires_login"
                  checked={formData.requires_login}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requires_login" className="ml-2 flex items-center">
                  <Lock className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Requires Login
                  </span>
                </label>
                <p className="ml-6 text-xs text-gray-500">
                  Guest needs to sign in to use this service
                </p>
              </div>

              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 flex items-center">
                  <Play className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
                <p className="ml-6 text-xs text-gray-500">
                  Service is available to guests
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              to={`/properties/${propertyId}/streaming`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Service' : 'Add Service'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StreamingServiceForm;