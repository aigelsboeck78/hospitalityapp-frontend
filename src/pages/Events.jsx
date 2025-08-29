import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Tag, Link, Camera, Activity, Eye, EyeOff, ChevronUp, ChevronDown, Star, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import EventForm from '../components/EventForm';
import ScorePreviewPanel from '../components/ScorePreviewPanel';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [stats, setStats] = useState({ today: 0, upcoming: 0, featured: 0, total: 0 });
  const [showScorePreview, setShowScorePreview] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  const categories = [
    { id: 'all', name: 'All Events', icon: '📅', color: 'bg-gray-100 text-gray-800' },
    { id: 'general', name: 'General', icon: '🎉', color: 'bg-blue-100 text-blue-800' },
    { id: 'sports', name: 'Sports', icon: '⛷️', color: 'bg-green-100 text-green-800' },
    { id: 'culture', name: 'Culture', icon: '🎭', color: 'bg-purple-100 text-purple-800' },
    { id: 'culinary', name: 'Culinary', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
    { id: 'market', name: 'Markets', icon: '🛒', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'music', name: 'Music', icon: '🎵', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', color: 'bg-pink-100 text-pink-800' }
  ];

  const timeframes = [
    { id: 'all', name: 'All Events' },
    { id: 'today', name: 'Today' },
    { id: 'upcoming', name: 'Upcoming (7 days)' },
    { id: 'featured', name: 'Featured Only' }
  ];

  useEffect(() => {
    fetchEvents();
    fetchStats();
    // Get propertyId from localStorage or context
    const storedPropertyId = localStorage.getItem('selectedPropertyId');
    if (storedPropertyId) {
      setPropertyId(storedPropertyId);
    }
  }, [selectedCategory, selectedTimeframe]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let endpoint = '/events';
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedTimeframe === 'today') {
        endpoint = '/events/today';
      } else if (selectedTimeframe === 'upcoming') {
        endpoint = '/events/upcoming';
      } else if (selectedTimeframe === 'featured') {
        params.append('featured', 'true');
      }
      
      const queryString = params.toString();
      const response = await api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`);
      
      if (response.data.success) {
        const sortedEvents = (response.data.data || []).sort((a, b) => 
          new Date(a.start_date || a.date) - new Date(b.start_date || b.date)
        );
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/events/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if the endpoint fails
      setStats({ 
        today: 0, 
        upcoming: 0, 
        featured: 0, 
        total: 0 
      });
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await api.delete(`/events/${eventId}`);
      if (response.data.success) {
        setEvents(events.filter(event => event._id !== eventId));
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents();
    fetchStats();
  };

  const toggleEventStatus = async (eventId, currentStatus) => {
    try {
      const response = await api.patch(`/events/${eventId}/toggle`);
      if (response.data.success) {
        setEvents(events.map(event => 
          event._id === eventId 
            ? { ...event, isActive: !currentStatus }
            : event
        ));
      }
    } catch (error) {
      console.error('Error toggling event status:', error);
    }
  };

  const toggleFeatured = async (eventId, currentFeatured) => {
    try {
      const response = await api.patch(`/events/${eventId}/featured`);
      if (response.data.success) {
        setEvents(events.map(event => 
          event._id === eventId 
            ? { ...event, isFeatured: !currentFeatured }
            : event
        ));
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '📅';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          <div className="mt-2 flex items-center space-x-6 text-sm">
            <span className="flex items-center text-gray-600">
              <span className="text-lg mr-1">📅</span>
              <span className="font-medium">{stats.total}</span> Total
            </span>
            <span className="flex items-center text-blue-600">
              <span className="text-lg mr-1">🎯</span>
              <span className="font-medium">{stats.today}</span> Today
            </span>
            <span className="flex items-center text-green-600">
              <span className="text-lg mr-1">📈</span>
              <span className="font-medium">{stats.upcoming}</span> Upcoming
            </span>
            <span className="flex items-center text-yellow-600">
              <span className="text-lg mr-1">⭐</span>
              <span className="font-medium">{stats.featured}</span> Featured
            </span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {propertyId && (
            <button
              onClick={() => setShowScorePreview(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Activity className="h-4 w-4 mr-2" />
              Preview TV Recommendations
            </button>
          )}
          <button
            onClick={async () => {
              try {
                const response = await api.post('/events/scrape');
                if (response.data.success) {
                  toast.success(`Scraped ${response.data.total} events`);
                  fetchEvents();
                  fetchStats();
                }
              } catch (error) {
                toast.error('Failed to scrape events');
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Scrape Events
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.id} value={timeframe.id}>
                  {timeframe.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <Calendar className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first event
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event, index) => (
            <div
              key={event._id || event.id || `event-${index}`}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                event.is_active === false || event.isActive === false ? 'opacity-60' : 'bg-opacity-100'
              }`}
              style={{ backgroundColor: 'white' }}
            >
              {/* Card Image */}
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                {(event.image_url || event.imageUrl) && !(event.image_url || event.imageUrl).includes('data:image/svg') ? (
                  <img
                    src={event.image_url || event.imageUrl}
                    alt={event.name || event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`flex items-center justify-center h-full ${(event.image_url || event.imageUrl) && !(event.image_url || event.imageUrl).includes('data:image/svg') ? 'hidden' : ''}`}>
                  <span className="text-6xl">{getCategoryIcon(event.category)}</span>
                </div>
                
                {/* Status Badges */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  {(event.is_featured || event.isFeatured) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (event.is_active !== false && event.isActive !== false) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(event.is_active !== false && event.isActive !== false) ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Date Badge */}
                <div className="absolute bottom-2 left-2">
                  <div className="bg-white rounded-lg px-3 py-2 shadow-lg">
                    <div className="text-xs font-semibold text-gray-500">
                      {(event.start_date || event.date) && !isNaN(Date.parse(event.start_date || event.date)) 
                        ? new Date(event.start_date || event.date).toLocaleDateString('en-US', { month: 'short' })
                        : 'TBD'
                      }
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {(event.start_date || event.date) && !isNaN(Date.parse(event.start_date || event.date)) 
                        ? new Date(event.start_date || event.date).getDate()
                        : '--'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Title and Category */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {event.name || event.title}
                  </h3>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.category)}`}>
                    {categories.find(c => c.id === event.category)?.name || 'General'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-1 mb-3">
                  {event.time && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(event.time)}</span>
                      {event.endTime && <span> - {formatTime(event.endTime)}</span>}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.price && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Tag className="h-3 w-3 mr-1" />
                      <span>{event.price}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <button
                    onClick={() => toggleFeatured(event.id, event.is_featured)}
                    className={`text-sm ${event.is_featured ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-600`}
                    title="Toggle Featured"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => toggleEventStatus(event.id, event.is_active)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                    title="Toggle Active"
                  >
                    {event.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
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

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          isOpen={showForm}
          onClose={handleFormClose}
          onSave={async (eventData) => {
            try {
              const token = localStorage.getItem('token');
              const url = editingEvent 
                ? `${API_BASE_URL}/api/events/${editingEvent.id}`
                : `${API_BASE_URL}/api/events`;
              
              const response = await fetch(url, {
                method: editingEvent ? 'PUT' : 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
              });
              
              if (response.ok) {
                toast.success(editingEvent ? 'Event updated successfully' : 'Event created successfully');
                setShowForm(false);
                setEditingEvent(null);
                fetchEvents();
                fetchStats();
              } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to save event');
              }
            } catch (error) {
              console.error('Error saving event:', error);
              toast.error('Failed to save event');
            }
          }}
        />
      )}

      {/* Score Preview Panel */}
      {showScorePreview && propertyId && (
        <ScorePreviewPanel
          propertyId={propertyId}
          onClose={() => setShowScorePreview(false)}
        />
      )}
    </div>
  );
};

export default Events;