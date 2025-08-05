import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Crown,
  Star,
  Award,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Gift,
  TrendingUp,
  ShoppingBag,
  Eye,
  Edit,
  X,
  Save
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });
  const [saving, setSaving] = useState(false);
  const [orderStats, setOrderStats] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      console.log('ProfilePage - User data:', user);
      console.log('ProfilePage - User loyalty data:', {
        loyaltyPoints: user.loyaltyPoints,
        evolvPoints: user.evolvPoints,
        loyaltyTier: user.loyaltyTier
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'India'
        }
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };
  const handleSaveProfile = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch('http://localhost:3500/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
          address: editForm.address  
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        window.location.reload();
      } else {
        const data = await response.json();
        alert('Error updating profile: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }
  const userData = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || "Not provided",
    address: user.address 
      ? `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}`
          .replace(/^,\s*/, '')
          .replace(/,\s*,/g, ',') 
      : "Not provided",
    joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }),
    avatar: user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    totalOrders: orderStats?.total || 0,
    totalSpent: orderStats?.totalSpent || 0,
    loyaltyPoints: user.loyaltyPoints || 0,
    evolvPoints: user.evolvPoints || 0,
    currentTier: user.loyaltyTier || 'bronze',
    nextTier: user.loyaltyTier === 'bronze' ? 'silver' : user.loyaltyTier === 'silver' ? 'gold' : 'gold',
    progressToNextTier: user.loyaltyTier === 'gold' ? 100 : 
      user.loyaltyTier === 'bronze' ? Math.min(100, Math.floor((user.loyaltyPoints || 0) / 5000 * 100)) :
      Math.min(100, Math.floor((user.loyaltyPoints || 0) / 10000 * 100)),
    nextTierPoints: user.loyaltyTier === 'bronze' ? 5000 : user.loyaltyTier === 'silver' ? 10000 : 0
  };
  const tiers = [
    { 
      name: "Bronze", 
      minPoints: 0, 
      maxPoints: 4999, 
      color: "#CD7F32",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      textColor: "text-amber-800",
      iconColor: "text-amber-600",
      icon: Star,
      benefits: [
        "1% Evolv Points on every purchase",
        "Welcome bonus: 100 points",
        "Standard shipping rates",
        "Basic customer support"
      ]
    },
    { 
      name: "Silver", 
      minPoints: 5000, 
      maxPoints: 9999, 
      color: "#C0C0C0",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      textColor: "text-gray-800",
      iconColor: "text-gray-600",
      icon: Award,
      benefits: [
        "2% Evolv Points on every purchase",
        "Priority customer support",
        "Free shipping on orders ₹500+",
        "Early access to new products",
        "Birthday bonus: 500 points"
      ]
    },
    { 
      name: "Gold", 
      minPoints: 10000, 
      maxPoints: 999999, 
      color: "#FFD700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-600",
      icon: Crown,
      benefits: [
        "3% Evolv Points on every purchase",
        "VIP customer support",
        "Free shipping on all orders",
        "Exclusive product launches",
        "Birthday bonus: 1000 points",
        "Monthly surprise gifts",
        "Personal nutrition consultant"
      ]
    }
  ];
  useEffect(() => {
    if (activeTab === 'orders' && user && token) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError('');
        try {
          const response = await fetch('http://localhost:3500/api/customer/orders', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log('Fetched customer orders:', data); // Debug log
          if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');
          setOrders(data.data.orders);
        } catch (err: any) {
          setOrdersError(err.message || 'Failed to fetch orders');
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, user, token]);
  useEffect(() => {
    if (user && token) {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch('http://localhost:3500/api/customer/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await response.json();
          
          if (response.ok) {
            setOrderStats(data.data.orderStats);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      };
  
      fetchDashboardData();
    }
  }, [user, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white to-[#B1D182]/10 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        { }
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#688F4E]"
              />
              <button
                onClick={handleEditProfile}
                className="absolute -bottom-2 -right-2 bg-[#688F4E] text-white p-2 rounded-full hover:bg-[#5a7a42] transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#2B463C] mb-2">{userData.name}</h1>
              <p className="text-gray-600 mb-2">{userData.email}</p>
              <p className="text-gray-600 mb-4">Member since {userData.joinDate}</p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-[#688F4E]">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">{userData.totalOrders} Orders</span>
                </div>
                <div className="flex items-center gap-2 text-[#688F4E]">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">₹{userData.totalSpent.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        { }
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-[#FFD700]" />
            <h2 className="text-2xl font-bold text-[#2B463C]">Loyalty Program</h2>
          </div>
          <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Current Tier: {userData.currentTier.charAt(0).toUpperCase() + userData.currentTier.slice(1)}
                </h3>
                <p className="text-white/90">
                  Tier Points: {userData.loyaltyPoints} |
                  Evolv Points: {userData.evolvPoints}
                </p>
              </div>
              <Crown className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">
                Progress to {userData.nextTier === 'silver' ? 'Silver' : 'Gold'}
              </span>
              <span className="text-[#688F4E] font-bold">
                {userData.progressToNextTier}%
                ({userData.loyaltyPoints}/{userData.nextTierPoints})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#688F4E] to-[#B1D182] h-3 rounded-full transition-all duration-500"
                style={{ width: `${userData.progressToNextTier}%` }}
              ></div>
            </div>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isCurrentTier = tier.name.toLowerCase() === userData.currentTier;
              const isUnlocked = userData.loyaltyPoints >= tier.minPoints;

              return (
                <div
                  key={tier.name}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    isCurrentTier
                      ? `${tier.borderColor} ${tier.bgColor} ring-2 ring-offset-2 ring-opacity-50`
                      : isUnlocked
                        ? `${tier.borderColor} ${tier.bgColor} opacity-90`
                        : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tier.bgColor} border-2 ${tier.borderColor} mb-3`}>
                      <Icon className={`w-8 h-8 ${isCurrentTier ? tier.iconColor : 'text-gray-400'}`} />
                    </div>
                    <h4 className={`font-bold text-lg ${isCurrentTier ? tier.textColor : 'text-gray-600'}`}>
                      {tier.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {tier.minPoints === 0 ? '0' : tier.minPoints.toLocaleString()}+ points
                    </p>
                    {isCurrentTier && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${tier.bgColor} ${tier.textColor}`}>
                        Current Tier
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className={`font-semibold text-sm ${isCurrentTier ? tier.textColor : 'text-gray-700'}`}>
                      Benefits:
                    </h5>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2 text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isCurrentTier ? tier.iconColor.replace('text-', 'bg-') : 'bg-gray-300'}`}></div>
                          <span className={`${isCurrentTier ? 'text-gray-700' : 'text-gray-500'}`}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        { }
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "orders", label: "Orders", icon: Package },
              { id: "wishlist", label: "Wishlist", icon: Heart },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                    ? 'text-[#688F4E] border-b-2 border-[#688F4E]'
                    : 'text-gray-600 hover:text-[#688F4E]'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          { }
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                { }
                <div>
                  <h3 className="text-xl font-bold text-[#2B463C] mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-[#688F4E]" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-[#688F4E]" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{userData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                      <MapPin className="w-5 h-5 text-[#688F4E]" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{userData.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                { }
                <div>
                  <h3 className="text-xl font-bold text-[#2B463C] mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-[#688F4E]/10 rounded-lg">
                      <ShoppingBag className="w-8 h-8 text-[#688F4E] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2B463C]">{userData.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-[#688F4E]/10 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-[#688F4E] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2B463C]">₹{userData.totalSpent.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center p-4 bg-[#688F4E]/10 rounded-lg">
                      <Gift className="w-8 h-8 text-[#688F4E] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2B463C]">{userData.evolvPoints}</p>
                      <p className="text-sm text-gray-600">Evolv Points</p>
                    </div>
                    <div className="text-center p-4 bg-[#688F4E]/10 rounded-lg">
                      <Crown className="w-8 h-8 text-[#688F4E] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#2B463C]">{userData.currentTier}</p>
                      <p className="text-sm text-gray-600">Current Tier</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h3 className="text-xl font-bold text-[#2B463C] mb-4">Recent Orders</h3>
                {!token && (
                  <div className="text-center py-8 text-red-600">You are not logged in. Please log in to view your orders.</div>
                )}
                {ordersLoading ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : ordersError ? (
                  <div className="text-center py-8 text-red-600">{ordersError}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No orders found.</div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#2B463C]">{order.orderNumber}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}>
                            {order.status}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-600 text-sm mb-2">
                          {order.items.map((item: any) => item.product?.name).join(", ")}
                        </p>
                        <p className="font-semibold text-[#2B463C]">₹{order.total}</p>

                        <div className="mt-2 p-3 bg-[#688F4E]/10 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#2B463C] font-medium">Loyalty Points Earned:</span>
                            <span className="text-[#688F4E] font-bold">
                              {Math.floor(order.total)} points (Tier) + {Math.floor(order.total * (user.loyaltyTier === 'bronze' ? 0.10 : user.loyaltyTier === 'silver' ? 0.15 : 0.20))} points (Evolv)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="px-4 py-2 bg-[#688F4E] text-white rounded hover:bg-[#2B463C] transition-colors text-sm"
                          >
                            View Details
                          </button>

                          { }
                          {order.status === 'pending' && order.payment?.method !== 'cash_on_delivery' && (
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                              onClick={() => alert('Redirect to payment gateway for order ' + order.orderNumber)}
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h3 className="text-xl font-bold text-[#2B463C] mb-4">My Wishlist</h3>
                <div className="text-center py-8">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Your wishlist is empty</p>
                  <button className="mt-4 px-6 py-2 bg-[#688F4E] text-white rounded-lg hover:bg-[#5a7a42] transition-colors">
                    Start Shopping
                  </button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#2B463C] mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center gap-3 w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-5 h-5 text-[#688F4E]" />
                      <span className="text-left">Edit Profile</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Shield className="w-5 h-5 text-[#688F4E]" />
                      <span className="text-left">Privacy Settings</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <CreditCard className="w-5 h-5 text-[#688F4E]" />
                      <span className="text-left">Payment Methods</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye className="w-5 h-5 text-[#688F4E]" />
                      <span className="text-left">Notification Preferences</span>
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-left">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      { }
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#2B463C]">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              { }
              <div>
                <h3 className="text-lg font-semibold text-[#2B463C] mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              { }
              <div>
                <h3 className="text-lg font-semibold text-[#2B463C] mb-4">Address Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={editForm.address.street}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        address: { ...editForm.address, street: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={editForm.address.city}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        address: { ...editForm.address, city: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={editForm.address.state}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        address: { ...editForm.address, state: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={editForm.address.zipCode}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        address: { ...editForm.address, zipCode: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={editForm.address.country}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        address: { ...editForm.address, country: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-3 bg-[#688F4E] text-white rounded-lg hover:bg-[#5a7a42] transition-colors disabled:bg-gray-400 flex items-center space-x-2"
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
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
