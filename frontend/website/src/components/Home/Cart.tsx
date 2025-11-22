import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../context/CartContext";

export interface CartItem {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout?: () => void;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const {
    promoCode,
    applyPromoCode,
    removePromoCode,
    promoCodeLoading,
    promoCodeError,
    evolvPointsRedemption,
    applyEvolvPoints,
    removeEvolvPoints,
    evolvPointsLoading,
    evolvPointsError,
    userEvolvPoints,
    fetchUserEvolvPoints,
  } = useCartContext();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [evolvPointsInput, setEvolvPointsInput] = useState("");
  const [showEvolvPointsInput, setShowEvolvPointsInput] = useState(false);

  // Fetch user Evolv points when cart opens
  useEffect(() => {
    if (isOpen) {
      fetchUserEvolvPoints();
    }
  }, [isOpen, fetchUserEvolvPoints]);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 1000 ? 0 : 50;
  const promoDiscount = promoCode?.discountAmount || 0;
  const evolvDiscount = evolvPointsRedemption?.discountAmount || 0;
  const totalDiscount = promoDiscount + evolvDiscount;
  const total = subtotal + shipping - totalDiscount;
  const navigate = useNavigate();

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;

    try {
      await applyPromoCode(promoCodeInput.trim());
      setPromoCodeInput("");
      setShowPromoInput(false);
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleApplyEvolvPoints = async () => {
    const pointsToRedeem = parseInt(evolvPointsInput);
    if (!pointsToRedeem || pointsToRedeem <= 0) return;

    try {
      await applyEvolvPoints(pointsToRedeem);
      setEvolvPointsInput("");
      setShowEvolvPointsInput(false);
    } catch (error) {
      // Error is handled in context
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="fixed top-0 right-0 h-full w-full sm:w-[95%] md:w-[90%] max-w-md bg-background backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-tertiary">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ShoppingBag className="w-6 h-6 text-[#914D26]" />
            <span
              role="heading"
              aria-level={2}
              className="text-lg sm:text-xl md:text-2xl text-[#914D26] font-semibold"
            >
              Your Bag
            </span>
            <span
              className="text-[#914D26] text-lg px-0 py-0 rounded-full poppins-numeric"
              style={{
                fontVariantNumeric: "lining-nums",
                fontFeatureSettings: '"tnum"',
                WebkitFontVariantLigatures: "normal",
              }}
            >
              ({items.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tertiary  rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-tertiary hover:text-background" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-background" />
              </div>
              <span
                role="heading"
                aria-level={3}
                className="block text-lg sm:text-xl md:text-2xl font-bold text-[#914D26] mb-2"
              >
                Your Bag is empty
              </span>
              <span className="block text-sm sm:text-base md:text-lg text-[#914D26] mb-6">
                Add some stylish fashion items to get started!
              </span>
              <button
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
                className="bg-tertiary text-background px-8 py-3 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="bg-background backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-xl"
                  />

                  <div className="flex-1 min-w-0">
                    <span
                      role="heading"
                      aria-level={4}
                      className="block font-semibold text-[#914D26] truncate text-sm sm:text-base md:text-xl"
                    >
                      {item.name}
                    </span>
                    <span className="block text-xl md:text-lg sm:text-sm text-[#914D26]">
                      Size: {item.size}
                    </span>
                    <span className="block text-md sm:text-base md:text-lg text-[#914D26] poppins-numeric">
                      ₹{item.price}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          `${item.id}-${item.size}-${item.color}`,
                          Math.max(0, item.quantity - 1)
                        )
                      }
                      className="w-5 h-5 rounded-full border-2 border-tertiary hover:border-[#914D26] flex items-center justify-center transition-colors duration-200"
                    >
                      <Minus className="w-3 h-3 text-[#914D26]" />
                    </button>
                    <span
                      className="w-5 text-center font-semibold text-[#914D26] poppins-numeric"
                      style={{
                        fontVariantNumeric: "lining-nums",
                        fontFeatureSettings: '"tnum"',
                        WebkitFontVariantLigatures: "normal",
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          `${item.id}-${item.size}-${item.color}`,
                          item.quantity + 1
                        )
                      }
                      className="w-5 h-5 rounded-full border-2 border-tertiary hover:border-[#914D26] flex items-center justify-center transition-colors duration-200"
                    >
                      <Plus className="w-3 h-3 text-[#914D26]" />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      onRemoveItem(`${item.id}-${item.size}-${item.color}`)
                    }
                    className="p-2 text-tertiary hover:bg-red-50 rounded-full transition-colors duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-tertiary p-6 space-y-4">
            <div className="space-y-3">
              {!promoCode &&
                !evolvPointsRedemption &&
                !showPromoInput &&
                !showEvolvPointsInput && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowPromoInput(true)}
                      className="flex items-center space-x-2 text-[#914D26] hover:text-[#2B463C] transition-colors duration-200"
                    >
                      <Tag className="w-4 h-4" />
                      <p className="text-sm font-medium">Have a promo code?</p>
                    </button>

                    {userEvolvPoints > 0 && (
                      <button
                        onClick={() => setShowEvolvPointsInput(true)}
                        className="flex items-center space-x-2 text-[#914D26] hover:text-[#2B463C] transition-colors duration-200"
                      >
                        <Zap className="w-4 h-4" />
                        <p className="text-sm font-medium">
                          Redeem Flaunt By Nishi Points ({userEvolvPoints}{" "}
                          available)
                        </p>
                      </button>
                    )}
                  </div>
                )}

              {showPromoInput && !promoCode && !evolvPointsRedemption && (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) =>
                        setPromoCodeInput(e.target.value.toUpperCase())
                      }
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-tertiary rounded-lg focus:ring-2 focus:ring-[#914D26] focus:border-transparent text-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleApplyPromoCode()
                      }
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      disabled={promoCodeLoading || !promoCodeInput.trim()}
                      className="px-4 py-2 bg-[#914D26] text-background rounded-lg hover:bg-[#2B463C]  disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                    >
                      {promoCodeLoading ? "Loading..." : "Apply"}
                    </button>
                  </div>
                  {promoCodeError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{promoCodeError}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowPromoInput(false);
                      setPromoCodeInput("");
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* {showEvolvPointsInput && !promoCode && !evolvPointsRedemption && (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={evolvPointsInput}
                      onChange={(e) => setEvolvPointsInput(e.target.value)}
                      placeholder={`Enter points (max ${userEvolvPoints})`}
                      max={userEvolvPoints}
                      min="1"
                      className="flex-1 px-3 py-2 border border-tertiary rounded-lg focus:ring-2 focus:ring-[#914D26] focus:border-transparent text-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleApplyEvolvPoints()
                      }
                    />
                    <button
                      onClick={handleApplyEvolvPoints}
                      disabled={
                        evolvPointsLoading ||
                        !evolvPointsInput ||
                        parseInt(evolvPointsInput) <= 0
                      }
                      className="px-4 py-2 bg-[#914D26] text-background rounded-lg hover:bg-[#2B463C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                    >
                      {evolvPointsLoading ? "Loading..." : "Redeem"}
                    </button>
                  </div>
                  {evolvPointsError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{evolvPointsError}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    1 Evolv Point = ₹1 discount
                  </div>
                  <button
                    onClick={() => {
                      setShowEvolvPointsInput(false);
                      setEvolvPointsInput("");
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )} */}

              {promoCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {promoCode.code} applied
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {promoCode.description}
                  </p>
                </div>
              )}

              {/* {evolvPointsRedemption && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {evolvPointsRedemption.pointsToRedeem} Flaunt By Nishi
                        Points redeemed
                      </span>
                    </div>
                    <button
                      onClick={removeEvolvPoints}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    ₹{evolvPointsRedemption.discountAmount} discount applied
                  </p>
                </div>
              )} */}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[914D26">
                <span>Subtotal</span>
                <span className="poppins-numeric">₹{subtotal.toFixed(0)}</span>
              </div>

              {promoCode && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode.code})</span>
                  <span className="poppins-numeric">
                    -₹{promoDiscount.toFixed(0)}
                  </span>
                </div>
              )}

              {evolvPointsRedemption && (
                <div className="flex justify-between text-blue-600">
                  <span>Flaunt By Nishi Points Discount</span>
                  <span className="poppins-numeric">
                    -₹{evolvDiscount.toFixed(0)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[914D26">
                <span>Shipping</span>
                <span className="">
                  {shipping === 0 ? "To be Calculated" : `₹${shipping}`}
                </span>
              </div>

              {subtotal < 3000 && (
                <p className="text-sm text-[#914D26] pt-2">
                  Add{" "}
                  <span className="poppins-numeric">₹{3000 - subtotal}</span>{" "}
                  more for free shipping!
                </p>
              )}

              <div className="flex justify-between text-lg font-semibold text-[#914D26] pt-2 border-t border-tertiary">
                <span>Total</span>
                <span className="poppins-numeric">
                  ₹{Math.max(0, total).toFixed(0)}
                </span>
              </div>
            </div>

            <button
              className="w-full bg-[#914D26] text-background py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              onClick={() => {
                if (onProceedToCheckout) {
                  onProceedToCheckout();
                } else {
                  onClose();
                  navigate("/checkout");
                }
              }}
              disabled={items.length === 0}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
                className="text-[#914D26] hover:text-[#2B463C] font-medium transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
