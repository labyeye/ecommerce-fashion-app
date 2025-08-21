import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface AddProductProps {
  onBack: () => void;
  onSave: (product: any) => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onBack, onSave }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    salePrice: '',
    category: '',
    brand: 'Flauntbynishi',
    material: '',
    careInstructions: '',
    fit: 'regular',
    tags: [] as string[],
    status: 'active',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [] as string[]
  });

  const [sizes, setSizes] = useState([
    { size: 'XS', stock: 0, price: 0 },
    { size: 'S', stock: 0, price: 0 },
    { size: 'M', stock: 0, price: 0 },
    { size: 'L', stock: 0, price: 0 },
    { size: 'XL', stock: 0, price: 0 },
    { size: 'XXL', stock: 0, price: 0 }
  ]);

  const [colors, setColors] = useState([
    { name: 'Black', hexCode: '#000000', stock: 0, images: [{ url: '', alt: '' }] }
  ]);

  const [images, setImages] = useState([{ url: '', alt: '', isPrimary: true }]);
  const [currentTag, setCurrentTag] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('dashboard_token');
      console.log('Fetching categories with token:', token ? 'Token exists' : 'No token found');
      
      const response = await fetch('https://ecommerce-fashion-app.onrender.com/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Categories response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories data:', data);
        if (data.success) {
          setCategories(data.data);
        }
      } else {
        const errorData = await response.json();
        console.error('Categories fetch error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('dashboard_token');
      
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const productData = {
        ...formData,
        description: formData.description || formData.shortDescription || 'No description provided',
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        sizes: sizes.filter(size => size.stock > 0).map(size => ({
          ...size,
          price: size.price || parseFloat(formData.price)
        })),
        colors: colors.map(color => ({
          ...color,
          stock: color.stock || 0
        })),
        images: images.filter(img => img.url),
        seo: {
          title: formData.seoTitle,
          description: formData.seoDescription,
          keywords: formData.seoKeywords
        }
      };

      console.log('Sending product data:', productData);
      console.log('Request headers:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });

      const response = await fetch('https://ecommerce-fashion-app.onrender.com/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        console.log('Product created successfully:', data.data);
        onSave(data.data);
        onBack(); // Navigate back to products list
      } else {
        setError(data.message || 'Failed to create product');
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.seoKeywords.includes(currentKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, currentKeyword.trim()]
      }));
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const updateSize = (index: number, field: string, value: any) => {
    setSizes(prev => prev.map((size, i) => 
      i === index ? { ...size, [field]: field === 'stock' || field === 'price' ? parseInt(value) || 0 : value } : size
    ));
  };

  const updateColor = (index: number, field: string, value: any) => {
    setColors(prev => prev.map((color, i) => 
      i === index ? { 
        ...color, 
        [field]: field === 'stock' ? parseInt(value) || 0 : value 
      } : color
    ));
  };

  const addColor = () => {
    setColors(prev => [...prev, { name: '', hexCode: '#000000', stock: 0, images: [{ url: '', alt: '' }] }]);
  };

  const removeColor = (index: number) => {
    if (colors.length > 1) {
      setColors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addImage = () => {
    setImages(prev => [...prev, { url: '', alt: '', isPrimary: false }]);
  };

  const updateImage = (index: number, field: string, value: any) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, [field]: value } : img
    ));
  };

  const removeImage = (index: number) => {
    if (images.length > 1) {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">Create a new fashion product for Flauntbynishi</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., FBN-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Brief product description (appears on product cards)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Detailed product description"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Fashion Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fashion Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., 100% Cotton, Polyester Blend"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fit
                  </label>
                  <select
                    value={formData.fit}
                    onChange={(e) => handleInputChange('fit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="slim">Slim Fit</option>
                    <option value="regular">Regular Fit</option>
                    <option value="loose">Loose Fit</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Care Instructions
                </label>
                <textarea
                  value={formData.careInstructions}
                  onChange={(e) => handleInputChange('careInstructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Machine wash cold, tumble dry low, do not bleach"
                />
              </div>
            </div>
          </div>

          {/* Sizes & Stock */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sizes & Stock</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 items-center text-sm font-medium text-gray-700 border-b pb-2">
                <div>Size</div>
                <div>Stock</div>
                <div>Price (Optional)</div>
                <div>Display</div>
              </div>
              {sizes.map((size, index) => (
                <div key={size.size} className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium text-gray-700">{size.size}</div>
                  <div>
                    <input
                      type="number"
                      value={size.stock}
                      onChange={(e) => updateSize(index, 'stock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Stock"
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={size.price}
                      onChange={(e) => updateSize(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Price (optional)"
                      min="0"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {size.price > 0 ? `₹${size.price}` : 'Default price'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Colors</h3>
              <button
                type="button"
                onClick={addColor}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Color</span>
              </button>
            </div>
            <div className="space-y-4">
              {colors.map((color, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Name
                      </label>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="e.g., Black, Navy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hex Code
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={color.hexCode}
                          onChange={(e) => updateColor(index, 'hexCode', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color.hexCode}
                          onChange={(e) => updateColor(index, 'hexCode', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={color.stock}
                        onChange={(e) => updateColor(index, 'stock', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="flex items-end">
                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
              <button
                type="button"
                onClick={addImage}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>
            <div className="space-y-4">
              {images.map((image, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL *
                      </label>
                      <input
                        type="url"
                        value={image.url}
                        onChange={(e) => updateImage(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateImage(index, 'alt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Image description"
                      />
                    </div>
                    <div className="flex items-end space-x-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={image.isPrimary}
                          onChange={(e) => updateImage(index, 'isPrimary', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Primary</span>
                      </label>
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Add tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Features</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Product Features</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => handleInputChange('isNewArrival', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">New Arrival</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => handleInputChange('isBestSeller', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Best Seller</span>
                </label>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="SEO title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="SEO description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Add keyword..."
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.seoKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.seoKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;