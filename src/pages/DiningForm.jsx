import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Clock, Phone, Globe, DollarSign, Star, Upload, Users, Car, Utensils, Award, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const DiningForm = () => {
  const navigate = useNavigate();
  const { propertyId, id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    name_en: '',
    name_de: '',
    category: '',
    cuisine_type: 'international',
    
    // Location
    location_area: '',
    street_address: '',
    city: 'Schladming',
    postal_code: '8970',
    latitude: '',
    longitude: '',
    altitude_m: '',
    
    // Contact
    phone: '',
    website: '',
    email: '',
    
    // Operating Hours
    hours_winter: '',
    hours_summer: '',
    season_recommendation: 'Year_Round',
    
    // Pricing & Capacity
    price_range: '2',
    capacity_indoor: '',
    capacity_outdoor: '',
    capacity_total: '',
    
    // Features & Services
    parking: false,
    family_friendly: false,
    vegetarian: false,
    vegan: false,
    gluten_free: false,
    reservations_required: 'No',
    
    // Additional Info
    awards: '',
    accessibility: '',
    relevance_status: 'Popular',
    
    // Media
    image_url: '',
    description: '',
    
    // Status
    is_active: true
  });

  const cuisineTypes = [
    { value: 'austrian', label: 'Austrian Traditional' },
    { value: 'italian', label: 'Italian' },
    { value: 'asian', label: 'Asian' },
    { value: 'international', label: 'International' },
    { value: 'cafe', label: 'Café & Bar' },
    { value: 'fine_dining', label: 'Fine Dining' },
    { value: 'steakhouse', label: 'Steakhouse' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'pizza', label: 'Pizza & Italian' },
    { value: 'burger', label: 'Burger & Grill' },
    { value: 'local', label: 'Local Specialties' }
  ];

  const categories = [
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Fine_Dining', label: 'Fine Dining' },
    { value: 'Mountain_Hut', label: 'Mountain Hut' },
    { value: 'Alpine_Hut', label: 'Alpine Hut' },
    { value: 'Apres_Ski', label: 'Après Ski' },
    { value: 'Cafe_Bakery', label: 'Café & Bakery' },
    { value: 'Bar', label: 'Bar' },
    { value: 'Hotel_Restaurant', label: 'Hotel Restaurant' },
    { value: 'Gourmet_Hut', label: 'Gourmet Hut' },
    { value: 'Traditional', label: 'Traditional' },
    { value: 'Modern', label: 'Modern' }
  ];

  const locationAreas = [
    { value: 'Schladming_Center', label: 'Schladming Center' },
    { value: 'Planai_Base', label: 'Planai Base' },
    { value: 'Planai_Mid', label: 'Planai Mid Station' },
    { value: 'Planai_Top', label: 'Planai Top' },
    { value: 'Hochwurzen_Base', label: 'Hochwurzen Base' },
    { value: 'Hochwurzen_Top', label: 'Hochwurzen Top' },
    { value: 'Reiteralm', label: 'Reiteralm' },
    { value: 'Hauser_Kaibling_Base', label: 'Hauser Kaibling Base' },
    { value: 'Hauser_Kaibling_Top', label: 'Hauser Kaibling Top' },
    { value: 'Rohrmoos', label: 'Rohrmoos' },
    { value: 'Rohrmoostal', label: 'Rohrmoostal' },
    { value: 'Pichl', label: 'Pichl' },
    { value: 'Haus', label: 'Haus im Ennstal' },
    { value: 'Ramsau', label: 'Ramsau am Dachstein' },
    { value: 'Fageralm', label: 'Fageralm' },
    { value: 'Obertal', label: 'Obertal' },
    { value: 'Untertal', label: 'Untertal' }
  ];

  const seasonOptions = [
    { value: 'Year_Round', label: 'Year Round' },
    { value: 'Winter_Only', label: 'Winter Only' },
    { value: 'Summer_Only', label: 'Summer Only' },
    { value: 'Winter_Summer', label: 'Winter & Summer' },
    { value: 'Ski_Season', label: 'Ski Season Only' }
  ];

  const relevanceOptions = [
    { value: 'Must_See', label: 'Must See ⭐⭐⭐' },
    { value: 'Highly_Recommended', label: 'Highly Recommended ⭐⭐' },
    { value: 'Recommended', label: 'Recommended ⭐' },
    { value: 'Popular', label: 'Popular' },
    { value: 'Standard', label: 'Standard' }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchDiningPlace();
    }
  }, [id]);

  const fetchDiningPlace = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/dining/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const dining = await response.json();
      if (response.ok && dining) {
        // Map the actual database fields to form fields
        setFormData({
          name_en: dining.name_en || dining.name || '',
          name_de: dining.name_de || dining.name || '',
          category: dining.category || '',
          cuisine_type: dining.cuisine_type || 'international',
          
          location_area: dining.location_area || '',
          street_address: dining.street_address || '',
          city: dining.city || 'Schladming',
          postal_code: dining.postal_code || '8970',
          latitude: dining.latitude || '',
          longitude: dining.longitude || '',
          altitude_m: dining.altitude_m || '',
          
          phone: dining.phone || '',
          website: dining.website || '',
          email: dining.email || '',
          
          hours_winter: dining.hours_winter || '',
          hours_summer: dining.hours_summer || '',
          season_recommendation: dining.season_recommendation || 'Year_Round',
          
          price_range: dining.price_range || '2',
          capacity_indoor: dining.capacity_indoor || '',
          capacity_outdoor: dining.capacity_outdoor || '',
          capacity_total: dining.capacity_total || '',
          
          parking: dining.parking === true,
          family_friendly: dining.family_friendly === true,
          vegetarian: dining.vegetarian === true,
          vegan: dining.vegan === true,
          gluten_free: dining.gluten_free === true,
          reservations_required: dining.reservations_required || 'No',
          
          awards: dining.awards || '',
          accessibility: dining.accessibility || '',
          relevance_status: dining.relevance_status || 'Popular',
          
          image_url: dining.image_url || '',
          description: dining.description || '',
          
          is_active: dining.is_active !== false
        });
      }
    } catch (error) {
      toast.error('Failed to load dining place');
      console.error('Error fetching dining place:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEdit 
        ? `${API_BASE_URL}/api/dining/${id}`
        : `${API_BASE_URL}/api/dining`;
      
      // Prepare data for submission
      const diningData = {
        ...formData,
        name: formData.name_en, // Add name field for compatibility
        location: formData.street_address,
        description: formData.description || `${formData.category} in ${formData.location_area}`,
        rating: 4.5 // Default rating
      };

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(diningData)
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        toast.success(isEdit ? 'Dining place updated successfully' : 'Dining place created successfully');
        navigate(propertyId ? `/properties/${propertyId}/dining` : '/dining');
      } else {
        toast.error(data.message || 'Failed to save dining place');
      }
    } catch (error) {
      toast.error('Failed to save dining place');
      console.error('Error saving dining place:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(propertyId ? `/properties/${propertyId}/dining` : '/dining')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dining
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Dining Place' : 'Add New Dining Place'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Restaurant name in English"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (German)
                </label>
                <input
                  type="text"
                  name="name_de"
                  value={formData.name_de}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Restaurant name in German"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type *
                </label>
                <select
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {cuisineTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Price Range
                </label>
                <select
                  name="price_range"
                  value={formData.price_range}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">€ - Budget</option>
                  <option value="2">€€ - Moderate</option>
                  <option value="3">€€€ - Expensive</option>
                  <option value="4">€€€€ - Very Expensive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Star className="inline h-4 w-4 mr-1" />
                  Relevance Status
                </label>
                <select
                  name="relevance_status"
                  value={formData.relevance_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {relevanceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-6 border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <MapPin className="inline h-5 w-5 mr-1" />
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Area *
                </label>
                <select
                  name="location_area"
                  value={formData.location_area}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select location area</option>
                  {locationAreas.map(area => (
                    <option key={area.value} value={area.value}>{area.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street and number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altitude (m)
                </label>
                <input
                  type="number"
                  name="altitude_m"
                  value={formData.altitude_m}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Altitude in meters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPS Coordinates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Latitude"
                  />
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Longitude"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="mb-6 border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <Phone className="inline h-5 w-5 mr-1" />
              Contact & Operating Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+43 1234 567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="info@restaurant.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Season Recommendation
                </label>
                <select
                  name="season_recommendation"
                  value={formData.season_recommendation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {seasonOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Winter Hours
                </label>
                <input
                  type="text"
                  name="hours_winter"
                  value={formData.hours_winter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Daily 11:00-22:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Summer Hours
                </label>
                <input
                  type="text"
                  name="hours_summer"
                  value={formData.hours_summer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Daily 10:00-23:00"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Features */}
          <div className="mb-6 border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <Users className="inline h-5 w-5 mr-1" />
              Capacity & Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indoor Capacity
                </label>
                <input
                  type="number"
                  name="capacity_indoor"
                  value={formData.capacity_indoor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of seats"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outdoor Capacity
                </label>
                <input
                  type="number"
                  name="capacity_outdoor"
                  value={formData.capacity_outdoor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of seats"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Capacity
                </label>
                <input
                  type="number"
                  name="capacity_total"
                  value={formData.capacity_total}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Total number of guests"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleChange}
                  className="mr-2"
                />
                <Car className="h-4 w-4 mr-1" />
                <span className="text-sm">Parking Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="family_friendly"
                  checked={formData.family_friendly}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">👨‍👩‍👧‍👦 Family Friendly</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="vegetarian"
                  checked={formData.vegetarian}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">🥗 Vegetarian Options</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="vegan"
                  checked={formData.vegan}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">🌱 Vegan Options</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="gluten_free"
                  checked={formData.gluten_free}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">🌾 Gluten-Free Options</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">✅ Active</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reservations Required
                </label>
                <select
                  name="reservations_required"
                  value={formData.reservations_required}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="No">No</option>
                  <option value="Recommended">Recommended</option>
                  <option value="Yes">Yes - Required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accessibility
                </label>
                <input
                  type="text"
                  name="accessibility"
                  value={formData.accessibility}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Walk, Car, Cable_Car"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6 border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <Award className="inline h-5 w-5 mr-1" />
              Additional Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Awards & Recognition
                </label>
                <input
                  type="text"
                  name="awards"
                  value={formData.awards}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Gault_Millau, Michelin_Star"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the dining place..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="h-32 w-auto rounded-md object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(propertyId ? `/properties/${propertyId}/dining` : '/dining')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Dining Place
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DiningForm;