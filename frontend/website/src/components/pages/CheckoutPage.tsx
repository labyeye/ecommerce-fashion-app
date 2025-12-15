import React, { useState, useEffect } from "react";
import { useCartContext } from "../../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Check,
  Lock,
  Truck,
  CreditCard,
  MapPin,
  ShieldCheck,
  Gift,
} from "lucide-react";
import razorpayService, {
  RazorpayResponse,
} from "../../services/razorpayService";

const CheckoutPage: React.FC = () => {
  const { cartItems, clearCart, isLoading, promoCode, evolvPointsRedemption } =
    useCartContext();
  const { token, authInitializing } = useAuth();

  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [billing, setBilling] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [currentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressManuallyEntered, setAddressManuallyEntered] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;

      try {
        setLoadingProfile(true);
        const response = await fetch("https://backend.flauntbynishi.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);

          // Auto-populate shipping address from user profile
          if (data.user) {
            const userData = data.user;
            const addressData = {
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || "",
              phone: userData.phone || "",
              street: userData.address?.street || "",
              city: userData.address?.city || "",
              state: userData.address?.state || "",
              zipCode: userData.address?.zipCode || "",
              country: userData.address?.country || "India",
            };

            setShipping(addressData);
            setBilling(addressData);
            
            // If address is already saved, don't show save option
            if (userData.address?.street) {
              setAddressManuallyEntered(false);
            } else {
              setAddressManuallyEntered(true);
            }
          }
        }
      } catch (_error: unknown) {
        // ignore profile load errors silently
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Load saved addresses from localStorage (added from Addresses page)
  useEffect(() => {
    const raw = localStorage.getItem("addresses");
    if (raw) {
      try {
        setSavedAddresses(JSON.parse(raw));
      } catch (e) {
        setSavedAddresses([]);
      }
    }
  }, []);

  const handleSelectSavedAddress = (addr: any) => {
    const payload = {
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      email: addr.email || shipping.email,
      phone: addr.phone || shipping.phone,
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zipCode: addr.zipCode || "",
      country: addr.country || "India",
    };
    setShipping(payload);
    if (useSameAddress) setBilling(payload);
  };
  useEffect(() => {
    if (useSameAddress) {
      setBilling(shipping);
    }
  }, [shipping, useSameAddress]);
  const SHIPPING_FLAT: number = 100;
  let baseAmount = 0; // a
  let taxAmount = 0; // b
  for (const item of cartItems) {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const basePerUnit = price / 1.05;
    const taxPerUnit = basePerUnit * 0.05;
    baseAmount += basePerUnit * qty;
    taxAmount += taxPerUnit * qty;
  }
  // Round to 2 decimals for display
  baseAmount = Math.round((baseAmount + Number.EPSILON) * 100) / 100;
  taxAmount = Math.round((taxAmount + Number.EPSILON) * 100) / 100;
  // baseAmount and taxAmount were computed above per unit (base = price/1.05, tax = base*0.05)
  const subtotalExclTax = Math.round((baseAmount + Number.EPSILON) * 100) / 100; // displayable subtotal excluding tax
  const taxDisplay = Math.round((taxAmount + Number.EPSILON) * 100) / 100;
  const subtotalInclTax =
    Math.round((subtotalExclTax + taxDisplay + Number.EPSILON) * 100) / 100;
  // Free shipping for orders >= ₹3000 based on subtotal including tax
  const shippingCost = subtotalInclTax >= 3000 ? 0 : SHIPPING_FLAT;
  const promoDiscountAmount = promoCode?.discountAmount || 0;
  const evolvDiscountAmount = evolvPointsRedemption?.discountAmount || 0;
  const totalDiscountAmount = promoDiscountAmount + evolvDiscountAmount;
  // final total will be calculated when rendering to ensure it uses displayed subtotal/tax/shipping values

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "shipping" | "billing"
  ) => {
    const { name, value } = e.target;
    // Sanitization rules:
    // - phone: digits only, max 10
    // - zipCode: digits only, max 6
    // - city/state: letters, spaces, hyphen and apostrophe only
    let newValue = value;
    if (name === "phone") {
      newValue = (value || "").replace(/\D+/g, "").slice(0, 10);
    } else if (name === "zipCode") {
      newValue = (value || "").replace(/\D+/g, "").slice(0, 6);
    } else if (name === "city" || name === "state") {
      newValue = (value || "").replace(/[^A-Za-z\s\-']/g, "");
      // cap length to reasonable 60 chars
      newValue = newValue.slice(0, 60);
    }

    if (type === "shipping") {
      setShipping((prev) => ({ ...prev, [name]: newValue }));
      // Mark address as manually entered when user types
      if (!addressManuallyEntered && newValue !== "") {
        setAddressManuallyEntered(true);
      }
    }
    else setBilling((prev) => ({ ...prev, [name]: newValue }));
  };
  const handleSaveAddress = async () => {
    if (!token) {
      setError("Please login to save address");
      return;
    }

    // Validate required fields
    if (!shipping.street || !shipping.city || !shipping.state || !shipping.zipCode) {
      setError("Please fill in all address fields before saving");
      return;
    }

    try {
      setSavingAddress(true);
      setError(""); 

      // Prepare the request body
      const requestBody: any = {
        address: {
          street: shipping.street,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.zipCode,
          country: shipping.country || "India",
        },
      };

      // Only include phone if it's valid (10 digits)
      if (shipping.phone && shipping.phone.length === 10) {
        requestBody.phone = shipping.phone;
      }

      const response = await fetch(
        "https://backend.flauntbynishi.com/api/customer/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
        setAddressManuallyEntered(false);
        setSaveAddress(false);
        // Show success message
        alert("Address saved successfully! It will be auto-filled next time.");
      } else {
        const errorData = await response.json();
        console.error("Save address error:", errorData);
        setError(errorData.message || errorData.errors?.[0]?.msg || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError("Failed to save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (authInitializing) {
      setError("Finishing login — please wait a moment and try again.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError(
        "You must be logged in to place an order. Please log in and try again."
      );
      setLoading(false);
      // preserve current location so user returns to checkout after login
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }

    // Frontend validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "street",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    for (const field of requiredFields) {
      if (!(shipping as any)[field]) {
        setError(`Shipping address: ${field} is required.`);
        setLoading(false);
        return;
      }
      if (!useSameAddress && !(billing as any)[field]) {
        setError(`Billing address: ${field} is required.`);
        setLoading(false);
        return;
      }
    }

    // Only Razorpay is supported now
    if (paymentMethod === "razorpay") {
      await processRazorpayPayment();
      return;
    }

    setError("Invalid payment method selected");
    setLoading(false);
  };

  const processRazorpayPayment = async () => {
    try {
      const normalizeAddress = (addr: any) => {
        const z =
          addr?.zipCode || addr?.pincode || userProfile?.address?.zipCode || "";
        return {
          ...addr,
          zipCode: String(z || ""),
          pincode: String(z || ""),
        };
      };

      const normalizedShipping = normalizeAddress(shipping);
      const normalizedBilling = useSameAddress
        ? normalizedShipping
        : normalizeAddress(billing);

      const orderData = {
        items: cartItems.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
          itemTotal: item.price * item.quantity,
        })),
        shippingAddress: normalizedShipping,
        billingAddress: normalizedBilling,
        // totals are computed server-side (server enforces base/tax/shipping formula)
        ...(promoCode?.code && { promoCode: promoCode.code }),
        evolvPointsToRedeem: evolvPointsRedemption?.pointsToRedeem || 0,
      };

      // Create Razorpay order
      const razorpayOrder = await razorpayService.createOrder(orderData);

      // Configure Razorpay options
      const options = {
        key: razorpayOrder.razorpay_key_id, // This will come from backend
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Flaunt By Nishi",
        description: "Test Order Payment",
        order_id: razorpayOrder.id,
        handler: async (response: RazorpayResponse) => {
          try {
            setProcessingOrder(true);
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: razorpayOrder.order_id,
            };

            const verificationResult = await razorpayService.verifyPayment(
              verificationData
            );

            if (
              verificationResult.success ||
              verificationResult.paymentStatus === "paid"
            ) {
              setSuccess(true);
              const resolved = verificationResult.data || verificationResult;
              setOrderData(resolved);
              clearCart();
              navigate("/order-complete", { state: { orderData: resolved } });
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (verifyError: unknown) {
            const text =
              verifyError instanceof Error
                ? verifyError.message
                : String(verifyError);
            setError(text || "Payment verification failed");
            await razorpayService.handlePaymentFailure(
              razorpayOrder.order_id,
              verifyError as any
            );
          } finally {
            setLoading(false);
            setProcessingOrder(false);
          }
        },
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          email: shipping.email,
          contact: shipping.phone,
        },
        notes: {
          address: `${shipping.street}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}`,
          order_type: "test_order",
        },
        theme: {
          color: "#95522C",
        },
        config: {
          display: {
            blocks: {
              utib: {
                //This key should be the bank's short name.
                name: "Pay using Axis Bank", //This value will be displayed in the list of payment method icons.
                instruments: [
                  {
                    method: "upi",
                  },
                  {
                    method: "card",
                  },
                  {
                    method: "netbanking",
                  },
                ],
              },
            },
            hide: [
              {
                method: "wallet",
              },
            ],
            preferences: {
              show_default_blocks: true, // Should Razorpay's default blocks be shown
            },
          },
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            // Navigate to payment cancelled page with order ID
            if (razorpayOrder?.order_id) {
              navigate(`/payment-cancelled?orderId=${razorpayOrder.order_id}`);
            } else {
              setError("Payment cancelled by user");
            }
          },
        },
      };
      // Open Razorpay checkout
      await razorpayService.openCheckout(options);
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setError(text || "Failed to initiate payment");
      setLoading(false);
    }
  };

  // Order summary renderer reused for mobile (inside main column) and desktop sidebar
  const OrderSummary: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={className}>
      <div className="bg-background rounded-2xl shadow-sm p-6">
        <span className="block text-3xl text-[#95522C] mb-6">Order Summary</span>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.size}-${item.color}`}
              className="flex items-center space-x-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <span className="block font-medium">{item.name}</span>
                <span className="block">
                  Size: {item.size} || Qty: <span className="federo-numeric">{item.quantity}</span>
                </span>
                <span className="block federo-numeric">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-[#95522C]">
            <span>Subtotal</span>
            <span className="federo-numeric">₹{subtotalExclTax.toFixed(0)}</span>
          </div>

          {promoCode && promoDiscountAmount > 0 && (
            <div className="flex justify-between TEXT-[#95522C]">
              <span>Discount ({promoCode.code})</span>
              <span className="federo-numeric">-₹{promoDiscountAmount.toFixed(0)}</span>
            </div>
          )}

          {evolvPointsRedemption && evolvDiscountAmount > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Flaunt By Nishi Points ({evolvPointsRedemption.pointsToRedeem} pts)</span>
              <span className="federo-numeric">-₹{evolvDiscountAmount.toFixed(0)}</span>
            </div>
          )}

          <div className="flex justify-between text-[#95522C]">
            <span>Shipping</span>
            <span className="federo-numeric">{shippingCost === 0 ? "Free Shipping" : `₹${shippingCost}`}</span>
          </div>
          {subtotalInclTax < 3000 && (
            <div className="text-md text-priamry federo-numeric">Free shipping on orders ₹3000 and above</div>
          )}
          <div className="flex justify-between text-[#95522C]">
            <span>Tax</span>
            <span className="federo-numeric">₹{taxDisplay.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
            <span>Total</span>
            <span className="federo-numeric">₹{(subtotalExclTax + taxDisplay + shippingCost - totalDiscountAmount).toFixed(0)}</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 p-4 bg-[#FFF2E1] rounded-lg">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#95522C]" />
            <span className="text-xl text-[#95522C] font-medium">Secure Checkout</span>
          </div>
          <span className="block text-lg text-[#95522C] mt-1">Your payment information is encrypted and secure.</span>
        </div>
      </div>
    </div>
  );

  // Show loading state while cart is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#95522C] mx-auto mb-4"></div>
          <span className="text-[#95522C] block">Loading your cart...</span>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-background rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 TEXT-[#95522C]" />
          </div>
          <span className="block text-2xl sm:text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</span>
          <span className="block text-[#95522C] mb-4">Thank you for your purchase. You will receive an email confirmation shortly.</span>

          {orderData && (
            <div className="mb-6 p-4 bg-[#95522C]/10 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Gift className="w-5 h-5 text-[#95522C]" />
                <span className="font-medium text-[#2B463C]">
                  Flaunt By Nishi Points Earned!
                </span>
              </div>
              <span className="block text-sm text-[#95522C] font-bold">+
                {Math.floor(
                  orderData.order.total *
                    (orderData.newTier === "bronze"
                      ? 0.1
                      : orderData.newTier === "silver"
                      ? 0.15
                      : 0.2)
                )} points
              </span>
              <span className="block text-xs text-[#95522C] mt-1">Current Tier: {orderData.newTier.charAt(0).toUpperCase() + orderData.newTier.slice(1)}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/order/${orderData?.data?.order?._id}`)}
              className="w-full bg-[#95522C] text-white px-6 py-3 rounded-lg hover:bg-[#2B463C] transition-colors"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full page processing overlay shown during post-payment verification
  if (processingOrder) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#95522C] mb-6" />
        <span className="text-4xl font-bold text-tertiary mb-8">Order Processing</span>
        <span className="block text-tertiary text-center max-w-lg">Do not refresh or go back — we are finalizing your payment and confirming your order.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8 mt-20">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center ${
                currentStep >= 1 ? "text-[#95522C]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-[#95522C] text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 2 ? "bg-[#95522C]" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                currentStep >= 2 ? "text-[#95522C]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-[#95522C] text-white" : "bg-gray-200"
                }`}
              >
                {currentStep > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 3 ? "bg-[#95522C]" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                currentStep >= 3 ? "text-[#95522C]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? "bg-[#95522C] text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-12 h-12 text-gray-400" />
                </div>
                <span className="block text-xl sm:text-xl font-bold text-gray-900 mb-2">Your cart is empty</span>
                <span className="block text-[#95522C] mb-6">Add some products to your cart to continue with checkout.</span>
                <button
                  onClick={() => navigate("/")}
                  className="bg-[#95522C] text-white px-6 py-3 rounded-lg hover:bg-[#2B463C] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-background rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <MapPin className="w-6 h-6 text-[#95522C] mr-3" />
                      <span className="block text-3xl sm:text-3xl font-bold text-gray-900">
                        <span className="bg-tertiary bg-clip-text text-transparent">Shipping Address</span>
                      </span>
                    </div>
                  </div>

                  {loadingProfile && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#95522C]"></div>
                        <span className="text-sm text-blue-700">
                          Loading your saved address...
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xl font-medium text-[#95522C] mb-2">
                        First Name
                      </label>
                      <input
                        required
                        name="firstName"
                        placeholder="Enter first name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.firstName}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div>
                      <label className="block text-xl font-medium text-[#95522C] mb-2">
                        Last Name
                      </label>
                      <input
                        required
                        name="lastName"
                        placeholder="Enter last name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.lastName}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div>
                      <label className="block text-xl font-medium text-[#95522C]-700 mb-2">
                        Email
                      </label>
                      <input
                        required
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.email}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div>
                      <label className="block text-xl font-medium text-[#95522C]-700 mb-2">
                        Phone
                      </label>
                      <input
                        required
                        name="phone"
                        placeholder="Enter phone number"
                        inputMode="numeric"
                        pattern="\d{10}"
                        maxLength={10}
                        className="w-full border border-gray-300 federo-numeric rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.phone}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xl font-medium text-[#95522C]-700 mb-2">
                        Street Address
                      </label>
                      <input
                        required
                        name="street"
                        placeholder="Enter street address"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.street}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div>
                      <label className="block text-xl font-medium text-[#95522C]-700 mb-2">
                        City
                      </label>
                      <input
                        required
                        name="city"
                        placeholder="Enter city"
                        inputMode="text"
                        pattern="[A-Za-z\s\-']+"
                        maxLength={60}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.city}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div>
                      <label className="block text-xl font-medium text-[#95522C]-700 mb-2">
                        State
                      </label>
                      <input
                        required
                        name="state"
                        placeholder="Enter state"
                        inputMode="text"
                        pattern="[A-Za-z\s\-']+"
                        maxLength={60}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.state}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div>
                      <label className="block text-xl font-medium text-[#95522C]-700 mb-2">
                        PIN Code
                      </label>
                      <input
                        required
                        name="zipCode"
                        placeholder="Enter PIN code"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.zipCode}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                    <div>
                      <label className="block text-xl font-medium text-[#95522C]-700 mb-2">
                        Country
                      </label>
                      <input
                        required
                        name="country"
                        placeholder="Enter country"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                        value={shipping.country}
                        onChange={(e) => handleInput(e, "shipping")}
                      />
                    </div>
                  </div>

                  {/* Save Address Option */}
                  {addressManuallyEntered && !userProfile?.address?.street && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="mt-1 rounded border-gray-300 focus:ring-2"
                          style={{ accentColor: "#95522C" }}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="saveAddress"
                            className="text-sm font-medium text-[#95522C] cursor-pointer"
                          >
                            Save this address to my profile
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            Your address will be saved and automatically filled for future orders
                          </p>
                        </div>
                      </div>
                      {saveAddress && (
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={savingAddress || !shipping.street || !shipping.city}
                          className="mt-3 w-full bg-[#95522C] text-white px-4 py-2 rounded-lg hover:bg-[#2B463C] transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                        >
                          {savingAddress ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>Save Address Now</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-background rounded-2xl shadow-sm p-6">
                  {savedAddresses && savedAddresses.length > 0 && (
                    <div className="w-full">
                      <div className="text-3xl font-bold text-[#95522C] mb-2">
                        Pick From Saved Addresses:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((a: any) => (
                          <button
                            type="button"
                            key={a.id}
                            onClick={() => handleSelectSavedAddress(a)}
                            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                          >
                            {a.label ||
                              `${a.firstName || ""} ${a.lastName || ""}`}{" "}
                            - {a.city}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Address */}
                <div className="bg-background rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <CreditCard className="w-6 h-6 text-[#95522C] mr-3" />
                      <span className="block text-3xl sm:text-3xl font-bold text-gray-900">
                        <span className="bg-tertiary bg-clip-text text-transparent">Billing Address</span>
                      </span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useSameAddress}
                        onChange={(e) => setUseSameAddress(e.target.checked)}
                        className="rounded border-gray-300 focus:ring-2"
                        style={{ accentColor: "#95522C" }}
                      />
                      <span className="ml-2 text-sm text-[#95522C]">
                        Same as shipping address
                      </span>
                    </label>
                  </div>

                  {!useSameAddress && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          required
                          name="firstName"
                          placeholder="Enter first name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.firstName}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          required
                          name="lastName"
                          placeholder="Enter last name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.lastName}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          required
                          name="email"
                          type="email"
                          placeholder="Enter email address"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.email}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          required
                          name="phone"
                          placeholder="Enter phone number"
                          inputMode="numeric"
                          pattern="\d{10}"
                          maxLength={10}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.phone}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          required
                          name="street"
                          placeholder="Enter street address"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.street}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          required
                          name="city"
                          placeholder="Enter city"
                          inputMode="text"
                          pattern="[A-Za-z\s\-']+"
                          maxLength={60}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.city}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          required
                          name="state"
                          placeholder="Enter state"
                          inputMode="text"
                          pattern="[A-Za-z\s\-']+"
                          maxLength={60}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.state}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          required
                          name="zipCode"
                          placeholder="Enter ZIP code"
                          inputMode="numeric"
                          pattern="\d{6}"
                          maxLength={6}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.zipCode}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          required
                          name="country"
                          placeholder="Enter country"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                          value={billing.country}
                          onChange={(e) => handleInput(e, "billing")}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* On mobile: show Order Summary before Payment Method */}
                <div className="lg:hidden">
                  <OrderSummary />
                </div>

                {/* Payment Method */}
                <div className="bg-background rounded-2xl shadow-md p-6">
                  <div className="flex items-center mb-6">
                    <CreditCard className="w-6 h-6 text-[#95522C] mr-3" />
                    <span className="block text-3xl sm:text-3xl font-bold text-gray-900">
                      <span className="bg-tertiary bg-clip-text text-transparent">Payment Method</span>
                    </span>
                  </div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95522C] focus:border-transparent"
                  >
                    <option value="razorpay">
                      Pay with Razorpay (UPI, Card, Wallet)
                    </option>
                  </select>

                  {/* {paymentMethod === "razorpay" && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-2">
                          🧪 Test Mode - Use these Indian test credentials:
                        </div>
                        <div className="space-y-2 text-blue-700">
                          <div className="font-medium">Credit/Debit Cards:</div>
                          <div className="ml-2 space-y-1">
                            <div>• Visa: 4111 1111 1111 1111</div>
                            <div>• MasterCard: 5555 5555 5555 4444</div>
                            <div>• Rupay: 6076 6200 0000 0007</div>
                            <div>• Exp: Any future date (12/25), CVV: 123</div>
                          </div>
                          <div className="font-medium mt-2">
                            UPI (Recommended):
                          </div>
                          <div className="ml-2">
                            <div>
                              • success@razorpay (for successful payment)
                            </div>
                            <div>• fail@razorpay (for testing failure)</div>
                          </div>
                          <div className="font-medium mt-2">Net Banking:</div>
                          <div className="ml-2">
                            • Select any test bank from the list
                          </div>
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="font-medium mb-2">{error}</div>
                    {(error.includes("cancelled") ||
                      error.includes("International cards")) &&
                      paymentMethod === "razorpay" && (
                        <div className="text-sm mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          
                        </div>
                      )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#95522C] shadow-sm shadow-tertiary text-white py-4 rounded-lg font-semibold hover:bg-primary transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Place Order Securely</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Order Summary Sidebar (desktop only) */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-8">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
