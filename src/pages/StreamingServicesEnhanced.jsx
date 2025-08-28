import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Link, useParams } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tv, ArrowLeft, 
  ChevronUp, ChevronDown, ExternalLink, Eye, EyeOff, Search,
  Wifi, Lock, Star, Info, Copy, Check, Globe, Play, Shield,
  Music, Gamepad2, Baby, Heart, BookOpen, Activity, Image,
  CheckCircle, Circle, Settings, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getEntertainmentApps, getAppsByCategory, kioskPresets } from '../config/entertainmentApps.js';

const StreamingServicesEnhanced = () => {
  const { propertyId } = useParams();
  const [services, setServices] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('allEntertainment');
  const [customMode, setCustomMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedApps, setSelectedApps] = useState([]);
  const [kioskEnabled, setKioskEnabled] = useState(false);
  const [returnTimeout, setReturnTimeout] = useState(1800);
  const [savingKiosk, setSavingKiosk] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  // Get entertainment apps data
  const entertainmentApps = getEntertainmentApps();
  const appsByCategory = entertainmentApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {});

  const categoryIcons = {
    streaming: <Tv className="h-4 w-4" />,
    music: <Music className="h-4 w-4" />,
    sports: <Play className="h-4 w-4" />,
    gaming: <Gamepad2 className="h-4 w-4" />,
    kids: <Baby className="h-4 w-4" />,
    news: <Globe className="h-4 w-4" />,
    fitness: <Activity className="h-4 w-4" />,
    education: <BookOpen className="h-4 w-4" />,
    wellness: <Heart className="h-4 w-4" />,
    lifestyle: <Star className="h-4 w-4" />,
    media: <Image className="h-4 w-4" />
  };

  const returnTimeoutOptions = [
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 7200, label: '2 hours' },
    { value: 0, label: 'Never' }
  ];

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch property info
      const propResponse = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const propData = await propResponse.json();
      if (propData.success) {
        setProperty(propData.data);
      }

      // Fetch streaming services
      const servicesResponse = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/streaming-services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const servicesData = await servicesResponse.json();
      if (servicesData.success) {
        setServices(servicesData.data);
      }

      // Fetch devices
      const devicesResponse = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/devices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const devicesData = await devicesResponse.json();
      if (devicesData.success) {
        setDevices(devicesData.data);
        
        // Check if any device has kiosk mode enabled
        const kioskDevice = devicesData.data.find(d => d.kiosk_mode_enabled);
        if (kioskDevice) {
          setKioskEnabled(true);
          setSelectedDevice(kioskDevice);
          
          // Load current allowed apps
          if (kioskDevice.allowed_apps) {
            setSelectedApps(kioskDevice.allowed_apps);
            setCustomMode(true);
          }
          if (kioskDevice.kiosk_mode_config?.returnTimeout) {
            setReturnTimeout(kioskDevice.kiosk_mode_config.returnTimeout);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = (app) => {
    setSelectedApps(prev => {
      const apps = [...prev];
      const index = apps.findIndex(a => a.bundleId === app.bundleId);
      
      if (index >= 0) {
        apps.splice(index, 1);
      } else {
        apps.push(app);
      }
      
      return apps;
    });
  };

  const toggleCategory = (category) => {
    const categoryApps = appsByCategory[category];
    const allSelected = categoryApps.every(app => 
      selectedApps.some(a => a.bundleId === app.bundleId)
    );
    
    setSelectedApps(prev => {
      let apps = [...prev];
      
      if (allSelected) {
        // Remove all apps from this category
        apps = apps.filter(a => 
          !categoryApps.some(ca => ca.bundleId === a.bundleId)
        );
      } else {
        // Add all apps from this category
        categoryApps.forEach(app => {
          if (!apps.some(a => a.bundleId === app.bundleId)) {
            apps.push(app);
          }
        });
      }
      
      return apps;
    });
  };

  const toggleCategoryExpansion = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const applyPreset = async () => {
    const preset = kioskPresets[selectedPreset];
    if (!preset) return;
    
    setSelectedApps(preset.allowedApps);
    setReturnTimeout(preset.returnTimeout);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const saveKioskConfiguration = async () => {
    if (!selectedDevice && devices.length === 0) {
      toast.error('No devices available');
      return;
    }

    setSavingKiosk(true);
    try {
      const token = localStorage.getItem('token');
      const deviceToUpdate = selectedDevice || devices[0];
      
      // Apply kiosk configuration to device(s)
      const response = await fetch(`${API_BASE_URL}/api/mdm/kiosk/devices/${deviceToUpdate.id}/configure-kiosk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          allowedApps: selectedApps,
          returnTimeout: returnTimeout,
          autoReturn: true,
          name: 'Entertainment Configuration'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Entertainment apps configuration saved and applied');
        setKioskEnabled(true);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSavingKiosk(false);
    }
  };

  const applyToAllDevices = async () => {
    if (devices.length === 0) {
      toast.error('No devices available');
      return;
    }

    setSavingKiosk(true);
    try {
      const token = localStorage.getItem('token');
      
      // Create kiosk profile for all devices
      const response = await fetch(`${API_BASE_URL}/api/mdm/properties/${propertyId}/profiles/kiosk-entertainment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Entertainment Apps Profile',
          presetId: customMode ? null : selectedPreset,
          customApps: customMode ? selectedApps : [],
          returnTimeout: returnTimeout,
          makeDefault: true
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Apply to all enrolled devices
        const applyResponse = await fetch(`${API_BASE_URL}/api/mdm/properties/${propertyId}/apply-configuration`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            kioskMode: {
              enabled: true,
              allowedApps: selectedApps,
              returnTimeout: returnTimeout
            }
          })
        });
        
        const applyData = await applyResponse.json();
        if (applyData.success) {
          toast.success(`Configuration applied to ${devices.length} devices`);
          setKioskEnabled(true);
          fetchData();
        }
      }
    } catch (error) {
      toast.error('Failed to apply to all devices');
    } finally {
      setSavingKiosk(false);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/streaming-services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Service deleted successfully');
        fetchData();
      } else {
        toast.error(data.message || 'Failed to delete service');
      }
    } catch (error) {
      toast.error('Failed to delete service');
      console.error('Error:', error);
    }
  };

  const toggleService = async (service) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/streaming-services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !service.is_active })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Service ${!service.is_active ? 'enabled' : 'disabled'}`);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update service');
      }
    } catch (error) {
      toast.error('Failed to update service');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entertainment & Streaming</h1>
            <p className="mt-1 text-sm text-gray-600">
              {property?.name} - Configure entertainment apps and kiosk mode
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Link
            to={`/properties/${propertyId}/streaming/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Service
          </Link>
        </div>
      </div>

      {/* Device Status */}
      {devices.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Device Status:</span>
              <span className="text-sm text-gray-600">
                {devices.filter(d => d.enrollment_status === 'enrolled').length} of {devices.length} enrolled
              </span>
              {kioskEnabled && (
                <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Kiosk Mode Active
                </span>
              )}
            </div>
            {selectedDevice && (
              <span className="text-sm text-gray-500">
                Active on: {selectedDevice.device_name || selectedDevice.room_number}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Kiosk Mode Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center">
              <Lock className="h-5 w-5 mr-2 text-purple-600" />
              Entertainment Apps Configuration
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCustomMode(!customMode)}
                className={`px-3 py-1 text-sm rounded-md ${
                  customMode 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {customMode ? 'Custom Selection' : 'Use Presets'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Preset Selection */}
          {!customMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(kioskPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedPreset(key);
                      setSelectedApps(preset.allowedApps);
                      setReturnTimeout(preset.returnTimeout);
                    }}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedPreset === key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {preset.allowedApps.length} apps • {preset.returnTimeout / 60} min timeout
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom App Selection */}
          {customMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Entertainment Apps
              </label>
              <div className="border rounded-lg overflow-hidden">
                {Object.entries(appsByCategory).map(([category, apps]) => {
                  const isExpanded = expandedCategories.has(category);
                  const selectedCount = apps.filter(app => 
                    selectedApps.some(a => a.bundleId === app.bundleId)
                  ).length;
                  const allSelected = selectedCount === apps.length;
                  
                  return (
                    <div key={category} className="border-b last:border-b-0">
                      <div
                        onClick={() => toggleCategoryExpansion(category)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center">
                          {categoryIcons[category] || <Circle className="h-4 w-4" />}
                          <span className="ml-2 font-medium capitalize">{category}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({selectedCount}/{apps.length})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(category);
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              allSelected 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                          {isExpanded ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 py-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {apps.map((app) => {
                            const isSelected = selectedApps.some(
                              a => a.bundleId === app.bundleId
                            );
                            
                            return (
                              <button
                                key={app.bundleId}
                                onClick={() => toggleApp(app)}
                                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                                  isSelected
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {isSelected ? 
                                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" /> : 
                                  <Circle className="h-4 w-4 mr-2 flex-shrink-0" />
                                }
                                <span className="mr-2">{app.icon}</span>
                                <span className="truncate">{app.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {selectedApps.length} apps selected
              </p>
            </div>
          )}

          {/* Return Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Return to Hospitality App
            </label>
            <select
              value={returnTimeout}
              onChange={(e) => setReturnTimeout(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              {returnTimeoutOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Time before automatically returning to the main hospitality app after exiting an entertainment app
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              The hospitality app will always be the home screen
            </div>
            <div className="flex space-x-3">
              {devices.length > 1 && (
                <button
                  onClick={applyToAllDevices}
                  disabled={savingKiosk || selectedApps.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Apply to All Devices
                </button>
              )}
              <button
                onClick={saveKioskConfiguration}
                disabled={savingKiosk || selectedApps.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingKiosk ? 'Saving...' : 'Save & Apply'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Streaming Services */}
      {services.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium">Custom Streaming Services</h2>
          </div>
          <div className="divide-y">
            {services.map((service) => (
              <div key={service.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: service.background_color || '#gray' }}
                  >
                    {service.logo_url ? (
                      <img src={service.logo_url} alt={service.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Tv className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.bundle_identifier}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleService(service)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {service.is_active ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <Link
                    to={`/properties/${propertyId}/streaming/${service.id}/edit`}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </Link>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingServicesEnhanced;