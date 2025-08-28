import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Monitor, Shield, Lock, RefreshCw, Settings, Smartphone, Package } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;

const MDMSettings = () => {
  const [kioskSettings, setKioskSettings] = useState({
    homeApp: 'com.chaletmoments.hospitality',
    mode: 'autonomous',
    autoReturn: true,
    returnTimeout: 1800
  });

  // Common home app options
  const homeAppOptions = [
    { 
      value: 'com.chaletmoments.hospitality', 
      label: 'Chalet Moments Hospitality',
      description: 'Main hospitality app (default)'
    },
    { 
      value: 'com.apple.TVAppStore', 
      label: 'Apple TV App Store',
      description: 'For testing and app installation'
    },
    { 
      value: 'com.apple.tv', 
      label: 'Apple TV App',
      description: 'Apple\'s main TV app'
    },
    { 
      value: 'custom', 
      label: 'Custom Bundle ID',
      description: 'Enter your own app bundle ID'
    }
  ];

  const kioskModes = [
    {
      value: 'single',
      label: 'Single App Mode',
      description: 'Locks device to home app only - no other apps accessible'
    },
    {
      value: 'autonomous',
      label: 'Autonomous Single App Mode',
      description: 'Home app with access to allowed entertainment apps'
    }
  ];

  const [customBundleId, setCustomBundleId] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Fetch current MDM configuration
  const { data: mdmConfig, isLoading, refetch } = useQuery(
    'mdm-config',
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/mdm/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        if (data.kioskConfig) {
          setKioskSettings(data.kioskConfig);
          // Check if using custom bundle ID
          const isKnownApp = homeAppOptions.some(opt => opt.value === data.kioskConfig.homeApp);
          if (!isKnownApp && data.kioskConfig.homeApp) {
            setCustomBundleId(data.kioskConfig.homeApp);
            setShowCustomInput(true);
          }
        }
      }
    }
  );

  // Save configuration mutation
  const saveMutation = useMutation(
    async (config) => {
      const token = localStorage.getItem('token');
      return axios.put(`${API_URL}/mdm/config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        toast.success('MDM configuration saved');
        refetch();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to save configuration');
      }
    }
  );

  const handleHomeAppChange = (value) => {
    if (value === 'custom') {
      setShowCustomInput(true);
      setKioskSettings({
        ...kioskSettings,
        homeApp: customBundleId || ''
      });
    } else {
      setShowCustomInput(false);
      setKioskSettings({
        ...kioskSettings,
        homeApp: value
      });
    }
  };

  const handleSave = () => {
    const finalSettings = {
      ...kioskSettings,
      homeApp: showCustomInput ? customBundleId : kioskSettings.homeApp
    };

    if (!finalSettings.homeApp) {
      toast.error('Please select or enter a home app bundle ID');
      return;
    }

    saveMutation.mutate({ kioskConfig: finalSettings });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          MDM Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure Mobile Device Management and Kiosk Mode settings
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Kiosk Mode Configuration
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Kiosk Mode Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kiosk Mode Type
            </label>
            <div className="space-y-3">
              {kioskModes.map((mode) => (
                <label key={mode.value} className="flex items-start">
                  <input
                    type="radio"
                    name="kioskMode"
                    value={mode.value}
                    checked={kioskSettings.mode === mode.value}
                    onChange={(e) => setKioskSettings({
                      ...kioskSettings,
                      mode: e.target.value
                    })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-gray-500">{mode.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Home App Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home App (Single App)
            </label>
            <select
              value={showCustomInput ? 'custom' : kioskSettings.homeApp}
              onChange={(e) => handleHomeAppChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {homeAppOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              The main app that devices will run in kiosk mode
            </p>

            {showCustomInput && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customBundleId}
                  onChange={(e) => {
                    setCustomBundleId(e.target.value);
                    setKioskSettings({
                      ...kioskSettings,
                      homeApp: e.target.value
                    });
                  }}
                  placeholder="e.g., com.company.appname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the exact bundle ID of your custom app
                </p>
              </div>
            )}
          </div>

          {/* Auto Return Settings */}
          {kioskSettings.mode === 'autonomous' && (
            <>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={kioskSettings.autoReturn}
                    onChange={(e) => setKioskSettings({
                      ...kioskSettings,
                      autoReturn: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Auto-return to home app
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Automatically return to the home app after a period of inactivity
                </p>
              </div>

              {kioskSettings.autoReturn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={kioskSettings.returnTimeout}
                    onChange={(e) => setKioskSettings({
                      ...kioskSettings,
                      returnTimeout: parseInt(e.target.value) || 1800
                    })}
                    min="60"
                    max="7200"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time before returning to home app ({Math.floor(kioskSettings.returnTimeout / 60)} minutes)
                  </p>
                </div>
              )}
            </>
          )}

          {/* Current Configuration Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mode:</span>
                <span className="font-medium">{kioskSettings.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Home App:</span>
                <span className="font-medium font-mono text-xs">
                  {showCustomInput ? customBundleId : kioskSettings.homeApp}
                </span>
              </div>
              {kioskSettings.mode === 'autonomous' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auto Return:</span>
                    <span className="font-medium">{kioskSettings.autoReturn ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  {kioskSettings.autoReturn && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timeout:</span>
                      <span className="font-medium">{Math.floor(kioskSettings.returnTimeout / 60)} minutes</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saveMutation.isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saveMutation.isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Settings className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About Kiosk Mode
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Kiosk mode restricts device usage to specific apps. In Single App Mode, 
                only the home app is accessible. In Autonomous Mode, users can access 
                allowed entertainment apps but will automatically return to the home app 
                after the timeout period.
              </p>
              <p className="mt-2">
                These settings will be applied to all newly enrolled devices. 
                Existing devices need to be updated individually or through bulk actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MDMSettings;