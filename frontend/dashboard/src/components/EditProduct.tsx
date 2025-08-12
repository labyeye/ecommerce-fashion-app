import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus, Trash2, Upload, Eye, EyeOff } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  salePrice?: number;
  category: {
    _id: string;
    name: string;
  } | string;
  status: 'active' | 'draft' | 'inactive';
  sizes: Array<{
    size: string;
    stock: number;
    price?: number;
  }>;
  colors: Array<{
    name: string;
    hexCode: string;
    stock: number;
    images?: Array<{
      url: string;
      alt: string;
    }>;
  }>;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  material?: string;
  careInstructions?: string;
  fit?: 'slim' | 'regular' | 'loose' | 'oversized';
  tags?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isComingSoon?: boolean;
  minLoyaltyTier: 'bronze' | 'silver' | 'gold';
}

interface Category {
  _id: string;
  name: string;
}

interface EditProductProps {
  productId: string;
  onBack: () => void;
  onSave: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({ productId, onBack, onSave }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'inventory' | 'images' | 'seo'>('basic');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    price: 0,
    comparePrice: 0,
    salePrice: 0,
    category: '',
    status: 'active' as 'active' | 'draft' | 'inactive',
    minLoyaltyTier: 'bronze' as 'bronze' | 'silver' | 'gold',
    material: '',
    careInstructions: '',
    fit: 'regular' as 'slim' | 'regular' | 'loose' | 'oversized',
    tags: [] as string[],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isComingSoon: false,
    sizes: [] as Array<{ size: string; stock: number; price?: number }>,
    colors: [] as Array<{ name: string; hexCode: string; stock: number; images?: Array<{ url: string; alt: string }> }>,
    images: [] as Array<{ url: string; alt: string; isPrimary: boolean }>
  });

  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Helper function to initialize form data from product data
  const initializeFormData = (productData: any) => {
    return {
      name: productData.name || '',
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      sku: productData.sku || '',
      price: productData.price || 0,
      comparePrice: productData.comparePrice || 0,
      salePrice: productData.salePrice || 0,
      category: typeof productData.category === 'string' ? productData.category : productData.category?._id || '',
      status: productData.status || 'active',
      minLoyaltyTier: productData.minLoyaltyTier || 'bronze',
      material: productData.material || '',
      careInstructions: productData.careInstructions || '',
      fit: productData.fit || 'regular',
      tags: productData.tags || [],
      isFeatured: productData.isFeatured || false,
      isNewArrival: productData.isNewArrival || false,
      isBestSeller: productData.isBestSeller || false,
      isComingSoon: productData.isComingSoon || false,
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      images: productData.images || []
    };
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('dashboard_token');
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // First try to get the specific product
        let response = await fetch(`https://ecommerce-fashion-app.onrender.com/api/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // If single product endpoint doesn't exist, get all products and filter
        if (response.status === 404) {
          console.log('Single product endpoint not found, fetching all products...');
          response = await fetch(`https://ecommerce-fashion-app.onrender.com/api/admin/products`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }

          const data = await response.json();
          
          if (data.success) {
            // Find the specific product in the list
            const productData = data.data.products.find((p: any) => p._id === productId);
            
            if (!productData) {
              throw new Error('Product not found');
            }
            
            setProduct(productData);
            setFormData(initializeFormData(productData));
          }
        } else if (!response.ok) {
          throw new Error('Failed to fetch product');
        } else {
          // Single product endpoint exists
          const data = await response.json();
          
          if (data.success) {
            const productData = data.data;
            setProduct(productData);
            setFormData(initializeFormData(productData));
          }
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch product');
  } finally {
    setLoading(false);
  }
}

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('dashboard_token');
        const response = await fetch('https://ecommerce-fashion-app.onrender.com/api/admin/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (err) {https://ecommerce-fashion-app.onrender.com
        console.error('Failed to fetch categories:', err);
      }
    };

    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  const handleInputChange = (field: string, value: any) => {
    // Ensure boolean fields are properly set as boolean values
    const booleanFields = ['isFeatured', 'isNewArrival', 'isBestSeller', 'isComingSoon'];
    const finalValue = booleanFields.includes(field) ? Boolean(value) : value;

    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', stock: 0, price: 0 }]
    }));
  };

  const updateSize = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', hexCode: '#000000', stock: 0, images: [] }]
    }));
  };

  const updateColor = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      )
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '', isPrimary: prev.images.length === 0 }]
    }));
  };

  const updateImage = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((image, i) => 
        i === index ? { ...image, [field]: value } : image
      )
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((image, i) => ({
        ...image,
        isPrimary: i === index
      }))
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('dashboard_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure boolean fields are explicitly set as boolean values
      const processedFormData = {
        ...formData,
        isFeatured: Boolean(formData.isFeatured),
        isNewArrival: Boolean(formData.isNewArrival),
        isBestSeller: Boolean(formData.isBestSeller),
        isComingSoon: Boolean(formData.isComingSoon)
      };

      const response = await fetch(`https://ecommerce-fashion-app.onrender.com/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedFormData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();
      
      if (data.success) {
        onSave();
      } else {
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={onBack} className="px-4 py-2 bg-black text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">{formData.name || 'Update product information'}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'images', label: 'Images' },
            { id: 'seo', label: 'SEO & Tags' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'basic' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
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
                  />
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
                    placeholder="Brief product description"
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
                      placeholder="Product SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compare Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.comparePrice}
                      onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

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
                      placeholder="e.g., Cotton, Polyester"
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
                      <option value="slim">Slim</option>
                      <option value="regular">Regular</option>
                      <option value="loose">Loose</option>
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
                    placeholder="Care instructions for the product"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Sizes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sizes & Stock</h3>
                  <button
                    onClick={addSize}
                    className="flex items-center space-x-2 px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Size</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) => updateSize(index, 'size', e.target.value)}
                        placeholder="Size (e.g., S, M, L)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={size.stock}
                        onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="Stock"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={size.price || 0}
                        onChange={(e) => updateSize(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="Price (optional)"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <button
                        onClick={() => removeSize(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Colors & Stock</h3>
                  <button
                    onClick={addColor}
                    className="flex items-center space-x-2 px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Color</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        placeholder="Color name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <input
                        type="color"
                        value={color.hexCode}
                        onChange={(e) => updateColor(index, 'hexCode', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        value={color.stock}
                        onChange={(e) => updateColor(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="Stock"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <button
                        onClick={() => removeColor(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                <button
                  onClick={addImage}
                  className="flex items-center space-x-2 px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Image</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={image.url}
                        onChange={(e) => updateImage(index, 'url', e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateImage(index, 'alt', e.target.value)}
                        placeholder="Alt text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    {image.url && (
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => setPrimaryImage(index)}
                        className={`px-3 py-1 text-xs rounded ${
                          image.isPrimary
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {image.isPrimary ? 'Primary' : 'Set Primary'}
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">SEO & Tags</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Visibility</h3>
            
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
                    Minimum Loyalty Tier
                  </label>
                  <select
                    value={formData.minLoyaltyTier}
                    onChange={(e) => handleInputChange('minLoyaltyTier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="bronze">Bronze (All Customers)</option>
                    <option value="silver">Silver & Above</option>
                    <option value="gold">Gold Only</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select which loyalty tier customers can access this product
                  </p>
                </div>

                <div className="space-y-3 mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                  </label>                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => handleInputChange('isNewArrival', e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => handleInputChange('isBestSeller', e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isComingSoon}
                    onChange={(e) => handleInputChange('isComingSoon', e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="ml-2 text-sm text-gray-700">Coming Soon</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.images.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="space-y-3">
                <img
                  src={formData.images.find(img => img.isPrimary)?.url || formData.images[0]?.url}
                  alt={formData.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{formData.name}</h4>
                  <p className="text-sm text-gray-500">{formData.shortDescription}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">₹{formData.price}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProduct;