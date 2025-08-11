import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard, { Product } from './ProductCard';

interface ProductSliderProps {
  type: 'featured' | 'new-arrivals' | 'best-sellers' | 'coming-soon';
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
    apiEndpoint: 'https://ecommerce-fashion-app.onrender.com/api/products?featured=true',
    emptyMessage: 'No featured products available yet'
  },
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'Fresh off the runway, straight to your wardrobe',
    apiEndpoint: 'https://ecommerce-fashion-app.onrender.com/api/products?isNewArrival=true',
    emptyMessage: 'New arrivals coming soon'
  },
  'best-sellers': {
    title: 'Best Sellers',
    description: 'Most loved by our fashion community',
    apiEndpoint: 'https://ecommerce-fashion-app.onrender.com/api/products?isBestSeller=true',
    emptyMessage: 'Stay tuned for our best sellers'
  },
  'coming-soon': {
    title: 'Coming Soon',
    description: 'Preview our upcoming collections',
    apiEndpoint: 'https://ecommerce-fashion-app.onrender.com/api/products?isComingSoon=true',
    emptyMessage: 'No upcoming products at the moment'
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
    return (
      <section className="w-screen py-16 bg-gradient-to-br from-background via-tertiary/20 to-background">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(visibleCount)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4] bg-primary/10 rounded-lg mb-4"></div>
                <div className="h-4 bg-primary/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-primary/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-screen py-16 bg-gradient-to-br from-background via-tertiary/20 to-background ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary/80 font-body">{error}</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-screen py-16 bg-gradient-to-br from-background via-tertiary/20 to-background ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-display text-primary mb-4">{config.title}</h2>
          <p className="text-primary/80 font-body text-lg">{config.emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-screen py-16 bg-gradient-to-br from-background via-tertiary/20 to-background ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-display text-primary mb-4">
            {config.title}
          </h2>
          <p className="text-primary/80 font-body text-lg max-w-2xl mx-auto">
            {config.description}
          </p>
        </div>

        {/* Products Slider */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {getVisibleProducts().map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                className="transform transition-all duration-700 ease-in-out"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          {products.length > visibleCount && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              {[...Array(Math.ceil(products.length / visibleCount))].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * visibleCount)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / visibleCount) === index
                      ? 'bg-primary w-4'
                      : 'bg-primary/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
