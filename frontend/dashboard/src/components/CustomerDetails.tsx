import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Phone, MapPin, CreditCard, Package, TrendingUp, Calendar, Gift, Star, Award, Crown, Loader2, AlertCircle } from 'lucide-react';

interface CustomerDetailsProps {
  customerId: string;
  onBack: () => void;
}

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
  evolvPoints?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customerId, onBack }) => {
  const { token } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!token || !customerId) return;

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`http://localhost:3500/api/admin/users/${customerId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch customer details');
        }

        const data = await response.json();
        setCustomer(data.data.customer);
        setStats(data.data.stats);
      } catch (err: any) {
        console.error('Customer details fetch error:', err);
        setError(err.message || 'Failed to fetch customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [token, customerId]);

  const getSegmentColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-900">Error Loading Customer</h2>
          </div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h2 className="font-semibold text-yellow-900">Customer Not Found</h2>
          </div>
          <p className="text-yellow-700">The customer you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
            <p className="text-gray-600 mt-1">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSegmentColor(customer.loyaltyTier || 'bronze')}`}>
            {customer.loyaltyTier?.toUpperCase() || 'BRONZE'} Tier
          </span>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Mail className="w-4 h-4" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Lifetime Value</p>
                    <p className="text-2xl font-bold text-blue-900">₹{stats?.totalSpent?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-green-900">{stats?.totalOrders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Avg. Order Value</p>
                    <p className="text-2xl font-bold text-purple-900">
                      ₹{stats && stats.totalOrders > 0 ? (stats.totalSpent / stats.totalOrders).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Loyalty Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Tier */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  {customer.loyaltyTier === 'bronze' && <Star className="w-6 h-6 text-[#CD7F32]" />}
                  {customer.loyaltyTier === 'silver' && <Award className="w-6 h-6 text-[#C0C0C0]" />}
                  {customer.loyaltyTier === 'gold' && <Crown className="w-6 h-6 text-[#FFD700]" />}
                  <h4 className="font-semibold capitalize">{customer.loyaltyTier || 'bronze'} Tier</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Current tier with {customer.loyaltyPoints || 0} points
                </p>
              </div>

              {/* Points Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold">Points Summary</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loyalty Points:</span>
                    <span className="font-medium">{customer.loyaltyPoints || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Evolv Points:</span>
                    <span className="font-medium">{customer.evolvPoints || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Points:</span>
                    <span className="font-medium">{(customer.loyaltyPoints || 0) + (customer.evolvPoints || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Progress to Next Tier</h4>
                <div className="space-y-2 text-sm">
                  {customer.loyaltyTier === 'bronze' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium">{customer.loyaltyPoints || 0} / 5000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((customer.loyaltyPoints || 0) / 5000) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">Next: Silver Tier</p>
                    </>
                  )}
                  {customer.loyaltyTier === 'silver' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium">{customer.loyaltyPoints || 0} / 10000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((customer.loyaltyPoints || 0) / 10000) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">Next: Gold Tier</p>
                    </>
                  )}
                  {customer.loyaltyTier === 'gold' && (
                    <div className="text-center">
                      <Crown className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
                      <p className="text-sm font-medium">Maximum Tier Achieved!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Personal Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{customer.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Address</h4>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    {customer.address ? (
                      <>
                        <p>{customer.address.street}</p>
                        <p>{customer.address.city}, {customer.address.state}</p>
                        <p>{customer.address.zipCode}, {customer.address.country}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">No address provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Customer Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">
                  {customer.lastLogin ? formatDate(customer.lastLogin) : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Loyalty Tier</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSegmentColor(customer.loyaltyTier || 'bronze')}`}>
                  {customer.loyaltyTier?.toUpperCase() || 'BRONZE'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span>Add Loyalty Points</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>View Orders</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment History</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;