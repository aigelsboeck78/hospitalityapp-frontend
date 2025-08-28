import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { 
    Lock, Unlock, Play, Music, Gamepad2, Baby, 
    Globe, CheckCircle, Circle, Clock, Home,
    Tv, Wifi, Shield, ChevronDown, ChevronUp,
    Save, RefreshCw, AlertCircle, BookOpen, 
    Heart, Image, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const KioskModeConfigurator = ({ device, propertyId, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [presets, setPresets] = useState([]);
    const [entertainmentApps, setEntertainmentApps] = useState([]);
    const [selectedPreset, setSelectedPreset] = useState('allEntertainment');
    const [customMode, setCustomMode] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    
    const [kioskConfig, setKioskConfig] = useState({
        enabled: device?.kiosk_mode_enabled || false,
        mode: 'autonomous',
        homeApp: 'com.chaletmoments.hospitality',
        allowedApps: device?.allowed_apps || [],
        autoReturn: true,
        returnTimeout: 1800 // 30 minutes default
    });

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
        lifestyle: <Home className="h-4 w-4" />,
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
        fetchPresets();
        fetchEntertainmentApps();
    }, []);

    const fetchPresets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/kiosk/presets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPresets(data.data.presets);
            }
        } catch (error) {
            console.error('Error fetching presets:', error);
        }
    };

    const fetchEntertainmentApps = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/kiosk/entertainment-apps`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setEntertainmentApps(data.data);
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
        }
    };

    const applyPreset = async () => {
        if (!device) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/kiosk/devices/${device.id}/apply-preset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    presetId: selectedPreset,
                    customizations: {
                        returnTimeout: kioskConfig.returnTimeout
                    }
                })
            });
            
            const data = await response.json();
            if (data.success) {
                toast.success('Kiosk preset applied successfully');
                if (onUpdate) onUpdate();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to apply preset');
        } finally {
            setLoading(false);
        }
    };

    const applyCustomConfig = async () => {
        if (!device) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/kiosk/devices/${device.id}/configure-kiosk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    allowedApps: kioskConfig.allowedApps,
                    returnTimeout: kioskConfig.returnTimeout,
                    autoReturn: kioskConfig.autoReturn,
                    name: 'Custom Entertainment Configuration'
                })
            });
            
            const data = await response.json();
            if (data.success) {
                toast.success('Custom kiosk configuration applied');
                if (onUpdate) onUpdate();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to apply configuration');
        } finally {
            setLoading(false);
        }
    };

    const toggleApp = (app) => {
        setKioskConfig(prev => {
            const apps = [...prev.allowedApps];
            const index = apps.findIndex(a => a.bundleId === app.bundleId);
            
            if (index >= 0) {
                apps.splice(index, 1);
            } else {
                apps.push(app);
            }
            
            return { ...prev, allowedApps: apps };
        });
    };

    const toggleCategory = (category) => {
        const categoryApps = entertainmentApps.filter(app => app.category === category);
        const allSelected = categoryApps.every(app => 
            kioskConfig.allowedApps.some(a => a.bundleId === app.bundleId)
        );
        
        setKioskConfig(prev => {
            let apps = [...prev.allowedApps];
            
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
            
            return { ...prev, allowedApps: apps };
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

    const disableKiosk = async () => {
        if (!device) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/devices/${device.id}/kiosk/disable`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                toast.success('Kiosk mode disabled');
                setKioskConfig(prev => ({ ...prev, enabled: false }));
                if (onUpdate) onUpdate();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to disable kiosk mode');
        } finally {
            setLoading(false);
        }
    };

    // Group apps by category
    const appsByCategory = entertainmentApps.reduce((acc, app) => {
        if (!acc[app.category]) {
            acc[app.category] = [];
        }
        acc[app.category].push(app);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-purple-600" />
                        Kiosk Mode Configuration
                    </h2>
                    {device?.kiosk_mode_enabled && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                            <Lock className="h-4 w-4 mr-1" />
                            Active
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Preset Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {presets.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => {
                                    setSelectedPreset(preset.id);
                                    setCustomMode(false);
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    selectedPreset === preset.id && !customMode
                                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                                }`}
                            >
                                <div className="text-left">
                                    <div className="font-semibold">{preset.name}</div>
                                    <div className="text-xs opacity-75">{preset.appCount} apps</div>
                                </div>
                            </button>
                        ))}
                        <button
                            onClick={() => setCustomMode(true)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors col-span-2 ${
                                customMode
                                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            <div className="text-center">
                                <div className="font-semibold">Custom Selection</div>
                                <div className="text-xs opacity-75">Choose specific apps</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Return Settings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Return to Hospitality App
                    </label>
                    <div className="flex items-center space-x-4">
                        <select
                            value={kioskConfig.returnTimeout}
                            onChange={(e) => setKioskConfig({...kioskConfig, returnTimeout: parseInt(e.target.value)})}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                            {returnTimeoutOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-1" />
                            Returns to main app
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        When users exit an entertainment app, they'll automatically return to the hospitality app after this timeout
                    </p>
                </div>

                {/* Custom App Selection */}
                {customMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Entertainment Apps
                        </label>
                        <div className="border rounded-lg overflow-hidden">
                            {Object.entries(appsByCategory).map(([category, apps]) => {
                                const isExpanded = expandedCategories.has(category);
                                const selectedCount = apps.filter(app => 
                                    kioskConfig.allowedApps.some(a => a.bundleId === app.bundleId)
                                ).length;
                                const allSelected = selectedCount === apps.length;
                                
                                return (
                                    <div key={category} className="border-b last:border-b-0">
                                        <button
                                            onClick={() => toggleCategoryExpansion(category)}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
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
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="px-4 py-2 bg-gray-50 grid grid-cols-2 gap-2">
                                                {apps.map((app) => {
                                                    const isSelected = kioskConfig.allowedApps.some(
                                                        a => a.bundleId === app.bundleId
                                                    );
                                                    
                                                    return (
                                                        <button
                                                            key={app.bundleId}
                                                            onClick={() => toggleApp(app)}
                                                            className={`flex items-center px-3 py-2 rounded text-sm ${
                                                                isSelected
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {isSelected ? 
                                                                <CheckCircle className="h-4 w-4 mr-2" /> : 
                                                                <Circle className="h-4 w-4 mr-2" />
                                                            }
                                                            <span className="mr-2">{app.icon}</span>
                                                            {app.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Selected: {kioskConfig.allowedApps.length} apps
                        </p>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                        <div className="text-sm text-purple-800">
                            <p className="font-medium mb-1">How Kiosk Mode Works</p>
                            <ul className="space-y-1 text-xs">
                                <li>• The hospitality app is always the home screen</li>
                                <li>• Guests can access allowed entertainment apps</li>
                                <li>• After exiting an app, they return to the hospitality app</li>
                                <li>• Prevents access to system settings and other apps</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                    {device?.kiosk_mode_enabled ? (
                        <button
                            onClick={disableKiosk}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                        >
                            <Unlock className="h-4 w-4 mr-2" />
                            Disable Kiosk Mode
                        </button>
                    ) : (
                        <div />
                    )}
                    
                    <div className="flex space-x-2">
                        {customMode ? (
                            <button
                                onClick={applyCustomConfig}
                                disabled={loading || kioskConfig.allowedApps.length === 0}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Apply Custom Config
                            </button>
                        ) : (
                            <button
                                onClick={applyPreset}
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Apply Preset
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KioskModeConfigurator;