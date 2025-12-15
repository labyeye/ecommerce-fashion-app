import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Star,
  Crown,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import OrderStatusTracker from "../OrderStatusTracker";

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
    refund?: {
      status: string;
      refundId?: string;
      amount?: number;
      reason?: string;
      initiatedAt?: string;
      completedAt?: string;
    };
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
  const [error, setError] = useState("");
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [eligible, setEligible] = useState<boolean>(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeReason, setExchangeReason] = useState("");
  const [submittingExchange, setSubmittingExchange] = useState(false);
  const [exchangeSubmitted, setExchangeSubmitted] = useState(false);
  const [exchangeFiles, setExchangeFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token || !orderId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://backend.flauntbynishi.com/api/customer/orders/${orderId}/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data.data.order);
        setLoyaltyInfo(data.data.loyaltyInfo);
        setPointsEarned(data.data.pointsEarned);
        setDeliveryBonusPoints(data.data.deliveryBonusPoints);
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : String(err);
        setError(text);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [token, orderId]);

  // Check exchange eligibility after order loads
  useEffect(() => {
    const checkEligibility = async () => {
      if (!token || !orderId) return;
      try {
        const resp = await fetch(
          `https://backend.flauntbynishi.com/api/exchange/eligibility/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!resp.ok) return;
        const json = await resp.json();
        if (json.success) {
          setEligible(Boolean(json.eligible));
        }
      } catch (err: unknown) {
        // ignore transient errors
      } finally {
        setEligibilityChecked(true);
      }
    };

    if (order) checkEligibility();
  }, [order, token, orderId]);

  // Poll order status and shipment every 12 seconds
  useEffect(() => {
    if (!token || !orderId) return;
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const resp = await fetch(
          `https://backend.flauntbynishi.com/api/orders/status/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!resp.ok) return;
        const json = await resp.json();
        if (mounted && json.success && json.data) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: json.data.orderStatus,
              timeline: json.data.timeline || prev.timeline,
              estimatedDelivery:
                json.data.estimatedDelivery || prev.estimatedDelivery,
              // include shipment info if present
              // @ts-ignore
              shipment: json.data.shipment || prev["shipment"],
            } as Order;
          });
        }
      } catch (err: unknown) {
        // ignore polling errors
      }
    };

    const interval = setInterval(fetchStatus, 12000);
    // initial fetch
    fetchStatus();
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token, orderId]);

  const handleConfirmDelivery = async () => {
    if (!token || !orderId) return;

    try {
      setConfirmingDelivery(true);
      const response = await fetch(
        `https://backend.flauntbynishi.com/api/customer/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "delivered",
            deliveryConfirmation: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to confirm delivery");
      }

      const data = await response.json();
      setOrder(data.data.order);

      // Show success message
      alert(
        `Delivery confirmed! You earned ${data.data.bonusPointsEarned} bonus loyalty points!`
      );

      // Refresh the page to get updated data
      window.location.reload();
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      alert("Error confirming delivery: " + text);
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "shipped":
        return <Truck className="w-6 h-6 text-blue-600" />;
      case "processing":
        return <Package className="w-6 h-6 text-yellow-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "gold":
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case "silver":
        return <Star className="w-5 h-5 text-gray-400" />;
      default:
        return <Star className="w-5 h-5 text-amber-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3F00] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
        {/* Exchange Modal */}
        {showExchangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
              <h3 className="text-lg font-semibold mb-3">Request Exchange</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for the exchange.
              </p>
              <textarea
                value={exchangeReason}
                onChange={(e) => setExchangeReason(e.target.value)}
                className="w-full border rounded p-2 mb-4 h-28"
                placeholder="Reason for exchange"
              />
              <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">
                  Upload images (optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    setExchangeFiles(Array.from(e.target.files));
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowExchangeModal(false);
                    setExchangeReason("");
                  }}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!exchangeReason.trim()) {
                      alert("Please provide a reason");
                      return;
                    }
                    try {
                      setSubmittingExchange(true);
                      const form = new FormData();
                      form.append("orderId", orderId || "");
                      form.append("reason", exchangeReason);
                      // Attach files
                      exchangeFiles.forEach((f) =>
                        form.append("images", f, f.name)
                      );

                      const resp = await fetch(
                        "https://backend.flauntbynishi.com/api/exchange/request",
                        {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` },
                          body: form,
                        }
                      );
                      if (!resp.ok) {
                        const err = await resp.json();
                        throw new Error(
                          err.message || "Failed to submit exchange request"
                        );
                      }
                      alert("Exchange request submitted");
                      setExchangeSubmitted(true);
                      setEligible(false);
                      setShowExchangeModal(false);
                    } catch (err: any) {
                      alert("Error: " + (err.message || err));
                    } finally {
                      setSubmittingExchange(false);
                      setExchangeReason("");
                      setExchangeFiles([]);
                    }
                  }}
                  disabled={submittingExchange}
                  className="px-4 py-2 rounded bg-[#7B3F00] text-white disabled:opacity-60"
                >
                  {submittingExchange ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The order you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/profile")}
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
            onClick={() => navigate("/profile")}
            className="flex items-center space-x-2 text-[#7B3F00] hover:text-[#5a2f00] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Profile</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 federo-numeric">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              {/* Exchange button shown only for eligible delivered orders */}
              {order.status === "delivered" && eligibilityChecked && (
                <div>
                  <button
                    onClick={() => setShowExchangeModal(true)}
                    disabled={!eligible || exchangeSubmitted}
                    className={`ml-3 px-3 py-1 rounded-md text-white text-sm ${
                      eligible && !exchangeSubmitted
                        ? "bg-[#7B3F00] hover:bg-[#5a2f00]"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {exchangeSubmitted ? "Exchange Requested" : "Exchange"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    {(() => {
                      const p: any = item.product;
                      const img =
                        p.colors &&
                        p.colors.length > 0 &&
                        p.colors[0].images &&
                        p.colors[0].images.length > 0
                          ? p.colors[0].images[0].url
                          : null;
                      return (
                        <img
                          src={img || "/assets/img-placeholder-80.png"}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      );
                    })()}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity:{" "}
                        <span className="federo-numeric">{item.quantity}</span>
                      </p>
                      <p className="text-sm text-gray-600 federo-numeric">
                        ₹{item.price} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#7B3F00] federo-numeric">
                        ₹{item.total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Tracker */}
            <OrderStatusTracker status={(order.status || "").toString()} />

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Timeline
              </h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-[#7B3F00] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {event.status.charAt(0).toUpperCase() +
                          event.status.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600">{event.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Confirmation */}
            {order.status === "shipped" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Confirm Delivery
                </h2>
                <p className="text-gray-600 mb-4">
                  Has your order been delivered? Confirm delivery to earn bonus
                  loyalty points!
                </p>
                <button
                  onClick={handleConfirmDelivery}
                  disabled={confirmingDelivery}
                  className="bg-[#7B3F00] text-white px-6 py-3 rounded-lg hover:bg-[#5a2f00] transition-colors disabled:bg-gray-400 flex items-center space-x-2"
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="federo-numeric">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="federo-numeric">
                    {order.shipping.cost === 0
                      ? "Free"
                      : `₹${order.shipping.cost}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="federo-numeric">₹{order.tax}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="federo-numeric">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Points */}
            {loyaltyInfo && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Loyalty Points
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Tier</span>
                    <div className="flex items-center space-x-2">
                      {getTierIcon(loyaltyInfo.currentTier)}
                      <span className="font-medium capitalize">
                        {loyaltyInfo.currentTier}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Points</span>
                    <span className="font-medium federo-numeric">
                      {loyaltyInfo.currentPoints}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Progress to next tier
                      </span>
                      <span className="text-[#7B3F00]">
                        {loyaltyInfo.progressToNextTier}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#7B3F00] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${loyaltyInfo.progressToNextTier}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Points from this order */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Points earned from this order
                      </span>
                      <span className="text-[#7B3F00] font-medium federo-numeric">
                        {pointsEarned}
                      </span>
                    </div>
                    {order.status === "delivered" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Delivery bonus points
                        </span>
                        <span className="text-[#7B3F00] font-medium federo-numeric">
                          +{deliveryBonusPoints}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Total from this order</span>
                      <span className="text-[#7B3F00]">
                        {pointsEarned + deliveryBonusPoints}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
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
                {/* AWB / Tracking */}
                {/** @ts-ignore */}
                {order && (order as any).shipment && (
                  <div className="mt-3">
                    {(order as any).shipment.awb && (
                      <p className="text-sm text-gray-600">
                        AWB:{" "}
                        <span className="font-medium">
                          {(order as any).shipment.awb}
                        </span>
                      </p>
                    )}
                    {(order as any).shipment.shipmentId && (
                      <p className="text-sm text-gray-600">
                        Shipment ID:{" "}
                        <span className="font-medium">
                          {(order as any).shipment.shipmentId}
                        </span>
                      </p>
                    )}
                    {(order as any).shipment.trackingUrl && (
                      <a
                        href={(order as any).shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#7B3F00] hover:underline"
                      >
                        Track on Delhivery
                      </a>
                    )}

                    {/* Show additional Delhivery fields when present */}
                    {(order as any).shipment.name && (
                      <p className="text-sm text-gray-600 mt-2">
                        Consignee:{" "}
                        <span className="font-medium">
                          {(order as any).shipment.name}
                        </span>
                      </p>
                    )}
                    {(order as any).shipment.address && (
                      <p className="text-sm text-gray-600">
                        Address: {(order as any).shipment.address}
                      </p>
                    )}
                    {(order as any).shipment.pincode && (
                      <p className="text-sm text-gray-600">
                        Pincode:{" "}
                        <span className="font-medium">
                          {(order as any).shipment.pincode}
                        </span>
                      </p>
                    )}
                    {(order as any).shipment.phone &&
                      (order as any).shipment.phone.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Phone:{" "}
                          <span className="font-medium">
                            {(order as any).shipment.phone.join(", ")}
                          </span>
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium capitalize">
                    {order.payment.method.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.payment.status === "refunded"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.payment.status.charAt(0).toUpperCase() +
                      order.payment.status.slice(1)}
                  </span>
                </div>

                {/* Refund Information */}
                {order.payment.refund && order.payment.refund.status !== 'none' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
                      <span className="mr-2">💰</span> Refund Information
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Status:</span>
                        <span className={`px-2 py-1 rounded-full font-medium capitalize ${
                          order.payment.refund.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.payment.refund.status === 'failed' ? 'bg-red-100 text-red-800' :
                          order.payment.refund.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment.refund.status}
                        </span>
                      </div>
                      {order.payment.refund.amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Amount:</span>
                          <span className="font-semibold">₹{order.payment.refund.amount.toFixed(2)}</span>
                        </div>
                      )}
                      {order.payment.refund.refundId && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Refund ID:</span>
                          <span className="font-mono text-[10px]">{order.payment.refund.refundId}</span>
                        </div>
                      )}
                      {order.payment.refund.reason && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <span className="text-gray-700 block mb-1">Reason:</span>
                          <span className="text-gray-600 text-[11px]">{order.payment.refund.reason}</span>
                        </div>
                      )}
                      {order.payment.refund.completedAt && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700">
                          <div className="flex items-start">
                            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-xs">Refund Completed</p>
                              <p className="text-[10px] mt-1">
                                Your refund was processed on {new Date(order.payment.refund.completedAt).toLocaleDateString()}. 
                                It should reflect in your account within 5-7 business days.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {order.payment.refund.status === 'initiated' || order.payment.refund.status === 'processing' ? (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                          <div className="flex items-start">
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-xs">Refund in Progress</p>
                              <p className="text-[10px] mt-1">
                                Your refund is being processed. It will be credited to your original payment method within 5-7 business days.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
