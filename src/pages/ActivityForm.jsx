import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageHelpers';

const ActivityForm = () => {
  const navigate = useNavigate();
  const { propertyId, id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing); // Loading state for fetching existing activity
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    title_de: '',
    description_de: '',
    activity_type: 'outdoor',
    location: '',
    contact_info: '',
    operating_hours: '',
    price_range: '',
    booking_required: false,
    booking_url: '',
    booking_phone: '',
    target_guest_types: [],
    activity_labels: [],
    weather_suitability: [],
    is_active: true,
    display_order: 0,
    image_url: '',
    season: 'all',
    season_start_month: 1,
    season_end_month: 12,
    weather_dependent: false,
    min_temperature: '',
    max_temperature: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' or 'url'
  const [imageImporting, setImageImporting] = useState(false);
  
  const activityTypes = [
    { value: 'outdoor', label: 'Outdoor Activities' },
    { value: 'winter_sports', label: 'Winter Sports' },
    { value: 'summer_sports', label: 'Summer Sports' },
    { value: 'wellness', label: 'Wellness & Spa' },
    { value: 'restaurant', label: 'Restaurant & Dining' },
    { value: 'recreation', label: 'Recreation & Sports' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'cultural', label: 'Cultural & Arts' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'family', label: 'Family Activities' },
    { value: 'business', label: 'Business Services' }
  ];
  
  const guestTypes = [
    { value: 'family', label: 'Family with Children' },
    { value: 'couple', label: 'Couples' },
    { value: 'solo', label: 'Solo Travelers' },
    { value: 'business', label: 'Business Travelers' },
    { value: 'all_male', label: 'Male Groups' },
    { value: 'all_female', label: 'Female Groups' },
    { value: 'seniors', label: 'Seniors' },
    { value: 'youth', label: 'Young Adults' }
  ];

  const activityLabels = [
    { value: 'family', label: 'Family-Friendly', color: 'bg-green-100 text-green-800', icon: '👨‍👩‍👧‍👦' },
    { value: 'intense', label: 'Intense/Adventure', color: 'bg-red-100 text-red-800', icon: '🔥' },
    { value: 'girls_weekend', label: 'Girls Weekend', color: 'bg-pink-100 text-pink-800', icon: '👯‍♀️' },
    { value: 'boys_weekend', label: 'Boys Weekend', color: 'bg-blue-100 text-blue-800', icon: '🍺' },
    { value: 'chill', label: 'Chill/Relaxing', color: 'bg-purple-100 text-purple-800', icon: '🧘‍♀️' }
  ];

  const weatherSuitability = [
    { value: 'sunny', label: 'Sunny Weather', icon: '☀️' },
    { value: 'cloudy', label: 'Cloudy Weather', icon: '☁️' },
    { value: 'rainy', label: 'Rainy Weather', icon: '🌧️' },
    { value: 'snowy', label: 'Snowy Weather', icon: '❄️' },
    { value: 'indoor', label: 'Indoor (Weather Independent)', icon: '🏠' },
    { value: 'all_weather', label: 'All Weather Conditions', icon: '🌦️' }
  ];
  
  const seasons = [
    { value: 'all', label: 'All Year', icon: '📅' },
    { value: 'winter', label: 'Winter (Dec-Mar)', icon: '❄️' },
    { value: 'summer', label: 'Summer (Jun-Sep)', icon: '☀️' },
    { value: 'spring', label: 'Spring (Apr-May)', icon: '🌸' },
    { value: 'autumn', label: 'Autumn (Oct-Nov)', icon: '🍂' },
    { value: 'winter_summer', label: 'Winter & Summer', icon: '🏔️' }
  ];

  useEffect(() => {
    fetchProperty();
    if (isEditing) {
      fetchActivity();
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

  const fetchActivity = async () => {
    try {
      setInitialLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const activity = data.data;
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          title_de: activity.title_de || '',
          description_de: activity.description_de || '',
          activity_type: activity.activity_type || 'outdoor',
          location: activity.location || '',
          contact_info: activity.contact_info || '',
          operating_hours: activity.operating_hours || '',
          price_range: activity.price_range || '',
          booking_required: activity.booking_required === true,
          booking_url: activity.booking_url || '',
          booking_phone: activity.booking_phone || '',
          target_guest_types: Array.isArray(activity.target_guest_types) 
            ? activity.target_guest_types 
            : (typeof activity.target_guest_types === 'string' 
              ? activity.target_guest_types.replace(/[{}]/g, '').split(',') 
              : []),
          activity_labels: Array.isArray(activity.activity_labels) 
            ? activity.activity_labels 
            : (typeof activity.activity_labels === 'string' 
              ? activity.activity_labels.replace(/[{}]/g, '').split(',') 
              : []),
          weather_suitability: Array.isArray(activity.weather_suitability) 
            ? activity.weather_suitability 
            : (typeof activity.weather_suitability === 'string' 
              ? activity.weather_suitability.replace(/[{}]/g, '').split(',') 
              : []),
          is_active: activity.is_active === true,
          display_order: activity.display_order ?? 0,
          image_url: activity.image_url || '',
          season: activity.season || 'all',
          season_start_month: activity.season_start_month ?? 1,
          season_end_month: activity.season_end_month ?? 12,
          weather_dependent: activity.weather_dependent === true,
          min_temperature: activity.min_temperature != null ? String(activity.min_temperature) : '',
          max_temperature: activity.max_temperature != null ? String(activity.max_temperature) : ''
        });
        
        if (activity.image_url) {
          // Check if it's an external URL or a local upload
          if (activity.image_url.startsWith('http')) {
            // External URL
            setImageUrlInput(activity.image_url);
            setImageInputMode('url');
            
            // Check if it's a Vercel Blob Storage URL
            if (activity.image_url.includes('blob.vercel-storage.com')) {
              // Use Blob Storage URL directly - no proxy needed
              setImagePreview(activity.image_url);
            } else {
              // Use proxy for external images to avoid CORS issues
              try {
                const checkResponse = await fetch(`${API_BASE_URL}/api/check-image`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ url: activity.image_url })
                });
                
                const checkResult = await checkResponse.json();
                
                if (checkResult.success && checkResult.data.accessible && checkResult.data.isImage) {
                  // Use proxied URL for preview
                  const proxiedUrl = `${API_BASE_URL}/api/proxy/image?url=${encodeURIComponent(activity.image_url)}`;
                  setImagePreview(proxiedUrl);
                } else {
                  // Fallback to direct URL
                  setImagePreview(activity.image_url);
                }
              } catch (error) {
                console.error('Error checking image:', error);
                setImagePreview(activity.image_url);
              }
            }
          } else {
            // Local upload - use the helper to get full URL for preview
            const imageUrl = getImageUrl(activity.image_url);
            setImagePreview(imageUrl);
            setImageInputMode('upload');
            // Don't modify formData here as it's already set above
          }
        }
      } else {
        toast.error(data.message || 'Failed to fetch activity');
        navigate(`/properties/${propertyId}/activities`);
      }
    } catch (error) {
      toast.error('Failed to fetch activity');
      console.error('Error fetching activity:', error);
      navigate(`/properties/${propertyId}/activities`);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuestTypeChange = (guestType) => {
    setFormData(prev => ({
      ...prev,
      target_guest_types: prev.target_guest_types.includes(guestType)
        ? prev.target_guest_types.filter(type => type !== guestType)
        : [...prev.target_guest_types, guestType]
    }));
  };

  const handleActivityLabelChange = (label) => {
    setFormData(prev => ({
      ...prev,
      activity_labels: prev.activity_labels.includes(label)
        ? prev.activity_labels.filter(l => l !== label)
        : [...prev.activity_labels, label]
    }));
  };

  const handleWeatherSuitabilityChange = (weather) => {
    setFormData(prev => ({
      ...prev,
      weather_suitability: prev.weather_suitability.includes(weather)
        ? prev.weather_suitability.filter(w => w !== weather)
        : [...prev.weather_suitability, weather]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      setImageFile(file);
      setImageUrlInput('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = async (e) => {
    const url = e.target.value;
    setImageUrlInput(url);
    
    if (url) {
      // Basic URL validation
      if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
        setFormData(prev => ({ ...prev, image_url: url }));
        setImageFile(null);
        
        // For external URLs, use the proxy for preview
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // Check if it's a Vercel Blob Storage URL
          if (url.includes('blob.vercel-storage.com')) {
            // Use Blob Storage URL directly - no proxy needed
            setImagePreview(url);
          } else {
            const token = localStorage.getItem('token');
            
            // Check if we can access the image
            try {
              const checkResponse = await fetch(`${API_BASE_URL}/api/check-image`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url })
              });
              
              const checkResult = await checkResponse.json();
              
              if (checkResult.success && checkResult.data.accessible && checkResult.data.isImage) {
                // Use proxied URL for preview
                const proxiedUrl = `${API_BASE_URL}/api/proxy/image?url=${encodeURIComponent(url)}`;
                setImagePreview(proxiedUrl);
                
                // Show info about auto-import if not already a blob URL
                toast('This image will be automatically imported to our CDN when you save.', {
                  icon: '📥',
                  duration: 4000
                });
              } else {
                // Fallback to direct URL (may not display due to CORS)
                setImagePreview(url);
                toast('Image may not display properly due to external site restrictions, but will be imported when saved.');
              }
            } catch (error) {
              console.error('Error checking image:', error);
              setImagePreview(url);
            }
          }
        } else {
          // Local URL, use directly
          setImagePreview(url);
        }
      }
    } else {
      setImagePreview('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrlInput('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    // Reset to upload mode for consistency
    setImageInputMode('upload');
  };

  const handleGoogleImageSearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // If we're editing an existing activity, use its ID
      // Otherwise, save the activity first
      let activityId = id;
      
      if (!activityId) {
        toast.info('Please save the activity first before searching for images');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/activities/${activityId}/search-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activityName: formData.title || formData.title_de,
          location: formData.location || 'Schladming Austria'
        })
      });

      const result = await response.json();
      
      if (result.success && result.image) {
        // Update the image URL and preview
        const imageUrl = result.image.url;
        setImageUrlInput(imageUrl);
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        setImageInputMode('url');
        
        // Check if the image is accessible via our backend
        const checkResponse = await fetch(`${API_BASE_URL}/api/check-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: imageUrl })
        });
        
        const checkResult = await checkResponse.json();
        
        if (checkResult.success && checkResult.data.accessible && checkResult.data.isImage) {
          // If the image needs proxying (external URL), use the proxy URL for preview
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            const proxiedUrl = `${API_BASE_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
            setImagePreview(proxiedUrl);
          } else {
            setImagePreview(imageUrl);
          }
          toast.success(`Image found from ${result.image.source}!`);
        } else {
          // Still save the URL but warn about display issues
          setImagePreview(imageUrl);
          toast(`Image found but may not display properly. The URL has been saved and will be accessible through the backend.`);
        }
      } else {
        toast('No suitable image found. Try adding more details to the activity title.', {
          icon: '⚠️',
        });
      }
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('Failed to search for image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      let imageUrl = formData.image_url;
      
      // Handle image based on input mode
      if (imageInputMode === 'upload' && imageFile) {
        // Upload image if a new file was selected
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const imageResponse = await fetch(`${API_BASE_URL}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });
        
        const imageData = await imageResponse.json();
        if (imageData.success) {
          imageUrl = imageData.data.url;
        } else {
          throw new Error(imageData.message || 'Failed to upload image');
        }
      } else if (imageInputMode === 'url' && imageUrlInput) {
        // Use the direct URL provided
        imageUrl = imageUrlInput;
      } else if (isEditing && !imageFile && !imageUrlInput && formData.image_url) {
        // If editing and no new image, keep the existing image_url
        imageUrl = formData.image_url;
      }

      // Prepare activity data
      const activityData = {
        ...formData,
        property_id: propertyId,
        image_url: imageUrl,
        target_guest_types: formData.target_guest_types,
        // Convert empty strings to null for temperature fields
        min_temperature: formData.min_temperature === '' ? null : parseInt(formData.min_temperature),
        max_temperature: formData.max_temperature === '' ? null : parseInt(formData.max_temperature)
      };

      const url = isEditing 
        ? `${API_BASE_URL}/api/activities/${id}`
        : `${API_BASE_URL}/api/activities`;
        
      const method = isEditing ? 'PUT' : 'POST';
      
      // Show importing toast if external URL
      if (imageUrlInput && !imageUrlInput.includes('blob.vercel-storage.com') && imageUrlInput.startsWith('http')) {
        setImageImporting(true);
        toast('Importing image to CDN...', {
          icon: '⏳',
          duration: 3000
        });
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });
      
      const data = await response.json();
      
      setImageImporting(false);
      
      if (data.success) {
        toast.success(isEditing ? 'Activity updated successfully' : 'Activity created successfully');
        if (imageUrlInput && !imageUrlInput.includes('blob.vercel-storage.com') && imageUrlInput.startsWith('http')) {
          toast.success('Image imported to CDN successfully!');
        }
        navigate(`/properties/${propertyId}/activities`);
      } else {
        toast.error(data.message || `Failed to ${isEditing ? 'update' : 'create'} activity`);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} activity`);
      console.error('Error submitting activity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching existing activity data
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to={`/properties/${propertyId}/activities`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Activities
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Activity' : 'Add New Activity'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title (English) *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Rocky Mountain National Park"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title (German)
              </label>
              <input
                type="text"
                name="title_de"
                value={formData.title_de}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Rocky Mountain Nationalpark"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type *
              </label>
              <select
                name="activity_type"
                value={formData.activity_type}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Downtown (10 minutes drive)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English) *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed description of the activity..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (German)
              </label>
              <textarea
                name="description_de"
                value={formData.description_de}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detaillierte Beschreibung der Aktivität..."
              />
            </div>
          </div>
        </div>

        {/* Contact & Booking Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Booking Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <input
                type="text"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Hours
              </label>
              <input
                type="text"
                name="operating_hours"
                value={formData.operating_hours}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 9 AM - 5 PM daily"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <input
                type="text"
                name="price_range"
                value={formData.price_range}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., $25 - $50 per person"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Phone
              </label>
              <input
                type="tel"
                name="booking_phone"
                value={formData.booking_phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., (555) 123-4567"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="booking_url"
                value={formData.booking_url}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/booking"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="booking_required"
                  checked={formData.booking_required}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Booking Required
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Target Guest Types */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Guest Types</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select all guest types that would be interested in this activity:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {guestTypes.map(guestType => (
              <div key={guestType.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={guestType.value}
                  checked={formData.target_guest_types.includes(guestType.value)}
                  onChange={() => handleGuestTypeChange(guestType.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={guestType.value} className="ml-2 text-sm text-gray-700">
                  {guestType.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Labels */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Labels</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select labels that best describe this activity for better guest matching:
          </p>
          
          <div className="flex flex-wrap gap-3">
            {activityLabels.map(label => (
              <button
                key={label.value}
                type="button"
                onClick={() => handleActivityLabelChange(label.value)}
                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors border ${
                  formData.activity_labels.includes(label.value)
                    ? `${label.color} border-current`
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{label.icon}</span>
                {label.label}
              </button>
            ))}
          </div>
          
          {formData.activity_labels.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {formData.activity_labels.map(labelValue => {
                  const label = activityLabels.find(l => l.value === labelValue);
                  return label ? `${label.icon} ${label.label}` : labelValue;
                }).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Weather Suitability */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather Suitability</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select weather conditions when this activity is recommended:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {weatherSuitability.map(weather => (
              <div key={weather.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={weather.value}
                  checked={formData.weather_suitability.includes(weather.value)}
                  onChange={() => handleWeatherSuitabilityChange(weather.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={weather.value} className="ml-2 text-sm text-gray-700 flex items-center">
                  <span className="mr-2">{weather.icon}</span>
                  {weather.label}
                </label>
              </div>
            ))}
          </div>
          
          {formData.weather_suitability.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Suitable for:</strong> {formData.weather_suitability.map(weatherValue => {
                  const weather = weatherSuitability.find(w => w.value === weatherValue);
                  return weather ? `${weather.icon} ${weather.label}` : weatherValue;
                }).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Season Availability */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Season Availability</h2>
          <p className="text-sm text-gray-600 mb-4">
            Specify when this activity is available throughout the year:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {seasons.map(season => (
                  <option key={season.value} value={season.value}>
                    {season.icon} {season.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="weather_dependent"
                name="weather_dependent"
                checked={formData.weather_dependent}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="weather_dependent" className="ml-2 block text-sm text-gray-700">
                🌡️ Weather dependent activity
              </label>
            </div>
            
            {formData.weather_dependent && (
              <>
                <div>
                  <label htmlFor="min_temperature" className="block text-sm font-medium text-gray-700 mb-2">
                    Min Temperature (°C)
                  </label>
                  <input
                    type="number"
                    id="min_temperature"
                    name="min_temperature"
                    value={formData.min_temperature}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., -10 for skiing"
                  />
                </div>
                
                <div>
                  <label htmlFor="max_temperature" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Temperature (°C)
                  </label>
                  <input
                    type="number"
                    id="max_temperature"
                    name="max_temperature"
                    value={formData.max_temperature}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5 for skiing"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Season Guide:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• <strong>Winter:</strong> Dec-Mar (skiing, snowboarding, winter activities)</li>
              <li>• <strong>Summer:</strong> Jun-Sep (hiking, biking, swimming)</li>
              <li>• <strong>All Year:</strong> Indoor activities, wellness, restaurants</li>
            </ul>
          </div>
        </div>

        {/* Activity Image */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Image</h2>
          
          {/* Image Input Mode Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setImageInputMode('upload')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                imageInputMode === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setImageInputMode('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                imageInputMode === 'url'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Use Image URL
            </button>
          </div>
          
          {/* Google Image Search Button */}
          {id && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleImageSearch}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
                </svg>
                {loading ? 'Searching...' : 'Auto-Find Image'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Automatically search and set an appropriate image for this activity
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Activity preview" 
                  className="w-64 h-48 object-cover rounded-lg border"
                  onError={(e) => {
                    console.error('Image failed to load:', imagePreview);
                    e.target.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              {imageInputMode === 'upload' ? (
                <>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a direct URL to an image. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in the list
              </p>
            </div>
            
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active (visible to guests)
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Link
            to={`/properties/${propertyId}/activities`}
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
                {isEditing ? 'Update Activity' : 'Create Activity'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;