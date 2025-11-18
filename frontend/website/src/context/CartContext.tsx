import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  isLoading: boolean;
  promoCode: PromoCodeData | null;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  promoCodeLoading: boolean;
  promoCodeError: string | null;
  evolvPointsRedemption: EvolvPointsData | null;
  applyEvolvPoints: (pointsToRedeem: number) => Promise<void>;
  removeEvolvPoints: () => void;
  evolvPointsLoading: boolean;
  evolvPointsError: string | null;
  userEvolvPoints: number;
  fetchUserEvolvPoints: () => Promise<void>;
}

interface EvolvPointsData {
  pointsToRedeem: number;
  discountAmount: number;
  availablePoints: number;
  finalTotal: number;
}

interface PromoCodeData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
}
interface CartItem {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState<PromoCodeData | null>(null);
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [evolvPointsRedemption, setEvolvPointsRedemption] = useState<EvolvPointsData | null>(null);
  const [evolvPointsLoading, setEvolvPointsLoading] = useState(false);
  const [evolvPointsError, setEvolvPointsError] = useState<string | null>(null);
  const [userEvolvPoints, setUserEvolvPoints] = useState<number>(0);

  // Initialize cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        const parsedItems = JSON.parse(stored);
        setCartItems(Array.isArray(parsedItems) ? parsedItems : []);
      }
    } catch (error) {
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever cartItems change
  useEffect(() => {
    if (!isLoading) { // Only save after initial load
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (error) {
      }
    }
  }, [cartItems, isLoading]);

  // Example cart context update
  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i =>
        i.id === item.id && i.size === item.size && i.color === item.color
      );

      if (existingItem) {
        return prev.map(i =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(cartItemId);
    } else {
      setCartItems((items) =>
        items.map((item) =>
          `${item.id}-${item.size}-${item.color}` === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeItem = (cartItemId: string) => {
    setCartItems((items) =>
      items.filter((item) => `${item.id}-${item.size}-${item.color}` !== cartItemId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode(null);
    setEvolvPointsRedemption(null);
  };

  // Calculate cart totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const applyPromoCode = async (code: string) => {
    setPromoCodeLoading(true);
    setPromoCodeError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to apply promo codes');
      }

      const subtotal = calculateSubtotal();
      const items = cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      }));

      const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/customer/validate-promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          orderValue: subtotal,
          items
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply promo code');
      }

      setPromoCode(data.data);
    } catch (error: any) {
      setPromoCodeError(error.message);
      throw error;
    } finally {
      setPromoCodeLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setPromoCodeError(null);
  };

  // Fetch user's current Evolv points
  const fetchUserEvolvPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/customer/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserEvolvPoints(data.data.evolvPoints || 0);
      }
    } catch (error) {
    }
  };

  const applyEvolvPoints = async (pointsToRedeem: number) => {
    setEvolvPointsLoading(true);
    setEvolvPointsError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to redeem Evolv points');
      }

      // Clear promo code if applied (mutual exclusivity)
      if (promoCode) {
        setPromoCode(null);
        setPromoCodeError(null);
      }

      const subtotal = calculateSubtotal();

      const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/customer/validate-evolv-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pointsToRedeem,
          orderValue: subtotal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply Evolv points');
      }

      setEvolvPointsRedemption(data.data);
      setUserEvolvPoints(data.data.availablePoints - data.data.pointsToRedeem);
    } catch (error: any) {
      setEvolvPointsError(error.message);
      throw error;
    } finally {
      setEvolvPointsLoading(false);
    }
  };

  const removeEvolvPoints = () => {
    setEvolvPointsRedemption(null);
    setEvolvPointsError(null);
    fetchUserEvolvPoints(); // Refresh user points
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isLoading,
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
        fetchUserEvolvPoints
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};