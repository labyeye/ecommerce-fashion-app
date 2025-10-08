import HeroComponent from "../Home/Hero";
import ProductSlider from "../Home/ProductSlider";
import CategoryCards from "../Home/CategoryCards";
import CategorySlider from "../Home/CategorySlider";
import Features from "../Home/Features";
import Reviews from "../Home/Review";
import useFadeOnScroll from "../ui/useFadeOnScroll";
import useRevealOnScroll from "../ui/useRevealOnScroll";

const HomePage = () => {
  const heroFade = useFadeOnScroll<HTMLElement>();
  const categoryFade = useFadeOnScroll<HTMLElement>();
  const categoryReveal = useRevealOnScroll<HTMLElement>();
  const newArrivalsFade = useFadeOnScroll<HTMLElement>();
  const bestSellersFade = useFadeOnScroll<HTMLElement>();
  const featuresFade = useFadeOnScroll<HTMLElement>();
  const reviewsFade = useFadeOnScroll<HTMLElement>();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section
        ref={heroFade[0]}
        className={`w-full transition-all duration-700 ${
          heroFade[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <HeroComponent />
      </section>
      <section
        ref={newArrivalsFade[0]}
        className={`w-full transition-all duration-700 ${
          newArrivalsFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <ProductSlider type="new-arrivals" autoPlayInterval={6000} />
      </section>
      <section
        ref={categoryReveal[0]}
        className={`w-full transition-all duration-700 ${
          categoryReveal[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <CategorySlider />
      </section>
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
      <section
        ref={bestSellersFade[0]}
        className={`w-full  transition-all duration-700 ${
          bestSellersFade[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <ProductSlider type="best-sellers" autoPlayInterval={5500} />
      </section>

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
    </div>
  );
};

export default HomePage;
