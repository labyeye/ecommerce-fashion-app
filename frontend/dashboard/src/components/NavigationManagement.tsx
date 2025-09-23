import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, Save, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface NavigationLink {
  _id: string;
  name: string;
  slug: string;
  url: string;
  type: 'category' | 'page' | 'external';
  category?: Category;
  isActive: boolean;
  showInNavigation: boolean;
  sortOrder: number;
  hasDropdown: boolean;
  dropdownItems: Array<{
    name: string;
    url: string;
    category?: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  icon?: string;
}

interface FormData {
  name: string;
  url: string;
  type: 'category' | 'page' | 'external';
  category: string;
  isActive: boolean;
  showInNavigation: boolean;
  sortOrder: number;
  hasDropdown: boolean;
  dropdownItems: Array<{
    name: string;
    url: string;
    category?: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  icon: string;
}

const NavigationManagement: React.FC = () => {
  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    type: 'page',
    category: '',
    isActive: true,
    showInNavigation: true,
    sortOrder: 0,
    hasDropdown: false,
    dropdownItems: [],
    icon: ''
  });

  useEffect(() => {
    fetchNavigationLinks();
    fetchCategories();
  }, []);

  const fetchNavigationLinks = async () => {
    try {
      const token = localStorage.getItem('dashboard_token');
      const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/navigation', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNavigationLinks(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching navigation links:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('dashboard_token');
      const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/admin/categories', {
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
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('dashboard_token');
      const url = editingId 
        ? `https://ecommerce-fashion-app-som7.vercel.app/api/navigation/${editingId}`
        : 'https://ecommerce-fashion-app-som7.vercel.app/api/navigation';
      
      const method = editingId ? 'PUT' : 'POST';

      // Client-side validation
      if (!formData.name || !formData.url) {
        alert('Please provide both a Name and URL for the navigation link.');
        return;
      }

      // Sanitize payload: remove empty dropdown items (backend also filters, but do it here for better UX)
      const normalizeVal = (v: any) => (v === undefined || v === null || (typeof v === 'string' && v.trim() === '') ? null : v);

      const payload = {
        ...formData,
        category: normalizeVal(formData.category),
        dropdownItems: Array.isArray(formData.dropdownItems)
          ? formData.dropdownItems
              .filter(it => it && it.name && it.url)
              .map(it => ({ ...it, category: normalizeVal(it.category) }))
          : []
      };

      // Debug: log outgoing request data to help diagnose 400 Bad Request
      console.debug('[NavigationManagement] submitting', { url, method, body: payload });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

        if (response.ok) {
          await fetchNavigationLinks();
          resetForm();
        } else {
          // try to show server-side validation / error messages
          let errorText = 'Failed to save navigation link';
          try {
            const err = await response.json();
            errorText = err && err.message ? err.message : JSON.stringify(err);
          } catch (e) {
            errorText = response.statusText || errorText;
          }
          console.warn('[NavigationManagement] server error', response.status, errorText);
          alert(`Navigation update failed: ${errorText}`);
        }
    } catch (error) {
      console.error('Error saving navigation link:', error);
    }
  };

  const handleEdit = (link: NavigationLink) => {
    setEditingId(link._id);
    setFormData({
      name: link.name,
      url: link.url,
      type: link.type,
      category: link.category?._id || '',
      isActive: link.isActive,
      showInNavigation: link.showInNavigation,
      sortOrder: link.sortOrder,
      hasDropdown: link.hasDropdown,
      dropdownItems: link.dropdownItems.map(item => ({
        ...item,
        category: item.category || ''
      })),
      icon: link.icon || ''
    });
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation link?')) return;
    
    try {
      const token = localStorage.getItem('dashboard_token');
      const response = await fetch(`https://ecommerce-fashion-app-som7.vercel.app/api/navigation/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchNavigationLinks();
      }
    } catch (error) {
      console.error('Error deleting navigation link:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      type: 'page',
      category: '',
      isActive: true,
      showInNavigation: true,
      sortOrder: 0,
      hasDropdown: false,
      dropdownItems: [],
      icon: ''
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const addDropdownItem = () => {
    setFormData({
      ...formData,
      dropdownItems: [
        ...formData.dropdownItems,
        {
          name: '',
          url: '',
          category: '',
          isActive: true,
          sortOrder: formData.dropdownItems.length + 1
        }
      ]
    });
  };

  const updateDropdownItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.dropdownItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, dropdownItems: updatedItems });
  };

  const removeDropdownItem = (index: number) => {
    const updatedItems = formData.dropdownItems.filter((_, i) => i !== index);
    setFormData({ ...formData, dropdownItems: updatedItems });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Navigation Management</h1>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Navigation Link
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Navigation Link' : 'Add Navigation Link'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="/about, /contact, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'category' | 'page' | 'external' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="page">Page</option>
                  <option value="category">Category</option>
                  <option value="external">External Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.showInNavigation}
                  onChange={(e) => setFormData({ ...formData, showInNavigation: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Show in Navigation</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasDropdown}
                  onChange={(e) => setFormData({ ...formData, hasDropdown: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Has Dropdown</span>
              </label>
            </div>

            {/* Dropdown Items */}
            {formData.hasDropdown && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700">Dropdown Items</h3>
                  <button
                    type="button"
                    onClick={addDropdownItem}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                  >
                    Add Item
                  </button>
                </div>

                {formData.dropdownItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateDropdownItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Category name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Item URL
                        </label>
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => updateDropdownItem(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="/products?category=..."
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeDropdownItem(index)}
                          className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation Links List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {navigationLinks
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link) => (
                  <tr key={link._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {link.name}
                        </div>
                        {link.hasDropdown && (
                          <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {link.url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {link.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {link.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          link.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          link.showInNavigation 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {link.showInNavigation ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(link._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NavigationManagement;
