import React, { useState, useEffect } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { Heart, Lock, Star } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoyaltyTier, canAccessTier } from "../../hooks/useLoyaltyTier";

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  salePrice?: number;
  sku?: string;
  category?: string;
  brand?: string;
  sizes: Array<{
    size: string;
    stock: number;
    price: number;
  }>;
  colors: Array<{
    name: string;
    hexCode: string;
    images?: Array<{
      url: string;
      alt?: string;
    }>;
    stock: number;
  }>;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  material?: string;
  careInstructions?: string;
  fit?: "slim" | "regular" | "loose" | "oversized";
  tags?: string[];
  status?: "active" | "inactive" | "draft";
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
  minLoyaltyTier?: "bronze" | "silver" | "gold";
  ratings?: {
    average: number;
    count: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ProductCardProps {
  product: Product;
  viewDetailsLink?: string;
  cardClassName?: string;
  hidePromoBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewDetailsLink,
  cardClassName,
  hidePromoBadge,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [localWishlisted, setLocalWishlisted] = useState(false);
  const [reviewsCount, setReviewsCount] = useState<number | null>(null);
  const [reviewsAvg, setReviewsAvg] = useState<number | null>(null);
  useEffect(() => {
    setLocalWishlisted(!!product._id && wishlist.includes(product._id));
  }, [wishlist, product._id]);

  // Fetch a small set of reviews to compute average/count when product.ratings is missing
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const fetchReviews = async () => {
      if (!product._id) return;

      // If product already has ratings metadata, prefer that and avoid extra fetch
      if (product.ratings && product.ratings.count > 0) {
        setReviewsCount(product.ratings.count);
        setReviewsAvg(product.ratings.average);
        return;
      }

      try {
        // Fetch recent reviews (limit small to reduce payload). Use absolute backend URL
        // to match other pages which use `https://backend.flauntbynishi.com`.
        const res = await axios.get(
          `https://backend.flauntbynishi.com/api/reviews?productId=${product._id}&limit=20`,
          { timeout: 8000 }
        );
        const data = res?.data || {};
        if (!mounted) return;
        const arr = Array.isArray(data.data) ? data.data : [];
        if (arr.length === 0) {
          setReviewsCount(0);
          setReviewsAvg(null);
          return;
        }

        // Compute average rating from fetched reviews
        const sum = arr.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0);
        const avg = sum / arr.length;
        setReviewsCount(arr.length);
        setReviewsAvg(Number((avg || 0).toFixed(2)));
      } catch (e) {
        if ((e as any).name === 'AbortError') return;
        console.error('Failed to fetch reviews for product card', e);
        setReviewsCount(0);
        setReviewsAvg(null);
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [product._id, product.ratings]);

  const [toast, setToast] = useState<string | null>(null);
  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !product._id) return;
    try {
      if (localWishlisted) {
        // await backend removal and update context
        await removeFromWishlist(product._id);
        setToast("Removed from wishlist");
      } else {
        await addToWishlist(product._id);
        setToast("Added to wishlist");
      }
      // sync local state to context value (wishlist contains ids)
      setLocalWishlisted((prev) => !prev);
      // also notify other windows/components
      try {
        window.dispatchEvent(new CustomEvent("wishlist:refresh"));
      } catch (e) {}
    } catch (err) {
      console.error("Wishlist action failed", err);
    } finally {
      setTimeout(() => setToast(null), 2000);
    }
  };
  const userTier = useLoyaltyTier();
  const canAccess =
    !product.minLoyaltyTier || canAccessTier(userTier, product.minLoyaltyTier);

  const currentPrice = product.salePrice || product.price;
  const getProductImages = () => {
    const images = [];
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach((color) => {
        if (color.images && color.images.length > 0) {
          images.push(...color.images);
        }
      });
    }
    if (images.length === 0) {
      images.push(
        {
          url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          alt: product.name,
        },
        {
          url: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          alt: product.name,
        }
      );
    }
    return {
      primary: images[0],
      secondary: images[1] || images[0],
    };
  };

  const { primary, secondary } = getProductImages();

  const handleViewDetails = () => {
    if (!canAccess) {
      alert(
        `This product is only available for ${product.minLoyaltyTier} tier and above members`
      );
      return;
    }

    const productId = product._id || product.id || "";
    if (viewDetailsLink) {
      navigate(viewDetailsLink);
    } else {
      navigate(`/product/${productId}`);
    }
  };
  const isProductPage = location.pathname.startsWith("/product/");
  const defaultProductPageClass =
    isProductPage && !cardClassName
      ? "w-full sm:max-w-[480px] md:max-w-[640px] mx-auto"
      : "";

  return (
    <div
      className={`group relative bg-background transition-all duration-300 overflow-hidden ${
        isHovered ? " -translate-y-1" : ""
      } ${!canAccess ? "opacity-60" : ""} ${
        cardClassName || defaultProductPageClass
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {toast &&
        createPortal(
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2  shadow-lg z-50">
            {toast}
          </div>,
          document.body
        )}
      {!canAccess && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center p-4">
            <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-lg font-display font-medium text-primary">
              {product.minLoyaltyTier
                ? `${
                    product.minLoyaltyTier.charAt(0).toUpperCase() +
                    product.minLoyaltyTier.slice(1)
                  } Tier Only`
                : "Higher Tier Required"}
            </p>
            <p className="text-sm text-primary/70 mt-1">
              Upgrade your loyalty tier to access
            </p>
          </div>
        </div>
      )}
      <button
        className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-[#934E27] backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
        onClick={handleWishlist}
        disabled={!user}
        title={
          user
            ? localWishlisted
              ? "Remove from Wishlist"
              : "Add to Wishlist"
            : "Login to use wishlist"
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Heart: fill when wishlisted, outline otherwise. Use currentColor for fill. */}
        <Heart
          className={`w-5 h-5 transition-colors duration-300 ${
            localWishlisted ? "text-[#FFF2E1]" : isHovered ? "text-white" : "text-[#FFF2E1]"
          }`}
          fill={localWishlisted ? "currentColor" : "none"}
        />
      </button>
      <div
        className="relative aspect-[2/4] overflow-hidden bg-gray-50 cursor-pointer"
        onClick={handleViewDetails}
      >
        {!hidePromoBadge &&
          !isProductPage &&
          (product.isNewArrival || (product as any).category?.isNewArrival) && (
            <div className="absolute top-3 left-3 z-20 bg-[#934E27] text-[#FFF2E1] text-xs font-semibold uppercase px-2 py-1 rounded shadow">
              <p>New</p>
            </div>
          )}
        <img
          src={primary?.url}
          alt={primary?.alt || product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? "opacity-0" : "opacity-100"
          } group-hover:scale-105`}
        />
        <img
          src={secondary?.url}
          alt={secondary?.alt || product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          } group-hover:scale-105`}
        />
        {isHovered && (
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="w-full bg-background/95 backdrop-blur-sm text-tertiary font-bold py-3 font-display uppercase tracking-widest transition-all duration-300 hover:bg-background hover:text-secondary"
            >
              View Details
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 flex flex-row justify-between">
        <div className="flex flex-col">
          <div>
            <span
              className="block text-2xl sm:text-lg md:text-xl text-[#95522C] font-['Sans-Serif'] leading-tight hover:text-gray-800 transition-colors cursor-pointer"
              onClick={handleViewDetails}
            >
              {product.name}
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <span className="text-[#95522C] font-['Sans-Serif'] federo-numeric text-2xl sm:text-lg md:text-xl">
              ₹{currentPrice.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="flex space-x-1 mt-[2px]">
            {Array.from({ length: 5 }).map((_, i) => {
              // Prefer authoritative product.ratings when available, otherwise use fetched reviewsAvg
              const avgValue = (product.ratings && product.ratings.count > 0)
                ? product.ratings.average
                : (reviewsAvg ?? 0);
              const filled = Math.round(avgValue) >= i + 1;
              const hasReviews = (product.ratings && product.ratings.count > 0) || (reviewsCount && reviewsCount > 0);
              return (
                <Star
                  key={i}
                  fill={filled && hasReviews ? 'currentColor' : 'none'}
                  className={`w-4 h-4 ${
                    filled
                      ? hasReviews
                        ? 'text-tertiary'
                        : 'text-[#914D26]'
                      : 'text-[#C17237]'
                  }`}
                />
              );
            })}
          </div>
          <div className="text-md federo-numeric text-tertiary">
            ({(product.ratings && product.ratings.count) || reviewsCount || 0})
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
