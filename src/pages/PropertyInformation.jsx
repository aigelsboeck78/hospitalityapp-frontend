import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Wifi,
  Flame,
  Droplet,
  Thermometer,
  Tv,
  UtensilsCrossed,
  Leaf,
  Phone,
  Clock,
  Ticket,
  Info,
  Link as LinkIcon,
  Save,
  X,
  Sparkles,
  Waves,
  WashingMachine
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;

const iconMap = {
  wifi: Wifi,
  flame: Flame,
  thermometer: Thermometer,
  drop: Droplet,
  ticket: Ticket,
  tv: Tv,
  'fork-knife': UtensilsCrossed,
  leaf: Leaf,
  phone: Phone,
  clock: Clock,
  info: Info,
  sparkles: Sparkles,
  waves: Waves,
  'washing-machine': WashingMachine
};

const PropertyInformation = () => {
  const { propertyId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('amenity');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category: 'amenity',
    type: '',
    title: '',
    description: '',
    instructions: '',
    icon: 'info',
    url: '',
    display_order: 0,
    is_active: true,
    metadata: {}
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const categories = ['amenity', 'guide', 'service'];
  const types = {
    amenity: ['wifi', 'heating', 'fireplace', 'pool', 'sauna', 'whirlpool', 'tv', 'kitchen', 'parking', 'laundry'],
    guide: ['checkin', 'checkout', 'recycling', 'emergency', 'house-rules', 'local-area', 'laundry-combo'],
    service: ['summercard', 'cleaning', 'concierge', 'transfers', 'ski-pass']
  };
  
  const typeLabels = {
    wifi: 'WiFi',
    heating: 'Heating',
    fireplace: 'Fireplace',
    pool: 'Pool',
    sauna: 'Sauna',
    whirlpool: 'Whirlpool / Hot Tub',
    tv: 'TV',
    kitchen: 'Kitchen',
    parking: 'Parking',
    laundry: 'Laundry',
    checkin: 'Check-in',
    checkout: 'Check-out',
    recycling: 'Recycling',
    emergency: 'Emergency',
    'house-rules': 'House Rules',
    'local-area': 'Local Area',
    'laundry-combo': 'Wash & Dry Combo Machine',
    summercard: 'Summer Card',
    cleaning: 'Cleaning',
    concierge: 'Concierge',
    transfers: 'Transfers',
    'ski-pass': 'Ski Pass'
  };
  
  const typeIcons = {
    wifi: 'wifi',
    heating: 'flame',
    fireplace: 'flame',
    pool: 'drop',
    sauna: 'sparkles',
    whirlpool: 'waves',
    tv: 'tv',
    kitchen: 'fork-knife',
    parking: 'info',
    laundry: 'washing-machine',
    'laundry-combo': 'washing-machine',
    checkin: 'clock',
    checkout: 'clock',
    recycling: 'leaf',
    emergency: 'phone',
    'house-rules': 'info',
    'local-area': 'info',
    summercard: 'ticket',
    cleaning: 'sparkles',
    concierge: 'info',
    transfers: 'info',
    'ski-pass': 'ticket'
  };

  // Fetch property information
  const { data: information = [], isLoading, refetch } = useQuery(
    ['property-information', propertyId],
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/properties/${propertyId}/information`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || [];
    }
  );

  // Create/Update mutation
  const saveMutation = useMutation(
    async (data) => {
      const token = localStorage.getItem('token');
      if (editingItem) {
        return axios.put(`${API_URL}/api/property-info/${editingItem.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        return axios.post(`${API_URL}/api/properties/${propertyId}/information`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    },
    {
      onSuccess: () => {
        toast.success(editingItem ? 'Information updated' : 'Information added');
        refetch();
        closeModal();
      },
      onError: () => {
        toast.error('Failed to save information');
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    async (id) => {
      const token = localStorage.getItem('token');
      return axios.delete(`${API_URL}/api/property-info/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        toast.success('Information deleted');
        refetch();
      },
      onError: () => {
        toast.error('Failed to delete information');
      }
    }
  );

  // Toggle active mutation
  const toggleMutation = useMutation(
    async (id) => {
      const token = localStorage.getItem('token');
      return axios.patch(`${API_URL}/property-info/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        toast.success('Status updated');
        refetch();
      },
      onError: () => {
        toast.error('Failed to update status');
      }
    }
  );

  // Update order mutation
  const orderMutation = useMutation(
    async (items) => {
      const token = localStorage.getItem('token');
      return axios.put(`${API_URL}/api/property-info/order`, { items }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        toast.success('Order updated');
      },
      onError: () => {
        toast.error('Failed to update order');
      }
    }
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = information.findIndex(item => item.id === active.id);
      const newIndex = information.findIndex(item => item.id === over.id);
      const newOrder = arrayMove(information, oldIndex, newIndex);
      
      // Update local state immediately
      queryClient.setQueryData(['property-information', propertyId], newOrder);
      
      // Send to server
      const items = newOrder.map((item, index) => ({ id: item.id, order: index }));
      orderMutation.mutate(items);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        category: activeTab,
        type: '',
        title: '',
        description: '',
        instructions: '',
        icon: 'info',
        url: '',
        display_order: information.length,
        is_active: true,
        metadata: {}
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this information?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredInformation = information.filter(item => item.category === activeTab);

  const SortableItem = ({ item }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1
    };

    const Icon = iconMap[item.icon] || Info;
    
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="bg-white border rounded-lg p-4 mb-3 flex items-start gap-4"
      >
        <div className="cursor-move" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{item.title}</h4>
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
              {item.type}
            </span>
            {!item.is_active && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
          {item.instructions && (
            <div className="bg-gray-50 p-2 rounded text-sm">
              <pre className="whitespace-pre-wrap font-sans">{item.instructions}</pre>
            </div>
          )}
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" 
               className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-2">
              <LinkIcon className="h-3 w-3" />
              View More
            </a>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleMutation.mutate(item.id)}
            className="p-2 hover:bg-gray-100 rounded"
            title={item.is_active ? 'Deactivate' : 'Activate'}
          >
            {item.is_active ? 
              <Eye className="h-4 w-4 text-gray-600" /> : 
              <EyeOff className="h-4 w-4 text-gray-400" />
            }
          </button>
          <button
            onClick={() => openModal(item)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Edit2 className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/properties" className="text-primary-600 hover:text-primary-700">
          ← Back to Properties
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold">Property Information & Amenities</h1>
          <button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Information
          </button>
        </div>

        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === category
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
                {category === 'amenity' && 'ies'}
                {category === 'guide' && 's'}
                {category === 'service' && 's'}
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {information.filter(i => i.category === category).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {filteredInformation.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredInformation.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {filteredInformation.map(item => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-12">
              <Info className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No {activeTab === 'amenity' ? 'amenities' : activeTab === 'guide' ? 'guides' : 'services'} yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding property information for your guests.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">
                  {editingItem ? 'Edit Information' : 'Add Information'}
                </h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input"
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => {
                          const selectedType = e.target.value;
                          setFormData({ 
                            ...formData, 
                            type: selectedType,
                            icon: typeIcons[selectedType] || 'info'
                          });
                        }}
                        className="input"
                        required
                      >
                        <option value="">Select a type</option>
                        {(types[formData.category] || []).map(type => (
                          <option key={type} value={type}>
                            {typeLabels[type] || type.replace('-', ' ').charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions / How-to Information
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="input"
                      rows="6"
                      placeholder="Provide detailed instructions or how-to information for guests"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="input"
                      >
                        {Object.keys(iconMap).map(icon => (
                          <option key={icon} value={icon}>
                            {icon.replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL (optional)
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active (visible to guests)
                    </label>
                  </div>

                  {formData.type === 'wifi' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WiFi Password
                      </label>
                      <input
                        type="text"
                        value={formData.metadata.password || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, password: e.target.value }
                        })}
                        className="input"
                      />
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isLoading}
                    className="btn btn-primary"
                  >
                    {saveMutation.isLoading ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyInformation;