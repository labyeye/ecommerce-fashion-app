import React from "react";
import HeroComponent from "../Home/Hero";
import ProductSlider from "../Home/ProductSlider";
import CategoryCards from "../Home/CategoryCards";
import CategorySlider from "../Home/CategorySlider";
import Features from "../Home/Features";
import useFadeOnScroll from "../ui/useFadeOnScroll";
import useRevealOnScroll from "../ui/useRevealOnScroll";

const HomePage: React.FC = () => {
  const heroFade = useFadeOnScroll<HTMLElement>();
  const categoryFade = useFadeOnScroll<HTMLElement>();
  const categoryReveal = useRevealOnScroll<HTMLElement>();
  const newArrivalsFade = useFadeOnScroll<HTMLElement>();
  const bestSellersFade = useFadeOnScroll<HTMLElement>();
  const featuresFade = useFadeOnScroll<HTMLElement>();

  return (
    <>
      <style>{`
        /* Mobile-only section scroll snap - apply to root scroll container */
        @media (max-width: 1023px) {
          html, body {
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
          .snap-section {
            scroll-snap-align: start;
            scroll-snap-stop: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }
        
        /* Desktop - disable snap */
        @media (min-width: 1024px) {
          html, body {
            scroll-snap-type: none;
          }
        }
        
        /* Smooth scroll for all */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="flex flex-col min-h-screen bg-background">
        <section
          ref={heroFade[0]}
          className={`w-full snap-section transition-all duration-700 ${
            heroFade[1]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <HeroComponent />
        </section>
        <section
          ref={newArrivalsFade[0]}
          className={`w-full snap-section transition-all duration-700 ${
            newArrivalsFade[1]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <ProductSlider type="new-arrivals" autoPlayInterval={6000} />
        </section>
        <section
          ref={categoryReveal[0]}
          className={`w-full snap-section transition-all duration-700 ${
            categoryReveal[1]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <CategorySlider />
        </section>
        <section
          ref={categoryFade[0]}
          className={`w-full snap-section transition-all duration-700 ${
            categoryFade[1]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <CategoryCards />
        </section>
        <section
          ref={bestSellersFade[0]}
          className={`w-full snap-section transition-all duration-700 ${
            bestSellersFade[1]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <ProductSlider type="best-sellers" autoPlayInterval={5500} />
        </section>

        <section
          ref={featuresFade[0]}
          className={`w-full snap-section transition-all duration-700 ${
            featuresFade[1]
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <Features />
        </section>

        {/* Shop Now CTA Section */}
        <section className="w-full py-12 sm:py-16 px-4 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#95522C] mb-4 sm:mb-6">
              Discover Your Style
            </h2>
            <p className="text-lg sm:text-xl text-[#95522C]/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Explore our complete collection of premium fashion pieces
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="bg-[#95522C] text-[#FFF2E1] px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold hover:bg-[#7a4222] transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Shop Now
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
