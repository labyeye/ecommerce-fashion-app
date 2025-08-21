import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  CreditCard, 
  Star,
  Crown,
  Gift,
  Calendar,
  Phone,
  Mail,
  FileText,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string; alt: string }>;
    description: string;
  };
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: {
    cost: number;
    method: string;
  };
  total: number;
  payment: {
    method: string;
    status: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timeline: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
}

interface LoyaltyInfo {
  currentPoints: number;
  currentTier: string;
  nextTierPoints: number;
  progressToNextTier: number;
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [deliveryBonusPoints, setDeliveryBonusPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token || !orderId) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3500/api/customer/orders/${orderId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data.data.order);
        setLoyaltyInfo(data.data.loyaltyInfo);
        setPointsEarned(data.data.pointsEarned);
        setDeliveryBonusPoints(data.data.deliveryBonusPoints);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [token, orderId]);

  const handleConfirmDelivery = async () => {
    if (!token || !orderId) return;

    try {
      setConfirmingDelivery(true);
      const response = await fetch(`http://localhost:3500/api/customer/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'delivered',
          deliveryConfirmation: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm delivery');
      }

      const data = await response.json();
      setOrder(data.data.order);
      
      // Show success message
      alert(`Delivery confirmed! You earned ${data.data.bonusPointsEarned} bonus loyalty points!`);
      
      // Refresh the page to get updated data
      window.location.reload();
    } catch (err: any) {
      alert('Error confirming delivery: ' + err.message);
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-yellow-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'silver':
        return <Star className="w-5 h-5 text-gray-400" />;
      default:
        return <Star className="w-5 h-5 text-amber-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#688F4E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-[#688F4E] text-white px-6 py-3 rounded-lg hover:bg-[#2B463C] transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 text-[#688F4E] hover:text-[#2B463C] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Profile</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product.images?.[0]?.url || 'https://via.placeholder.com/80'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#688F4E]">₹{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-[#688F4E] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</p>
                      <p className="text-sm text-gray-600">{event.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Confirmation */}
            {order.status === 'shipped' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delivery</h2>
                <p className="text-gray-600 mb-4">
                  Has your order been delivered? Confirm delivery to earn bonus loyalty points!
                </p>
                <button
                  onClick={handleConfirmDelivery}
                  disabled={confirmingDelivery}
                  className="bg-[#688F4E] text-white px-6 py-3 rounded-lg hover:bg-[#2B463C] transition-colors disabled:bg-gray-400 flex items-center space-x-2"
                >
                  {confirmingDelivery ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirm Delivery</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{order.shipping.cost === 0 ? 'Free' : `₹${order.shipping.cost}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{order.tax}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Points */}
            {loyaltyInfo && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Loyalty Points</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Tier</span>
                    <div className="flex items-center space-x-2">
                      {getTierIcon(loyaltyInfo.currentTier)}
                      <span className="font-medium capitalize">{loyaltyInfo.currentTier}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Points</span>
                    <span className="font-medium">{loyaltyInfo.currentPoints}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress to next tier</span>
                      <span className="text-[#688F4E]">{loyaltyInfo.progressToNextTier}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#688F4E] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${loyaltyInfo.progressToNextTier}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Points from this order */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Points earned from this order</span>
                      <span className="text-[#688F4E] font-medium">{pointsEarned}</span>
                    </div>
                    {order.status === 'delivered' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery bonus points</span>
                        <span className="text-[#688F4E] font-medium">+{deliveryBonusPoints}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Total from this order</span>
                      <span className="text-[#688F4E]">{pointsEarned + deliveryBonusPoints}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
                <div className="flex items-center space-x-2 text-gray-600 mt-2">
                  <Phone className="w-4 h-4" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{order.shippingAddress.email}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium capitalize">
                    {order.payment.method.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage; 