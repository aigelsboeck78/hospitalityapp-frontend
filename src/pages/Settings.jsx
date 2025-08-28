import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Save, Upload, X, Tv, Palette, Globe, Shield, Bell, Eye, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState('');
  
  const [settings, setSettings] = useState({
    // Branding Settings
    company_name: '',
    logo_url: '',
    brand_color_primary: '#2563eb',
    brand_color_secondary: '#1e40af',
    brand_color_accent: '#3b82f6',
    default_background_url: '',
    
    // TV App Settings
    tv_app_name: 'Hospitality Hub',
    tv_app_tagline: 'Welcome to your digital concierge',
    show_weather: true,
    show_local_time: true,
    weather_location: '',
    timezone: 'America/Denver',
    
    // Display Settings
    screen_timeout_minutes: 30,
    auto_return_home_minutes: 5,
    theme_mode: 'auto', // light, dark, auto
    font_size: 'medium', // small, medium, large
    
    // Feature Settings
    enable_activities: true,
    enable_streaming: true,
    enable_room_service: false,
    enable_concierge_chat: false,
    enable_local_recommendations: true,
    enable_weather_widget: true,
    
    // Guest Privacy Settings
    require_guest_registration: false,
    collect_guest_preferences: true,
    data_retention_days: 30,
    
    // Notification Settings
    enable_push_notifications: true,
    welcome_message_enabled: true,
    checkout_reminder_hours: 2,
    maintenance_notifications: true,
    
    // Contact Information
    property_phone: '',
    property_email: '',
    emergency_contact: '',
    front_desk_hours: '24/7',
    
    // Integration Settings
    google_analytics_id: '',
    custom_css: '',
    api_rate_limit: 1000
  });

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'tv_app', label: 'TV App', icon: Tv },
    { id: 'features', label: 'Features', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, ...data.data }));
        if (data.data.logo_url) {
          setLogoPreview(data.data.logo_url);
        }
        if (data.data.default_background_url) {
          setBackgroundPreview(data.data.default_background_url);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Logo file size must be less than 2MB');
        return;
      }
      
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Background file size must be less than 10MB');
        return;
      }
      
      setBackgroundFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setSettings(prev => ({ ...prev, logo_url: '' }));
  };

  const removeBackground = () => {
    setBackgroundFile(null);
    setBackgroundPreview('');
    setSettings(prev => ({ ...prev, default_background_url: '' }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      let logoUrl = settings.logo_url;
      let backgroundUrl = settings.default_background_url;
      
      // Upload logo if a new file was selected
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('image', logoFile);
        
        const logoResponse = await fetch(`${API_BASE_URL}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: logoFormData
        });
        
        const logoData = await logoResponse.json();
        if (logoData.success) {
          logoUrl = logoData.data.url;
        } else {
          toast.error(logoData.message || 'Failed to upload logo');
        }
      }
      
      // Upload background if a new file was selected
      if (backgroundFile) {
        const bgFormData = new FormData();
        bgFormData.append('image', backgroundFile);
        
        const bgResponse = await fetch(`${API_BASE_URL}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: bgFormData
        });
        
        const bgData = await bgResponse.json();
        if (bgData.success) {
          backgroundUrl = bgData.data.url;
        } else {
          toast.error(bgData.message || 'Failed to upload background');
        }
      }

      // Save settings
      const settingsData = {
        ...settings,
        logo_url: logoUrl,
        default_background_url: backgroundUrl
      };

      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Settings saved successfully');
        setLogoFile(null);
        setBackgroundFile(null);
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={settings.company_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Company Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TV App Name
            </label>
            <input
              type="text"
              name="tv_app_name"
              value={settings.tv_app_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Hospitality Hub"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Logo Settings</h4>
        <div className="space-y-4">
          {logoPreview && (
            <div className="relative inline-block">
              <img 
                src={logoPreview.startsWith('data:') ? logoPreview : `${API_BASE_URL}${logoPreview}`} 
                alt="Logo preview" 
                className="w-32 h-32 object-contain bg-white border rounded-lg p-2"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Logo (appears in TV app status bar)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 200x60px, PNG with transparent background, max 2MB
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Brand Colors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="brand_color_primary"
                value={settings.brand_color_primary}
                onChange={handleInputChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                name="brand_color_primary"
                value={settings.brand_color_primary}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="brand_color_secondary"
                value={settings.brand_color_secondary}
                onChange={handleInputChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                name="brand_color_secondary"
                value={settings.brand_color_secondary}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="brand_color_accent"
                value={settings.brand_color_accent}
                onChange={handleInputChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                name="brand_color_accent"
                value={settings.brand_color_accent}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Default Background</h4>
        <div className="space-y-4">
          {backgroundPreview && (
            <div className="relative inline-block">
              <img 
                src={backgroundPreview.startsWith('data:') ? backgroundPreview : `${API_BASE_URL}${backgroundPreview}`} 
                alt="Background preview" 
                className="w-64 h-36 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeBackground}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Default Background
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 1920x1080px, JPG/PNG, max 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTvAppTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">TV App Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App Tagline
            </label>
            <input
              type="text"
              name="tv_app_tagline"
              value={settings.tv_app_tagline}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Welcome to your digital concierge"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weather Location
            </label>
            <input
              type="text"
              name="weather_location"
              value={settings.weather_location}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="City, State or Coordinates"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">GMT</option>
              <option value="Europe/Vienna">Central European Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme Mode
            </label>
            <select
              name="theme_mode"
              value={settings.theme_mode}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="auto">Auto (based on time)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Display Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screen Timeout (minutes)
            </label>
            <input
              type="number"
              name="screen_timeout_minutes"
              value={settings.screen_timeout_minutes}
              onChange={handleInputChange}
              min="5"
              max="120"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Return to Home (minutes)
            </label>
            <input
              type="number"
              name="auto_return_home_minutes"
              value={settings.auto_return_home_minutes}
              onChange={handleInputChange}
              min="1"
              max="30"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Widget Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="show_weather"
              checked={settings.show_weather}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Show Weather Widget
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="show_local_time"
              checked={settings.show_local_time}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Show Local Time
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Toggles</h3>
        <div className="space-y-4">
          {[
            { key: 'enable_activities', label: 'Local Activities & Recommendations', desc: 'Show curated local activities and attractions' },
            { key: 'enable_streaming', label: 'Entertainment Hub', desc: 'Display available streaming services and entertainment apps' },
            { key: 'enable_room_service', label: 'Room Service Ordering', desc: 'Allow guests to order room service through the app' },
            { key: 'enable_concierge_chat', label: 'Concierge Chat', desc: 'Real-time messaging with hotel staff' },
            { key: 'enable_local_recommendations', label: 'Local Recommendations', desc: 'AI-powered local recommendations based on guest preferences' },
            { key: 'enable_weather_widget', label: 'Weather Widget', desc: 'Display current weather conditions and forecast' }
          ].map(feature => (
            <div key={feature.key} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name={feature.key}
                  checked={settings[feature.key]}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label className="text-sm font-medium text-gray-700">
                  {feature.label}
                </label>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                name="require_guest_registration"
                checked={settings.require_guest_registration}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Require Guest Registration
              </label>
              <p className="text-sm text-gray-500">Guests must provide basic information to access personalized features</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                name="collect_guest_preferences"
                checked={settings.collect_guest_preferences}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Collect Guest Preferences
              </label>
              <p className="text-sm text-gray-500">Learn from guest interactions to provide better recommendations</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Retention Period (days)
        </label>
        <input
          type="number"
          name="data_retention_days"
          value={settings.data_retention_days}
          onChange={handleInputChange}
          min="7"
          max="365"
          className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Guest data will be automatically deleted after this period
        </p>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          {[
            { key: 'enable_push_notifications', label: 'Push Notifications', desc: 'Send notifications to staff devices' },
            { key: 'welcome_message_enabled', label: 'Welcome Messages', desc: 'Automatically display welcome message on guest check-in' },
            { key: 'maintenance_notifications', label: 'Maintenance Alerts', desc: 'Notify staff of system maintenance and updates' }
          ].map(setting => (
            <div key={setting.key} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name={setting.key}
                  checked={settings[setting.key]}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label className="text-sm font-medium text-gray-700">
                  {setting.label}
                </label>
                <p className="text-sm text-gray-500">{setting.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Checkout Reminder (hours before checkout)
        </label>
        <input
          type="number"
          name="checkout_reminder_hours"
          value={settings.checkout_reminder_hours}
          onChange={handleInputChange}
          min="1"
          max="24"
          className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Third-Party Integrations</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics ID
            </label>
            <input
              type="text"
              name="google_analytics_id"
              value={settings.google_analytics_id}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="GA-XXXXXXXXX-X"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Rate Limit (requests per hour)
            </label>
            <input
              type="number"
              name="api_rate_limit"
              value={settings.api_rate_limit}
              onChange={handleInputChange}
              min="100"
              max="10000"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Custom CSS</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional CSS Styles
          </label>
          <textarea
            name="custom_css"
            value={settings.custom_css}
            onChange={handleInputChange}
            rows={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="/* Custom CSS styles for TV app */"
          />
          <p className="text-xs text-gray-500 mt-1">
            Custom styles will be applied to the TV app interface
          </p>
        </div>
      </div>
    </div>
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure your hospitality system and TV app preferences
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'branding' && renderBrandingTab()}
          {activeTab === 'tv_app' && renderTvAppTab()}
          {activeTab === 'features' && renderFeaturesTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'integrations' && renderIntegrationsTab()}
        </div>
      </div>
    </div>
  );
};

export default Settings;