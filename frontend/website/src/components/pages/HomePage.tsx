import HeroComponent from "../Home/Hero";
import ProductSlider from "../Home/ProductSlider";
import CategoryCards from "../Home/CategoryCards";
import CategorySlider from "../Home/CategorySlider";
import Features from "../Home/Features";
import Reviews from "../Home/Review";
import useFadeOnScroll from "../ui/useFadeOnScroll";
import useRevealOnScroll from "../ui/useRevealOnScroll";

const HomePage = () => {
  // Fade hooks for each section
  const heroFade = useFadeOnScroll<HTMLElement>();
  const featuredFade = useFadeOnScroll<HTMLElement>();
  const categoryFade = useFadeOnScroll<HTMLElement>();
  // Reveal hook for the slider so it animates once and stays visible
  const categoryReveal = useRevealOnScroll<HTMLElement>();
  const newArrivalsFade = useFadeOnScroll<HTMLElement>();
  const bestSellersFade = useFadeOnScroll<HTMLElement>();
  const featuresFade = useFadeOnScroll<HTMLElement>();
  const reviewsFade = useFadeOnScroll<HTMLElement>();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section
        ref={heroFade[0]}
        className={`w-full transition-all duration-700 ${
          heroFade[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <HeroComponent />
      </section>

      {/* Category Slider - Shop by Category (immediately after Hero) */}
      <section
        ref={categoryReveal[0]}
        className={`w-full transition-all duration-700 ${
          categoryReveal[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <CategorySlider />
      </section>

      {/* Featured Products - Top Section */}
      <section
        ref={featuredFade[0]}
        className={`w-full py-6 sm:py-8 lg:py-12 transition-all duration-700 ${
          featuredFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <ProductSlider type="featured" autoPlayInterval={5000} />
      </section>

      {/* Category Section */}
      <section
        ref={categoryFade[0]}
        className={`w-full transition-all duration-700 ${
          categoryFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <CategoryCards />
      </section>

      {/* New Arrivals Section */}
      <section
        ref={newArrivalsFade[0]}
        className={`w-full py-6 sm:py-8 lg:py-12 transition-all duration-700 ${
          newArrivalsFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <ProductSlider type="new-arrivals" autoPlayInterval={6000} />
      </section>

      {/* Best Sellers Section */}
      <section
        ref={bestSellersFade[0]}
        className={`w-full py-6 sm:py-8 lg:py-12 transition-all duration-700 ${
          bestSellersFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <ProductSlider type="best-sellers" autoPlayInterval={5500} />
      </section>

      {/* Features Section */}
      <section
        ref={featuresFade[0]}
        className={`w-full transition-all duration-700 ${
          featuresFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <Features />
      </section>

      {/* Reviews Section */}
      <section
        ref={reviewsFade[0]}
        className={`w-full transition-all duration-700 ${
          reviewsFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <Reviews />
      </section>
    </div>
  );
};

export default HomePage;
