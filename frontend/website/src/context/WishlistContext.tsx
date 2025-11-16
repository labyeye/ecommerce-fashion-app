import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return token
      ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };
  };

  const fetchWishlist = async () => {
    try {
      const config = getAuthConfig();

      const res = await axios.get("https://ecommerce-fashion-app-som7.vercel.app/api/wishlist", config);
      setWishlist(res.data.wishlist.map((p: any) => p._id));
    } catch (err: any) {
      console.error(
        "❌ Error fetching wishlist:",
        err.response?.status,
        err.response?.data
      );
      setWishlist([]);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const config = getAuthConfig();

      const response = await axios.post(
        "https://ecommerce-fashion-app-som7.vercel.app/api/wishlist/add",
        { productId },
        config
      );
      await fetchWishlist();
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Please log in to add items to your wishlist");
      } else {
        alert("Failed to add item to wishlist");
      }
      throw err;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const config = getAuthConfig();

      await axios.post(
        "https://ecommerce-fashion-app-som7.vercel.app/api/wishlist/remove",
        { productId },
        config
      );

      await fetchWishlist();
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Please log in to manage your wishlist");
      } else {
        alert("Failed to remove item from wishlist");
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
