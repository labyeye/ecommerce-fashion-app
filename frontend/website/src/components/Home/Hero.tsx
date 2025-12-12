import LoadingMountainSunsetBeach from "../ui/LoadingMountainSunsetBeach";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import heroService, { Hero } from "../../services/heroService";

const HeroComponent: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchHeroes = async () => {
      try {
        setLoading(true);
        setError("");

        const heroData = await heroService.getActiveHeroes();

        if (isMounted) {
          setHeroes(heroData);
          setCurrentSlide(0);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load hero slides";
          console.error("Failed to fetch heroes:", err);
          setError(errorMessage);
          setHeroes([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHeroes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && heroes && heroes.length > 0 && autoPlay) {
      const currentHero = heroes[currentSlide];
      const duration = currentHero?.animationDuration || 4000;

      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroes.length);
      }, duration);

      return () => clearInterval(interval);
    }
  }, [heroes, currentSlide, autoPlay, loading]);

  if (loading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gray-100">
        <LoadingMountainSunsetBeach text="Loading..." />;
      </section>
    );
  }

  if (error || (!loading && (!heroes || heroes.length === 0))) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || "No Hero Slides Available"}
          </h2>
          <p className="text-gray-600">
            {error
              ? "Please try again later."
              : "Please check back soon for updates."}
          </p>
        </div>
      </section>
    );
  }

  const currentHero = heroes[currentSlide];

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const getHeroImage = (hero: Hero) => {
    return isMobile
      ? hero?.image?.mobile || hero?.image || { url: "", alt: "" }
      : hero?.image?.desktop || hero?.image || { url: "", alt: "" };
  };

  return (
    <section
      id="home"
      className="relative h-[85vh] sm:h-[85vh] md:h-[80vh] lg:h-[80vh] xl:h-[80vh] 2xl:h-[80vh] min-h-[600px] max-h-[1000px] flex items-center justify-center overflow-hidden mt-20"
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero Images"
    >
      <div
        className="absolute inset-0 w-full h-full"
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        {heroes.map((hero, index) => {
          const heroImage = getHeroImage(hero);

          if (!heroImage?.url) {
            return null;
          }

          return (
            <div
              key={hero._id}
              id={`hero-slide-${index}`}
              role="tabpanel"
              aria-label={`Slide ${index + 1} of ${heroes.length}`}
              aria-hidden={index !== currentSlide}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={heroImage.url}
                alt={heroImage.alt || `${hero.title} - ${hero.subtitle}`}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                  target.alt = "Fallback hero image";
                }}
              />
              <div className="sr-only">
                <h2>{hero.title}</h2>
                {hero.subtitle && <p>{hero.subtitle}</p>}
                {hero.description && <p>{hero.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="absolute inset-0 bg-black/30 pointer-events-none"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <span
              className="block text-4xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mt-36"
              style={{ color: currentHero?.textColor || "#ffffff" }}
            >
              {currentHero?.title}
            </span>

            <span
              className="block text-2xl sm:text-lg md:text-xl lg:text-2xl opacity-90 leading-relaxed mt-2"
              style={{ color: currentHero?.textColor || "#ffffff" }}
            >
              {currentHero?.subtitle}
            </span>

            {currentHero?.description && (
              <span
                className="block text-xl sm:text-sm md:text-base font-bold mt-2"
                style={{ color: currentHero?.textColor || "#ffffff" }}
              >
                {currentHero.description}
              </span>
            )}

            {currentHero?.ctaButton.enabled && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href={currentHero.ctaButton.link}
                  className="w-36 h-14 lg:h-10 lg:w-68 mx-auto flex items-center justify-center text-2xl sm:text-sm md:text-md lg:text-lg px-3 py-1 sm:px-4 sm:py-2 bg-[#FFF2E1] text-[#914D26] font-semibold rounded-full hover:bg-beige transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {currentHero.ctaButton.text}
                  <ArrowRight className="ml-2 mt-1 w-5 h-5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform text-[#914D26]" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {heroes.length > 1 && (
        <div
          className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2"
          role="tablist"
          aria-label="Hero slides navigation"
        >
          {heroes.map((hero, index) => (
            <button
              key={hero._id}
              onClick={() => handleSlideChange(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              role="tab"
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentSlide}
              aria-controls={`hero-slide-${index}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroComponent;
