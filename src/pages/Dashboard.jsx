import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Building,
  Users,
  MapPin,
  Tv,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { propertyApi, guestApi, cleanupApi } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { format } from 'date-fns';

const Dashboard = () => {
  const { joinProperty } = useSocket();
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery(
    'properties',
    () => propertyApi.getAll(),
    {
      select: (response) => response.data.data,
    }
  );

  // Fetch cleanup service status
  const { data: cleanupStatus, refetch: refetchCleanupStatus } = useQuery(
    'cleanup-status',
    () => cleanupApi.getStatus(),
    {
      select: (response) => response.data.data,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch current guests for selected property
  const { data: currentGuest } = useQuery(
    ['current-guest', selectedProperty?.id],
    () => propertyApi.getCurrentGuest(selectedProperty.id),
    {
      enabled: !!selectedProperty,
      select: (response) => response.data.data,
      refetchInterval: 60000, // Refresh every minute
    }
  );

  // Auto-select first property and join its room
  useEffect(() => {
    if (properties?.length > 0 && !selectedProperty) {
      const firstProperty = properties[0];
      setSelectedProperty(firstProperty);
      joinProperty(firstProperty.id);
    }
  }, [properties, selectedProperty, joinProperty]);

  const handlePropertyChange = (property) => {
    setSelectedProperty(property);
    joinProperty(property.id);
  };

  const handleForceCleanup = async () => {
    try {
      await cleanupApi.forceCleanup();
      refetchCleanupStatus();
    } catch (error) {
      console.error('Failed to force cleanup:', error);
    }
  };

  if (propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!properties?.length) {
    return (
      <div className="text-center">
        <Building className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new property.
        </p>
        <div className="mt-6">
          <Link
            to="/properties/new"
            className="btn btn-primary"
          >
            Create Property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <select
            value={selectedProperty?.id || ''}
            onChange={(e) => {
              const property = properties.find(p => p.id === e.target.value);
              if (property) handlePropertyChange(property);
            }}
            className="input"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Properties
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {properties.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Guest
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {currentGuest 
                      ? `${currentGuest.first_name} ${currentGuest.last_name}`
                      : 'None'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cleanup Service
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {cleanupStatus?.isRunning ? 'Running' : 'Idle'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Cleanups
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {cleanupStatus?.totalCleanups || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Guest Details */}
      {currentGuest && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Current Guest</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentGuest.first_name} {currentGuest.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Guest Type</dt>
                <dd className="mt-1">
                  <span className="badge badge-primary">
                    {currentGuest.guest_type.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Party Size</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentGuest.party_size}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Check-in Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(currentGuest.check_in_date), 'PPP')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Check-out Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(currentGuest.check_out_date), 'PPP')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="badge badge-success">
                    Active
                  </span>
                </dd>
              </div>
            </div>
            {currentGuest.special_requests && (
              <div className="mt-6">
                <dt className="text-sm font-medium text-gray-500">Special Requests</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentGuest.special_requests}
                </dd>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cleanup Service Status */}
      {cleanupStatus && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Cleanup Service Status</h3>
              <button
                onClick={handleForceCleanup}
                className="btn btn-secondary btn-sm"
                disabled={cleanupStatus.isRunning}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Cleanup
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 flex items-center">
                  {cleanupStatus.isRunning ? (
                    <>
                      <Activity className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-green-700">Running</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">Idle</span>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Interval</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Every {cleanupStatus.intervalMinutes} minutes
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Run</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {cleanupStatus.lastRun 
                    ? format(new Date(cleanupStatus.lastRun), 'PPp')
                    : 'Never'
                  }
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Cleanups</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {cleanupStatus.totalCleanups}
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to={`/properties/${selectedProperty?.id}/guests`}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Manage Guests</h4>
                <p className="text-sm text-gray-500">Add, edit, or check out guests</p>
              </div>
            </Link>
            
            <Link
              to={`/properties/${selectedProperty?.id}/activities`}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Activities</h4>
                <p className="text-sm text-gray-500">Manage local activities</p>
              </div>
            </Link>
            
            <Link
              to={`/properties/${selectedProperty?.id}/streaming`}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Tv className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Streaming Services</h4>
                <p className="text-sm text-gray-500">Configure entertainment options</p>
              </div>
            </Link>
            
            <Link
              to="/properties"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Properties</h4>
                <p className="text-sm text-gray-500">Manage property settings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;