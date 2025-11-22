import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import ProductCard from "../Home/ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  sizes?: Array<{ size: string; stock: number; price: number }>;
  colors?: Array<{
    name: string;
    hexCode: string;
    images?: Array<{ url: string; alt?: string }>;
    stock: number;
  }>;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
}

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get auth configuration
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return token
      ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const config = getAuthConfig();

        const res = await axios.get(
          "https://ecommerce-fashion-app-som7.vercel.app/api/wishlist",
          config
        );
        setWishlist(res.data.wishlist || []);
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : String(err);
        console.warn("Failed to fetch wishlist", text);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const config = getAuthConfig();

      await axios.post(
        "https://ecommerce-fashion-app-som7.vercel.app/api/wishlist/remove",
        { productId },
        config
      );

      // Update local state immediately for better UX
      setWishlist(wishlist.filter((p) => p._id !== productId));
    } catch (err: unknown) {
      const anyErr = err as any;
      if (anyErr?.response?.status === 401) {
        alert("Please log in to manage your wishlist");
      } else {
        const text = err instanceof Error ? err.message : String(err);
        alert(text || "Failed to remove item from wishlist");
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-64">
        Loading...
      </div>
    );
  if (!user)
    return (
      <div className="p-6 text-center">
        Please log in to view your wishlist.
      </div>
    );

  return (
    <div className="p-6 mt-20">
      <h1 className="text-3xl text-center font-bold mb-4">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No products in your wishlist.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((product) => {
            // Add safe defaults for missing fields
            const safeProduct = {
              ...product,
              description: product.description || "",
              sizes: product.sizes || [],
              colors: product.colors || [],
              // prefer color images; fall back to imageUrl if present
              images:
                product.colors &&
                product.colors.length > 0 &&
                product.colors[0].images &&
                product.colors[0].images.length > 0
                  ? product.colors[0].images
                  : product.images ||
                    (product.imageUrl
                      ? [{ url: product.imageUrl, alt: product.name }]
                      : []),
            };
            return (
              <div key={product._id} className="flex flex-col items-center">
                <ProductCard product={safeProduct} />
                <button
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={() => removeFromWishlist(product._id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
