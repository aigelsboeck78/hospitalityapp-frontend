import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Phone, Mail, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const GuestForm = () => {
  const navigate = useNavigate();
  const { propertyId, id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    check_in_date: '',
    check_out_date: '',
    party_size: 1,
    room_number: '',
    guest_type: 'couple',
    guest_labels: [],
    special_requests: '',
    status: 'reserved',
    notes: '',
    language: 'en',
    // Profile fields
    profile_type: 'family',
    adults: 2,
    children: 0,
    children_ages: [],
    preferences: [],
    dietary_restrictions: [],
    accessibility_needs: [],
    allergies: '',
    preferred_activities: [],
    budget_preference: 'moderate',
    special_occasions: ''
  });
  
  const guestTypes = [
    { value: 'family', label: 'Family with Children', icon: '👨‍👩‍👧‍👦' },
    { value: 'couple', label: 'Couples', icon: '💑' },
    { value: 'solo', label: 'Solo Traveler', icon: '🚶‍♂️' },
    { value: 'business', label: 'Business Traveler', icon: '💼' },
    { value: 'group', label: 'Group/Friends', icon: '👥' },
    { value: 'wedding', label: 'Wedding Party', icon: '👰‍♀️' },
    { value: 'event', label: 'Event Attendees', icon: '🎉' }
  ];
  
  const guestLabels = [
    { value: 'family', label: 'Family-Friendly', color: 'bg-green-100 text-green-800', icon: '👨‍👩‍👧‍👦' },
    { value: 'intense', label: 'Adventure Seekers', color: 'bg-red-100 text-red-800', icon: '🔥' },
    { value: 'girls_weekend', label: 'Girls Weekend', color: 'bg-pink-100 text-pink-800', icon: '👯‍♀️' },
    { value: 'boys_weekend', label: 'Boys Weekend', color: 'bg-blue-100 text-blue-800', icon: '🍺' },
    { value: 'chill', label: 'Chill/Relaxing', color: 'bg-purple-100 text-purple-800', icon: '🧘‍♀️' },
    { value: 'wellness', label: 'Wellness & Spa', color: 'bg-teal-100 text-teal-800', icon: '💆‍♀️' },
    { value: 'romantic', label: 'Romantic Getaway', color: 'bg-red-100 text-red-800', icon: '❤️' },
    { value: 'business', label: 'Business Travel', color: 'bg-gray-100 text-gray-800', icon: '💼' }
  ];

  const preferredActivitiesList = [
    { value: 'skiing', label: 'Skiing', icon: '⛷️' },
    { value: 'snowboarding', label: 'Snowboarding', icon: '🏂' },
    { value: 'hiking', label: 'Hiking', icon: '🥾' },
    { value: 'spa', label: 'Spa & Wellness', icon: '💆' },
    { value: 'dining', label: 'Fine Dining', icon: '🍽️' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'sightseeing', label: 'Sightseeing', icon: '🏛️' },
    { value: 'nightlife', label: 'Nightlife', icon: '🎉' },
    { value: 'cycling', label: 'Cycling', icon: '🚴' },
    { value: 'golf', label: 'Golf', icon: '⛳' },
    { value: 'swimming', label: 'Swimming', icon: '🏊' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' }
  ];

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'es', label: 'Español', flag: '🇪🇸' }
  ];
  
  const guestStatuses = [
    { value: 'reserved', label: 'Reserved' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'checkout_due', label: 'Checkout Due' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchProperty();
    if (isEditing) {
      fetchGuest();
    }
  }, [propertyId, id]);

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

  const fetchGuest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/guests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const guest = data.data;
        setFormData({
          name: guest.first_name && guest.last_name ? `${guest.first_name} ${guest.last_name}` : (guest.first_name || guest.last_name || ''),
          email: guest.email || '',
          phone: guest.phone || '',
          check_in_date: guest.check_in_date ? new Date(guest.check_in_date).toISOString().split('T')[0] : '',
          check_out_date: guest.check_out_date ? new Date(guest.check_out_date).toISOString().split('T')[0] : '',
          party_size: guest.party_size || 1,
          room_number: guest.room_number || '',
          guest_type: guest.guest_type || 'couple',
          guest_labels: Array.isArray(guest.guest_labels) 
            ? guest.guest_labels 
            : (typeof guest.guest_labels === 'string' 
              ? guest.guest_labels.replace(/[{}]/g, '').split(',').filter(Boolean) 
              : []),
          special_requests: guest.special_requests || '',
          status: guest.status || 'reserved',
          notes: guest.notes || '',
          language: guest.language || 'en',
          // Profile fields - support both field naming conventions
          profile_type: guest.profile_type || 'family',
          adults: guest.adults || guest.number_of_adults || 2,
          children: guest.children || guest.number_of_children || 0,
          children_ages: Array.isArray(guest.children_ages) ? guest.children_ages : [],
          preferences: Array.isArray(guest.preferences) ? guest.preferences : [],
          dietary_restrictions: Array.isArray(guest.dietary_restrictions) ? guest.dietary_restrictions : [],
          accessibility_needs: Array.isArray(guest.accessibility_needs) ? guest.accessibility_needs : [],
          allergies: Array.isArray(guest.allergies) ? guest.allergies.join(', ') : (guest.allergies || ''),
          preferred_activities: Array.isArray(guest.preferred_activities) ? guest.preferred_activities : [],
          budget_preference: guest.budget_preference || 'moderate',
          special_occasions: guest.special_occasions || ''
        });
      } else {
        toast.error(data.message || 'Failed to fetch guest');
        navigate(`/properties/${propertyId}/guests`);
      }
    } catch (error) {
      toast.error('Failed to fetch guest');
      console.error('Error fetching guest:', error);
      navigate(`/properties/${propertyId}/guests`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuestLabelChange = (label) => {
    setFormData(prev => ({
      ...prev,
      guest_labels: prev.guest_labels.includes(label)
        ? prev.guest_labels.filter(l => l !== label)
        : [...prev.guest_labels, label]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare guest data - include both field naming conventions for backend compatibility
      const guestData = {
        ...formData,
        property_id: propertyId,
        party_size: parseInt(formData.party_size),
        // Include both field naming conventions for backend compatibility
        number_of_adults: formData.adults,
        number_of_children: formData.children,
        // Convert allergies string to array for database compatibility
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        // Ensure preferences is properly formatted (handle as object or array)
        preferences: formData.preferences || []
      };
      
      console.log('Sending guest data:', guestData);

      const url = isEditing 
        ? `${API_BASE_URL}/api/guests/${id}`
        : `${API_BASE_URL}/api/guests`;
        
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(isEditing ? 'Guest updated successfully' : 'Guest created successfully');
        navigate(`/properties/${propertyId}/guests`);
      } else {
        console.error('Guest update failed:', data);
        if (data.errors) {
          console.error('Validation errors:', data.errors);
          // Log each error in detail
          data.errors.forEach(err => {
            console.error(`Field: ${err.path?.join('.')}, Message: ${err.message}, Type: ${err.type}`);
          });
          const errorMessages = data.errors.map(err => err.message).join(', ');
          toast.error(`Validation failed: ${errorMessages}`);
        } else {
          toast.error(data.message || `Failed to ${isEditing ? 'update' : 'create'} guest`);
        }
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} guest`);
      console.error('Error submitting guest:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stay duration
  const calculateStayDuration = () => {
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const diffTime = checkOut - checkIn;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const stayDuration = calculateStayDuration();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to={`/properties/${propertyId}/guests`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Guests
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Guest' : 'Add New Guest'}
          </h1>
          {property && (
            <p className="text-sm text-gray-600">for {property.name}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Stay Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stay Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                name="check_in_date"
                value={formData.check_in_date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date *
              </label>
              <input
                type="date"
                name="check_out_date"
                value={formData.check_out_date}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Size *
              </label>
              <input
                type="number"
                name="party_size"
                value={formData.party_size}
                onChange={handleInputChange}
                min="1"
                max="20"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="101"
              />
            </div>
          </div>
          
          {stayDuration > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Stay Duration:</strong> {stayDuration} night{stayDuration !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Guest Type & Labels */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Profile</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Type *
              </label>
              <select
                name="guest_type"
                value={formData.guest_type}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {guestTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language *
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                This determines the language displayed in the tvOS app interface
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Interest Labels</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select labels that match this guest's interests for personalized activity recommendations:
              </p>
              
              <div className="flex flex-wrap gap-3">
                {guestLabels.map(label => (
                  <button
                    key={label.value}
                    type="button"
                    onClick={() => handleGuestLabelChange(label.value)}
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors border ${
                      formData.guest_labels.includes(label.value)
                        ? `${label.color} border-current`
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{label.icon}</span>
                    {label.label}
                  </button>
                ))}
              </div>
              
              {formData.guest_labels.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Selected Interests:</strong> {formData.guest_labels.map(labelValue => {
                      const label = guestLabels.find(l => l.value === labelValue);
                      return label ? `${label.icon} ${label.label}` : labelValue;
                    }).join(', ')}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    The TV app will recommend activities that match these interests and current weather conditions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {guestStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                name="special_requests"
                value={formData.special_requests}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special accommodations or requests..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Internal notes about this guest (not visible to guest)..."
              />
            </div>
          </div>
        </div>

        {/* Guest Profile */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Type
              </label>
              <select
                name="profile_type"
                value={formData.profile_type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="family">Family</option>
                <option value="couple">Couple</option>
                <option value="adventure">Adventure</option>
                <option value="wellness">Wellness</option>
                <option value="business">Business</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Preference
              </label>
              <select
                name="budget_preference"
                value={formData.budget_preference}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adults
              </label>
              <input
                type="number"
                name="adults"
                value={formData.adults}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Children
              </label>
              <input
                type="number"
                name="children"
                value={formData.children}
                onChange={handleInputChange}
                min="0"
                max="8"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Activities
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select activities the guest enjoys - these will be used for recommendations in the tvOS app.
              </p>
              <div className="flex flex-wrap gap-2">
                {preferredActivitiesList.map(activity => (
                  <label key={activity.value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={activity.value}
                      checked={formData.preferred_activities.includes(activity.value)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          preferred_activities: e.target.checked 
                            ? [...prev.preferred_activities, value]
                            : prev.preferred_activities.filter(a => a !== value)
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {activity.icon} {activity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restrictions
              </label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'Nut-Free'].map(diet => (
                  <label key={diet} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={diet.toLowerCase().replace('-', '_')}
                      checked={formData.dietary_restrictions.includes(diet.toLowerCase().replace('-', '_'))}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          dietary_restrictions: e.target.checked 
                            ? [...prev.dietary_restrictions, value]
                            : prev.dietary_restrictions.filter(d => d !== value)
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{diet}</span>
                  </label>
                ))}
              </div>
            </div>
            
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="List any allergies..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Occasions
              </label>
              <input
                type="text"
                name="special_occasions"
                value={formData.special_occasions}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Anniversary, Birthday, etc..."
              />
            </div>
          </div>

          {/* Profile Summary */}
          {(formData.preferred_activities.length > 0 || formData.dietary_restrictions.length > 0 || formData.guest_labels.length > 0) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Profile Summary</h3>
              
              {formData.guest_labels.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-blue-700">Interest Labels: </span>
                  <span className="text-xs text-blue-800">
                    {formData.guest_labels.map(labelValue => {
                      const label = guestLabels.find(l => l.value === labelValue);
                      return label ? `${label.icon} ${label.label}` : labelValue;
                    }).join(', ')}
                  </span>
                </div>
              )}
              
              {formData.preferred_activities.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-blue-700">Activities: </span>
                  <span className="text-xs text-blue-800">
                    {formData.preferred_activities.map(actValue => {
                      const activity = preferredActivitiesList.find(a => a.value === actValue);
                      return activity ? `${activity.icon} ${activity.label}` : actValue;
                    }).join(', ')}
                  </span>
                </div>
              )}
              
              {formData.dietary_restrictions.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-blue-700">Dietary: </span>
                  <span className="text-xs text-blue-800">
                    {formData.dietary_restrictions.join(', ')}
                  </span>
                </div>
              )}
              
              <p className="text-xs text-blue-700 mt-3">
                ✨ This profile will sync with the tvOS app to provide personalized recommendations
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Link
            to={`/properties/${propertyId}/guests`}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Guest' : 'Create Guest'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestForm;