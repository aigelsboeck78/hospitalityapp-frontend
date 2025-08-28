import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Link, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, MapPin, Clock, Phone, Globe, Eye, EyeOff, Activity, Star, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ScorePreviewPanel from '../components/ScorePreviewPanel';
import { getImageUrl } from '../utils/imageHelpers';

const Activities = () => {
  const { propertyId } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [typeFilter, setTypeFilter] = useState('all'); // all, outdoor, wellness, restaurant, recreation, shopping
  const [showScorePreview, setShowScorePreview] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // cards or list

  const activityTypes = [
    { value: 'outdoor', label: 'Outdoor', color: 'bg-green-100 text-green-800' },
    { value: 'wellness', label: 'Wellness', color: 'bg-purple-100 text-purple-800' },
    { value: 'restaurant', label: 'Restaurant', color: 'bg-orange-100 text-orange-800' },
    { value: 'recreation', label: 'Recreation', color: 'bg-blue-100 text-blue-800' },
    { value: 'shopping', label: 'Shopping', color: 'bg-pink-100 text-pink-800' },
    { value: 'entertainment', label: 'Entertainment', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'cultural', label: 'Cultural', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    fetchProperty();
    fetchActivities();
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

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/activities?property_id=${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setActivities(data.data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      } else {
        toast.error(data.message || 'Failed to fetch activities');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivityStatus = async (activityId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/activities/${activityId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setActivities(activities.map(activity => 
          activity.id === activityId 
            ? { ...activity, is_active: !currentStatus }
            : activity
        ));
        toast.success(`Activity ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(data.message || 'Failed to update activity status');
      }
    } catch (error) {
      toast.error('Failed to update activity status');
      console.error('Error updating activity status:', error);
    }
  };

  const deleteActivity = async (activityId, activityTitle) => {
    if (!confirm(`Are you sure you want to delete "${activityTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setActivities(activities.filter(activity => activity.id !== activityId));
        toast.success('Activity deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete activity');
      }
    } catch (error) {
      toast.error('Failed to delete activity');
      console.error('Error deleting activity:', error);
    }
  };

  const moveActivity = async (activityId, direction) => {
    const currentIndex = activities.findIndex(a => a.id === activityId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= activities.length) return;
    
    // Swap activities
    const newActivities = [...activities];
    [newActivities[currentIndex], newActivities[newIndex]] = [newActivities[newIndex], newActivities[currentIndex]];
    
    // Update display order
    newActivities.forEach((activity, index) => {
      activity.display_order = index;
    });
    
    setActivities(newActivities);
    
    // Save to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/activities/${activityId}/reorder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_order: newIndex })
      });
      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.message || 'Failed to update activity order');
      }
    } catch (error) {
      toast.error('Failed to update activity order');
      console.error('Error updating activity order:', error);
    }
  };

  const getTypeColor = (type) => {
    const typeObj = activityTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'bg-gray-100 text-gray-800';
  };

  const filteredActivities = activities.filter(activity => {
    const statusMatch = filter === 'all' || 
      (filter === 'active' && activity.is_active) ||
      (filter === 'inactive' && !activity.is_active);
    
    const typeMatch = typeFilter === 'all' || activity.activity_type === typeFilter;
    
    return statusMatch && typeMatch;
  });

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities Management</h1>
          {property && (
            <p className="mt-1 text-sm text-gray-600">Managing activities for {property.name}</p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowScorePreview(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Activity className="h-4 w-4 mr-2" />
            Preview TV Recommendations
          </button>
          <Link
            to={`/properties/${propertyId}/activities/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Activity
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All ({activities.length})</option>
                <option value="active">Active ({activities.filter(a => a.is_active).length})</option>
                <option value="inactive">Inactive ({activities.filter(a => !a.is_active).length})</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
        </div>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <MapPin className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activities.length === 0 
              ? "Get started by adding your first activity." 
              : "Try adjusting your filters to see more activities."
            }
          </p>
          {activities.length === 0 && (
            <div className="mt-6">
              <Link
                to={`/properties/${propertyId}/activities/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                !activity.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Card Image or Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                {(activity.images && activity.images.length > 0) || activity.image_url ? (
                  <>
                    <img 
                      src={getImageUrl(activity.image_url || (activity.images && activity.images[0]) || '')} 
                      alt={activity.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden items-center justify-center h-full">
                      <MapPin className="h-16 w-16 text-white opacity-50" />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MapPin className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Order Badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-white text-gray-900">
                    #{index + 1}
                  </span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-4">
                {/* Title and Type */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {activity.title}
                  </h3>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(activity.activity_type)}`}>
                    {activityTypes.find(t => t.value === activity.activity_type)?.label || activity.activity_type}
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {activity.description}
                </p>
                
                {/* Details */}
                <div className="space-y-1 mb-3">
                  {activity.location && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{activity.location}</span>
                    </div>
                  )}
                  {activity.operating_hours && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="truncate">{activity.operating_hours}</span>
                    </div>
                  )}
                  {activity.price_range && (
                    <div className="flex items-center text-xs text-gray-500">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span>{activity.price_range}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveActivity(activity.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveActivity(activity.id, 'down')}
                      disabled={index === filteredActivities.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => toggleActivityStatus(activity.id, activity.is_active)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {activity.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/properties/${propertyId}/activities/${activity.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteActivity(activity.id, activity.title)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score Preview Panel */}
      {showScorePreview && (
        <ScorePreviewPanel
          propertyId={propertyId}
          onClose={() => setShowScorePreview(false)}
        />
      )}
    </div>
  );
};

export default Activities;