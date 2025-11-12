import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, AlertTriangle, Package, Edit, Trash2 } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
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
    stock: number;
  }>;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  createdAt: string;
}

interface ProductsProps {
  onAddProduct: () => void;
  onViewDetails: (productId: string) => void;
}

const Products: React.FC<ProductsProps> = ({ onAddProduct, onViewDetails }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null
  });
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('dashboard_token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`https://ecommerce-fashion-app-som7.vercel.app/api/admin/products?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.pages);
        setError(null);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('dashboard_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`https://ecommerce-fashion-app-som7.vercel.app/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted product from the state
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
        setDeleteModal({ show: false, product: null });
        
        // Show success message (you can implement a toast notification here)
        console.log('Product deleted successfully');
        
        // If current page becomes empty and it's not the first page, go to previous page
        if (products.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          // Refresh the current page to get updated data
          fetchProducts();
        }
      } else {
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setDeleteModal({ show: true, product });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, product: null });
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, statusFilter]);

  const getTotalStock = (product: Product) => {
    // Prefer sizes inside colors if available
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.reduce((pTotal, color) => {
        if (Array.isArray((color as any).sizes) && (color as any).sizes.length > 0) {
          return pTotal + (color as any).sizes.reduce((cTotal: number, s: any) => cTotal + (Number(s.stock) || 0), 0);
        }
        return pTotal + (color.stock || 0);
      }, 0);
    }
    // Fallback to top-level sizes; guard against undefined
    return Array.isArray(product.sizes) ? product.sizes.reduce((total, size) => total + (Number(size.stock) || 0), 0) : 0;
  };

  const getStockStatus = (product: Product) => {
    const totalStock = getTotalStock(product);
    if (totalStock === 0) return { status: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    if (totalStock < 10) return { status: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', class: 'bg-green-100 text-green-800' };
  };

  const lowStockProducts = products.filter(p => {
    const totalStock = getTotalStock(p);
    return totalStock < 10;
  });

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchProducts}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ds-900">Product & Inventory</h1>
          <p className="text-ds-700 mt-1">Manage your Flauntbynishi product catalog and track inventory levels</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-ds-100 border border-ds-200 rounded-lg hover:bg-ds-200 transition-colors">
            <Package className="w-4 h-4 text-ds-700" />
            <span className="text-ds-700">Bulk Edit</span>
          </button>
          <button 
            onClick={onAddProduct}
            className="flex items-center space-x-2 px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="text-2xl font-bold text-ds-900">{products.length}</div>
          <div className="text-sm text-ds-700">Total Products</div>
          <div className="text-xs text-ds-700 mt-1">Active catalog</div>
        </div>
        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="text-2xl font-bold text-ds-900">
            {products.filter(p => getTotalStock(p) > 0).length}
          </div>
          <div className="text-sm text-ds-700">In Stock</div>
          <div className="text-xs text-ds-700 mt-1">Available items</div>
        </div>
        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="text-2xl font-bold text-ds-900">{lowStockProducts.length}</div>
          <div className="text-sm text-ds-700">Low Stock</div>
          <div className="text-xs text-ds-700 mt-1">Needs attention</div>
        </div>
        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="text-2xl font-bold text-ds-900">
            {products.filter(p => getTotalStock(p) === 0).length}
          </div>
          <div className="text-sm text-ds-700">Out of Stock</div>
          <div className="text-xs text-ds-700 mt-1">Urgent restock</div>
        </div>
      </div>

      {/* Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-800">Low Stock Alert</h3>
              <p className="text-sm text-orange-700 mt-1">
                {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on inventory
              </p>
              <div className="mt-3 space-y-2">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product._id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      <p className="text-sm font-medium text-red-600">
                        {getTotalStock(product)} units left
                      </p>
                    </div>
                    <button 
                      onClick={() => onViewDetails(product._id)}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
              {lowStockProducts.length > 3 && (
                <p className="text-sm text-orange-700 mt-2">
                  And {lowStockProducts.length - 3} more products need attention
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ds-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ds-200 rounded-lg focus:ring-2 focus:ring-ds-600 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-ds-200 rounded-lg focus:ring-2 focus:ring-ds-600 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 border border-ds-200 rounded-lg hover:bg-ds-200">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-ds-300">
          <h3 className="text-lg font-semibold text-ds-900">
            Product Catalog ({products.length} products)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ds-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sizes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-ds-100 divide-y divide-ds-300">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first fashion product.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={onAddProduct}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const totalStock = getTotalStock(product);
                  
                  return (
                    <tr key={product._id} className="hover:bg-ds-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 && (
                            <img
                              className="h-10 w-10 rounded object-cover mr-3"
                              src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                              alt={product.name}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-ds-900">{product.name}</div>
                              <div className="text-sm text-ds-700">
                              {typeof product.category === 'string' ? product.category : product.category?.name || 'No Category'}
                            </div>
                            <div className="flex space-x-1 mt-1">
                              {product.isFeatured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ds-200 text-ds-700">
                                  Featured
                                </span>
                              )}
                              {product.isNewArrival && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ds-200 text-ds-700">
                                  New
                                </span>
                              )}
                              {product.isBestSeller && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ds-200 text-ds-700">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-ds-900">₹{product.price.toFixed(2)}</div>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">₹{product.comparePrice.toFixed(2)}</div>
                        )}
                        {product.salePrice && (
                          <div className="text-sm text-green-600 font-medium">Sale: ₹{product.salePrice.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-ds-900">{totalStock} units</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.class}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(product.sizes) ? product.sizes : []).filter(size => (size && size.stock) ? size.stock > 0 : false).map((size) => (
                            <span key={size.size} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-ds-100 text-ds-800">
                              {size.size} ({size.stock})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(product.colors) ? product.colors : []).filter(color => (color && color.stock) ? color.stock > 0 : false).map((color) => (
                            <span key={color.name} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-ds-100 text-ds-800">
                              {color.name} ({color.stock})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-ds-100 text-ds-800'
                        }`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => onViewDetails(product._id)}
                          className="text-ds-700 hover:text-ds-900"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(product)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {loading && products.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.product && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Product</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "<strong>{deleteModal.product.name}</strong>"? 
                  This action cannot be undone and will permanently remove the product from your catalog.
                </p>
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    {deleteModal.product.images && deleteModal.product.images.length > 0 && (
                      <img
                        className="h-10 w-10 rounded object-cover"
                        src={deleteModal.product.images.find(img => img.isPrimary)?.url || deleteModal.product.images[0]?.url}
                        alt={deleteModal.product.name}
                      />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{deleteModal.product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {deleteModal.product.sku}</p>
                      <p className="text-sm text-gray-500">Price: ₹{deleteModal.product.price}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 px-4 py-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteModal.product!._id)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Product'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;