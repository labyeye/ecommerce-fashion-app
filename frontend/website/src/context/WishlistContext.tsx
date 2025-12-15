import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface WishlistContextType {
  // list of product ids in wishlist (for quick includes checks)
  wishlist: string[];
  // full product objects fetched from server
  wishlistProducts: any[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return token
      ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };
  };

  const fetchWishlist = async () => {
    try {
      const config = getAuthConfig();

      const res = await axios.get(
        "https://backend.flauntbynishi.com/api/wishlist",
        config
      );
      const products = res.data.wishlist || [];
      setWishlistProducts(products);
      setWishlist(products.map((p: any) => p._id));
      // broadcast update so non-context consumers can react
      try {
        window.dispatchEvent(
          new CustomEvent("wishlist:updated", { detail: { products } })
        );
      } catch (e) {
        // ignore in non-browser environments
      }
    } catch (err: any) {
      setWishlistProducts([]);
      setWishlist([]);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const config = getAuthConfig();
      // optimistic update of ids
      setWishlist((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
      await axios.post(
        "https://backend.flauntbynishi.com/api/wishlist/add",
        { productId },
        config
      );
      // refresh full wishlist to keep products in sync
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
      // optimistic local removal
      setWishlist((prev) => prev.filter((id) => id !== productId));
      setWishlistProducts((prev) => prev.filter((p) => p._id !== productId));
      await axios.post(
        "https://backend.flauntbynishi.com/api/wishlist/remove",
        { productId },
        config
      );
      // ensure server state reflected locally
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
    // also listen for external updates (e.g. other tabs) to refresh
    const onUpdate = () => fetchWishlist();
    window.addEventListener("storage", onUpdate);
    window.addEventListener("wishlist:refresh", onUpdate as EventListener);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("wishlist:refresh", onUpdate as EventListener);
    };
  }, []);

  return (
    <WishlistContext.Provider
      value={{ wishlist, wishlistProducts, addToWishlist, removeFromWishlist, fetchWishlist }}
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
