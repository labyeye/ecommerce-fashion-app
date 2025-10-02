import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import axios from "axios";

interface Review {
  id: number;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

const Reviews: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("https://ecommerce-fashion-app-som7.vercel.app/api/reviews?limit=12");
      const data = res.data && res.data.data ? res.data.data : [];
      // Transform server reviews into local shape
      const formatted = data.map((r: any, idx: number) => ({
        id: r._id || idx,
        name: r.name,
        role: "",
        comment: r.message,
        rating: r.rating,
      }));
      setReviews(formatted);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [refreshKey]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto slide every 3 seconds - infinite rotation
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Get the reviews to display (3 at a time) - infinite rotation
  const getVisibleReviews = () => {
    if (!reviews || reviews.length === 0) return [];

    const visibleReviews = [];
    const count = Math.min(5, reviews.length);
    for (let i = 0; i < count; i++) {
      const index = (currentIndex + i) % reviews.length;
      const item = reviews[index];
      if (item) visibleReviews.push(item);
    }
    return visibleReviews;
  };

  // Ensure currentIndex stays within bounds when reviews length changes
  useEffect(() => {
    if (!reviews || reviews.length === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((ci) => ci % reviews.length);
  }, [reviews.length]);

  return (
    <div className="relative max-w-7.5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="text-center mb-0 max-w-8xl mx-auto">
        <h2 className="text-6xl sm:text-6xl font-bold mb-14">
          <span className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
            What Our Customers Say
          </span>
        </h2>
      </div>
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {getVisibleReviews().map((review, index) => (
            <div
              key={`${review.id}-${currentIndex}-${index}`}
              className={`bg-white/90 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-105 hover:bg-white/95 transform ${
                isTransitioning
                  ? "opacity-50 scale-95"
                  : "opacity-100 scale-100"
              } animate-slide-in-up`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: "600ms",
              }}
            >
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-[#tertiary] mb-3 sm:mb-4 animate-pulse" />
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 italic mb-4 sm:mb-6 flex-grow leading-relaxed">
                "{review.comment}"
              </p>
              <div className="flex items-center justify-between">
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <p className="font-semibold text-sm sm:text-base text-[#2B463C]">
                    {review.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {review.role}
                  </p>
                </div>
                <div
                  className="flex animate-fade-in-up"
                  style={{ animationDelay: "300ms" }}
                >
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                        i < review.rating
                          ? "text-yellow-400 scale-110"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 hover:scale-125 ${
              currentIndex === index
                ? "bg-tertiary scale-110"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-[#688F4E] hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isTransitioning}
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-[#688F4E] hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isTransitioning}
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default Reviews;
