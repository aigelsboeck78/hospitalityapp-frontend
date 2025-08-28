import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ShoppingBag, Euro } from 'lucide-react';
import api from '../services/api';
import ShopProductForm from '../components/ShopProductForm';

const ShopMoments = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = [
    { id: 'all', name: 'All Products', icon: '📦' },
    { id: 'textiles', name: 'Textiles & Fabrics', icon: '🧶' },
    { id: 'ceramics', name: 'Ceramics & Pottery', icon: '🏺' },
    { id: 'woodwork', name: 'Woodwork & Crafts', icon: '🔨' },
    { id: 'jewelry', name: 'Jewelry & Accessories', icon: '💎' },
    { id: 'food', name: 'Local Delicacies', icon: '🍯' },
    { id: 'wellness', name: 'Wellness & Spa', icon: '🌿' },
    { id: 'books', name: 'Books & Guides', icon: '📚' },
    { id: 'clothing', name: 'Alpine Clothing', icon: '👕' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const propertyId = localStorage.getItem('selectedPropertyId') || '24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b';
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await api.get(`/shop/property/${propertyId}/products${params}`);
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const propertyId = localStorage.getItem('selectedPropertyId') || '24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b';
        await api.delete(`/shop/property/${propertyId}/products/${productId}`);
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      const propertyId = localStorage.getItem('selectedPropertyId') || '24ea9b80-94c9-4ee4-b1b2-42c8dc154f1b';
      
      if (editingProduct) {
        // Update existing product
        await api.put(`/shop/property/${propertyId}/products/${editingProduct.id}`, productData);
      } else {
        // Create new product
        await api.post(`/shop/property/${propertyId}/products`, productData);
      }
      
      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error; // Re-throw so form can handle the error
    }
  };

  const filteredProducts = products;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shop Moments</h1>
              <p className="text-gray-600">Alpine cosy living goods for your guests</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Euro className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Featured Products</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.filter(p => p.isFeatured).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Stock</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.filter(p => p.availability === 'in_stock').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Locally Made</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.filter(p => p.isLocallyMade).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                selectedCategory === category.id
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {selectedCategory === 'all' 
            ? `All Products (${products.length})`
            : `${categories.find(c => c.id === selectedCategory)?.name} (${products.length})`
          }
        </h3>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first product.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 group-hover:opacity-75">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-48 w-full object-cover object-center"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/400/300?random=${product.id}&blur=1`;
                      }}
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Featured
                      </span>
                    </div>
                  )}
                  
                  {/* Stock Status */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.availability === 'in_stock' 
                        ? 'bg-green-100 text-green-800'
                        : product.availability === 'low_stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.availability === 'in_stock' ? 'In Stock' : 
                       product.availability === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.shortDescription}</p>
                  
                  {/* Price */}
                  <div className="mt-2 flex items-center">
                    <span className="text-lg font-medium text-gray-900">€{product.price?.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        €{product.originalPrice?.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Category & Craftsperson */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-1">{categories.find(c => c.id === product.category)?.icon || '📦'}</span>
                      {categories.find(c => c.id === product.category)?.name || product.category}
                    </div>
                    {product.craftspersonName && (
                      <div className="text-xs text-gray-500">
                        By {product.craftspersonName}
                      </div>
                    )}
                    {product.isLocallyMade && (
                      <div className="text-xs text-blue-600 font-medium">
                        🏔️ Locally Made
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => handleEdit(product)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ShopProductForm
        product={editingProduct}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ShopMoments;