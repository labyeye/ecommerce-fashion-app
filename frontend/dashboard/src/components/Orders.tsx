import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Download, Package, Truck, CheckCircle } from 'lucide-react';

interface OrdersProps {
  onViewDetails: (orderId: string) => void;
}

const Orders: React.FC<OrdersProps> = ({ onViewDetails }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:3500/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
        setOrders(data.data.orders);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Package;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      default: return Package;
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:3500/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to confirm payment');
      // Update order in UI
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: 'confirmed', payment: { ...o.payment, status: 'paid' } } : o));
      alert('Payment confirmed!');
    } catch (err: any) {
      alert(err.message || 'Failed to confirm payment');
    }
  };

  const statusOptions = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ];

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!token) return;
    if (!statusOptions.includes(newStatus)) {
      alert('Invalid status');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3500/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: `Status updated to ${newStatus}`
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Status update error:', data);
        throw new Error(data.message || 'Failed to update status');
      }
      
      // Refresh the orders list to get updated data
      const refreshResponse = await fetch('http://localhost:3500/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setOrders(refreshData.data.orders);
      }
      
      alert('Order status updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Bulk Update
          </button>
        </div>
      </div>

      {/* Order Pipeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Package className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">{getStatusCount('pending')}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{getStatusCount('processing')}</div>
            <div className="text-sm text-blue-600">Processing</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Truck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{getStatusCount('shipped')}</div>
            <div className="text-sm text-purple-600">Shipped</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{getStatusCount('delivered')}</div>
            <div className="text-sm text-green-600">Delivered</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by ID, customer, or status..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">Loading orders...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders found.</div>
          ) : (
            <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                  <th className="px-4 py-2 text-left font-semibold">Order #</th>
                  <th className="px-4 py-2 text-left font-semibold">Customer</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Items</th>
                  <th className="px-4 py-2 text-left font-semibold">Total</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-2">{order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : '-'}</td>
                      <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{order.items.map((item: any) => item.product?.name).join(', ')}</td>
                      <td className="px-4 py-2 font-medium">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-4 h-4 text-gray-400" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                      </div>
                    </td>
                      <td className="px-4 py-2">
                        <button onClick={() => onViewDetails(order._id)} className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        {order.status === 'pending' && order.payment?.method !== 'cash_on_delivery' && (
                      <button 
                            className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            onClick={() => handleConfirmPayment(order._id)}
                      >
                            Confirm Payment
                      </button>
                        )}
                        <select
                          className="ml-2 px-2 py-1 border rounded"
                          value={order.status}
                          onChange={e => handleUpdateStatus(order._id, e.target.value)}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                          ))}
                        </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;