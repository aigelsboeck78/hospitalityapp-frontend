import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Link, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, MapPin, Clock, Globe, Phone, DollarSign, Eye, EyeOff, Activity, Star, Utensils, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ScorePreviewPanel from '../components/ScorePreviewPanel';

const Dining = () => {
  const { propertyId } = useParams();
  const [diningPlaces, setDiningPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [showScorePreview, setShowScorePreview] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || localStorage.getItem('selectedPropertyId'));

  const cuisineTypes = [
    { value: 'all', label: 'All Cuisines', icon: '🍽️', color: 'bg-gray-100 text-gray-800' },
    { value: 'austrian', label: 'Austrian', icon: '🥨', color: 'bg-red-100 text-red-800' },
    { value: 'italian', label: 'Italian', icon: '🍕', color: 'bg-green-100 text-green-800' },
    { value: 'asian', label: 'Asian', icon: '🥢', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'international', label: 'International', icon: '🌍', color: 'bg-blue-100 text-blue-800' },
    { value: 'cafe', label: 'Café & Bar', icon: '☕', color: 'bg-brown-100 text-brown-800' },
    { value: 'fine_dining', label: 'Fine Dining', icon: '🍷', color: 'bg-purple-100 text-purple-800' },
    { value: 'casual', label: 'Casual Dining', icon: '🍔', color: 'bg-orange-100 text-orange-800' }
  ];

  useEffect(() => {
    // Always fetch dining places regardless of property
    fetchDiningPlaces();
    
    // Optionally fetch property if selected
    if (selectedPropertyId) {
      fetchProperty();
    }
  }, [selectedPropertyId]);

  const fetchProperty = async () => {
    if (!selectedPropertyId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/properties/${selectedPropertyId}`, {
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

  const fetchDiningPlaces = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Build URL with optional property_id
      let url = `${API_BASE_URL}/api/dining`;
      if (selectedPropertyId) {
        url += `?property_id=${selectedPropertyId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      // The dining API returns array directly, not wrapped in success/data
      if (Array.isArray(data)) {
        setDiningPlaces(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      } else if (data.success) {
        setDiningPlaces(data.data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      } else {
        toast.error(data.message || 'Failed to fetch dining places');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
      console.error('Error fetching dining places:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDiningStatus = async (diningId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dining/${diningId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDiningPlaces(diningPlaces.map(dining => 
          dining.id === diningId 
            ? { ...dining, is_active: !currentStatus }
            : dining
        ));
        toast.success(`Dining place ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(data.message || 'Failed to update dining status');
      }
    } catch (error) {
      toast.error('Failed to update dining status');
      console.error('Error updating dining status:', error);
    }
  };

  const deleteDining = async (diningId, diningName) => {
    if (!confirm(`Are you sure you want to delete "${diningName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dining/${diningId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDiningPlaces(diningPlaces.filter(dining => dining.id !== diningId));
        toast.success('Dining place deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete dining place');
      }
    } catch (error) {
      toast.error('Failed to delete dining place');
      console.error('Error deleting dining place:', error);
    }
  };

  const moveDining = async (diningId, direction) => {
    const currentIndex = diningPlaces.findIndex(d => d.id === diningId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= diningPlaces.length) return;
    
    // Swap dining places
    const newDiningPlaces = [...diningPlaces];
    [newDiningPlaces[currentIndex], newDiningPlaces[newIndex]] = [newDiningPlaces[newIndex], newDiningPlaces[currentIndex]];
    
    // Update display order
    newDiningPlaces.forEach((dining, index) => {
      dining.display_order = index;
    });
    
    setDiningPlaces(newDiningPlaces);
    
    // Save to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dining/${diningId}/reorder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_order: newIndex })
      });
      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.message || 'Failed to update dining order');
      }
    } catch (error) {
      toast.error('Failed to update dining order');
      console.error('Error updating dining order:', error);
    }
  };

  const getCuisineColor = (cuisine) => {
    const type = cuisineTypes.find(t => t.value === cuisine);
    return type ? type.color : 'bg-gray-100 text-gray-800';
  };

  const getCuisineIcon = (cuisine) => {
    const type = cuisineTypes.find(t => t.value === cuisine);
    return type ? type.icon : '🍽️';
  };

  const getPriceIndicator = (priceRange) => {
    switch(priceRange) {
      case '€': return '€';
      case '€€': return '€€';
      case '€€€': return '€€€';
      case '€€€€': return '€€€€';
      default: return priceRange || '€€';
    }
  };

  const filteredDining = diningPlaces.filter(dining => {
    const statusMatch = filter === 'all' || 
      (filter === 'active' && dining.is_active) ||
      (filter === 'inactive' && !dining.is_active);
    
    const cuisineMatch = cuisineFilter === 'all' || dining.cuisine_type === cuisineFilter;
    
    return statusMatch && cuisineMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow viewing dining places without property selection
  // if (!selectedPropertyId) {
  //   return (
  //     <div className="flex items-center justify-center min-h-64">
  //       <div className="text-center">
  //         <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900">No Property Selected</h3>
  //         <p className="mt-2 text-sm text-gray-500">
  //           Please select a property from the properties page to manage dining options.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dining Management</h1>
          {property ? (
            <p className="mt-1 text-sm text-gray-600">Managing dining options for {property.name}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-600">Managing dining options across all locations</p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {selectedPropertyId && (
            <button
              onClick={() => setShowScorePreview(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Activity className="h-4 w-4 mr-2" />
              Preview TV Recommendations
            </button>
          )}
          <Link
            to={selectedPropertyId ? `/properties/${selectedPropertyId}/dining/new` : '/dining/new'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Dining
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
                <option value="all">All ({diningPlaces.length})</option>
                <option value="active">Active ({diningPlaces.filter(d => d.is_active).length})</option>
                <option value="inactive">Inactive ({diningPlaces.filter(d => !d.is_active).length})</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Cuisine:</label>
              <select 
                value={cuisineFilter} 
                onChange={(e) => setCuisineFilter(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {cuisineTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredDining.length} of {diningPlaces.length} dining options
          </div>
        </div>
      </div>

      {/* Dining Cards Grid */}
      {filteredDining.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <Utensils className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No dining places found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {diningPlaces.length === 0 
              ? "Get started by adding your first dining option." 
              : "Try adjusting your filters to see more dining options."
            }
          </p>
          {diningPlaces.length === 0 && (
            <div className="mt-6">
              <Link
                to={selectedPropertyId ? `/properties/${selectedPropertyId}/dining/new` : '/dining/new'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Dining Option
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDining.map((dining, index) => (
            <div 
              key={dining.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                !dining.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Card Image or Placeholder */}
              <div className="h-48 bg-gradient-to-br from-orange-500 to-red-600 relative">
                {dining.image_url ? (
                  <img 
                    src={dining.image_url} 
                    alt={dining.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-6xl">{getCuisineIcon(dining.cuisine_type)}</span>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    dining.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dining.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Order Badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-white text-gray-900">
                    #{index + 1}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-bold bg-white text-gray-900">
                    {getPriceIndicator(dining.price_range)}
                  </span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-4">
                {/* Title and Cuisine */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {dining.name_en || dining.name_de || dining.name}
                  </h3>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCuisineColor(dining.cuisine_type)}`}>
                    {cuisineTypes.find(t => t.value === dining.cuisine_type)?.label || dining.cuisine_type}
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {dining.description || `${dining.cuisine_type} cuisine in ${dining.location_area || dining.city}`}
                </p>
                
                {/* Details */}
                <div className="space-y-1 mb-3">
                  {(dining.street_address || dining.address) && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{dining.street_address || dining.address}</span>
                    </div>
                  )}
                  {dining.walking_time && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{dining.walking_time} min walk</span>
                    </div>
                  )}
                  {dining.phone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="h-3 w-3 mr-1" />
                      <span className="truncate">{dining.phone}</span>
                    </div>
                  )}
                  {dining.website && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Globe className="h-3 w-3 mr-1" />
                      <a 
                        href={dining.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Special Features */}
                {(dining.has_terrace || dining.reservations_required || dining.vegetarian || dining.vegan || dining.family_friendly) && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dining.has_terrace && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Terrace
                      </span>
                    )}
                    {dining.reservations_required && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Reservation
                      </span>
                    )}
                    {dining.vegetarian && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Vegetarian
                      </span>
                    )}
                    {dining.vegan && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Vegan
                      </span>
                    )}
                    {dining.family_friendly && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Family Friendly
                      </span>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveDining(dining.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveDining(dining.id, 'down')}
                      disabled={index === filteredDining.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => toggleDiningStatus(dining.id, dining.is_active)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {dining.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={selectedPropertyId ? `/properties/${selectedPropertyId}/dining/${dining.id}/edit` : `/dining/${dining.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteDining(dining.id, dining.name_en || dining.name_de || dining.name)}
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
      {showScorePreview && selectedPropertyId && (
        <ScorePreviewPanel
          propertyId={selectedPropertyId}
          onClose={() => setShowScorePreview(false)}
        />
      )}
    </div>
  );
};

export default Dining;