import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi } from '../services/api';
import toast from 'react-hot-toast';

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'apartment',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    coordinates: {
      latitude: '',
      longitude: ''
    },
    policies: {
      checkInTime: '4:00 PM',
      checkOutTime: '11:00 AM',
      quietHours: '10:00 PM - 8:00 AM',
      smoking: 'not_allowed',
      pets: 'not_allowed',
      parties: 'not_allowed',
      children: 'allowed',
      additionalRules: []
    },
    contactInfo: {
      hostName: '',
      hostPhone: '',
      hostEmail: '',
      emergencyPhone: '',
      managementCompany: '',
      managementPhone: '',
      checkInContact: '',
      maintenancePhone: ''
    },
    wifiCredentials: {
      networkName: '',
      password: '',
      guestNetworkName: '',
      guestPassword: '',
      instructions: ''
    },
    emergencyInfo: {
      localPolice: '911',
      fireDepartment: '911',
      medicalServices: '911',
      poisonControl: '',
      nearestHospital: {
        name: '',
        address: '',
        phone: '',
        distance: '',
        drivingTime: ''
      },
      propertyManager: '',
      utilityCompanies: []
    },
    localInfo: {
      timezone: 'Europe/Vienna',
      currency: 'EUR',
      language: 'en',
      localCustoms: [],
      importantNumbers: [],
      nearbyServices: [],
      publicTransport: null,
      localEvents: []
    },
    features: {
      shopEnabled: true
    },
    isActive: true
  });

  // Load property data if editing
  useEffect(() => {
    if (isEditing) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await propertyApi.getById(id);
      const propertyData = response.data.data;
      
      console.log('Loaded property data:', propertyData);
      
      // Map backend data to frontend form structure
      const addressParts = propertyData.address ? propertyData.address.split(', ') : [];
      console.log('Address parts:', addressParts);
      
      setFormData(prevData => ({
        ...prevData,
        name: propertyData.name || '',
        type: propertyData.type || 'apartment',
        description: propertyData.welcome_message || '',
        isActive: propertyData.is_active !== false,
        features: {
          shopEnabled: propertyData.shop_enabled !== false
        },
        address: {
          ...prevData.address,
          street: addressParts[0] || '',
          city: addressParts[1] || '',
          state: addressParts[2]?.split(' ')[0] || '',
          postalCode: addressParts[2]?.split(' ')[1] || '',
          country: addressParts[3] || ''
        },
        policies: {
          ...prevData.policies,
          checkInTime: propertyData.house_rules?.includes('Check-in:') ? 
            propertyData.house_rules.split('Check-in: ')[1]?.split(',')[0] || '' : 
            prevData.policies.checkInTime,
          checkOutTime: propertyData.house_rules?.includes('Check-out:') ? 
            propertyData.house_rules.split('Check-out: ')[1]?.split(',')[0] || '' : 
            prevData.policies.checkOutTime,
          quietHours: propertyData.house_rules?.includes('Quiet hours:') ? 
            propertyData.house_rules.split('Quiet hours: ')[1] || '' : 
            prevData.policies.quietHours
        },
        contactInfo: {
          ...prevData.contactInfo,
          emergencyPhone: propertyData.emergency_contact || ''
        },
        wifiCredentials: {
          ...prevData.wifiCredentials,
          networkName: propertyData.wifi_ssid || '',
          password: propertyData.wifi_password || '',
          instructions: propertyData.checkout_instructions || ''
        }
      }));
      
      console.log('Form data updated for property:', propertyData.name);
    } catch (error) {
      toast.error('Failed to load property data');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (section, field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  };

  const addArrayItem = (section, field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], defaultValue]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Prepare data for submission - map to backend schema
      const submitData = {
        name: formData.name || '',
        type: formData.type || 'apartment',
        address: (formData.address?.street && formData.address?.city) ? 
          `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.postalCode}, ${formData.address.country}`.replace(/,\s*,/g, ',').replace(/,$/, '') :
          '',
        wifi_ssid: formData.wifiCredentials?.networkName || '',
        wifi_password: formData.wifiCredentials?.password || '',
        welcome_message: formData.description || '',
        house_rules: (formData.policies?.checkInTime || formData.policies?.checkOutTime || formData.policies?.quietHours) ?
          `Check-in: ${formData.policies?.checkInTime || ''}, Check-out: ${formData.policies?.checkOutTime || ''}, Quiet hours: ${formData.policies?.quietHours || ''}`.replace(/,\s*,/g, ',').replace(/,$/, '') :
          '',
        emergency_contact: formData.contactInfo?.emergencyPhone || '',
        checkout_instructions: formData.wifiCredentials?.instructions || '',
        shop_enabled: formData.features?.shopEnabled !== false
      };

      console.log('Submitting data:', submitData);

      if (isEditing) {
        await propertyApi.update(id, submitData);
        toast.success('Property updated successfully!');
      } else {
        await propertyApi.create(submitData);
        toast.success('Property created successfully!');
      }
      
      navigate('/properties');
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} property`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading property data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {isEditing ? 'Edit Property' : 'Create New Property'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-subtitle">Basic Information</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Name *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => handleInputChange(null, 'name', e.target.value)}
                  placeholder="e.g., Luxury Mountain Chalet"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <select
                  required
                  className="input"
                  value={formData.type}
                  onChange={(e) => handleInputChange(null, 'type', e.target.value)}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="condo">Condominium</option>
                  <option value="cabin">Cabin</option>
                  <option value="chalet">Chalet</option>
                  <option value="hotel">Hotel Room</option>
                  <option value="resort">Resort</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="input"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange(null, 'description', e.target.value)}
                placeholder="Describe your property..."
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange(null, 'isActive', e.target.checked)}
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Property is active
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-subtitle">Address & Location</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.address?.state || ''}
                  onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.address?.postalCode || ''}
                  onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.address?.country || ''}
                  onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={formData.coordinates?.latitude || ''}
                  onChange={(e) => handleInputChange('coordinates', 'latitude', e.target.value)}
                  placeholder="47.3928"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  value={formData.coordinates?.longitude || ''}
                  onChange={(e) => handleInputChange('coordinates', 'longitude', e.target.value)}
                  placeholder="13.6863"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-subtitle">Policies & Rules</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Time
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.policies?.checkInTime || ''}
                  onChange={(e) => handleInputChange('policies', 'checkInTime', e.target.value)}
                  placeholder="4:00 PM"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Time
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.policies?.checkOutTime || ''}
                  onChange={(e) => handleInputChange('policies', 'checkOutTime', e.target.value)}
                  placeholder="11:00 AM"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiet Hours
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.policies?.quietHours || ''}
                  onChange={(e) => handleInputChange('policies', 'quietHours', e.target.value)}
                  placeholder="10:00 PM - 8:00 AM"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {['smoking', 'pets', 'parties', 'children'].map((policy) => (
                <div key={policy}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {policy}
                  </label>
                  <select
                    className="input"
                    value={formData.policies?.[policy] || 'allowed'}
                    onChange={(e) => handleInputChange('policies', policy, e.target.value)}
                  >
                    <option value="allowed">Allowed</option>
                    <option value="not_allowed">Not Allowed</option>
                    <option value="restricted">Restricted</option>
                    <option value="by_request">By Request</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-subtitle">Contact Information</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.contactInfo?.hostName || ''}
                  onChange={(e) => handleInputChange('contactInfo', 'hostName', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host Phone
                </label>
                <input
                  type="tel"
                  className="input"
                  value={formData.contactInfo?.hostPhone || ''}
                  onChange={(e) => handleInputChange('contactInfo', 'hostPhone', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host Email
                </label>
                <input
                  type="email"
                  className="input"
                  value={formData.contactInfo?.hostEmail || ''}
                  onChange={(e) => handleInputChange('contactInfo', 'hostEmail', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  className="input"
                  value={formData.contactInfo?.emergencyPhone || ''}
                  onChange={(e) => handleInputChange('contactInfo', 'emergencyPhone', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Management Company
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.contactInfo?.managementCompany || ''}
                  onChange={(e) => handleInputChange('contactInfo', 'managementCompany', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Management Phone
                </label>
                <input
                  type="tel"
                  className="input"
                  value={formData.contactInfo?.managementPhone || ''}
                  onChange={(e) => handleInputChange('contactInfo', 'managementPhone', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* WiFi Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-subtitle">WiFi Information</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Network Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.wifiCredentials?.networkName || ''}
                  onChange={(e) => handleInputChange('wifiCredentials', 'networkName', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Network Password
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.wifiCredentials?.password || ''}
                  onChange={(e) => handleInputChange('wifiCredentials', 'password', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Network Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.wifiCredentials?.guestNetworkName || ''}
                  onChange={(e) => handleInputChange('wifiCredentials', 'guestNetworkName', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Network Password
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.wifiCredentials?.guestPassword || ''}
                  onChange={(e) => handleInputChange('wifiCredentials', 'guestPassword', e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Instructions
              </label>
              <textarea
                className="input"
                rows={3}
                value={formData.wifiCredentials?.instructions || ''}
                onChange={(e) => handleInputChange('wifiCredentials', 'instructions', e.target.value)}
                placeholder="Any special instructions for connecting to WiFi..."
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-subtitle">Features & Settings</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="shopEnabled"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.features?.shopEnabled || false}
                  onChange={(e) => handleInputChange('features', 'shopEnabled', e.target.checked)}
                />
                <label htmlFor="shopEnabled" className="text-sm font-medium text-gray-700">
                  Enable Shop Feature
                </label>
                <span className="text-sm text-gray-500">
                  (Allows guests to purchase items through the TV app)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card">
          <div className="card-content">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/properties')}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Property' : 'Create Property'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;