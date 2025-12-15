import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { XCircle, Clock, RefreshCw } from "lucide-react";
import razorpayService, { RazorpayResponse } from "../../services/razorpayService";

const PaymentCancelledPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !token) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3500/api/customer/orders/${orderId}/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  // Calculate time remaining for payment
  useEffect(() => {
    if (!order?.order?.createdAt) return;

    const updateTimer = () => {
      const created = new Date(order.order.createdAt).getTime();
      const now = Date.now();
      const elapsed = now - created;
      const twelveHours = 12 * 60 * 60 * 1000;
      const remaining = twelveHours - elapsed;

      if (remaining <= 0) {
        setTimeRemaining("Payment window expired");
        return;
      }

      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [order]);

  const handleRetryPayment = async () => {
    if (!orderId || !token) return;

    try {
      setRetrying(true);
      setError("");

      // Request new Razorpay order for existing order
      const response = await fetch(
        `http://localhost:3500/api/payments/retry-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to retry payment");
      }

      const razorpayOrder = await response.json();

      // Configure Razorpay options
      const options = {
        key: razorpayOrder.data.razorpay_key_id,
        amount: razorpayOrder.data.amount,
        currency: razorpayOrder.data.currency,
        name: "Flaunt By Nishi",
        description: "Order Payment",
        order_id: razorpayOrder.data.id,
        handler: async (razorpayResponse: RazorpayResponse) => {
          try {
            const verificationData = {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              order_id: orderId,
            };

            const verificationResult = await razorpayService.verifyPayment(
              verificationData
            );

            if (
              verificationResult.success ||
              verificationResult.paymentStatus === "paid"
            ) {
              // Payment successful - redirect to order complete
              navigate("/order-complete", {
                state: { orderData: verificationResult.data || verificationResult },
              });
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (verifyError: any) {
            setError(
              verifyError.message || "Payment verification failed"
            );
          } finally {
            setRetrying(false);
          }
        },
        prefill: {
          name: order?.order?.shippingAddress
            ? `${order.order.shippingAddress.firstName} ${order.order.shippingAddress.lastName}`
            : "",
          email: order?.order?.shippingAddress?.email || "",
          contact: order?.order?.shippingAddress?.phone || "",
        },
        notes: {
          address: order?.order?.shippingAddress
            ? `${order.order.shippingAddress.addressLine1}, ${order.order.shippingAddress.city}, ${order.order.shippingAddress.state} ${order.order.shippingAddress.pinCode}`
            : "Retry payment",
        },
        theme: {
          color: "#95522C",
        },
        modal: {
          ondismiss: () => {
            setRetrying(false);
            setError("Payment cancelled by user");
          },
        },
      };

      // Open Razorpay checkout
      await razorpayService.openCheckout(options);
    } catch (err: any) {
      setError(err.message || "Failed to retry payment");
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#95522C] mx-auto mb-4"></div>
          <span className="text-[#95522C]">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#95522C] text-white px-6 py-3 rounded-lg hover:bg-[#7A3F26] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = order?.order?.status || "pending";
  const isPending = orderStatus === "pending";
  const isCancelled = orderStatus === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className={`p-8 ${isPending ? "bg-primary/10" : "bg-tertiary/10"}`}>
            <div className="flex flex-col items-center text-center">
              {isPending ? (
                <>
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-10 h-10 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-tertiary mb-2 inline-block">
                    Payment Cancelled
                  </span>
                  <span className="text-lg text-primary mb-2 inline-block">
                    Your order is pending payment
                  </span>
                  {timeRemaining && (
                    <div className="flex items-center space-x-2 text-primary bg-primary/10 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{timeRemaining}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-tertiary/20 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-10 h-10 text-tertiary" />
                  </div>
                  <span className="text-3xl font-bold text-tertiary mb-2 inline-block">
                    Order Cancelled
                  </span>
                  <span className="text-lg text-primary inline-block">
                    This order has been automatically cancelled
                  </span>
                </>
              )}
            </div>
          </div>

          

          {/* Order Details */}
          <div className="p-8">
            {order?.order?.items && order.order.items.length > 0 && (
              <div className="mb-6">
                <span className="text-2xl font-semibold text-tertiary mb-3 inline-block">
                  Items in Order
                </span>
                <div className="space-y-3">
                  {order.order.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-background-50 rounded-lg"
                    >
                      {/** Show product image (primary if available) instead of icon */}
                      {
                        (() => {
                          const prod = item.product || {};
                          const imgUrl =
                            prod.images?.find((im: any) => im.isPrimary)?.url ||
                            prod.images?.[0]?.url ||
                            "https://via.placeholder.com/80";
                          const imgAlt = prod.name || "Product image";
                          return (
                            <img
                              src={imgUrl}
                              alt={imgAlt}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          );
                        })()
                      }
                      <div className="flex-1">
                        <span className="text-md font-medium text-tertiary block federo-numeric">
                          {item.product?.name || "Product"}
                        </span>
                        <span className="text-md text-tertiary block federo-numeric">
                          Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-medium text-tertiary-900 federo-numeric">
                        ₹{(item.quantity * item.price)?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6">
              <span className="text-2xl font-semibold text-tertiary mb-4 inline-block">
                Order Details
              </span>
              <div className="space-y-2 text-md">
                <div className="flex justify-between">
                  <span className="text-teritary federo-numeric">Order ID:</span>
                  <span className="font-medium federo-numeric text-tertiary">
                    {order?.order?.orderNumber || orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary federo-numeric">Status:</span>
                  <span
                    className={`font-medium ${
                      isPending ? "text-primary" : "text-tertiary"
                    }`}
                  >
                    {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary federo-numeric">Total Amount:</span>
                  <span className="text-lg font-medium text-tertiary federo-numeric">
                    ₹{order?.order?.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
                
              </div>
            </div>

            {/* Order Items */}
            

            {error && (
              <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-lg">
                <span className="text-sm text-tertiary">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isPending && !isCancelled && (
                <button
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className="w-full bg-tertiary text-white px-6 py-4 rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-400 flex items-center justify-center space-x-2 font-semibold"
                >
                  {retrying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Pay Now</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Info Message */}
            {isPending && (
              <div className="mt-6 p-4 bg-background rounded-lg">
                <p className="text-sm text-tertiary-800">
                  <strong>Note:</strong> You have 12 hours from order creation
                  to complete the payment. After that, the order will be
                  automatically cancelled.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
