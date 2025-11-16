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
  AlertCircle,
  Download,
  Printer,
  MessageCircle,
  Zap,
} from "lucide-react";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      if (!id) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://ecommerce-fashion-app-som7.vercel.app/api/customer/orders/${id}/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err: any) {
        console.error("Fetch order error:", err);
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    // initial load
    fetchOrder();

    // expose fetchOrder to the component scope for reuse after actions
    (window as any).__fetchOrderDetails = fetchOrder;
  }, [id, token]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "out_for_delivery":
        return <Truck className="w-5 h-5 text-orange-500" />;
      case "delivered":
        return <Home className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

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
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusStep = (status: string) => {
    const steps = [
      { key: "pending", label: "Order Placed", completed: true },
      {
        key: "confirmed",
        label: "Payment Confirmed",
        completed: [
          "confirmed",
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
        ].includes(status),
      },
      {
        key: "processing",
        label: "Processing",
        completed: [
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
        ].includes(status),
      },
      {
        key: "shipped",
        label: "Shipped",
        completed: ["shipped", "out_for_delivery", "delivered"].includes(
          status
        ),
      },
      {
        key: "out_for_delivery",
        label: "Out for Delivery",
        completed: ["out_for_delivery", "delivered"].includes(status),
      },
      {
        key: "delivered",
        label: "Delivered",
        completed: status === "delivered",
      },
    ];
    return steps;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF6F0] via-white to-[#F2E0CB]/10 pt-24">
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#95522C]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white 10 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-[#95522C] mb-6">{error}</p>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-2 bg-[#95522C] text-white rounded-lg hover:bg-[#7A3F26] transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white 10 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">
              Order Not Found
            </h2>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-2 bg-[#95522C] text-white rounded-lg hover:bg-[#7A3F26] transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white 10 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#95522C] hover:text-[##95522C] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-[#95522C] hover:text-[#95522C] transition-colors">
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-[#95522C] hover:text-[#95522C] transition-colors">
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
                  <h4 className="text-3xl poppins-numeric text-[#95522C]">
                    Order #{order.order.orderNumber}
                  </h4>
                  <p className="text-[#95522C] mt-1">
                    Placed on {formatDate(order.order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      order.order.status
                    )}`}
                  >
                    {order.order.status.charAt(0).toUpperCase() +
                      order.order.status.slice(1).replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              {/* <div className="mb-6">
                <h2 className="text-3xl font-semibold text-[##95522C] mb-4">
                  Order Status
                </h2>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {getStatusStep(order.order.status).map((step, index) => (
                      <div
                        key={step.key}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-[#95522C] text-white"
                              : "bg-[#FFF2E1] text-gray-500"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium text-[#95522C]">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-2 text-center ${
                            step.completed
                              ? "text-[#95522C] font-medium"
                              : "text-[#95522C]"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10"></div>
                </div>
              </div> */}
              {order.order.timeline && order.order.timeline.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-[#95522C] mb-3">
                    Order Updates
                  </h4>
                  <div className="space-y-3">
                    {order.order.timeline.map((entry: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-beige rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {getStatusIcon(entry.status)}
                        </div>
                        <div className="flex-1">
                          
                          <p className="text-[#95522C] poppins-numeric text-sm">
                            {entry.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatDate(
                              entry.updatedAt || order.order.createdAt
                            )}
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
              <h4 className="text-3xl font-bold text-[##95522C] mb-4">
                Order Items
              </h4>
              <div className="space-y-4">
                {order.order.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    {(() => {
                      const p: any = item.product || {};
                      let img = null;

                      // Prefer color-specific images when available
                      try {
                        if (p.colors && p.colors.length > 0) {
                          const c = p.colors[0];
                          if (c && c.images && c.images.length > 0) {
                            const first = c.images[0];
                            img = typeof first === 'string' ? first : first?.url || null;
                          }
                        }
                      } catch (err) {
                        img = null;
                      }

                      // Fallback to top-level `images` (some records use this shape)
                      if (!img && p.images && Array.isArray(p.images) && p.images.length > 0) {
                        const first = p.images[0];
                        img = typeof first === 'string' ? first : first?.url || null;
                      }

                      // Fallback to single `image` field
                      if (!img && (p.image || p.img)) {
                        img = p.image || p.img;
                      }

                      // Resolve relative URLs to absolute so browser can fetch images correctly
                      const resolveImage = (u: string | null) => {
                        if (!u) return null;
                        try {
                          // If it's already an absolute URL, return as-is
                          const lc = u.toLowerCase();
                          if (lc.startsWith('http://') || lc.startsWith('https://') || lc.startsWith('//')) return u;
                          // If it starts with a leading slash, prefix with origin
                          if (u.startsWith('/')) return `${window.location.origin}${u}`;
                          // Otherwise also prefix with origin
                          return `${window.location.origin}/${u}`;
                        } catch (e) {
                          return u;
                        }
                      };

                      const finalImg = resolveImage(img) || '/assets/img-placeholder-80.png';
                      return (
                        <img
                          src={finalImg}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            if (!t.dataset.errored) {
                              t.dataset.errored = '1';
                              t.src = '/assets/img-placeholder-80.png';
                            }
                          }}
                        />
                      );
                    })()}
                    <div className="flex-1">
                      <h5 className="font-semibold text-[##95522C]">
                        {item.product?.name}
                      </h5>
                      <div className="flex items-center justify-between">
                        <div className="text-xl text-[#95522C]">
                          <span>Size: {item.size || "-"}</span>
                          <span className="mx-2">•</span>
                          <span>Quantity: {item.quantity}</span>
                          <span className="mx-2">•</span>
                          <span className="text-lg poppins-numeric">₹{item.price?.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#95522C] poppins-numeric">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* {order.loyaltyInfo && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-6 h-6 text-[#95522C]" />
                  <h2 className="text-3xl font-bold text-[##95522C]">
                    Loyalty Points Earned
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-[#95522C]/10 10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      {order.loyaltyInfo.currentTier === "bronze" && (
                        <Star className="w-6 h-6 text-[#CD7F32]" />
                      )}
                      {order.loyaltyInfo.currentTier === "silver" && (
                        <Award className="w-6 h-6 text-[#C0C0C0]" />
                      )}
                      {order.loyaltyInfo.currentTier === "gold" && (
                        <Crown className="w-6 h-6 text-[#FFD700]" />
                      )}
                      <h3 className="font-semibold capitalize">
                        {order.loyaltyInfo.currentTier} Tier
                      </h3>
                    </div>
                    <p className="text-[#95522C] text-sm">
                      You have {order.loyaltyInfo.currentPoints} points
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#95522C]/10 10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-6 h-6 text-[#95522C]" />
                      <h3 className="font-semibold">Points Earned</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#95522C]">Purchase Points:</span>
                        <span className="font-medium text-[#95522C]">
                          +{order.pointsEarned}
                        </span>
                      </div>
                      {order.order.status === "delivered" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[#95522C]">
                            Delivery Bonus:
                          </span>
                          <span className="font-medium text-[#95522C]">
                            +{order.deliveryBonusPoints}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-[##95522C] border-t pt-2">
                        <span>Total Points:</span>
                        <span>+{order.totalPointsFromOrder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#95522C]/10 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">
                      Progress to Next Tier
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-[#95522C] h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${order.loyaltyInfo.progressToNextTier}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-[#95522C] text-sm">
                      {order.loyaltyInfo.nextTierPoints -
                        order.loyaltyInfo.currentPoints}{" "}
                      points needed for next tier
                    </p>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="text-3xl font-semibold text-[##95522C] mb-4">
                Order Summary
              </h4>
              <div className="space-y-3">
                {(() => {
                  // Some code paths store shipping cost as top-level `shippingCost` (older code)
                  // while schema uses `shipping.cost`. Provide fallbacks so the UI always shows values.
                  const subtotal =
                    typeof order.order.subtotal === 'number'
                      ? order.order.subtotal
                      : order.order.subTotal || 0;

                  let shippingCost =
                    (order.order.shipping && typeof order.order.shipping.cost === 'number')
                      ? order.order.shipping.cost
                      : typeof order.order.shippingCost === 'number'
                      ? order.order.shippingCost
                      : typeof order.order.shippingCostCalculated === 'number'
                      ? order.order.shippingCostCalculated
                      : typeof order.order.shipping_cost === 'number'
                      ? order.order.shipping_cost
                      : 0;

                  // Fallback to the common flat shipping used by the server if nothing is present.
                  // This avoids showing 0 when the value is missing in older records.
                  if (!shippingCost) shippingCost = 150;

                  const tax =
                    typeof order.order.tax === 'number'
                      ? order.order.tax
                      : order.order.taxAmount || 0;

                  const total =
                    typeof order.order.total === 'number'
                      ? order.order.total
                      : Math.round((subtotal + tax + shippingCost + Number.EPSILON) * 100) / 100;

                  const fmt = (n: number) => `₹${(n || 0).toFixed(2)}`;

                  return (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-[#95522C]">Subtotal:</span>
                        <span className="poppins-numeric font-medium">{fmt(subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-[#95522C]">Shipping:</span>
                        <span className="poppins-numeric font-medium">{fmt(shippingCost)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-[#95522C]">Tax:</span>
                        <span className="poppins-numeric font-medium">{fmt(tax)}</span>
                      </div>
                      <div className="flex justify-between py-3 text-lg text-[#95522C]">
                        <span>Total:</span>
                        <span className="poppins-numeric">{fmt(total)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-[#95522C]" />
                <h4 className="text-3xl font-semibold text-[##95522C]">
                  Shipping Address
                </h4>
              </div>
              <div className="space-y-2 text-[#95522C]">
                <p>{order.order.shippingAddress?.street}</p>
                <p>
                  {order.order.shippingAddress?.city},{" "}
                  {order.order.shippingAddress?.state}
                </p>
                <p>{order.order.shippingAddress?.zipCode}</p>
                <p>{order.order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-[#95522C]" />
                <h4 className="text-3xl font-semibold text-[##95522C]">
                  Payment Information
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-[#95522C]">Method:</p>
                  <p className="capitalize font-medium">
                    {order.order.payment?.method?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[#95522C]">Status:</p>
                  <p
                    className={`capitalize px-2 py-1 rounded text-xs font-medium ${
                      order.order.payment?.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.order.payment?.status}
                  </p>
                </div>
                {order.order.payment?.transactionId && (
                  <div className="text-sm text-[#95522C]">
                    <p>
                      Transaction ID: {order.order.payment.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="text-3xl font-semibold text-[##95522C] mb-4">
                Order Actions
              </h4>
              <div className="space-y-3">
                {order.order.status === "pending" && (
                  <>
                    <button
                      onClick={async () => {
                        if (
                          !confirm(
                            "Are you sure you want to cancel this order?"
                          )
                        )
                          return;
                        try {
                          setCanceling(true);
                          const resp = await fetch(
                            `https://ecommerce-fashion-app-som7.vercel.app/api/customer/orders/${id}/cancel`,
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                reason: "Cancelled by customer via UI",
                              }),
                            }
                          );
                          const data = await resp.json();
                          if (!resp.ok) {
                            throw new Error(data.message || "Failed to cancel");
                          }
                          // Re-fetch order details so component has consistent data shape
                          if ((window as any).__fetchOrderDetails)
                            await (window as any).__fetchOrderDetails();
                          alert(
                            "Order cancelled. A confirmation email has been sent to your registered email."
                          );
                        } catch (err: any) {
                          console.error("Cancel error:", err);
                          alert(err.message || "Failed to cancel order");
                        } finally {
                          setCanceling(false);
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      disabled={canceling}
                    >
                      {canceling ? "Cancelling..." : "Cancel Order"}
                    </button>
                    {order.order.payment?.method === "razorpay" &&
                      order.order.payment?.status !== "paid" && (
                        <button className="w-full px-4 py-2 bg-[#95522C] text-white rounded-lg hover:bg-[#5a7a42] transition-colors">
                          Pay Now
                        </button>
                      )}
                  </>
                )}
                {order.order.status === "delivered" && (
                  <button className="w-full px-4 py-2 bg-[#95522C] text-white rounded-lg hover:bg-[#5a7a42] transition-colors">
                    Write Review
                  </button>
                )}
                <button className="w-full px-4 py-2 border border-gray-300 text-[#95522C] rounded-lg hover:bg-gray-50 transition-colors">
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
