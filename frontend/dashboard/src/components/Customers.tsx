import React, { useState, useEffect } from 'react';
import { Search, Download, Mail, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface CustomersProps {
  onViewDetails: (customerId: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ onViewDetails }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    vipCustomers: 0
  });

  const { token } = useAuth();
  const API_BASE_URL = 'https://ecommerce-fashion-app-som7.vercel.app/api';

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data.users);
      } else {
        setError('Failed to fetch customers');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {

      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalCustomers: data.data.stats.totalUsers,
          activeCustomers: data.data.stats.totalUsers, // Assuming all are active for now
          newCustomers: data.data.stats.totalUsers, // Will calculate based on recent registrations
          vipCustomers: Math.floor(data.data.stats.totalUsers * 0.1) // 10% as VIP
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Customer Management</h1>
          <p className="text-subtle mt-1">Manage and analyze your customer base</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-neutral-card border border-neutral-border rounded-lg hover:bg-primary-100 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Mail className="w-4 h-4" />
            <span>Send Campaign</span>
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-card p-6 rounded-xl shadow-sm border border-neutral-border">
          <div className="text-2xl font-bold text-heading">{stats.totalCustomers}</div>
          <div className="text-sm text-subtle">Total Customers</div>
          <div className="text-xs text-subtle mt-1">All registered users</div>
        </div>
        <div className="bg-ds-100 p-6 rounded-xl shadow-sm border border-ds-200">
          <div className="text-2xl font-bold text-ds-900">{stats.activeCustomers}</div>
          <div className="text-sm text-ds-700">Active Customers</div>
          <div className="text-xs text-ds-700 mt-1">Currently active</div>
        </div>
        <div className="bg-ds-100 p-6 rounded-xl shadow-sm border border-ds-200">
          <div className="text-2xl font-bold text-ds-900">{stats.vipCustomers}</div>
          <div className="text-sm text-ds-700">VIP Customers</div>
          <div className="text-xs text-ds-700 mt-1">Top 10% customers</div>
        </div>
        <div className="bg-ds-100 p-6 rounded-xl shadow-sm border border-ds-200">
          <div className="text-2xl font-bold text-ds-900">{stats.newCustomers}</div>
          <div className="text-sm text-ds-700">New Customers</div>
          <div className="text-xs text-ds-700 mt-1">Recently registered</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-neutral-card rounded-xl shadow-sm border border-neutral-border p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={fetchCustomers}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-neutral-card rounded-xl shadow-sm border border-neutral-border overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-border">
          <h3 className="text-lg font-semibold text-heading">Customer List</h3>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-ds-600" />
            <span className="ml-2 text-ds-700">Loading customers...</span>
          </div>
        )}

        {error && (
          <div className="px-6 py-4 text-red-600 bg-red-50">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                    Customer
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                    Loyalty Tier
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Location
                  </th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                                      Last Login
                                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-card divide-y divide-neutral-border">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-subtle">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-primary-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-heading">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-subtle">{customer.email}</div>
                          {/* Mobile compact info */}
                          <div className="sm:hidden text-sm text-subtle mt-1">
                            <div>{customer.phone || 'No phone'}</div>
                            <div className="truncate">
                              {customer.address?.city ? `${customer.address.city}${customer.address?.state ? ', ' + customer.address.state : ''}` : 'No address'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-heading">
                          {customer.phone || 'No phone'}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-heading">
                          {customer.address?.city && customer.address?.state
                            ? `${customer.address.city}, ${customer.address.state}`
                            : 'No address'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
  {customer.loyaltyTier ? (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
      customer.loyaltyTier === 'gold' ? 'bg-primary-100 text-primary-900' :
      customer.loyaltyTier === 'silver' ? 'bg-primary-100 text-primary-900' :
      'bg-amber-100 text-amber-800'
    }`}>
      {customer.loyaltyTier}
    </span>
    ) : (
    <span className="text-subtle">None</span>
  )}
</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-subtle">
                        {customer.lastLogin
                          ? new Date(customer.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.isActive ? 'Active' : 'Inactive')}`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onViewDetails(customer._id)}
                          className="text-primary-900 hover:text-primary-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-primary-900 hover:text-primary-700"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;