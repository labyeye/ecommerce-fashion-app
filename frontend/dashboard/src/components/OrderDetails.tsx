import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  CreditCard,
  User,
  Gift,
  Star,
  Award,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import OrderStatusTracker from "./OrderStatusTracker";

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

interface OrderItem {
  _id: string;
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
  total: number;
  subtotal: number;
  tax: number;
  shipping: {
    cost: number;
    method: string;
  };
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    evolvPoints?: number;
  };
  items: OrderItem[];
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    refund?: {
      status: string;
      refundId?: string;
      amount?: number;
      reason?: string;
      initiatedAt?: string;
      completedAt?: string;
      errorMessage?: string;
    };
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timeline: Array<{
    status: string;
    message: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface LoyaltyInfo {
  pointsEarned: number;
  deliveryBonusPoints: number;
  totalPointsFromOrder: number;
  customerTier: string;
  customerPoints: number;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onBack }) => {
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState<string>("");
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token || !orderId) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://backend.flauntbynishi.com/api/admin/orders/${orderId}/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data.data.order);
        setLoyaltyInfo(data.data.loyaltyInfo);
        setInvoiceNo(data.data.order?.invoiceNo || "");
      } catch (err: any) {
        console.error("Order details fetch error:", err);
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    // Poll for updates every 12 seconds
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        if (!token || !orderId) return;
        const resp = await fetch(
          `https://backend.flauntbynishi.com/api/admin/orders/${orderId}/details`,
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
          setOrder(json.data.order);
        }
      } catch (err) {
        // ignore polling errors
      }
    }, 12000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Package;
      case "confirmed":
        return CheckCircle;
      case "processing":
        return Package;
      case "shipped":
        return Truck;
      case "delivered":
        return CheckCircle;
      default:
        return Package;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = async () => {
    if (!token || !orderId) return;

    const reason = prompt("Enter cancellation reason (optional):");
    if (reason === null) return; // User cancelled the prompt

    if (
      !confirm(
        "Are you sure you want to cancel this order? This will automatically process a refund if payment was made."
      )
    ) {
      return;
    }

    try {
      setCancelling(true);
      const response = await fetch(
        `https://backend.flauntbynishi.com/api/admin/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reason || "Cancelled by admin" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel order");
      }

      const data = await response.json();
      setOrder(data.data.order);

      if (data.data.refundProcessed) {
        alert("Order cancelled successfully! Refund has been processed.");
      } else if (data.data.refundDetails?.isCOD) {
        alert("Order cancelled successfully! (COD order - no refund needed)");
      } else if (data.data.refundDetails?.notPaid) {
        alert(
          "Order cancelled successfully! (Payment not completed - no refund needed)"
        );
      } else {
        alert("Order cancelled successfully!");
      }
    } catch (err: any) {
      console.error("Cancel order error:", err);
      alert(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!token || !orderId) return;

    const reason = prompt("Enter refund reason:");
    if (!reason) return;

    const amountStr = prompt(
      `Enter refund amount (leave empty for full amount: ₹${order?.total}):`
    );
    const amount = amountStr ? parseFloat(amountStr) : null;

    if (!confirm(`Process refund of ₹${amount || order?.total}?`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(
        `https://backend.flauntbynishi.com/api/admin/orders/${orderId}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount,
            reason: reason,
            deductShipping: false,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process refund");
      }

      const data = await response.json();
      setOrder(data.data.order);

      if (data.data.refund?.isCOD) {
        alert("This is a COD order - no refund needed.");
      } else if (data.data.refund?.notPaid) {
        alert("Payment not completed - no refund needed.");
      } else if (data.data.refund?.alreadyRefunded) {
        alert("Refund already processed for this order.");
      } else {
        alert(
          `Refund processed successfully! Refund ID: ${data.data.refund?.refundId}`
        );
      }
    } catch (err: any) {
      console.error("Process refund error:", err);
      alert(err.message || "Failed to process refund");
    } finally {
      setProcessing(false);
    }
  };

  const handleSyncDelhivery = async () => {
    if (!token || !orderId) return;

    try {
      setProcessing(true);
      const response = await fetch(
        `https://backend.flauntbynishi.com/api/admin/orders/${orderId}/sync-delhivery`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sync order status");
      }

      const data = await response.json();
      setOrder(data.data.order);

      if (data.data.cancellationDetected) {
        alert("Order status synced! Cancellation detected and processed.");
      } else {
        alert("Order status synced successfully!");
      }
    } catch (err: any) {
      console.error("Sync Delhivery error:", err);
      alert(err.message || "Failed to sync order status");
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!token || !orderId) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch(
        `https://backend.flauntbynishi.com/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            notes: `Status updated to ${newStatus}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      const data = await response.json();
      setOrder(data.data);

      // Recalculate loyalty info for the new status
      const pointsEarned = Math.floor(data.data.total);
      const deliveryBonusPoints =
        newStatus === "delivered" ? Math.floor(data.data.total * 0.1) : 0;
      const totalPointsFromOrder = pointsEarned + deliveryBonusPoints;

      setLoyaltyInfo({
        pointsEarned,
        deliveryBonusPoints,
        totalPointsFromOrder,
        customerTier: data.data.customer.loyaltyTier || "bronze",
        customerPoints: data.data.customer.loyaltyPoints || 0,
      });

      alert("Order status updated successfully!");
    } catch (err: any) {
      console.error("Status update error:", err);
      alert(err.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
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
            <h2 className="font-semibold text-red-900">Error Loading Order</h2>
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

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h2 className="font-semibold text-yellow-900">Order Not Found</h2>
          </div>
          <p className="text-yellow-700">
            The order you're looking for doesn't exist.
          </p>
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
    <div className="space-y-6 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between animate-slideIn">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice No
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter invoice number"
              />
              <button
                onClick={async () => {
                  if (!token || !order) return alert("Not authenticated");
                  try {
                    setSavingInvoice(true);
                    const resp = await fetch(
                      `https://backend.flauntbynishi.com/api/admin/orders/${order._id}/invoice`,
                      {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ invoiceNo }),
                      }
                    );
                    const json = await resp.json();
                    if (!resp.ok)
                      throw new Error(
                        json.message || "Failed to save invoice number"
                      );
                    setOrder(json.data);
                    alert("Invoice number saved");
                  } catch (e: any) {
                    console.error("Save invoice error:", e);
                    alert(e.message || "Failed to save invoice");
                  } finally {
                    setSavingInvoice(false);
                  }
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                {savingInvoice ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          <OrderStatusTracker status={order.status} />
        </div>
        <div className="flex items-center space-x-3 animate-scaleIn">
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 hover:scale-105 ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>

          {(() => {
            const awbVal =
              (order as any).awb ||
              (order as any).trackingNumber ||
              (order as any).shipment?.awb;
            if (awbVal) {
              return (
                <div className="px-4 py-2 bg-yellow-50 rounded-lg text-yellow-800 flex items-center space-x-3">
                  <div>
                    <div className="font-medium">Synced with Delhivery</div>
                    <div className="text-sm">
                      AWB:{" "}
                      <a
                        className="font-semibold text-yellow-800 hover:underline"
                        href={`https://track.delhivery.com/?waybill=${awbVal}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {awbVal}
                      </a>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updatingStatus}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            );
          })()}
          {updatingStatus && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Updating...</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
              Order Timeline
            </h3>
            <div className="space-y-4">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((step, index) => {
                  const StatusIcon = getStatusIcon(step.status);
                  return (
                    <div key={index} className="flex items-center space-x-4 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-110 ${
                          step.status === "delivered"
                            ? "bg-green-100"
                            : step.status === "cancelled"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <StatusIcon
                          className={`w-5 h-5 ${
                            step.status === "delivered"
                              ? "text-green-600"
                              : step.status === "cancelled"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            step.status === "cancelled"
                              ? "text-red-900"
                              : "text-gray-900"
                          }`}
                        >
                          {step.status.charAt(0).toUpperCase() +
                            step.status.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {step.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(step.updatedAt)}
                        </p>
                      </div>
                      {step.status === "delivered" && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {step.status === "cancelled" && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No timeline updates available</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => {
                const p: any = item.product;
                // Try multiple image sources in priority order
                const imageUrl =
                  p.images?.[0]?.url ||
                  p.colors?.[0]?.images?.[0]?.url ||
                  (typeof p.images?.[0] === "string" ? p.images[0] : null) ||
                  "/placeholder-product.png";

                const itemData = item as any;
                const size = itemData.size || "";
                const color = itemData.color || "";

                return (
                  <div
                    key={item._id}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-blue-200"
                  >
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-product.png";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">
                        {item.product.name}
                      </h4>
                      <div className="flex gap-3 mt-1">
                        {size && (
                          <span className="text-sm text-gray-600">
                            Size: <span className="font-medium">{size}</span>
                          </span>
                        )}
                        {color && (
                          <span className="text-sm text-gray-600">
                            Color: <span className="font-medium">{color}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantity:{" "}
                        <span className="font-medium">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ₹{order.subtotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    ₹{order.shipping?.cost?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    ₹{order.tax?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Points Section */}
          {loyaltyInfo && (
            <div className="bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 rounded-xl shadow-sm border border-gray-100 p-6 card-hover animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Loyalty Points Earned
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Tier */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    {order.customer.loyaltyTier === "bronze" && (
                      <Star className="w-6 h-6 text-[#CD7F32]" />
                    )}
                    {order.customer.loyaltyTier === "silver" && (
                      <Award className="w-6 h-6 text-[#C0C0C0]" />
                    )}
                    {order.customer.loyaltyTier === "gold" && (
                      <Crown className="w-6 h-6 text-[#FFD700]" />
                    )}
                    <h4 className="font-semibold capitalize">
                      {order.customer.loyaltyTier} Tier
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Customer has {order.customer.loyaltyPoints || 0} points
                  </p>
                </div>

                {/* Points from this order */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-green-600" />
                    <h4 className="font-semibold">Points Earned</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purchase Points:</span>
                      <span className="font-medium text-green-600">
                        +{loyaltyInfo.pointsEarned}
                      </span>
                    </div>
                    {order.status === "delivered" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Bonus:</span>
                        <span className="font-medium text-green-600">
                          +{loyaltyInfo.deliveryBonusPoints}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-gray-900 border-t pt-2">
                      <span>Total Points:</span>
                      <span>+{loyaltyInfo.totalPointsFromOrder}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Points Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Customer Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Points:</span>
                      <span className="font-medium">
                        {order.customer.loyaltyPoints || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Evolv Points:</span>
                      <span className="font-medium">
                        {order.customer.evolvPoints || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tier:</span>
                      <span className="font-medium capitalize">
                        {order.customer.loyaltyTier || "bronze"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></div>
              Shipping Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Shipping Address
                </h4>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}
                    </p>
                    <p>
                      {order.shippingAddress.zipCode},{" "}
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Shipping Method
                </h4>
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">
                      {order.shipping.method || "Standard Shipping"}
                    </p>
                    <p>3-5 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-sm border border-gray-100 p-6 card-hover animate-slideIn">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              Customer Information
            </h4>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg shadow-sm border border-blue-100">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                    {(order.customer.firstName?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {order.customer.firstName || "N/A"}{" "}
                      {order.customer.lastName || ""}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.customer.email || "No email"}
                    </p>
                    {order.customer.phone && (
                      <p className="text-sm text-gray-600 mt-1">
                        📞 {order.customer.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Customer ID:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {order.customer._id}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Order Time:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() =>
                    (window.location.href = `/customers/${order.customer._id}`)
                  }
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View Customer Profile
                </button>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-br from-white to-green-50/30 rounded-xl shadow-sm border border-gray-100 p-6 card-hover animate-slideIn" style={{animationDelay: '0.1s'}}>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <div className="p-1.5 bg-green-100 rounded-lg mr-2">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              Payment Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {order.payment.method?.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status:{" "}
                    <span
                      className={`capitalize ${
                        order.payment.status === "paid"
                          ? "text-green-600"
                          : order.payment.status === "refunded"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.payment.status}
                    </span>
                  </p>
                </div>
              </div>
              {order.payment.transactionId && (
                <div className="text-sm text-gray-600">
                  <p>Transaction ID: {order.payment.transactionId}</p>
                </div>
              )}

              {/* Refund Information */}
              {order.payment.refund &&
                order.payment.refund.status !== "none" && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <span className="mr-2">💰</span> Refund Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Status:</span>
                        <span
                          className={`font-medium capitalize ${
                            order.payment.refund.status === "completed"
                              ? "text-green-600"
                              : order.payment.refund.status === "failed"
                              ? "text-red-600"
                              : order.payment.refund.status === "processing"
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.payment.refund.status}
                        </span>
                      </div>
                      {order.payment.refund.amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Amount:</span>
                          <span className="font-medium">
                            ₹{order.payment.refund.amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {order.payment.refund.refundId && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Refund ID:</span>
                          <span className="font-mono text-xs">
                            {order.payment.refund.refundId}
                          </span>
                        </div>
                      )}
                      {order.payment.refund.reason && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Reason:</span>
                          <span className="text-xs">
                            {order.payment.refund.reason}
                          </span>
                        </div>
                      )}
                      {order.payment.refund.initiatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Initiated:</span>
                          <span className="text-xs">
                            {new Date(
                              order.payment.refund.initiatedAt
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {order.payment.refund.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Completed:</span>
                          <span className="text-xs">
                            {new Date(
                              order.payment.refund.completedAt
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {order.payment.refund.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                          <strong>Error:</strong>{" "}
                          {order.payment.refund.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-xl shadow-sm border border-gray-100 p-6 card-hover animate-slideIn" style={{animationDelay: '0.2s'}}>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full mr-3"></div>
              Order Actions
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Update Status
                </label>
                {order && (
                  <select
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-blue-400 font-medium"
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updatingStatus}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                )}
                {updatingStatus && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600 animate-pulse">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Updating status...</span>
                  </div>
                )}
              </div>
              {/* Create / Retry shipment action for admin */}
              {order && !(order as any).shipment?.awb ? (
                <button
                  onClick={async () => {
                    if (!token) return alert("Not authenticated");
                    try {
                      const resp = await fetch(
                        `https://backend.flauntbynishi.com/api/admin/orders/${order._id}/create-shipment`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );
                      const json = await resp.json();
                      if (!resp.ok)
                        throw new Error(
                          json.message || "Failed to create shipment"
                        );
                      alert("Shipment created successfully");
                      // refresh order details
                      const details = await fetch(
                        `https://backend.flauntbynishi.com/api/admin/orders/${order._id}/details`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );
                      const djson = await details.json();
                      if (details.ok) setOrder(djson.data.order);
                    } catch (e: any) {
                      alert("Create shipment failed: " + (e.message || e));
                    }
                  }}
                  className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Create Shipment (Delhivery)
                </button>
              ) : (
                <div className="w-full px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg">
                  Shipment exists:{" "}
                  <span className="font-medium">
                    {(order as any).shipment?.shipmentId ||
                      (order as any).shipment?.awb}
                  </span>
                </div>
              )}

              {/* Sync Delhivery Status - Hide when cancelled */}
              {order && (order as any).shipment?.awb && order.status !== "cancelled" && (
                <button
                  onClick={handleSyncDelhivery}
                  disabled={processing}
                  className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between font-medium shadow-sm hover:shadow-md"
                >
                  <span>Sync Delhivery Status</span>
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
              )}

              {/* Cancel Order with Refund */}
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full text-left px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                >
                  <span>Cancel Order & Refund</span>
                  {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
              )}

              {/* Process Refund - Hide when cancelled */}
              {order.status !== "cancelled" &&
                order.payment.status === "paid" &&
                (!order.payment.refund ||
                  order.payment.refund.status === "none" ||
                  order.payment.refund.status === "failed") && (
                  <button
                    onClick={handleProcessRefund}
                    disabled={processing}
                    className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between font-medium shadow-sm hover:shadow-md"
                  >
                    <span>Process Refund</span>
                    {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                  </button>
                )}

              <button
                onClick={() => {
                  if (order.customer?.email) {
                    alert(
                      `Email update will be sent to ${order.customer.email}`
                    );
                  }
                }}
                className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Send Update Email
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Print Invoice
              </button>
              <button
                onClick={() => {
                  // Create invoice content
                  const invoiceContent = `
                    Invoice #${invoiceNo || order.orderNumber}
                    Order: ${order.orderNumber}
                    Date: ${formatDate(order.createdAt)}
                    
                    Customer: ${order.customer.firstName} ${
                    order.customer.lastName
                  }
                    Email: ${order.customer.email}
                    Phone: ${order.customer.phone || "N/A"}
                    
                    Shipping Address:
                    ${order.shippingAddress.street}
                    ${order.shippingAddress.city}, ${
                    order.shippingAddress.state
                  }
                    ${order.shippingAddress.zipCode}, ${
                    order.shippingAddress.country
                  }
                    
                    Items:
                    ${order.items
                      .map(
                        (item) =>
                          `${item.product.name} x ${item.quantity} - ₹${(
                            item.price * item.quantity
                          ).toFixed(2)}`
                      )
                      .join("\n")}
                    
                    Subtotal: ₹${order.subtotal?.toFixed(2) || "0.00"}
                    Shipping: ₹${order.shipping?.cost?.toFixed(2) || "0.00"}
                    Tax: ₹${order.tax?.toFixed(2) || "0.00"}
                    Total: ₹${order.total.toFixed(2)}
                    
                    Payment Method: ${order.payment.method}
                    Payment Status: ${order.payment.status}
                  `;

                  const blob = new Blob([invoiceContent], {
                    type: "text/plain",
                  });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `invoice-${order.orderNumber}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
                className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
