import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Monitor, Wifi, Shield, Bell, Settings, Activity, AlertTriangle,
    CheckCircle, XCircle, Clock, ChevronRight, Plus, Edit2, Trash2,
    Lock, Unlock, RotateCw, Send, Download, Upload, Info,
    Battery, HardDrive, WifiOff, ShieldCheck, ShieldOff
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import KioskModeConfigurator from '../components/KioskModeConfigurator';
import MDMMonitoring from '../components/MDMMonitoring';

const MDMDashboard = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    
    // State management
    const [activeTab, setActiveTab] = useState('devices');
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [property, setProperty] = useState(null);
    
    // Modal states
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showWiFiModal, setShowWiFiModal] = useState(false);
    
    // Profile creation state
    const [newProfile, setNewProfile] = useState({
        name: '',
        type: 'wifi',
        content: {}
    });
    
    // WiFi configuration state
    const [wifiConfig, setWifiConfig] = useState({
        ssid: '',
        password: '',
        encryptionType: 'WPA2'
    });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [propertyId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch all data in parallel
            const [propRes, devRes, profRes, alertRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/properties/${propertyId}/devices`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/mdm/properties/${propertyId}/profiles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/mdm/alerts?propertyId=${propertyId}&resolved=false`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/notifications/statistics?propertyId=${propertyId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const propData = await propRes.json();
            if (propData.success) setProperty(propData.data);

            const devData = await devRes.json();
            if (devData.success) {
                setDevices(devData.data);
                if (devData.data.length > 0 && !selectedDevice) {
                    setSelectedDevice(devData.data[0]);
                }
            }

            const profData = await profRes.json();
            if (profData.success) setProfiles(profData.data);

            const alertData = await alertRes.json();
            if (alertData.success) setAlerts(alertData.data);

            const statsData = await statsRes.json();
            if (statsData.success) setStatistics(statsData.data);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch MDM data');
        } finally {
            setLoading(false);
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
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to enroll device');
        }
    };

    const sendCommand = async (deviceId, commandType, payload = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/devices/${deviceId}/commands`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ commandType, payload, priority: 5 })
            });
            
            const data = await response.json();
            if (data.success) {
                toast.success('Command sent successfully');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to send command');
        }
    };

    const createWiFiProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/mdm/properties/${propertyId}/profiles/wifi`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: `WiFi - ${wifiConfig.ssid}`,
                    ssid: wifiConfig.ssid,
                    password: wifiConfig.password,
                    encryptionType: wifiConfig.encryptionType,
                    applyToAllDevices: true
                })
            });
            
            const data = await response.json();
            if (data.success) {
                toast.success('WiFi profile created and applied');
                setShowWiFiModal(false);
                setWifiConfig({ ssid: '', password: '', encryptionType: 'WPA2' });
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to create WiFi profile');
        }
    };

    const sendTestNotification = async (deviceId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/notifications/devices/${deviceId}/test-notify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                toast.success('Test notification sent');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to send test notification');
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
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to resolve alert');
        }
    };

    const getDeviceStatusColor = (device) => {
        if (device.device_status === 'online') return 'text-green-500';
        if (device.device_status === 'offline') return 'text-red-500';
        return 'text-gray-400';
    };

    const getEnrollmentBadge = (device) => {
        if (device.enrollment_status === 'enrolled') {
            if (device.supervised) {
                return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Supervised</span>;
            }
            if (device.provisional_days_left > 0) {
                const color = device.provisional_days_left <= 7 ? 'red' : 'yellow';
                return (
                    <span className={`px-2 py-1 text-xs bg-${color}-100 text-${color}-800 rounded-full`}>
                        Provisional ({device.provisional_days_left}d)
                    </span>
                );
            }
            return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Enrolled</span>;
        }
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Not Enrolled</span>;
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">MDM Dashboard</h1>
                        <p className="mt-2 text-gray-600">{property?.name}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowWiFiModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                            <Wifi className="h-4 w-4 mr-2" />
                            Configure WiFi
                        </button>
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="mb-6 space-y-2">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between">
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Devices</p>
                            <p className="text-2xl font-bold">{devices.length}</p>
                        </div>
                        <Monitor className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Online</p>
                            <p className="text-2xl font-bold text-green-600">
                                {devices.filter(d => d.device_status === 'online').length}
                            </p>
                        </div>
                        <Activity className="h-8 w-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Kiosk Enabled</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {devices.filter(d => d.kiosk_mode_enabled).length}
                            </p>
                        </div>
                        <Lock className="h-8 w-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Profiles</p>
                            <p className="text-2xl font-bold">{profiles.length}</p>
                        </div>
                        <Shield className="h-8 w-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {['devices', 'kiosk', 'profiles', 'notifications', 'monitoring'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'devices' && (
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
                                        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                                            selectedDevice?.id === device.id ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Monitor className={`h-5 w-5 ${getDeviceStatusColor(device)}`} />
                                            <div className="text-left">
                                                <p className="font-medium">{device.device_name || device.room_number}</p>
                                                <p className="text-xs text-gray-500">{device.model}</p>
                                            </div>
                                        </div>
                                        {getEnrollmentBadge(device)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Device Details */}
                    {selectedDevice && (
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b">
                                    <h2 className="text-lg font-medium">Device Details</h2>
                                </div>
                                <div className="px-6 py-4">
                                    <dl className="grid grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                                            <dd className="mt-1 text-sm text-gray-900 font-mono">
                                                {selectedDevice.serial_number}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">OS Version</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {selectedDevice.os_version || 'Unknown'}
                                            </dd>
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
                                                    onClick={() => sendCommand(selectedDevice.id, 'RestartDevice')}
                                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                                >
                                                    <RotateCw className="h-4 w-4 inline mr-2" />
                                                    Restart
                                                </button>
                                                <button
                                                    onClick={() => sendCommand(selectedDevice.id, 
                                                        selectedDevice.kiosk_mode_enabled ? 'DisableKioskMode' : 'EnableKioskMode'
                                                    )}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                                >
                                                    {selectedDevice.kiosk_mode_enabled ? (
                                                        <>
                                                            <Unlock className="h-4 w-4 inline mr-2" />
                                                            Disable Kiosk
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="h-4 w-4 inline mr-2" />
                                                            Enable Kiosk
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => sendTestNotification(selectedDevice.id)}
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                                >
                                                    <Bell className="h-4 w-4 inline mr-2" />
                                                    Test Notify
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'kiosk' && selectedDevice && (
                <KioskModeConfigurator 
                    device={selectedDevice}
                    propertyId={propertyId}
                    onUpdate={fetchData}
                />
            )}

            {activeTab === 'kiosk' && !selectedDevice && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Device</h3>
                    <p className="text-gray-600">
                        Please select a device from the Devices tab to configure kiosk mode
                    </p>
                </div>
            )}

            {activeTab === 'profiles' && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-medium">Configuration Profiles</h2>
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                            Add Profile
                        </button>
                    </div>
                    <div className="divide-y">
                        {profiles.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No configuration profiles yet
                            </div>
                        ) : (
                            profiles.map((profile) => (
                                <div key={profile.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">{profile.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Type: {profile.profile_type} • 
                                            Created: {format(new Date(profile.created_at), 'PP')}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {profile.is_default && (
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                Default
                                            </span>
                                        )}
                                        {profile.is_active ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-medium">Push Notifications</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-4">
                            Send notifications to devices for testing and alerts
                        </p>
                        <button
                            onClick={() => setShowNotificationModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Send className="h-4 w-4 inline mr-2" />
                            Send Custom Notification
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'monitoring' && (
                <MDMMonitoring devices={devices} propertyId={propertyId} />
            )}

            {/* WiFi Configuration Modal */}
            {showWiFiModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Configure WiFi</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Network Name (SSID)</label>
                                <input
                                    type="text"
                                    value={wifiConfig.ssid}
                                    onChange={(e) => setWifiConfig({...wifiConfig, ssid: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={wifiConfig.password}
                                    onChange={(e) => setWifiConfig({...wifiConfig, password: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Security Type</label>
                                <select
                                    value={wifiConfig.encryptionType}
                                    onChange={(e) => setWifiConfig({...wifiConfig, encryptionType: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="WPA2">WPA2</option>
                                    <option value="WPA3">WPA3</option>
                                    <option value="WEP">WEP</option>
                                    <option value="Open">Open</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowWiFiModal(false);
                                    setWifiConfig({ ssid: '', password: '', encryptionType: 'WPA2' });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createWiFiProfile}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Apply to All Devices
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MDMDashboard;