import { useState, useEffect } from "react";
import { getProducts, Product } from "../../services/productService";
import Hero from "../Home/Hero";
import ProductSlider from "../Home//ProductSlider";
import Features from "../Home/Features";
import Reviews from "../Home/Review";

const HomePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#688F4E] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading amazing products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-gradient-to-r from-[#2B463C] to-[#688F4E] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Hero />
            <ProductSlider 
                products={products} 
                title="Featured Collection"
                autoPlay={true}
                autoPlayInterval={5000}
            />
            <Features />
            <Reviews />
        </>
    );
}

export default HomePage;