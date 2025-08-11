import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { useFilteredProducts } from "../../hooks/useFilteredProducts";
import type { Product } from "../../services/productService";

const ProductGrid: React.FC = () => {
  const { products, loading, error } = useFilteredProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterOpen, setFilterOpen] = useState(false);
  const filteredProducts = useMemo(() => {
    if (loading || error || !products) return [];
    
    let filtered = products.filter(
      (product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.material && product.material.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) =>
            (a.salePrice || a.price) - (b.salePrice || b.price)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            (b.salePrice || b.price) - (a.salePrice || a.price)
        );
        break;
      case "name":
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  
    return filtered;
  }, [products, searchTerm, sortBy]);

  return (
    <section
      id="products"
      className="py-12 sm:py-20 bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 mt-6 sm:mt-10">
            <span className="bg-gradient-to-r from-[#2B463C] to-[#688F4E] bg-clip-text text-transparent">
              Our Products
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our range of delicious protein shakes, each crafted with
            25g of complete protein and zero added sugar. Choose your favorite
            or try them all!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12 shadow-lg border border-white/20">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Sort and Filter */}
            <div className="flex items-center gap-2 sm:gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent transition-all duration-300"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl hover:bg-[#688F4E]/10 hover:border-[#688F4E] transition-all duration-300"
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-5 h-5 text-[#2B463C]" />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2B463C]">
                    Category
                  </label>
                  <div className="space-y-1">
                    {[
                      "All",
                      "T-Shirts",
                      "Shirts", 
                      "Jeans",
                      "Sweaters",
                      "Chinos",
                    ].map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#688F4E] border-gray-300 rounded focus:ring-[#688F4E]"
                        />
                        <span className="text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2B463C]">
                    Size
                  </label>
                  <div className="space-y-1">
                    {["All", "XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                      <label
                        key={size}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#688F4E] border-gray-300 rounded focus:ring-[#688F4E]"
                        />
                        <span className="text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2B463C]">
                    Material
                  </label>
                  <div className="space-y-1">
                    {[
                      "All",
                      "Cotton",
                      "Denim",
                      "Polyester",
                      "Wool",
                      "Linen",
                    ].map((material) => (
                      <label
                        key={material}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#688F4E] focus:ring-[#688F4E]"
                        />
                        <span className="text-gray-700">{material}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2B463C]">
                    Pack Size
                  </label>
                  <div className="space-y-1">
                    {["Single", "6-Pack", "12-Pack", "24-Pack"].map((size) => (
                      <label
                        key={size}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#688F4E] focus:ring-[#688F4E]"
                        />
                        <span>{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2B463C]">
                    Price Range
                  </label>
                  <div className="space-y-1">
                    {[
                      "Under ₹500",
                      "₹500 - ₹1000",
                      "₹1000 - ₹2000",
                      "Over ₹2000",
                    ].map((range) => (
                      <label
                        key={range}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#688F4E] focus:ring-[#688F4E]"
                        />
                        <span>{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2B463C]">
                    Features
                  </label>
                  <div className="space-y-1">
                    {["High Protein", "No Sugar", "Caffeine", "Prebiotics"].map(
                      (feature) => (
                        <label
                          key={feature}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#688F4E] focus:ring-[#688F4E]"
                          />
                          <span>{feature}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product._id || product.id || index}
              className="transform transition-all duration-700"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              <ProductCard
                product={product}
                viewDetailsLink={`/product/${product._id || product.id}`}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-[#B1D182] to-[#688F4E] rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2B463C] mb-4">
              No products found
            </h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSortBy("name");
              }}
              className="bg-gradient-to-r from-[#2B463C] to-[#688F4E] text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;