import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
// axios not needed here; wishlist actions handled via context
import ProductCard from "../Home/ProductCard";
import { useWishlist } from "../../context/WishlistContext";
import { trackEvent } from "../../services/analyticsService";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistProducts, fetchWishlist, removeFromWishlist } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        await fetchWishlist();
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };

    init();
    // track wishlist page view
    try {
      if (user) trackEvent("page_view", "wishlist");
    } catch (e) {}
    // subscribe to refresh events so page updates when wishlist is changed elsewhere
    const onRefresh = () => fetchWishlist();
    window.addEventListener("wishlist:refresh", onRefresh as EventListener);
    return () =>
      window.removeEventListener(
        "wishlist:refresh",
        onRefresh as EventListener
      );
  }, [user, fetchWishlist]);

  // detect mobile viewport
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Removal handled by `removeFromWishlist` from context

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
    <div className="p-6 mt-20 bg-background">
      {isMobile && (
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full border border-tertiary bg-background"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      )}
      <span className="block text-5xl sm:text-5xl md:text-5xl lg:text-5xl text-center font-bold mb-4">My Wishlist</span>
      {wishlistProducts.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No products in your wishlist.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
          {wishlistProducts.map((product) => {
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
              <div key={product._id} className="flex flex-col items-start">
                <ProductCard
                  product={safeProduct}
                  // make product card smaller in wishlist
                  cardClassName="w-full max-w-[240px]"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="px-2 py-0.5 bg-tertiary text-white rounded hover:bg-tertiary/90 transition-colors text-sm"
                    onClick={() => removeFromWishlist(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
