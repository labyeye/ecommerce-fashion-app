import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingCart, TrendingUp, Settings, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const stats = [
    {
      title: 'Total Customers',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Products',
      value: '5',
      change: '+0%',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: '456',
      change: '+8%',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    },
    {
      title: 'Revenue',
      value: '₹89,432',
      change: '+15%',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const recentOrders = [
    { id: '#ORD001', customer: 'John Doe', amount: '₹1,499', status: 'Delivered' },
    { id: '#ORD002', customer: 'Jane Smith', amount: '₹799', status: 'Processing' },
    { id: '#ORD003', customer: 'Mike Johnson', amount: '₹2,799', status: 'Shipped' },
    { id: '#ORD004', customer: 'Sarah Wilson', amount: '₹1,499', status: 'Pending' }
  ];

  return (
    <div className="min-h-screen bg-[#f4f1e9]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#B1D182]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2B463C]">Admin Dashboard</h1>
              <p className="text-[#688F4E]">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-[#2B463C] hover:text-[#688F4E] transition-colors duration-300">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-red-600 hover:text-red-700 transition-colors duration-300"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-[#B1D182]/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#688F4E]">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#2B463C]">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-[#B1D182]/20">
          <div className="px-6 py-4 border-b border-[#B1D182]/20">
            <h2 className="text-lg font-semibold text-[#2B463C]">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#B1D182]/20">
              <thead className="bg-[#f4f1e9]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2B463C] uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2B463C] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2B463C] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2B463C] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#B1D182]/20">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f4f1e9]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2B463C]">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2B463C]">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2B463C]">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-[#B1D182]/20 p-6">
            <h3 className="text-lg font-semibold text-[#2B463C] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#688F4E] text-white py-2 px-4 rounded-lg hover:bg-[#2B463C] transition-colors duration-300">
                Add New Product
              </button>
              <button className="w-full bg-[#B1D182] text-[#2B463C] py-2 px-4 rounded-lg hover:bg-[#688F4E] hover:text-white transition-colors duration-300">
                View All Orders
              </button>
              <button className="w-full bg-[#B1D182] text-[#2B463C] py-2 px-4 rounded-lg hover:bg-[#688F4E] hover:text-white transition-colors duration-300">
                Manage Customers
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#B1D182]/20 p-6">
            <h3 className="text-lg font-semibold text-[#2B463C] mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#2B463C]">Website</span>
                <span className="text-green-600 text-sm">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#2B463C]">Database</span>
                <span className="text-green-600 text-sm">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#2B463C]">API</span>
                <span className="text-green-600 text-sm">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#B1D182]/20 p-6">
            <h3 className="text-lg font-semibold text-[#2B463C] mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="text-[#688F4E]">New order #ORD005 received</div>
              <div className="text-[#688F4E]">Product "Vanilla Shake" updated</div>
              <div className="text-[#688F4E]">Customer registration: john@example.com</div>
              <div className="text-[#688F4E]">Order #ORD003 shipped</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 