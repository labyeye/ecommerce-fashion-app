import LoadingMountainSunsetBeach from "../ui/LoadingMountainSunsetBeach";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: {
    url: string;
    alt?: string;
  };
  featured: boolean;
  displayOrder: number;
}

const CategoryCards = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://ecommerce-fashion-app-som7.vercel.app/api/categories/featured');
        setCategories(response.data.data);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
  return <LoadingMountainSunsetBeach text="Loading categories..." />;
  }

  if (error) {
    return (
      <section className="w-screen py-16 bg-gradient-to-br from-background via-tertiary/20 to-background -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-primary/80 font-body">{error}</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 sm:py-12 md:py-16 bg-gradient-to-br from-background via-tertiary/20 to-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {categories.map((category) => (
            <div 
              key={category._id}
              className="group relative overflow-hidden rounded-lg sm:rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl"
            >
              <div className="aspect-[16/9] overflow-hidden bg-tertiary/20">
                {category.image ? (
                  <img
                    src={category.image.url}
                    alt={category.image.alt || category.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-primary/30 font-display text-xl sm:text-2xl">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-primary/20"></div>
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                <h1 className="font-display text-background mb-2 tracking-wide">
                  {category.name}
                </h1>
                {category.shortDescription && (
                  <p className="text-background/90 mb-4 max-w-md font-body text-lg">
                    {category.shortDescription}
                  </p>
                )}
                <Link 
                  to={`/category/${category.slug}`}
                  className="bg-background/90 backdrop-blur-sm text-primary w-fit px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 hover:bg-background group/btn font-display tracking-wide"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
