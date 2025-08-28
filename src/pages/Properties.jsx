import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Link } from 'react-router-dom';
import { Building, Plus, Edit, Users, Activity, Tv, Image as ImageIcon, Wifi, ShoppingBag, Info, Monitor, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch properties');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyName) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Property deleted successfully');
        // Remove the property from the list
        setProperties(properties.filter(p => p.id !== propertyId));
      } else {
        toast.error(data.message || 'Failed to delete property');
      }
    } catch (error) {
      toast.error('Failed to delete property');
      console.error('Error deleting property:', error);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your vacation rental properties and their settings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/properties/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-24 w-24 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first vacation rental property.
          </p>
          <div className="mt-6">
            <Link
              to="/properties/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Property
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div key={property.id} className="bg-white overflow-hidden shadow-sm rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {property.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {property.address}
                      </p>
                      {property.wifi_ssid && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                          <Wifi className="h-3 w-3 mr-1" />
                          WiFi: {property.wifi_ssid}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Management</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to={`/properties/${property.id}/guests`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Guests
                    </Link>
                    <Link
                      to={`/properties/${property.id}/activities`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Activities
                    </Link>
                    <Link
                      to={`/properties/${property.id}/streaming`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Tv className="h-3 w-3 mr-1" />
                      Entertainment
                    </Link>
                    <Link
                      to={`/properties/${property.id}/shop`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      Shop
                    </Link>
                    <Link
                      to={`/properties/${property.id}/backgrounds`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Backgrounds
                    </Link>
                    <Link
                      to={`/properties/${property.id}/information`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Info & Guides
                    </Link>
                    <Link
                      to={`/properties/${property.id}/devices`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Monitor className="h-3 w-3 mr-1" />
                      Devices
                    </Link>
                    <Link
                      to={`/properties/${property.id}/mdm-dashboard`}
                      className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      MDM Dashboard
                    </Link>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => handleDeleteProperty(property.id, property.name)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                  <Link
                    to={`/properties/${property.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Property
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;