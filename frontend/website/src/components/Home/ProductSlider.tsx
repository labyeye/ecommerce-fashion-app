import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';

interface ProductSliderProps {
  products: Product[];
  title?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  products,
  title = "Featured Products",
  autoPlay = true,
  autoPlayInterval = 4000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex >= products.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, products.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? products.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex >= products.length - 1 ? 0 : currentIndex + 1);
  };

  const getVisibleProducts = () => {
    const visibleCount = 4;
    const visibleProducts = [];
    
    for (let i = 0; i < visibleCount && i < products.length; i++) {
      const index = (currentIndex + i) % products.length;
      visibleProducts.push(products[index]);
    }
    
    return visibleProducts;
  };

  if (products.length === 0) {
    return (
      <div className="w-full py-16 bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white">
        <div className="w-full max-w-none px-4 text-center">
          <p className="text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-20 bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-16 max-w-7xl mx-auto">
          <div className="text-center flex-1">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#2B463C] to-[#688F4E] bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our latest collection with auto-rotating showcase
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4 ml-8">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#2B463C] hover:text-[#688F4E] transition-colors bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[#688F4E] shadow-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevious}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center hover:bg-[#688F4E]/10 hover:border-[#688F4E] transition-all duration-300 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 text-[#2B463C]" />
              </button>
              
              <button
                onClick={goToNext}
                className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center hover:bg-[#688F4E]/10 hover:border-[#688F4E] transition-all duration-300 shadow-lg"
              >
                <ChevronRight className="w-5 h-5 text-[#2B463C]" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Slider - Full Width */}
        <div className="w-full overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-gradient-to-r from-[#2B463C] to-[#688F4E]'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Product Counter */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-gray-200">
            Showing {Math.min(getVisibleProducts().length, products.length)} of {products.length} products
            {isPlaying && <span className="ml-2 text-[#688F4E]">• Auto-rotating</span>}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;