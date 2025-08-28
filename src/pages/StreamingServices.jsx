import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Link, useParams } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tv, ArrowLeft, 
  ChevronUp, ChevronDown, ExternalLink, Eye, EyeOff, Search,
  Wifi, Lock, Star, Info, Copy, Check, Globe, Play
} from 'lucide-react';
import toast from 'react-hot-toast';

// Popular streaming service presets with proper URL schemes
const STREAMING_PRESETS = {
  'netflix': {
    name: 'Netflix',
    bundleIdentifier: 'com.netflix.Netflix',
    urlScheme: 'nflx://',
    appStoreId: '363590051',
    backgroundColor: '#E50914',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/netflix.png',
    features: ['4K', 'HDR', 'Dolby Atmos', 'Downloads'],
    category: 'streaming'
  },
  'disney-plus': {
    name: 'Disney+',
    bundleIdentifier: 'com.disney.disneyplus',
    urlScheme: 'disneyplus://',
    appStoreId: '1446075923',
    backgroundColor: '#113CCF',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/disney-plus.png',
    features: ['4K', 'HDR', 'Dolby Atmos', 'Downloads'],
    category: 'streaming'
  },
  'prime-video': {
    name: 'Prime Video',
    bundleIdentifier: 'com.amazon.aiv.AIVApp',
    urlScheme: 'aiv://',
    appStoreId: '545519333',
    backgroundColor: '#00A8E1',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/prime-video.png',
    features: ['4K', 'HDR', 'Downloads'],
    category: 'streaming'
  },
  'apple-tv-plus': {
    name: 'Apple TV+',
    bundleIdentifier: 'com.apple.tv',
    urlScheme: 'videos://',
    appStoreId: '1174078549',
    backgroundColor: '#000000',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/apple-tv-plus.png',
    features: ['4K', 'HDR', 'Dolby Atmos', 'Dolby Vision'],
    category: 'streaming'
  },
  'hbo-max': {
    name: 'Max',
    bundleIdentifier: 'com.warnermedia.hbomax',
    urlScheme: 'hbomax://',
    appStoreId: '1497949536',
    backgroundColor: '#B535F6',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/max.png',
    features: ['4K', 'HDR', 'Dolby Atmos', 'Downloads'],
    category: 'streaming'
  },
  'paramount-plus': {
    name: 'Paramount+',
    bundleIdentifier: 'com.cbs.Paramount',
    urlScheme: 'paramountplus://',
    appStoreId: '530168168',
    backgroundColor: '#0068FF',
    logoUrl: 'https://via.placeholder.com/100x100/0068FF/FFFFFF?text=P%2B',
    features: ['4K', 'Downloads'],
    category: 'streaming'
  },
  'youtube': {
    name: 'YouTube',
    bundleIdentifier: 'com.google.ios.youtube',
    urlScheme: 'youtube://',
    appStoreId: '544007664',
    backgroundColor: '#FF0000',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/youtube.png',
    features: ['4K', 'HDR', 'Live TV'],
    category: 'streaming'
  },
  'spotify': {
    name: 'Spotify',
    bundleIdentifier: 'com.spotify.client',
    urlScheme: 'spotify://',
    appStoreId: '324684580',
    backgroundColor: '#1DB954',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/spotify.png',
    features: ['Podcasts', 'Playlists', 'Offline'],
    category: 'music'
  },
  'apple-music': {
    name: 'Apple Music',
    bundleIdentifier: 'com.apple.Music',
    urlScheme: 'music://',
    appStoreId: '1108187390',
    backgroundColor: '#FA243C',
    logoUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/apple-music.png',
    features: ['Lossless', 'Dolby Atmos', 'Lyrics'],
    category: 'music'
  },
  'dazn': {
    name: 'DAZN',
    bundleIdentifier: 'com.dazn.theApp',
    urlScheme: 'dazn://',
    appStoreId: '1129523036',
    backgroundColor: '#1A1A1A',
    logoUrl: 'https://via.placeholder.com/100x100/F8F8F8/000000?text=DAZN',
    features: ['Live Sports', 'HD Streaming'],
    category: 'sports'
  }
};

const StreamingServices = () => {
  const { propertyId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedService, setExpandedService] = useState(null);

  const serviceCategories = [
    { value: 'all', label: 'All Categories', icon: '🎬' },
    { value: 'streaming', label: 'Video Streaming', icon: '📺' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'news', label: 'News', icon: '📰' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'kids', label: 'Kids', icon: '👶' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '✨' }
  ];

  useEffect(() => {
    fetchProperty();
    fetchStreamingServices();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProperty(data.data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const fetchStreamingServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/streaming-services?property_id=${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      } else {
        toast.error(data.message || 'Failed to fetch streaming services');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
      console.error('Error fetching streaming services:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/streaming-services/${serviceId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setServices(services.map(service => 
          service.id === serviceId 
            ? { ...service, is_active: !currentStatus }
            : service
        ));
        toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(data.message || 'Failed to update service status');
      }
    } catch (error) {
      toast.error('Failed to update service status');
      console.error('Error updating service status:', error);
    }
  };

  const deleteService = async (serviceId, serviceName) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/streaming-services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setServices(services.filter(service => service.id !== serviceId));
        toast.success('Service deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete service');
      }
    } catch (error) {
      toast.error('Failed to delete service');
      console.error('Error deleting service:', error);
    }
  };

  const updateServiceOrder = async (serviceId, direction) => {
    const currentIndex = services.findIndex(s => s.id === serviceId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= services.length) return;
    
    const updatedServices = [...services];
    [updatedServices[currentIndex], updatedServices[newIndex]] = [updatedServices[newIndex], updatedServices[currentIndex]];
    
    // Update display orders
    updatedServices.forEach((service, index) => {
      service.display_order = index;
    });
    
    setServices(updatedServices);
    
    // Save to backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/streaming-services/${serviceId}/order`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ display_order: newIndex })
      });
    } catch (error) {
      console.error('Error updating service order:', error);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addPresetService = async (presetKey) => {
    const preset = STREAMING_PRESETS[presetKey];
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/streaming-services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: propertyId,
          service_name: preset.name,
          service_type: preset.category,
          app_url_scheme: preset.urlScheme,
          logo_url: preset.logoUrl,
          instructions: `Launch ${preset.name} from the Entertainment section`,
          requires_login: true,
          is_active: true,
          display_order: services.length
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`${preset.name} added successfully`);
        fetchStreamingServices();
        setShowPresets(false);
      } else {
        toast.error(data.message || 'Failed to add service');
      }
    } catch (error) {
      toast.error('Failed to add service');
      console.error('Error adding preset service:', error);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesStatus = filter === 'all' || 
      (filter === 'active' && service.is_active) || 
      (filter === 'inactive' && !service.is_active);
    const matchesCategory = categoryFilter === 'all' || service.service_type === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/properties/${propertyId}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Streaming Services</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {property?.name || 'Loading...'} • {filteredServices.length} services configured
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Popular Services
                </button>
                <Link
                  to={`/properties/${propertyId}/streaming/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Presets */}
      {showPresets && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Add Popular Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(STREAMING_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => addPresetService(key)}
                  className="group relative rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  style={{ backgroundColor: preset.backgroundColor + '20' }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {preset.logoUrl && (
                      <img 
                        src={preset.logoUrl} 
                        alt={preset.name}
                        className="h-12 w-12 object-contain"
                      />
                    )}
                    <span className="font-medium text-sm">{preset.name}</span>
                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {serviceCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 text-sm font-medium ${
                    filter === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border-t border-b`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('inactive')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                    filter === 'inactive'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border`}
                >
                  Inactive
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Showing {filteredServices.length} of {services.length} services
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Tv className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No streaming services</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || categoryFilter !== 'all' || filter !== 'all'
                ? 'No services match your filters.'
                : 'Get started by adding a streaming service.'}
            </p>
            {!searchTerm && categoryFilter === 'all' && filter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowPresets(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Popular Services
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Service Logo/Icon */}
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: service.logo_url ? 'transparent' : '#f3f4f6'
                        }}
                      >
                        {service.logo_url ? (
                          <img 
                            src={service.logo_url} 
                            alt={service.service_name}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <Tv className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {service.service_name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {serviceCategories.find(c => c.value === service.service_type)?.label || service.service_type}
                          </span>
                          {service.requires_login && (
                            <Lock className="h-4 w-4 text-gray-400" title="Requires Login" />
                          )}
                        </div>
                        
                        {/* URL Scheme & Instructions */}
                        <div className="mt-2 space-y-1">
                          {service.app_url_scheme && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                                {service.app_url_scheme}
                              </code>
                              <button
                                onClick={() => copyToClipboard(service.app_url_scheme, `url-${service.id}`)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {copiedId === `url-${service.id}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          )}
                          {service.instructions && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {service.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Order Controls */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => updateServiceOrder(service.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateServiceOrder(service.id, 'down')}
                          disabled={index === filteredServices.length - 1}
                          className={`p-1 rounded ${
                            index === filteredServices.length - 1
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Toggle Status */}
                      <button
                        onClick={() => toggleServiceStatus(service.id, service.is_active)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        {service.is_active ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      
                      {/* Expand/Collapse */}
                      <button
                        onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        {expandedService === service.id ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      
                      {/* Edit */}
                      <Link
                        to={`/properties/${propertyId}/streaming/${service.id}/edit`}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      
                      {/* Delete */}
                      <button
                        onClick={() => deleteService(service.id, service.service_name)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedService === service.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Display Order:</span>
                          <p className="mt-1">{service.display_order || 0}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Service Type:</span>
                          <p className="mt-1">{service.service_type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Requires Login:</span>
                          <p className="mt-1">{service.requires_login ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Created:</span>
                          <p className="mt-1">
                            {new Date(service.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {service.instructions && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-500">Full Instructions:</span>
                          <p className="mt-1 text-gray-700">{service.instructions}</p>
                        </div>
                      )}
                      {service.logo_url && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-500">Logo URL:</span>
                          <div className="mt-1 flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                              {service.logo_url}
                            </code>
                            <a
                              href={service.logo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingServices;