import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Minimalist Fashion",
      subtitle: "Timeless elegance meets modern comfort"
    },
    {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Curated Collections",
      subtitle: "Discover your signature style"
    },
    {
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Sustainable Fashion",
      subtitle: "Conscious choices for a better tomorrow"
    },
    {
      image:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Essential Pieces",
      subtitle: "Build your capsule wardrobe"
    },
    {
      image:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "New Arrivals",
      subtitle: "Fresh styles for every season"
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="relative h-[70vh] md:h-[80vh] lg:h-[90vh] flex items-center justify-center overflow-hidden bg-fashion-cream"
    >
      {/* Decorative circular elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-fashion-nude/30 circle-element animate-float hidden md:block"></div>
      <div className="absolute bottom-32 right-16 w-24 h-24 bg-fashion-rose-dust/40 circle-element animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-fashion-sage/30 circle-element animate-soft-pulse hidden lg:block"></div>

      {/* Slider Container */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-fashion-charcoal/40 via-transparent to-fashion-charcoal/20"></div>
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`space-y-6 transition-all duration-1000 ${
                index === currentSlide
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10 absolute"
              }`}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-wide leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light tracking-wide max-w-2xl">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button className="fashion-button group flex items-center space-x-2">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="fashion-button-outline bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-fashion-charcoal">
                  Explore Lookbook
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/75 circle-element"
            } rounded-full`}
          />
        ))}
      </div>

      {/* Floating scroll indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/80 rounded-fashion flex justify-center backdrop-blur-sm bg-white/10">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-soft-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

