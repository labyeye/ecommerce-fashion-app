import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Lock } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoyaltyTier, canAccessTier } from '../../hooks/useLoyaltyTier';

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
  fit?: 'slim' | 'regular' | 'loose' | 'oversized';
  tags?: string[];
  status?: 'active' | 'inactive' | 'draft';
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
  minLoyaltyTier?: 'bronze' | 'silver' | 'gold';
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
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewDetailsLink
  , cardClassName
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [localWishlisted, setLocalWishlisted] = useState(false);
  useEffect(() => {
    setLocalWishlisted(!!product._id && wishlist.includes(product._id));
  }, [wishlist, product._id]);

  const [toast, setToast] = useState<string | null>(null);
  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !product._id) return;
    // Optimistic UI update
    if (localWishlisted) {
      setLocalWishlisted(false);
      setToast('Removed from wishlist');
      removeFromWishlist(product._id); // Don't await
    } else {
      setLocalWishlisted(true);
      setToast('Added to wishlist');
      addToWishlist(product._id); // Don't await
    }
    setTimeout(() => setToast(null), 2000);
  };
  const userTier = useLoyaltyTier();
  const canAccess = !product.minLoyaltyTier || canAccessTier(userTier, product.minLoyaltyTier);

  const currentPrice = product.salePrice || product.price;
  const hasDiscount = product.comparePrice && product.comparePrice > currentPrice;

  // Get first two images from database
  const getProductImages = () => {
    const images = [];
    
    // Add main product images
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }
    
    // Add color variant images from database
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach(color => {
        if (color.images && color.images.length > 0) {
          images.push(...color.images);
        }
      });
    }
    
    // If no images in database, show default images
    if (images.length === 0) {
      images.push(
        {
          url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt: product.name
        },
        {
          url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt: product.name
        }
      );
    }
    
    // Return only first 2 images
    return {
      primary: images[0],
      secondary: images[1] || images[0] // If only 1 image, use same for both
    };
  };

  const { primary, secondary } = getProductImages();

  const handleViewDetails = () => {
    if (!canAccess) {
      // Show upgrade prompt or message
      alert(`This product is only available for ${product.minLoyaltyTier} tier and above members`);
      return;
    }
    
    const productId = product._id || product.id || '';
    if (viewDetailsLink) {
      navigate(viewDetailsLink);
    } else {
      navigate(`/product/${productId}`);
    }
  };

  // If rendering on a product details page, and no explicit cardClassName is provided,
  // apply a slightly larger default max width so cards look bigger on the product page.
  const isProductPage = location.pathname.startsWith('/product/');
  // Larger default width on product pages: 480px on small, 640px on md and above
  const defaultProductPageClass = isProductPage && !cardClassName ? 'w-full sm:max-w-[480px] md:max-w-[640px] mx-auto' : '';

  return (
    <div
      className={`group relative bg-background transition-all duration-300 ${
        isHovered ? 'shadow-lg' : ''
      } ${!canAccess ? 'opacity-60' : ''} ${cardClassName || defaultProductPageClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {toast && createPortal(
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>,
        document.body
      )}
      {!canAccess && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center p-4">
            <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-lg font-display font-medium text-primary">
              {product.minLoyaltyTier ? `${product.minLoyaltyTier.charAt(0).toUpperCase() + product.minLoyaltyTier.slice(1)} Tier Only` : 'Higher Tier Required'}
            </p>
            <p className="text-sm text-primary/70 mt-1">
              Upgrade your loyalty tier to access
            </p>
          </div>
        </div>
      )}
      {/* Heart Icon for Wishlist */}
      <button
        className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-[#934E27] backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
        onClick={handleWishlist}
        disabled={!user}
        title={user ? (localWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist') : 'Login to use wishlist'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Heart
          className={`w-4 h-4 transition-colors duration-300
            ${localWishlisted || isHovered ? 'fill-[#FCF4EA] text-red-500' : 'text-[#FCF4EA]'}
          `}
        />
      </button>

      {/* Product Image with Hover Effect */}
      <div 
        className="relative aspect-[2/4] overflow-hidden bg-gray-50 cursor-pointer"
        onClick={handleViewDetails}
      >
        {/* New badge when product or category is marked new */}
        {(product.isNewArrival || (product as any).category?.isNewArrival) && (
          <div className="absolute top-3 left-3 z-20 bg-[#934E27] text-[#FCF4EA] text-xs font-semibold uppercase px-2 py-1 rounded shadow">
            New
          </div>
        )}
        {/* Primary Image */}
        <img
          src={primary?.url}
          alt={primary?.alt || product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          } group-hover:scale-105`}
        />
        
        {/* Secondary Image - shows on hover */}
        <img
          src={secondary?.url}
          alt={secondary?.alt || product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } group-hover:scale-105`}
        />
        
        {/* Quick Shop Button - appears on hover */}
        {isHovered && (
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="w-full bg-background/95 backdrop-blur-sm text-primary py-3 text-sm font-display uppercase tracking-widest transition-all duration-300 hover:bg-background hover:text-secondary"
            >
              View Details
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="text-lg text-[#95522C] font-['Sans-Serif'] leading-tight hover:text-gray-800 transition-colors cursor-pointer" onClick={handleViewDetails}>
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-[#95522C] font-['Sans-Serif']">
            ₹{currentPrice.toLocaleString()}
          </span>
          {hasDiscount && product.comparePrice && (
            <span className="text-base text-[#95522C] line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;