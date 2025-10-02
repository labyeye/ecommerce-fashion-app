import React, { useEffect, useState } from "react";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  image?: { url?: string; alt?: string };
}

const CategoryCard: React.FC<{
  category: CategoryItem;
  onClick: () => void;
}> = ({ category, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white w-full rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
      role="button"
    >
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.image.alt || category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Overlay: visible on hover/focus for sm+ */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 sm:flex">
          <h3 className="text-white text-5xl sm:text-6xl font-semibold px-4 text-center">
            {category.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

const CategorySlider: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.debug("CategorySlider: fetching categories from API");
        const res = await fetch("https://ecommerce-fashion-app-som7.vercel.app/api/categories");
        if (!res.ok) {
          setError(`API responded with status ${res.status}`);
          console.warn("CategorySlider: non-ok response", res.status);
          return;
        }
        const data = await res.json();
        const list = (data.data || []).filter(
          (c: any) => c.isActive && c.showInNavigation && !c.parentCategory
        );
        console.debug("CategorySlider: fetched", list.length, "categories");
        setCategories(list);
      } catch (err: any) {
        console.error("Failed to load categories for slider", err);
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCardClick = (slug: string) => {
    window.location.href = `/products?category=${encodeURIComponent(slug)}`;
  };

  if (loading) {
    return (
      <div className="w-screen py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-center text-red-500">
            Failed to load categories: {error}
          </p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="w-screen py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">No categories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-8 w-screen bg-[#FCF4EA]">
      <div className="w-full px-4 sm:px-4 lg:px-6">
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-6xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
              Suitcase Staples Sorted
            </span>
          </h2>
          <p className="text-lg text-dark/80 max-w-2xl mx-auto">
            Discover our curated collection for your next
            adventure.
          </p>
        </div>

        <div>
          {/* Grid layout: 1 column on mobile, 2 on small/medium, 3 on large */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 px-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat._id}
                category={cat}
                onClick={() => handleCardClick(cat.slug)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
