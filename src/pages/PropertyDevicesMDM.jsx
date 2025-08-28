import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Monitor, Wifi, WifiOff, Shield, ShieldOff, AlertTriangle, 
    Play, RotateCw, Lock, Unlock, Smartphone, Settings,
    ChevronRight, CheckCircle, XCircle, Clock, AlertCircle,
    Activity, HardDrive, Battery, Calendar, Command
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PropertyDevicesMDM = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState(null);
    const [commands, setCommands] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [kioskConfig, setKioskConfig] = useState({
        enabled: false,
        mode: 'autonomous',
        autoReturn: true,
        returnTimeout: 1800,
        allowedApps: []
    });

    const availableApps = [
        { name: 'Netflix', bundleId: 'com.netflix.Netflix', icon: '📺' },
        { name: 'YouTube', bundleId: 'com.google.ios.youtube', icon: '▶️' },
        { name: 'Spotify', bundleId: 'com.spotify.client', icon: '🎵' },
        { name: 'Disney+', bundleId: 'com.disney.disneyplus', icon: '🏰' },
        { name: 'Apple TV+', bundleId: 'com.apple.tv', icon: '🍎' },
        { name: 'Amazon Prime Video', bundleId: 'com.amazon.Prime-Video', icon: '📦' },
        { name: 'Hulu', bundleId: 'com.hulu.plus', icon: '🟢' },
        { name: 'HBO Max', bundleId: 'com.hbo.hbonow', icon: '🎬' },
    ];

    useEffect(() => {
        fetchPropertyAndDevices();
        fetchAlerts();
    }, [propertyId]);

    useEffect(() => {
        if (selectedDevice) {
            fetchDeviceCommands(selectedDevice.id);
            if (selectedDevice.kiosk_mode_config) {
                setKioskConfig(selectedDevice.kiosk_mode_config);
            }
        }
    }, [selectedDevice]);

    const fetchPropertyAndDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch property
            const propResponse = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const propData = await propResponse.json();
            if (propData.success) {
                setProperty(propData.data);
            }

            // Fetch devices with MDM status
            const devResponse = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/devices`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const devData = await devResponse.json();
            if (devData.success) {
                setDevices(devData.data);
                if (devData.data.length > 0 && !selectedDevice) {
                    setSelectedDevice(devData.data[0]);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch devices');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeviceCommands = async (deviceId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/devices/${deviceId}/commands?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCommands(data.data);
            }
        } catch (error) {
            console.error('Error fetching commands:', error);
        }
    };

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/alerts?propertyId=${propertyId}&resolved=false`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const enrollDevice = async (deviceId, supervised = false) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/devices/${deviceId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ supervised })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Device enrolled successfully');
                fetchPropertyAndDevices();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to enroll device');
        }
    };

    const enableKioskMode = async () => {
        if (!selectedDevice) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/devices/${selectedDevice.id}/kiosk/enable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    config: kioskConfig,
                    allowedApps: kioskConfig.allowedApps 
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Kiosk mode enable command sent');
                fetchDeviceCommands(selectedDevice.id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to enable kiosk mode');
        }
    };

    const disableKioskMode = async () => {
        if (!selectedDevice) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/devices/${selectedDevice.id}/kiosk/disable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Kiosk mode disable command sent');
                fetchDeviceCommands(selectedDevice.id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to disable kiosk mode');
        }
    };

    const restartDevice = async () => {
        if (!selectedDevice) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/devices/${selectedDevice.id}/restart`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Restart command sent');
                fetchDeviceCommands(selectedDevice.id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to send restart command');
        }
    };

    const resolveAlert = async (alertId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/alerts/${alertId}/resolve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ resolvedBy: 'admin' })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Alert resolved');
                fetchAlerts();
            }
        } catch (error) {
            toast.error('Failed to resolve alert');
        }
    };

    const toggleApp = (bundleId) => {
        setKioskConfig(prev => {
            const apps = [...prev.allowedApps];
            const index = apps.findIndex(app => app.bundleId === bundleId);
            
            if (index >= 0) {
                apps.splice(index, 1);
            } else {
                const app = availableApps.find(a => a.bundleId === bundleId);
                if (app) {
                    apps.push({ 
                        name: app.name, 
                        bundleId: app.bundleId, 
                        enabled: true 
                    });
                }
            }
            
            return { ...prev, allowedApps: apps };
        });
    };

    const getStatusBadge = (device) => {
        if (device.enrollment_status === 'enrolled') {
            if (device.supervised) {
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Supervised</span>;
            } else if (device.provisional_days_left > 0) {
                const color = device.provisional_days_left <= 7 ? 'red' : 'yellow';
                return (
                    <span className={`px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded-full`}>
                        Provisional ({device.provisional_days_left} days)
                    </span>
                );
            }
            return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Enrolled</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Not Enrolled</span>;
    };

    const getDeviceStatusIcon = (status) => {
        switch (status) {
            case 'online':
                return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
            case 'offline':
                return <div className="w-2 h-2 bg-red-500 rounded-full" />;
            default:
                return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
        }
    };

    const getCommandStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'sent':
            case 'acknowledged':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/properties')}
                    className="mb-4 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to Properties
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    MDM Device Management
                </h1>
                <p className="mt-2 text-gray-600">
                    {property?.name} - Manage Apple TV devices and configurations
                </p>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="mb-6 space-y-2">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start justify-between">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                                <div>
                                    <p className="font-medium text-yellow-900">{alert.title}</p>
                                    <p className="text-sm text-yellow-700 mt-1">{alert.message}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => resolveAlert(alert.id)}
                                className="text-sm text-yellow-600 hover:text-yellow-800"
                            >
                                Dismiss
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-4 py-3 border-b">
                            <h2 className="text-lg font-medium">Devices</h2>
                        </div>
                        <div className="divide-y">
                            {devices.map((device) => (
                                <button
                                    key={device.id}
                                    onClick={() => setSelectedDevice(device)}
                                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                                        selectedDevice?.id === device.id ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Monitor className="h-5 w-5 text-gray-400" />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">
                                                {device.device_name || device.room_number || 'Apple TV'}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {getDeviceStatusIcon(device.device_status)}
                                                <span className="text-xs text-gray-500">
                                                    {device.device_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Device Details */}
                {selectedDevice && (
                    <div className="lg:col-span-2 space-y-6">
                        {/* Device Info Card */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium">Device Information</h2>
                                    {getStatusBadge(selectedDevice)}
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Model</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedDevice.model}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-mono">{selectedDevice.serial_number}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">OS Version</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedDevice.os_version || 'Unknown'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">App Version</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedDevice.app_version || 'Unknown'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Last Seen</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {selectedDevice.last_heartbeat ? 
                                                format(new Date(selectedDevice.last_heartbeat), 'PPp') : 
                                                'Never'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Kiosk Mode</dt>
                                        <dd className="mt-1">
                                            {selectedDevice.kiosk_mode_enabled ? (
                                                <span className="flex items-center text-green-600">
                                                    <Lock className="h-4 w-4 mr-1" />
                                                    Enabled
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-gray-500">
                                                    <Unlock className="h-4 w-4 mr-1" />
                                                    Disabled
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                </dl>

                                {/* Quick Actions */}
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {selectedDevice.enrollment_status !== 'enrolled' ? (
                                        <button
                                            onClick={() => enrollDevice(selectedDevice.id, false)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Enroll Device
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={restartDevice}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                                            >
                                                <RotateCw className="h-4 w-4 mr-2" />
                                                Restart
                                            </button>
                                            {selectedDevice.kiosk_mode_enabled ? (
                                                <button
                                                    onClick={disableKioskMode}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                                                >
                                                    <Unlock className="h-4 w-4 mr-2" />
                                                    Disable Kiosk
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={enableKioskMode}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                                >
                                                    <Lock className="h-4 w-4 mr-2" />
                                                    Enable Kiosk
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kiosk Configuration */}
                        {selectedDevice.enrollment_status === 'enrolled' && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b">
                                    <h2 className="text-lg font-medium">Kiosk Configuration</h2>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Mode</label>
                                            <select
                                                value={kioskConfig.mode}
                                                onChange={(e) => setKioskConfig({...kioskConfig, mode: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="autonomous">Autonomous Single App Mode</option>
                                                <option value="single">Single App Mode</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Auto Return Timeout (seconds)
                                            </label>
                                            <input
                                                type="number"
                                                value={kioskConfig.returnTimeout}
                                                onChange={(e) => setKioskConfig({...kioskConfig, returnTimeout: parseInt(e.target.value)})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                Allowed Applications
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableApps.map((app) => {
                                                    const isSelected = kioskConfig.allowedApps.some(
                                                        a => a.bundleId === app.bundleId
                                                    );
                                                    return (
                                                        <button
                                                            key={app.bundleId}
                                                            onClick={() => toggleApp(app.bundleId)}
                                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                                isSelected
                                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                            }`}
                                                        >
                                                            <span className="mr-2">{app.icon}</span>
                                                            {app.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <button
                                            onClick={enableKioskMode}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Apply Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Command History */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-medium">Recent Commands</h2>
                            </div>
                            <div className="divide-y">
                                {commands.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-500">
                                        No commands sent yet
                                    </div>
                                ) : (
                                    commands.map((command) => (
                                        <div key={command.id} className="px-6 py-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {getCommandStatusIcon(command.status)}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {command.command_type}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {format(new Date(command.created_at), 'PPp')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                command.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                command.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {command.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyDevicesMDM;