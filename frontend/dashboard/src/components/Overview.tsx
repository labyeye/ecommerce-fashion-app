import React, { useEffect, useState } from 'react';
import MetricCard from './MetricCard';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, TrendingUp, Package, Users, DollarSign, ShoppingCart, UserCheck } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrderCount: number;
}

interface OrderStatusCount {
  _id: string;
  count: number;
}

interface LowStockProduct {
  _id: string;
  name: string;
  stock: {
    quantity: number;
    trackStock: boolean;
  };
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const Overview: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orderStatusCounts, setOrderStatusCounts] = useState<OrderStatusCount[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError('');

        const response = await fetch('http://localhost:3500/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        setStats(data.data.stats);
        setOrderStatusCounts(data.data.orderStatusCounts);
        setLowStockProducts(data.data.lowStockProducts);
        setRecentOrders(data.data.recentOrders);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const getStatusCount = (status: string) => {
    const statusCount = orderStatusCounts.find(s => s._id === status);
    return statusCount ? statusCount.count : 0;
  };

  const urgentAlerts = [
    ...lowStockProducts.map(product => ({
      type: 'Low Stock',
      message: `${product.name} - Only ${product.stock.quantity} units left`,
      priority: product.stock.quantity <= 5 ? 'critical' : 'high'
    })),
    ...recentOrders.filter(order => order.status === 'pending').slice(0, 2).map(order => ({
      type: 'Pending Payment',
      message: `Order #${order.orderNumber} - ${order.customer.firstName} ${order.customer.lastName}`,
      priority: 'medium'
    }))
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-900">Error Loading Dashboard</h2>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      change: 12.5,
      changeType: 'positive' as const,
      icon: 'DollarSign'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toString() || '0',
      change: 8.2,
      changeType: 'positive' as const,
      icon: 'ShoppingBag'
    },
    {
      title: 'Total Customers',
      value: stats?.totalUsers?.toString() || '0',
      change: 15.3,
      changeType: 'positive' as const,
      icon: 'Users'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts?.toString() || '0',
      change: 5.7,
      changeType: 'positive' as const,
      icon: 'ShoppingBag'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-900">Urgent Alerts</h2>
          </div>
          <div className="space-y-2">
            {urgentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.priority === 'critical' ? 'bg-red-500' :
                    alert.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900">{alert.type}</span>
                  <span className="text-sm text-gray-600">{alert.message}</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Order Status Pipeline */}
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
            <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{getStatusCount('shipped')}</div>
            <div className="text-sm text-purple-600">Shipped</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{getStatusCount('delivered')}</div>
            <div className="text-sm text-green-600">Delivered</div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order, index) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customer.firstName} {order.customer.lastName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{order.total.toFixed(2)}</p>
                  <p className={`text-sm ${
                    order.status === 'delivered' ? 'text-green-600' :
                    order.status === 'pending' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-red-600">Only {product.stock.quantity} left</p>
                  </div>
                </div>
                <div className="text-right">
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                    Restock
                  </button>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;