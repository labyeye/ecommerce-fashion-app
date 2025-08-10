import React, { useState, useEffect } from 'react';
import { getHomepageCategories, Category } from '../../services/categoryService';
import { ArrowRight } from 'lucide-react';

const CategoryCards: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback categories with beautiful designs
  const fallbackCategories: Category[] = [
    {
      _id: 'women-fashion',
      name: 'Women\'s Collection',
      slug: 'womens-collection',
      description: 'Elegant styles for the modern woman',
      isActive: true,
      sortOrder: 1,
      showInNavigation: true,
      showInDropdown: true,
      color: '#F4F1E9',
      image: {
        url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Women\'s Fashion'
      }
    },
    {
      _id: 'trending-now',
      name: 'Trending Now',
      slug: 'trending-now',
      description: 'Latest fashion trends and styles',
      isActive: true,
      sortOrder: 2,
      showInNavigation: true,
      showInDropdown: true,
      color: '#2B463C',
      image: {
        url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Trending Fashion'
      }
    }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getHomepageCategories();
        // Use categories from API
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        } else {
          // Use fallback categories if no categories from API
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error fetching homepage categories, using fallback:', error);
        // Use fallback categories on error
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="w-screen -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="grid grid-cols-2">
          {[1, 2].map((index) => (
            <div 
              key={index}
              className="h-[600px] bg-gray-200 animate-pulse flex items-center justify-center"
            >
              <div className="text-gray-400">Loading...</div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Ensure we have exactly 2 categories to display
  const displayCategories = categories.length >= 2 
    ? categories.slice(0, 2) 
    : categories.length === 1 
    ? [categories[0], fallbackCategories[1]] 
    : fallbackCategories.slice(0, 2);

  return (
    <section className="w-screen -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="grid grid-cols-2">
        {displayCategories.map((category, index) => (
          <div
            key={category._id}
            className={`
              relative h-[1600px] group cursor-pointer overflow-hidden
              ${index === 0 ? 'bg-gradient-to-br from-[#F4F1E9] to-[#E8E3D3]' : 'bg-gradient-to-br from-[#2B463C] to-[#1A2D23]'}
            `}
            onClick={() => {
              // Navigate to category page or products page
              if (category.slug === 'womens-collection') {
                window.location.href = '/shop';
              } else if (category.slug === 'trending-now') {
                window.location.href = '/shop';
              } else {
                window.location.href = `/category/${category.slug}`;
              }
            }}
          >
            {/* Background Image */}
            {category.image?.url && (
              <div className="absolute inset-0">
                <img
                  src={category.image.url}
                  alt={category.image.alt || category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Hide image on error and show gradient background
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  loading="lazy"
                />
                <div className={`absolute inset-0 ${index === 0 ? 'bg-black/30' : 'bg-black/40'} group-hover:bg-black/50 transition-colors duration-300`} />
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
              {/* Category Icon */}
              {category.icon && (
                <div className="mb-6">
                  <div 
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-2xl
                      ${index === 0 ? 'bg-white/20 text-[#2B463C]' : 'bg-white/20 text-white'}
                      group-hover:scale-110 transition-transform duration-300
                    `}
                  >
                    {category.icon}
                  </div>
                </div>
              )}

              {/* Category Name */}
              <h3 className={`
                text-3xl sm:text-4xl font-bold mb-4 
                ${index === 0 ? 'text-[#2B463C]' : 'text-white'}
                group-hover:scale-105 transition-transform duration-300
              `}>
                {category.name}
              </h3>

              {/* Category Description */}
              {category.description && (
                <p className={`
                  text-lg mb-8 max-w-xs leading-relaxed
                  ${index === 0 ? 'text-[#2B463C]/80' : 'text-white/90'}
                `}>
                  {category.description}
                </p>
              )}

              {/* Shop Button */}
              <button className={`
                flex items-center space-x-2 px-8 py-3 rounded-full font-medium transition-all duration-300
                ${index === 0 
                  ? 'bg-[#2B463C] text-white hover:bg-[#1A2D23] hover:shadow-lg' 
                  : 'bg-white text-[#2B463C] hover:bg-gray-100 hover:shadow-lg'
                }
                group-hover:scale-105 transform
              `}>
                <span>Shop {category.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              {/* Decorative Elements */}
              <div className={`
                absolute top-6 right-6 w-12 h-12 rounded-full opacity-20
                ${index === 0 ? 'bg-[#2B463C]' : 'bg-white'}
                group-hover:scale-150 transition-transform duration-700
              `} />
              <div className={`
                absolute bottom-6 left-6 w-8 h-8 rounded-full opacity-30
                ${index === 0 ? 'bg-[#688F4E]' : 'bg-white'}
                group-hover:scale-125 transition-transform duration-500 delay-100
              `} />
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryCards;
