import React from 'react';
import { ArrowLeft, Edit, Trash2, Package, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { Product } from '../types/dashboard';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onEdit, onDelete }) => {
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-ds-100 text-ds-800';
    }
  };

  const profitMargin = ((product.price - (product.price * 0.6)) / product.price * 100).toFixed(1);
  const revenue = product.sales * product.price;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ds-900">{product.name}</h1>
            <p className="text-ds-700 mt-1">SKU: {product.sku}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button onClick={onEdit} className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
            <span>Edit Product</span>
          </button>

          <button onClick={onDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Overview */}
          <div className="neo-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-ds-900">Product Overview</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStockStatusColor(product.status)}`}>
                {product.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-ds-700">Current Price</label>
                  <p className="text-2xl font-bold text-ds-900">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ds-700">Stock Quantity</label>
                  <p className="text-xl font-semibold text-ds-900">{product.stock} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ds-700">Total Sales</label>
                  <p className="text-xl font-semibold text-ds-900">{product.sales} units</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-ds-700">Revenue Generated</label>
                  <p className="text-2xl font-bold text-green-600">${revenue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ds-700">Profit Margin</label>
                  <p className="text-xl font-semibold text-ds-900">{profitMargin}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ds-700">Return Rate</label>
                  <p className="text-xl font-semibold text-red-600">{product.returnRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="neo-card p-6">
            <h3 className="text-lg font-semibold text-ds-900 mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Sales Velocity</p>
                    <p className="text-2xl font-bold text-blue-900">{(product.sales / 30).toFixed(1)}</p>
                    <p className="text-xs text-blue-600">units/day</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Inventory Turnover</p>
                    <p className="text-2xl font-bold text-green-900">{(product.sales / Math.max(1, product.stock) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-green-600">efficiency</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Customer Rating</p>
                    <p className="text-2xl font-bold text-yellow-900">4.{Math.floor(Math.random() * 9) + 1}</p>
                    <p className="text-xs text-yellow-600">out of 5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales History */}
          <div className="neo-card p-6">
            <h3 className="text-lg font-semibold text-ds-900 mb-6">Sales History (Last 30 Days)</h3>
            <div className="space-y-4">
              {[...Array(7)].map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - index);
                const sales = Math.floor(Math.random() * 20) + 1;
                return (
                  <div key={index} className="flex items-center justify-between py-3 neo-inset last:neo-inset-last">
                    <div>
                      <p className="font-medium text-ds-900">{date.toLocaleDateString()}</p>
                      <p className="text-sm text-ds-700">{sales} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ds-900">${(sales * product.price).toFixed(2)}</p>
                      <p className="text-sm text-green-600">+{((sales / Math.max(1, product.sales)) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="neo-card p-6">
            <h3 className="text-lg font-semibold text-ds-900 mb-6">Recent Customer Reviews</h3>
            <div className="space-y-4">
              {[
                { name: 'Sarah Johnson', rating: 5, comment: 'Excellent quality and fast shipping!', date: '2024-01-15' },
                { name: 'Mike Chen', rating: 4, comment: 'Good product, exactly as described.', date: '2024-01-12' },
                { name: 'Emily Davis', rating: 5, comment: 'Love this product! Will buy again.', date: '2024-01-10' }
              ].map((review, index) => (
                <div key={index} className="neo-inset pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-ds-900">{review.name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-ds-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-ds-700">{review.date}</p>
                  </div>
                  <p className="text-ds-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Alert */}
          {product.stock <= 10 && (
            <div className="bg-gradient-to-r from-yellow-50 to-red-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Stock Alert</h4>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} units left`}
              </p>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">Restock Now</button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="neo-card p-6">
            <h4 className="font-semibold text-ds-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 rounded-lg transition-colors">Update Inventory</button>
              <button className="w-full text-left px-4 py-2 rounded-lg transition-colors">Adjust Pricing</button>
              <button className="w-full text-left px-4 py-2 rounded-lg transition-colors">Create Promotion</button>
              <button className="w-full text-left px-4 py-2 rounded-lg transition-colors">View Analytics</button>
            </div>
          </div>

          {/* Product Information */}
          <div className="neo-card p-6">
            <h4 className="font-semibold text-ds-900 mb-4">Product Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-ds-700">Category</label>
                <p className="text-ds-900">Electronics</p>
              </div>
              <div>
                <label className="text-sm font-medium text-ds-700">Weight</label>
                <p className="text-ds-900">0.5 kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-ds-700">Dimensions</label>
                <p className="text-ds-900">15 × 10 × 5 cm</p>
              </div>
              <div>
                <label className="text-sm font-medium text-ds-700">Created</label>
                <p className="text-ds-900">Jan 1, 2024</p>
              </div>
              <div>
                <label className="text-sm font-medium text-ds-700">Last Updated</label>
                <p className="text-ds-900">Jan 15, 2024</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="neo-card p-6">
            <h4 className="font-semibold text-ds-900 mb-4">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {['Electronics', 'Wireless', 'Audio', 'Bluetooth'].map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;