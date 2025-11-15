import LoadingMountainSunsetBeach from "../ui/LoadingMountainSunsetBeach";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard, { Product } from "./ProductCard";

interface ProductSliderProps {
  type: "new-arrivals" | "best-sellers";
  autoPlayInterval?: number;
}

interface SliderConfig {
  title: string;
  description: string;
  apiEndpoint: string;
  emptyMessage: string;
}

const sliderConfigs: Record<ProductSliderProps["type"], SliderConfig> = {
  "new-arrivals": {
    title: "New Arrivals",
    description: "Fresh off the runway, straight to your wardrobe",
    apiEndpoint: "https://ecommerce-fashion-app-som7.vercel.app/api/products?isNewArrival=true",
    emptyMessage: "New arrivals coming soon",
  },
  "best-sellers": {
    title: "Timeless Styles",
    description: "Designed for Dreamers and Loved by Travelers",
    apiEndpoint: "https://ecommerce-fashion-app-som7.vercel.app/api/products?isBestSeller=true",
    emptyMessage: "Stay tuned for our best sellers",
  },
};

const ProductSlider = ({
  type,
  autoPlayInterval = 4000,
}: ProductSliderProps) => {
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
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(config.apiEndpoint);
        setProducts(response.data.data);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [config.apiEndpoint]);
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (type === "new-arrivals") {
        if (width >= 1024) setVisibleCount(5);
        else if (width >= 768) setVisibleCount(3);
        else if (width >= 640) setVisibleCount(2);
        else setVisibleCount(1);
      } else {
        if (width >= 1280) setVisibleCount(5);
        else if (width >= 1024) setVisibleCount(4);
        else if (width >= 640) setVisibleCount(2);
        else setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
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
      <section className="w-screen py-16 bg-[#FFF2E1] ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent font-body">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-screen py-16 bg-[#FFF2E1] ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent font-display mb-4">
            {config.title}
          </h1>
          <p className="text-dark font-body text-lg">{config.emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-screen py-10 bg-[#FFF2E1]">
      <div className="w-full px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h1 className="font-bold mb-6">
            <span className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
              {config.title}
            </span>
          </h1>
          <h6 className="text-2xl bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent max-w-2xl mx-auto">
            {config.description}
          </h6>
        </div>

        {/* Products Slider - Full Screen Width */}
        <div className="w-full overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="max-w-none">
            <div
              className={
                "grid grid-cols-1 gap-4 lg:gap-6 xl:gap-8 " +
                (type === "new-arrivals"
                  ? "sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5"
                  : "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5")
              }
            >
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
              className={`transition-all duration-300 ${
                Math.floor(currentIndex / visibleCount) === index
                  ? "w-1.5 h-1.5 bg-[#FFF2E1]"
                  : "w-1.5 h-1.5 bg-dark/60 hover:bg-dark"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
