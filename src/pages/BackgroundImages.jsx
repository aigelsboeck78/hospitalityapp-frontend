import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Eye, Download, Image as ImageIcon, X, Snowflake, Sun, Leaf, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const BackgroundImages = () => {
  const { propertyId } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [property, setProperty] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [editingSeasonId, setEditingSeasonId] = useState(null);
  
  const seasons = [
    { value: 'all', label: 'All Year', icon: Calendar, color: 'text-gray-600' },
    { value: 'winter', label: 'Winter', icon: Snowflake, color: 'text-blue-500' },
    { value: 'summer', label: 'Summer', icon: Sun, color: 'text-yellow-500' },
    { value: 'spring', label: 'Spring', icon: Leaf, color: 'text-green-500' },
    { value: 'autumn', label: 'Autumn', icon: Leaf, color: 'text-orange-500' }
  ];

  useEffect(() => {
    console.log('BackgroundImages component mounted with propertyId:', propertyId);
    fetchProperty();
    fetchBackgroundImages();
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

  const fetchBackgroundImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/property/${propertyId}/backgrounds`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Background images API response:', data);
      if (data.success) {
        console.log('Setting images:', data.data);
        console.log('Images array length:', data.data.length);
        setImages(data.data);
        console.log('Images set, current images state should now be:', data.data);
      } else {
        console.log('API error:', data.message);
        toast.error(data.message || 'Failed to fetch background images');
      }
    } catch (error) {
      toast.error('Failed to fetch background images');
      console.error('Error fetching background images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        toast.error(`${file.name} is too large. Maximum size is 15MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('token');
    const uploaded = [];
    const errors = [];

    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('background', file);
        formData.append('season', selectedSeason);

        const response = await fetch(`${API_BASE_URL}/api/property/${propertyId}/backgrounds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        if (data.success) {
          uploaded.push(data.data);
        } else {
          errors.push(`${file.name}: ${data.message}`);
        }
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (uploaded.length > 0) {
      setImages(prev => [...uploaded, ...prev]);
      toast.success(`${uploaded.length} image(s) uploaded successfully`);
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    setSelectedFiles([]);
    setSelectedSeason('all');
    setUploading(false);
  };

  const deleteImage = async (filename) => {
    if (!confirm('Are you sure you want to delete this background image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/property/${propertyId}/backgrounds/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setImages(images.filter(img => img.filename !== filename));
        toast.success('Background image deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete image');
      }
    } catch (error) {
      toast.error('Failed to delete image');
      console.error('Error deleting image:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const updateImageSeason = async (imageId, newSeason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/property/${propertyId}/backgrounds/${imageId}/season`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ season: newSeason })
      });
      
      const data = await response.json();
      if (data.success) {
        setImages(images.map(img => 
          img.id === imageId ? { ...img, season: newSeason } : img
        ));
        toast.success('Season updated successfully');
        setEditingSeasonId(null);
      } else {
        toast.error(data.message || 'Failed to update season');
      }
    } catch (error) {
      toast.error('Failed to update season');
      console.error('Error updating season:', error);
    }
  };
  
  const getSeasonIcon = (season) => {
    const seasonConfig = seasons.find(s => s.value === season) || seasons[0];
    const Icon = seasonConfig.icon;
    return <Icon className={`h-4 w-4 ${seasonConfig.color}`} />;
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
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to={`/properties/${propertyId}/edit`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Property
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Background Images</h1>
          {property && (
            <p className="mt-1 text-sm text-gray-600">Managing TV app backgrounds for {property.name}</p>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Background Images</h2>
        
        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop background images here, or{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
              click to browse
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: 15MB per image. Supported formats: JPG, PNG, GIF
          </p>
          <p className="text-xs text-gray-500">
            Recommended resolution: 1920x1080 or higher for TV display
          </p>
        </div>

        {/* Season Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Season for new images
          </label>
          <div className="flex space-x-2">
            {seasons.map((season) => {
              const Icon = season.icon;
              return (
                <button
                  key={season.value}
                  onClick={() => setSelectedSeason(season.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedSeason === season.value
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${season.color}`} />
                  <span>{season.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Selected Files ({selectedFiles.length}) - Season: {seasons.find(s => s.value === selectedSeason)?.label}
            </h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={uploadImages}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length} Image(s)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Images Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Background Images</h2>
          <p className="text-sm text-gray-600">{images.length} image(s) | DEBUG: {JSON.stringify(images.map(img => img.filename))}</p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-24 w-24 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No background images</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload images to customize your TV app backgrounds
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image.id} className="group relative bg-gray-50 rounded-lg overflow-hidden border">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={image.url.startsWith('http') ? image.url : `${API_BASE_URL}${image.url}`}
                    alt={image.filename}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNNjcuNSA2MEw4MC41IDQ3TDkzLjUgNjBMMTA2LjUgNDdMMTE5LjUgNjBWNzVINjcuNVY2MFoiIGZpbGw9IiNEMUQ1REIiLz48L3N2Zz4=';
                    }}
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={() => setPreviewImage(image)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <a
                      href={image.url.startsWith('http') ? image.url : `${API_BASE_URL}${image.url}`}
                      download={image.filename}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </a>
                    <button
                      onClick={() => deleteImage(image.filename)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Image info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={image.filename}>
                    {image.title || image.filename}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      {editingSeasonId === image.id ? (
                        <select
                          value={image.season || 'all'}
                          onChange={(e) => updateImageSeason(image.id, e.target.value)}
                          onBlur={() => setEditingSeasonId(null)}
                          className="text-xs border rounded px-1 py-0.5"
                          autoFocus
                        >
                          {seasons.map(season => (
                            <option key={season.value} value={season.value}>
                              {season.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingSeasonId(image.id)}
                          className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                          title="Click to change season"
                        >
                          {getSeasonIcon(image.season || 'all')}
                          <span>{seasons.find(s => s.value === (image.season || 'all'))?.label}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setPreviewImage(null)}>
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{previewImage.filename}</h3>
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="text-center">
                  <img
                    src={previewImage.url.startsWith('http') ? previewImage.url : `${API_BASE_URL}${previewImage.url}`}
                    alt={previewImage.filename}
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Uploaded:</strong> {formatDate(previewImage.uploadedAt)}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <a
                  href={previewImage.url.startsWith('http') ? previewImage.url : `${API_BASE_URL}${previewImage.url}`}
                  download={previewImage.filename}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Download
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundImages;