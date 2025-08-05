import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewDetailsLink
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

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
    const productId = product._id || product.id || '';
    if (viewDetailsLink) {
      navigate(viewDetailsLink);
    } else {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div
      className={`group relative bg-white transition-all duration-300 ${
        isHovered ? 'shadow-lg' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Heart Icon */}
      <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white group-hover:scale-110">
        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 hover:fill-red-500 transition-colors duration-300" />
      </button>

      {/* Product Image with Hover Effect */}
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer"
        onClick={handleViewDetails}
      >
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
              className="w-full bg-white/95 backdrop-blur-sm text-black py-3 text-sm font-medium tracking-wide transition-all duration-300 hover:bg-white"
            >
              QUICK SHOP
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 leading-tight hover:text-gray-700 transition-colors cursor-pointer" onClick={handleViewDetails}>
            {product.name}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-gray-900">
            ₹{currentPrice.toLocaleString()}
          </span>
          {hasDiscount && product.comparePrice && (
            <span className="text-base text-gray-500 line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;