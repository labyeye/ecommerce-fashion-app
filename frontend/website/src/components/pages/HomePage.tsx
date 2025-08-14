import HeroComponent from "../Home/Hero";
import ProductSlider from "../Home/ProductSlider";
import CategoryCards from "../Home/CategoryCards";
import Features from "../Home/Features";
import Reviews from "../Home/Review";

const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Hero Section */}
            <section className="w-full">
                <HeroComponent />
            </section>

            {/* Featured Products - Top Section */}
            <section className="w-full py-6 sm:py-8 lg:py-12">
                <ProductSlider type="featured" autoPlayInterval={5000} />
            </section>

            {/* Category Section */}
            <section className="w-full">
                <CategoryCards />
            </section>

            {/* New Arrivals Section */}
            <section className="w-full py-6 sm:py-8 lg:py-12">
                <ProductSlider type="new-arrivals" autoPlayInterval={6000} />
            </section>

            {/* Best Sellers Section */}
            <section className="w-full py-6 sm:py-8 lg:py-12">
                <ProductSlider type="best-sellers" autoPlayInterval={5500} />
            </section>

            {/* Features Section */}
            <section className="w-full">
                <Features />
            </section>

            {/* Reviews Section */}
            <section className="w-full">
                <Reviews />
            </section>
        </div>
    );

};

export default HomePage;