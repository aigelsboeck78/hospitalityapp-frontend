import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';

const ShopProductForm = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    category: 'textiles',
    availability: 'in_stock',
    stockCount: '',
    isFeatured: false,
    isLocallyMade: true,
    craftspersonName: '',
    materials: '',
    dimensions: '',
    weight: '',
    careInstructions: '',
    tags: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'textiles', name: 'Textiles & Fabrics' },
    { id: 'ceramics', name: 'Ceramics & Pottery' },
    { id: 'woodwork', name: 'Woodwork & Crafts' },
    { id: 'jewelry', name: 'Jewelry & Accessories' },
    { id: 'food', name: 'Local Delicacies' },
    { id: 'wellness', name: 'Wellness & Spa' },
    { id: 'books', name: 'Books & Guides' },
    { id: 'clothing', name: 'Alpine Clothing' }
  ];

  const availabilityOptions = [
    { id: 'in_stock', name: 'In Stock' },
    { id: 'low_stock', name: 'Low Stock' },
    { id: 'made_to_order', name: 'Made to Order' },
    { id: 'out_of_stock', name: 'Out of Stock' }
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        category: product.category || 'textiles',
        availability: product.availability || 'in_stock',
        stockCount: product.stockCount?.toString() || '',
        isFeatured: product.isFeatured || false,
        isLocallyMade: product.isLocallyMade !== undefined ? product.isLocallyMade : true,
        craftspersonName: product.craftspersonName || '',
        materials: Array.isArray(product.materials) ? product.materials.join(', ') : (product.materials || ''),
        dimensions: product.dimensions || '',
        weight: product.weight || '',
        careInstructions: product.careInstructions || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
        imageUrl: product.imageUrl || ''
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        originalPrice: '',
        category: 'textiles',
        availability: 'in_stock',
        stockCount: '',
        isFeatured: false,
        isLocallyMade: true,
        craftspersonName: '',
        materials: '',
        dimensions: '',
        weight: '',
        careInstructions: '',
        tags: '',
        imageUrl: ''
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.originalPrice && (isNaN(formData.originalPrice) || parseFloat(formData.originalPrice) <= 0)) {
      newErrors.originalPrice = 'Original price must be a valid number';
    }

    if (formData.stockCount && (isNaN(formData.stockCount) || parseInt(formData.stockCount) < 0)) {
      newErrors.stockCount = 'Stock count must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stockCount: formData.stockCount ? parseInt(formData.stockCount) : 0,
        materials: formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(m => m) : [],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="e.g., Alpine Wool Throw"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Brief description for product listings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Detailed product description"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing and Availability */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Pricing & Availability</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (€) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`mt-1 block w-full border rounded-md px-3 py-2 ${errors.price ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Original Price (€)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`mt-1 block w-full border rounded-md px-3 py-2 ${errors.originalPrice ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Optional"
                  />
                  {errors.originalPrice && <p className="text-red-600 text-sm mt-1">{errors.originalPrice}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {availabilityOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Count</label>
                  <input
                    type="number"
                    name="stockCount"
                    value={formData.stockCount}
                    onChange={handleChange}
                    min="0"
                    className={`mt-1 block w-full border rounded-md px-3 py-2 ${errors.stockCount ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="0"
                  />
                  {errors.stockCount && <p className="text-red-600 text-sm mt-1">{errors.stockCount}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isLocallyMade"
                    checked={formData.isLocallyMade}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Locally Made</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Additional Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Craftsperson Name</label>
                <input
                  type="text"
                  name="craftspersonName"
                  value={formData.craftspersonName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Maria Huber"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Materials</label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Merino Wool, Organic Cotton (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 30cm x 40cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 500g"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Care & Tags</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Care Instructions</label>
                <textarea
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Hand wash in cold water, lay flat to dry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., handwoven, natural, cozy (comma-separated)"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopProductForm;