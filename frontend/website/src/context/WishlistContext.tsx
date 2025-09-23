import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token from localStorage:', token ? 'Token exists' : 'No token found');
    console.log('🔑 Token length:', token?.length || 0);
    
    // Check all possible token keys in localStorage
    console.log('📦 All localStorage keys:', Object.keys(localStorage));
    
    // Try different possible token keys
    const possibleTokens = [
      localStorage.getItem('token'),
      localStorage.getItem('authToken'), 
      localStorage.getItem('accessToken'),
      localStorage.getItem('jwt'),
      localStorage.getItem('userToken')
    ];
    
    console.log('🔍 Checking possible token keys:', possibleTokens);
    
    return token
      ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };
  };

  const fetchWishlist = async () => {
    try {
      const config = getAuthConfig();
      console.log('📡 Fetching wishlist with config:', config);
      
      const res = await axios.get('https://ecommerce-fashion-app-som7.vercel.app/api/wishlist', config);
      setWishlist(res.data.wishlist.map((p: any) => p._id));
      console.log('✅ Wishlist fetched successfully:', res.data.wishlist.length, 'items');
    } catch (err: any) {
      console.error('❌ Error fetching wishlist:', err.response?.status, err.response?.data);
      setWishlist([]);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const config = getAuthConfig();
      console.log('➕ Adding to wishlist with config:', config);
      console.log('🆔 Product ID:', productId);
      
      const response = await axios.post(
        'https://ecommerce-fashion-app-som7.vercel.app/api/wishlist/add', 
        { productId }, 
        config
      );
      
      console.log('✅ Added to wishlist successfully:', response.data);
      await fetchWishlist();
    } catch (err: any) {
      console.error('❌ Error adding to wishlist:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        headers: err.config?.headers
      });
      
      if (err.response?.status === 401) {
        alert('Please log in to add items to your wishlist');
      } else {
        alert('Failed to add item to wishlist');
      }
      throw err;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const config = getAuthConfig();
      console.log('➖ Removing from wishlist with config:', config);
      
      await axios.post(
        'https://ecommerce-fashion-app-som7.vercel.app/api/wishlist/remove', 
        { productId }, 
        config
      );
      
      console.log('✅ Removed from wishlist successfully');
      await fetchWishlist();
    } catch (err: any) {
      console.error('❌ Error removing from wishlist:', err.response?.status, err.response?.data);
      
      if (err.response?.status === 401) {
        alert('Please log in to manage your wishlist');
      } else {
        alert('Failed to remove item from wishlist');
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};