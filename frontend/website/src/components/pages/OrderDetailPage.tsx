import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Home, 
  XCircle,
  CreditCard,
  Gift,
  Star,
  Award,
  Crown,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  AlertCircle,
  Eye,
  Download,
  Printer,
  MessageCircle,
  Shield,
  Zap
} from "lucide-react";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      if (!id) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`http://localhost:3500/api/customer/orders/${id}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err: any) {
        console.error('Fetch order error:', err);
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'out_for_delivery': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered': return <Home className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusStep = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'confirmed', label: 'Payment Confirmed', completed: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status) },
      { key: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status) },
      { key: 'shipped', label: 'Shipped', completed: ['shipped', 'out_for_delivery', 'delivered'].includes(status) },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: ['out_for_delivery', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: status === 'delivered' }
    ];
    return steps;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white to-[#B1D182]/10 pt-24">
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#688F4E]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white to-[#B1D182]/10 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-[#688F4E] text-white rounded-lg hover:bg-[#5a7a42] transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white to-[#B1D182]/10 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#2B463C] mb-4">Order Not Found</h2>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-[#688F4E] text-white rounded-lg hover:bg-[#5a7a42] transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white to-[#B1D182]/10 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#688F4E] hover:text-[#2B463C] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#688F4E] transition-colors">
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#688F4E] transition-colors">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#2B463C]">Order #{order.order.orderNumber}</h1>
                  <p className="text-gray-600 mt-1">Placed on {formatDate(order.order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.order.status)}`}>
                    {order.order.status.charAt(0).toUpperCase() + order.order.status.slice(1).replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#2B463C] mb-4">Order Status</h2>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {getStatusStep(order.order.status).map((step, index) => (
                      <div key={step.key} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-[#688F4E] text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <p className={`text-xs mt-2 text-center ${step.completed ? 'text-[#688F4E] font-medium' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10"></div>
                </div>
              </div>

              {/* Order Timeline */}
              {order.order.timeline && order.order.timeline.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-[#2B463C] mb-3">Order Updates</h3>
                  <div className="space-y-3">
                    {order.order.timeline.map((entry: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {getStatusIcon(entry.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#2B463C]">
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace(/_/g, ' ')}
                          </p>
                          <p className="text-gray-600 text-sm">{entry.message}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatDate(entry.updatedAt || order.order.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2B463C] mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <img 
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/80'} 
                      alt={item.product?.name} 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2B463C]">{item.product?.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.product?.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span>Quantity: {item.quantity}</span>
                          <span className="mx-2">•</span>
                          <span>₹{item.price?.toFixed(2)} each</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#688F4E]">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Points Section */}
            {order.loyaltyInfo && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-6 h-6 text-[#688F4E]" />
                  <h2 className="text-xl font-bold text-[#2B463C]">Loyalty Points Earned</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Tier */}
                  <div className="bg-gradient-to-r from-[#688F4E]/10 to-[#B1D182]/10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      {order.loyaltyInfo.currentTier === 'bronze' && <Star className="w-6 h-6 text-[#CD7F32]" />}
                      {order.loyaltyInfo.currentTier === 'silver' && <Award className="w-6 h-6 text-[#C0C0C0]" />}
                      {order.loyaltyInfo.currentTier === 'gold' && <Crown className="w-6 h-6 text-[#FFD700]" />}
                      <h3 className="font-semibold capitalize">{order.loyaltyInfo.currentTier} Tier</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      You have {order.loyaltyInfo.currentPoints} points
                    </p>
                  </div>

                  {/* Points from this order */}
                  <div className="bg-gradient-to-r from-[#688F4E]/10 to-[#B1D182]/10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-6 h-6 text-[#688F4E]" />
                      <h3 className="font-semibold">Points Earned</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Purchase Points:</span>
                        <span className="font-medium text-[#688F4E]">+{order.pointsEarned}</span>
                      </div>
                      {order.order.status === 'delivered' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Delivery Bonus:</span>
                          <span className="font-medium text-[#688F4E]">+{order.deliveryBonusPoints}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-[#2B463C] border-t pt-2">
                        <span>Total Points:</span>
                        <span>+{order.totalPointsFromOrder}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress to next tier */}
                  <div className="bg-gradient-to-r from-[#688F4E]/10 to-[#B1D182]/10 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Progress to Next Tier</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-[#688F4E] to-[#B1D182] h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${order.loyaltyInfo.progressToNextTier}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {order.loyaltyInfo.nextTierPoints - order.loyaltyInfo.currentPoints} points needed for next tier
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-[#2B463C] mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{order.order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">₹{order.order.shipping?.cost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">₹{order.order.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg text-[#2B463C]">
                  <span>Total:</span>
                  <span>₹{order.order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-[#688F4E]" />
                <h3 className="text-lg font-semibold text-[#2B463C]">Shipping Address</h3>
              </div>
              <div className="space-y-2 text-gray-700">
                <p>{order.order.shippingAddress?.street}</p>
                <p>{order.order.shippingAddress?.city}, {order.order.shippingAddress?.state}</p>
                <p>{order.order.shippingAddress?.zipCode}</p>
                <p>{order.order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-[#688F4E]" />
                <h3 className="text-lg font-semibold text-[#2B463C]">Payment Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Method:</span>
                  <span className="capitalize font-medium">{order.order.payment?.method?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${
                    order.order.payment?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.order.payment?.status}
                  </span>
                </div>
                {order.order.payment?.transactionId && (
                  <div className="text-sm text-gray-600">
                    <span>Transaction ID: {order.order.payment.transactionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-[#2B463C] mb-4">Order Actions</h3>
              <div className="space-y-3">
                {order.order.status === 'pending' && (
                  <>
                    <button className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                      Cancel Order
                    </button>
                    {order.order.payment?.method !== 'cash_on_delivery' && (
                      <button className="w-full px-4 py-2 bg-[#688F4E] text-white rounded-lg hover:bg-[#5a7a42] transition-colors">
                        Pay Now
                      </button>
                    )}
                  </>
                )}
                {order.order.status === 'delivered' && (
                  <button className="w-full px-4 py-2 bg-[#688F4E] text-white rounded-lg hover:bg-[#5a7a42] transition-colors">
                    Write Review
                  </button>
                )}
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Support</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;