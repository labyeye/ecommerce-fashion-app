import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';

// Product shape is provided by the backend; we only define local form types below.

interface Category {
  _id: string;
  name: string;
}

interface EditProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  comparePrice: number;
  salePrice: number;
  category: string;
  status: 'active' | 'draft' | 'inactive';
  minLoyaltyTier: 'bronze' | 'silver' | 'gold';
  material: string;
  careInstructions: string;
  fit: 'slim' | 'regular' | 'loose' | 'oversized';
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isComingSoon: boolean;
  keyFeatures: string[];
  sizes: Array<{ size: string; stock: number; price?: number }>;
  colors: Array<{ name: string; hexCode: string; stock: number; images?: Array<{ url: string; alt: string }> ; sizes?: Array<{ size: string; stock: number; price?: number }> }>;
}

interface EditProductProps {
  productId: string;
  onBack: () => void;
  onSave: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({ productId, onBack, onSave }) => {
  // product state intentionally omitted; form is the single source of truth
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'inventory' | 'images' | 'seo'>('basic');

  // Form states
    const [formData, setFormData] = useState<EditProductFormData>({
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
      keyFeatures: [] as string[],
    sizes: [] as Array<{ size: string; stock: number; price?: number }>,
      colors: [] as Array<{ name: string; hexCode: string; stock: number; images?: Array<{ url: string; alt: string }> }>
  });

  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  // imagePreview removed (unused)

  // Helper function to initialize form data from product data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initializeFormData = (productData: any) => {
    const defaultSizes = [
      { size: 'XS', stock: 0, price: 0 },
      { size: 'S', stock: 0, price: 0 },
      { size: 'M', stock: 0, price: 0 },
      { size: 'L', stock: 0, price: 0 },
      { size: 'XL', stock: 0, price: 0 },
      { size: 'XXL', stock: 0, price: 0 },
    ];
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
  keyFeatures: productData.keyFeatures || [],
      isFeatured: productData.isFeatured || false,
      isNewArrival: productData.isNewArrival || false,
      isBestSeller: productData.isBestSeller || false,
      isComingSoon: productData.isComingSoon || false,
      // If productData has colors with sizes, use them. Otherwise if legacy top-level sizes exist, create a default color
      sizes: productData.sizes || [],
      colors: (productData.colors && productData.colors.length > 0)
        ? // ensure each color has sizes; if missing, prefill defaultSizes
          productData.colors.map((c: any) => ({ ...c, sizes: Array.isArray(c.sizes) && c.sizes.length > 0 ? c.sizes : defaultSizes }))
        : [{ name: 'Default', hexCode: '#000000', stock: 0, images: [], sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : defaultSizes }],
      // top-level images removed; images live under colors[].images
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
        let response = await fetch(`http://localhost:3500/api/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // If single product endpoint doesn't exist, get all products and filter
        if (response.status === 404) {
          console.log('Single product endpoint not found, fetching all products...');
          response = await fetch(`http://localhost:3500/api/admin/products`, {
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
            const productData = data.data.products.find((p: { _id: string }) => p._id === productId);
            
            if (!productData) {
              throw new Error('Product not found');
            }

            setFormData(initializeFormData(productData));
          }
        } else if (!response.ok) {
          throw new Error('Failed to fetch product');
        } else {
          // Single product endpoint exists
          const data = await response.json();
          
          if (data.success) {
            const productData = data.data;
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
        const response = await fetch('http://localhost:3500/api/admin/categories', {
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
  } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  type ColorItem = EditProductFormData['colors'][number];

  const handleInputChange = (
    field: keyof EditProductFormData,
    value: string | number | boolean | string[]
  ) => {
    // Ensure boolean fields are properly set as boolean values
    const booleanFields: Array<keyof EditProductFormData> = [
      'isFeatured',
      'isNewArrival',
      'isBestSeller',
      'isComingSoon',
    ];

    const finalValue = booleanFields.includes(field) ? Boolean(value) : value;

    setFormData((prev) =>
      ({
        ...prev,
        [field]: finalValue,
      } as unknown as EditProductFormData)
    );
  };

  

  const addColorSize = (colorIndex: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === colorIndex ? { ...c, sizes: [...(c.sizes || []), { size: '', stock: 0, price: 0 }] } : c)
    }));
  };

  const updateColorSize = (colorIndex: number, sizeIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === colorIndex ? { ...c, sizes: (c.sizes || []).map((s, si) => si === sizeIndex ? { ...s, [field]: field === 'stock' || field === 'price' ? Number(value) : value } : s) } : c)
    }));
  };

  const removeColorSize = (colorIndex: number, sizeIndex: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === colorIndex ? { ...c, sizes: (c.sizes || []).filter((_, si) => si !== sizeIndex) } : c)
    }));
  };

  const addColor = () => {
    // When adding a new color in edit mode, prefill it with the default size set
    const newSizes = [
      { size: 'XS', stock: 0, price: 0 },
      { size: 'S', stock: 0, price: 0 },
      { size: 'M', stock: 0, price: 0 },
      { size: 'L', stock: 0, price: 0 },
      { size: 'XL', stock: 0, price: 0 },
      { size: 'XXL', stock: 0, price: 0 },
    ];

    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', hexCode: '#000000', stock: 0, images: [], sizes: newSizes }]
    }));
  };

  // Per-color image management for edit form (max 5 images per color)
  const addColorImage = (colorIndex: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === colorIndex ? { ...c, images: [...(c.images || []), { url: '', alt: '' }] } : c)
    }));
  };

  const updateColorImage = (colorIndex: number, imgIndex: number, field: 'url' | 'alt', value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === colorIndex ? { ...c, images: (c.images || []).map((img, ii) => ii === imgIndex ? { ...img, [field]: value } : img) } : c)
    }));
  };

  const removeColorImage = (colorIndex: number, imgIndex: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === colorIndex ? { ...c, images: (c.images || []).filter((_, ii) => ii !== imgIndex) } : c)
    }));
  };

  const updateColor = (
    index: number,
    field: keyof ColorItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index ? { ...color, [field]: field === 'stock' ? Number(value) : value } : color
      ),
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
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

      const response = await fetch(`http://localhost:3500/api/admin/products/${productId}`, {
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
              onClick={() => setActiveTab(tab.id as 'basic' | 'inventory' | 'images' | 'seo')}
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
                {/* Key Features */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Add a feature (e.g., Breathable fabric)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newFeature.trim()) {
                          setFormData(prev => ({ ...prev, keyFeatures: [...prev.keyFeatures, newFeature.trim()] }));
                          setNewFeature('');
                        }
                      }}
                      className="px-3 py-2 bg-black text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.keyFeatures.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <div className="text-sm">{f}</div>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, keyFeatures: prev.keyFeatures.filter((_, idx) => idx !== i) }))} className="text-red-500 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Sizes are now managed per-color in the Colors section below */}

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
                    <React.Fragment key={index}>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
                    {/* Sizes for this color */}
                    <div className="w-full mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Sizes for {color.name || `Color ${index + 1}`}</h4>
                        <button type="button" onClick={() => addColorSize(index)} className="px-2 py-1 bg-black text-white rounded text-sm">Add Size</button>
                      </div>
                      <div className="space-y-2">
                        {(color.sizes || []).map((s, si) => (
                          <div key={si} className="flex items-center space-x-2">
                            {/* Show size name as label (not editable) so admin doesn't have to type it */}
                            <div className="px-3 py-2 border rounded w-28 font-medium text-sm">{s.size}</div>
                            {/* Single input to enter quantity (stock) for the given size */}
                            <input type="number" value={s.stock} min={0} onChange={(e) => updateColorSize(index, si, 'stock', Number(e.target.value))} className="px-3 py-2 border rounded w-28" />
                            {/* Optional remove size button */}
                            <button type="button" onClick={() => removeColorSize(index, si)} className="p-1 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Images for this color */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Images for {color.name || `Color ${index + 1}`}</h4>
                        <button type="button" onClick={() => addColorImage(index)} className="px-2 py-1 bg-black text-white rounded text-sm">Add Image</button>
                      </div>
                      <div className="space-y-2">
                        {(color.images || []).map((img, imi) => (
                          <div key={imi} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 space-y-2">
                              <input type="url" value={img.url} onChange={(e) => updateColorImage(index, imi, 'url', e.target.value)} placeholder="Image URL" className="w-full px-3 py-2 border rounded" />
                              <input type="text" value={img.alt} onChange={(e) => updateColorImage(index, imi, 'alt', e.target.value)} placeholder="Alt text" className="w-full px-3 py-2 border rounded" />
                            </div>
                            {img.url && (<img src={img.url} alt={img.alt} className="w-16 h-16 object-cover rounded-lg" />)}
                            <div className="flex flex-col space-y-2">
                              <button onClick={() => removeColorImage(index, imi)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Images tab removed — images are managed per-color in the Inventory tab */}

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

          {/* Preview (shows first color's primary/first image) */}
          {(formData.colors && formData.colors.length > 0 && formData.colors[0].images && formData.colors[0].images.length > 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="space-y-3">
                <img
                  src={formData.colors[0].images.find((img: any) => img.url)?.url || formData.colors[0].images[0]?.url}
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