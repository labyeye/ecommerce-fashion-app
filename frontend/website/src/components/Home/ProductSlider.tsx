import LoadingMountainSunsetBeach from "../ui/LoadingMountainSunsetBeach";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard, { Product } from './ProductCard';

interface ProductSliderProps {
  type: 'featured' | 'new-arrivals' | 'best-sellers';
  autoPlayInterval?: number;
}

interface SliderConfig {
  title: string;
  description: string;
  apiEndpoint: string;
  emptyMessage: string;
}

const sliderConfigs: Record<ProductSliderProps['type'], SliderConfig> = {
    'featured': {
    title: 'Featured Collection',
    description: 'Hand-picked favorites just for you',
    apiEndpoint: 'http://localhost:3500/api/products?featured=true',
    emptyMessage: 'No featured products available yet'
  },
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'Fresh off the runway, straight to your wardrobe',
    apiEndpoint: 'http://localhost:3500/api/products?isNewArrival=true',
    emptyMessage: 'New arrivals coming soon'
  },
  'best-sellers': {
    title: 'Best Sellers',
    description: 'Most loved by our fashion community',
    apiEndpoint: 'http://localhost:3500/api/products?isBestSeller=true',
    emptyMessage: 'Stay tuned for our best sellers'
  }
};

const ProductSlider = ({ type, autoPlayInterval = 4000 }: ProductSliderProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  // Reset current index when products change
  useEffect(() => {
    setCurrentIndex(0);
  }, [products]);

  const config = sliderConfigs[type];


  // Update visible count based on window size
  // Fetch products based on type
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(config.apiEndpoint);
        setProducts(response.data.data);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [config.apiEndpoint]);

  // Update visible count based on window size
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1280) setVisibleCount(5);
      else if (width >= 1024) setVisibleCount(4);
      else if (width >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!products || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= products.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [products, autoPlayInterval]);

  const getVisibleProducts = () => {
    if (!products || products.length === 0) return [];
    
    const visibleProducts = [];
    const totalProducts = products.length;
    
    for (let i = 0; i < visibleCount && i < totalProducts; i++) {
      const index = (currentIndex + i) % totalProducts;
      visibleProducts.push(products[index]);
    }
    
    return visibleProducts;
  };

  if (loading) {
  return <LoadingMountainSunsetBeach text="Loading products..." />;
  }

  if (error) {
    return (
      <section className="w-screen py-16 bg-gradient-to-br from-background via-tertiary/20 to-background ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-dark/80 font-body">{error}</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-screen py-16 bg-gradient-to-br from-background via-tertiary/20 to-background ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-dark text-4xl sm:text-5xl font-display text-[#2D2D2D] mb-4">{config.title}</h2>
          <p className="text-dark/80 font-body text-lg text-[#2D2D2D]">{config.emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-screen py-20 bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white">
      <div className="w-full px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#1A2D23] to-[#2B463C] bg-clip-text text-transparent">
              {config.title}
            </span>
          </h2>
          <p className="text-lg text-gray-800 max-w-2xl mx-auto">
            {config.description}
          </p>
        </div>

        {/* Products Slider - Full Screen Width */}
        <div className="w-full overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="max-w-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6 xl:gap-8">
              {getVisibleProducts().map((product, index) => (
                <div
                  key={`${product._id || product.id}-${currentIndex}-${index}`}
                  className="w-full transform transition-all duration-700 ease-in-out"
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-12 space-x-3">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * visibleCount)}
              className={`transition-all duration-300 rounded-full ${
                Math.floor(currentIndex / visibleCount) === index
                  ? 'w-8 h-3 bg-gradient-to-r from-[#1A2D23] to-[#2B463C]'
                  : 'w-3 h-3 bg-gray-700 hover:bg-gray-900'
              }`}
            />
          ))}
        </div>

        {/* Product Counter */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-800 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-gray-300">
            Showing {Math.min(getVisibleProducts().length, products.length)} of {products.length} products
            <span className="ml-2 text-[#2B463C]">• Auto-rotating</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
