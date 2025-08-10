import React, { useState, useEffect } from 'react';
import ProductCard, { Product } from './ProductCard';

interface ProductSliderProps {
  products: Product[];
  title?: string;
  autoPlayInterval?: number;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  products,
  title = "Featured Products",
  autoPlayInterval = 4000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

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
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= products.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [products.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getVisibleProducts = () => {
    const visibleProducts = [];
    
    for (let i = 0; i < visibleCount && i < products.length; i++) {
      const index = (currentIndex + i) % products.length;
      visibleProducts.push(products[index]);
    }
    
    return visibleProducts;
  };

  if (products.length === 0) {
    return (
      <div className="w-screen py-16 bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="w-full px-4 text-center">
          <p className="text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-screen py-20 bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-[#000000] bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our latest collection with auto-rotating showcase
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
      </div>
    </section>
  );
};

export default ProductSlider;