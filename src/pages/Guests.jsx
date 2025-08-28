import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useParams, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Calendar, Clock, Phone, Mail, MapPin, ArrowLeft, Filter, Search, User, Crown, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Guests = () => {
  const { propertyId } = useParams();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, checkout_due, past
  const [guestTypeFilter, setGuestTypeFilter] = useState('all');

  const guestStatuses = [
    { value: 'checked_in', label: 'Checked In', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'reserved', label: 'Reserved', color: 'bg-blue-100 text-blue-800', icon: Calendar },
    { value: 'checkout_due', label: 'Checkout Due', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    { value: 'checked_out', label: 'Checked Out', color: 'bg-gray-100 text-gray-800', icon: User },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle }
  ];

  const guestTypes = [
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { value: 'couple', label: 'Couple', icon: '💑' },
    { value: 'solo', label: 'Solo Traveler', icon: '🚶‍♂️' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'group', label: 'Group', icon: '👥' },
    { value: 'wedding', label: 'Wedding Party', icon: '👰‍♀️' },
    { value: 'event', label: 'Event', icon: '🎉' }
  ];

  useEffect(() => {
    fetchProperty();
    fetchGuests();
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

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/guests?property_id=${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setGuests(data.data.sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date)));
      } else {
        toast.error(data.message || 'Failed to fetch guests');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGuest = async (guestId, guestName) => {
    if (!confirm(`Are you sure you want to delete guest "${guestName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/guests/${guestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setGuests(guests.filter(guest => guest.id !== guestId));
        toast.success('Guest deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete guest');
      }
    } catch (error) {
      toast.error('Failed to delete guest');
      console.error('Error deleting guest:', error);
    }
  };

  const updateGuestStatus = async (guestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/guests/${guestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        setGuests(guests.map(guest => 
          guest.id === guestId 
            ? { ...guest, status: newStatus }
            : guest
        ));
        toast.success('Guest status updated');
      } else {
        toast.error(data.message || 'Failed to update guest status');
      }
    } catch (error) {
      toast.error('Failed to update guest status');
      console.error('Error updating guest status:', error);
    }
  };

  const getStatusInfo = (status) => {
    return guestStatuses.find(s => s.value === status) || guestStatuses[0];
  };

  const getGuestTypeInfo = (type) => {
    return guestTypes.find(t => t.value === type) || { value: type, label: type, icon: '👤' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysDiff = (date1, date2) => {
    const diffTime = new Date(date2) - new Date(date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredGuests = guests.filter(guest => {
    // Search filter
    const searchMatch = !searchTerm || 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.phone && guest.phone.includes(searchTerm));
    
    // Status filter
    const statusMatch = statusFilter === 'all' || guest.status === statusFilter;
    
    // Guest type filter
    const typeMatch = guestTypeFilter === 'all' || guest.guest_type === guestTypeFilter;
    
    return searchMatch && statusMatch && typeMatch;
  });

  // Statistics
  const stats = {
    total: guests.length,
    active: guests.filter(g => g.status === 'checked_in').length,
    upcoming: guests.filter(g => g.status === 'reserved').length,
    checkoutDue: guests.filter(g => g.status === 'checkout_due').length
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
          <Link 
            to="/properties"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Properties
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
          {property && (
            <p className="mt-1 text-sm text-gray-600">Managing guests for {property.name}</p>
          )}
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to={`/properties/${propertyId}/guests/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Guest
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Guests</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Currently Checked In</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Arrivals</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.upcoming}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Checkout Due</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.checkoutDue}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search guests..."
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {guestStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            
            {/* Guest Type Filter */}
            <div>
              <select 
                value={guestTypeFilter} 
                onChange={(e) => setGuestTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Guest Types</option>
                {guestTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredGuests.length} of {guests.length} guests
          </div>
        </div>
      </div>

      {/* Guests List */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <Users className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No guests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {guests.length === 0 
              ? "Get started by adding your first guest." 
              : "Try adjusting your search or filters to see more guests."
            }
          </p>
          {guests.length === 0 && (
            <div className="mt-6">
              <Link
                to={`/properties/${propertyId}/guests/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Guest
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stay Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => {
                  const statusInfo = getStatusInfo(guest.status);
                  const guestTypeInfo = getGuestTypeInfo(guest.guest_type);
                  const StatusIcon = statusInfo.icon;
                  const stayDuration = getDaysDiff(guest.check_in_date, guest.check_out_date);
                  
                  return (
                    <tr key={guest.id}>
                      {/* Guest Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                            <div className="text-sm text-gray-500">
                              Party of {guest.party_size || 1}
                              {guest.special_requests && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Special Requests
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {guest.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-3 w-3 mr-1" />
                              <a href={`mailto:${guest.email}`} className="text-blue-600 hover:text-blue-800 truncate">
                                {guest.email}
                              </a>
                            </div>
                          )}
                          {guest.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              <a href={`tel:${guest.phone}`} className="text-blue-600 hover:text-blue-800">
                                {guest.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Stay Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            {formatDate(guest.check_in_date)} - {formatDate(guest.check_out_date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stayDuration} night{stayDuration !== 1 ? 's' : ''}
                          </div>
                          {guest.room_number && (
                            <div className="text-xs text-blue-600">
                              Room: {guest.room_number}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Guest Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          <span className="mr-1">{guestTypeInfo.icon}</span>
                          {guestTypeInfo.label}
                        </span>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={guest.status}
                          onChange={(e) => updateGuestStatus(guest.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-none cursor-pointer ${statusInfo.color}`}
                        >
                          {guestStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/properties/${propertyId}/guests/${guest.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Guest"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteGuest(guest.id, guest.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Guest"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;