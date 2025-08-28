import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Monitor,
  Wifi,
  WifiOff,
  Star,
  StarOff,
  History,
  Copy,
  Check,
  X,
  Info,
  Calendar,
  Globe,
  Shield,
  Smartphone
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;

const deviceTypeIcons = {
  apple_tv: Monitor,
  ipad: Smartphone,
  fire_tv: Monitor,
  android_tv: Monitor
};

const PropertyDevices = () => {
  const { propertyId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    device_type: 'apple_tv',
    device_name: '',
    identifier: '',
    mac_address: '',
    ip_address: '',
    software_version: '',
    is_primary: false,
    is_active: true,
    settings: {}
  });

  // Fetch devices
  const { data: devices = [], isLoading, refetch } = useQuery(
    ['property-devices', propertyId],
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/properties/${propertyId}/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || [];
    }
  );

  // Fetch device history
  const { data: deviceHistory = [] } = useQuery(
    ['device-history', showHistory],
    async () => {
      if (!showHistory) return [];
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/devices/${showHistory}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || [];
    },
    { enabled: !!showHistory }
  );

  // Create/Update mutation
  const saveMutation = useMutation(
    async (data) => {
      const token = localStorage.getItem('token');
      if (editingDevice) {
        return axios.put(`${API_URL}/devices/${editingDevice.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        return axios.post(`${API_URL}/properties/${propertyId}/devices`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    },
    {
      onSuccess: () => {
        toast.success(editingDevice ? 'Device updated' : 'Device added');
        refetch();
        closeModal();
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Failed to save device';
        toast.error(message);
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    async (id) => {
      const token = localStorage.getItem('token');
      return axios.delete(`${API_URL}/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        toast.success('Device removed');
        refetch();
      },
      onError: () => {
        toast.error('Failed to remove device');
      }
    }
  );

  // Toggle active mutation
  const toggleMutation = useMutation(
    async (id) => {
      const token = localStorage.getItem('token');
      return axios.patch(`${API_URL}/devices/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        toast.success('Device status updated');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update device status');
      }
    }
  );

  // Set primary mutation
  const setPrimaryMutation = useMutation(
    async (deviceId) => {
      const token = localStorage.getItem('token');
      return axios.put(`${API_URL}/properties/${propertyId}/devices/${deviceId}/primary`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        toast.success('Primary device updated');
        refetch();
      },
      onError: () => {
        toast.error('Failed to set primary device');
      }
    }
  );

  const openModal = (device = null) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        device_type: device.device_type || 'apple_tv',
        device_name: device.device_name || '',
        identifier: device.identifier || '',
        mac_address: device.mac_address || '',
        ip_address: device.ip_address || '',
        software_version: device.software_version || '',
        is_primary: device.is_primary || false,
        is_active: device.is_active !== undefined ? device.is_active : true,
        settings: device.settings || {}
      });
    } else {
      setEditingDevice(null);
      setFormData({
        device_type: 'apple_tv',
        device_name: '',
        identifier: '',
        mac_address: '',
        ip_address: '',
        software_version: '',
        is_primary: false,
        is_active: true,
        settings: {}
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.device_name) {
      toast.error('Device name is required');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this device?')) {
      deleteMutation.mutate(id);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/properties" className="text-primary-600 hover:text-primary-700">
          ← Back to Properties
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Connected Devices</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage Apple TV and other devices connected to this property
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Device
          </button>
        </div>

        <div className="p-6">
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No devices connected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your Apple TV or other devices to manage them remotely.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => {
                const Icon = deviceTypeIcons[device.device_type] || Monitor;
                return (
                  <div
                    key={device.id}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${device.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Icon className={`h-6 w-6 ${device.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {device.device_name}
                            {device.is_primary && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </h3>
                          <p className="text-xs text-gray-500">{device.model || device.device_type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMutation.mutate(device.id)}
                        className={`p-1 rounded ${device.is_active ? 'text-green-600' : 'text-gray-400'}`}
                        title={device.is_active ? 'Connected' : 'Disconnected'}
                      >
                        {device.is_active ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Identifier:</span>
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {(device.identifier || device.mac_address || device.id || '').substring(0, 20)}{(device.identifier || device.mac_address || device.id || '').length > 20 ? '...' : ''}
                          </code>
                          <button
                            onClick={() => copyToClipboard(device.identifier || device.mac_address || device.id || '', device.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {copiedId === device.id ? 
                              <Check className="h-3 w-3 text-green-600" /> : 
                              <Copy className="h-3 w-3 text-gray-400" />
                            }
                          </button>
                        </div>
                      </div>

                      {/* MDM Status */}
                      {device.enrollment_status && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">MDM Status:</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            device.enrollment_status === 'enrolled' ? 'bg-green-100 text-green-800' : 
                            device.enrollment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {device.enrollment_status}
                          </span>
                        </div>
                      )}

                      {/* Kiosk Mode Status */}
                      {device.kiosk_mode_enabled !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Kiosk Mode:</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            device.kiosk_mode_enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {device.kiosk_mode_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      )}

                      {/* Supervised Status */}
                      {device.supervised !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Supervised:</span>
                          <span className={`text-xs ${device.supervised ? 'text-green-600' : 'text-gray-500'}`}>
                            {device.supervised ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}

                      {/* Configuration Profiles */}
                      {device.configuration_profiles && device.configuration_profiles.length > 0 && (
                        <div className="pt-2 border-t">
                          <span className="text-gray-500 text-xs">Configuration Profiles:</span>
                          <div className="mt-1 space-y-1">
                            {device.configuration_profiles.map((profile, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <Shield className="h-3 w-3 text-blue-500" />
                                <span className="text-xs text-gray-700">{profile.name || profile.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {device.serial_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Serial:</span>
                          <span className="font-mono text-xs">{device.serial_number}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Last Connected:</span>
                        <span className="text-xs">
                          {device.last_connected ? formatDate(device.last_connected) : 'Never'}
                        </span>
                      </div>

                      {device.last_ip_address && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">IP Address:</span>
                          <span className="font-mono text-xs">{device.last_ip_address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between">
                      <div className="flex gap-2">
                        {!device.is_primary && (
                          <button
                            onClick={() => setPrimaryMutation.mutate(device.id)}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Set as primary"
                          >
                            <StarOff className="h-4 w-4 text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowHistory(device.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="View history"
                        >
                          <History className="h-4 w-4 text-gray-400" />
                        </button>
                        {device.enrollment_status === 'enrolled' && (
                          <button
                            onClick={() => window.location.href = `/mdm/device/${device.id}`}
                            className="p-2 hover:bg-blue-100 rounded"
                            title="MDM Settings"
                          >
                            <Shield className="h-4 w-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(device)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            
            <div className="relative bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">
                  {editingDevice ? 'Edit Device' : 'Add Device'}
                </h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device Type
                    </label>
                    <select
                      value={formData.device_type}
                      onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="apple_tv">Apple TV</option>
                      <option value="ipad">iPad</option>
                      <option value="fire_tv">Fire TV</option>
                      <option value="android_tv">Android TV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device Name
                    </label>
                    <input
                      type="text"
                      value={formData.device_name}
                      onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                      className="input"
                      placeholder="e.g., Living Room Apple TV"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Device Identifier
                    </label>
                    <input
                      type="text"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      className="input font-mono text-sm"
                      placeholder="e.g., 00008110-000439023C63801E"
                      disabled={editingDevice}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unique device identifier (cannot be changed after creation)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MAC Address
                    </label>
                    <input
                      type="text"
                      value={formData.mac_address}
                      onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                      className="input font-mono text-sm"
                      placeholder="e.g., 00:11:22:33:44:55"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IP Address
                    </label>
                    <input
                      type="text"
                      value={formData.ip_address}
                      onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                      className="input font-mono text-sm"
                      placeholder="e.g., 192.168.1.100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Software Version
                    </label>
                    <input
                      type="text"
                      value={formData.software_version}
                      onChange={(e) => setFormData({ ...formData, software_version: e.target.value })}
                      className="input"
                      placeholder="e.g., tvOS 17.0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_primary"
                        checked={formData.is_primary}
                        onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="is_primary" className="text-sm font-medium text-gray-700">
                        Primary Device
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isLoading}
                    className="btn btn-primary"
                  >
                    {saveMutation.isLoading ? 'Saving...' : (editingDevice ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowHistory(null)} />
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Connection History</h2>
              </div>

              <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
                {deviceHistory.length === 0 ? (
                  <p className="text-center text-gray-500">No connection history available</p>
                ) : (
                  <div className="space-y-2">
                    {deviceHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${
                            entry.connection_type === 'registration' ? 'bg-blue-100' :
                            entry.connection_type === 'heartbeat' ? 'bg-green-100' :
                            'bg-gray-100'
                          }`}>
                            {entry.connection_type === 'registration' ? 
                              <Plus className="h-4 w-4 text-blue-600" /> :
                              entry.connection_type === 'heartbeat' ?
                              <Wifi className="h-4 w-4 text-green-600" /> :
                              <Info className="h-4 w-4 text-gray-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium capitalize">{entry.connection_type}</p>
                            <p className="text-xs text-gray-500">
                              {entry.ip_address && `IP: ${entry.ip_address}`}
                              {entry.app_version && ` • App: ${entry.app_version}`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t">
                <button
                  onClick={() => setShowHistory(null)}
                  className="btn btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDevices;