import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import ProductCard from '../Home/ProductCard';
import { Product } from '../Home/ProductCard';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductsPageData {
  category?: Category;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const ProductPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [data, setData] = useState<ProductsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get category from URL params
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'createdAt';
  const orderParam = searchParams.get('order') || 'desc';

  useEffect(() => {
    fetchProducts();
  }, [categoryParam, searchQuery, currentPage, sortParam, orderParam]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = 'https://ecommerce-fashion-app.onrender.com/api/products';
      const params = new URLSearchParams();

      if (categoryParam) {
        // If category is provided, use the category-specific endpoint
        url = `https://ecommerce-fashion-app.onrender.com/api/products/category/${categoryParam}`;
      } else {
        // Use general products endpoint with filters
        if (searchQuery) params.append('search', searchQuery);
      }

      params.append('page', currentPage.toString());
      params.append('limit', '12');
      params.append('sort', sortParam);
      params.append('order', orderParam);

      const finalUrl = `${url}?${params.toString()}`;
      console.log('Fetching from:', finalUrl);

      const response = await fetch(finalUrl);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (sortBy: string, order: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortBy);
    newParams.set('order', order);
    window.history.pushState(null, '', `${location.pathname}?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageTitle = () => {
    if (data?.category) {
      return data.category.name;
    }
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    return 'All Products';
  };

  const getPageDescription = () => {
    if (data?.category?.description) {
      return data.category.description;
    }
    if (searchQuery) {
      return `Found ${data?.pagination?.total || 0} products matching your search`;
    }
    return 'Discover our complete collection of fashion items';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fashion-cream">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fashion-accent-brown"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fashion-cream">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-light text-fashion-charcoal mb-4">Oops!</h1>
            <p className="text-fashion-charcoal/70 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-fashion-accent-brown text-white px-6 py-3 rounded-fashion hover:bg-fashion-accent-brown/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fashion-cream">
      {/* Header Section */}
      <div className="bg-white border-b border-fashion-charcoal/10">
        <div className="container mx-auto px-4 py-16 text-center mt-10">
          <h1 className="text-4xl md:text-5xl font-light text-fashion-charcoal mb-4 tracking-wide">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-fashion-charcoal/70 max-w-2xl mx-auto">
            {getPageDescription()}
          </p>
          {data?.pagination && (
            <p className="text-sm text-fashion-charcoal/50 mt-4">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} products
            </p>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white border-b border-fashion-charcoal/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Category Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-fashion-charcoal/60">
              <a href="/" className="hover:text-fashion-accent-brown transition-colors">Home</a>
              <span>/</span>
              <a href="/products" className="hover:text-fashion-accent-brown transition-colors">Products</a>
              {data?.category && (
                <>
                  <span>/</span>
                  <span className="text-fashion-accent-brown font-medium">{data.category.name}</span>
                </>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-fashion-charcoal/70">Sort by:</span>
              <select
                value={`${sortParam}-${orderParam}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  handleSortChange(sort, order);
                }}
                className="px-3 py-1 border border-fashion-charcoal/20 rounded-fashion text-sm focus:outline-none focus:ring-2 focus:ring-fashion-accent-brown focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {data?.products && data.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {data.products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.pages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-fashion-charcoal/20 rounded-fashion text-fashion-charcoal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-fashion-accent-brown hover:text-white hover:border-fashion-accent-brown transition-colors"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-fashion transition-colors ${
                        page === currentPage
                          ? 'bg-fashion-accent-brown text-white border-fashion-accent-brown'
                          : 'border-fashion-charcoal/20 text-fashion-charcoal hover:bg-fashion-accent-brown hover:text-white hover:border-fashion-accent-brown'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === data.pagination.pages}
                    className="px-4 py-2 border border-fashion-charcoal/20 rounded-fashion text-fashion-charcoal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-fashion-accent-brown hover:text-white hover:border-fashion-accent-brown transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-light text-fashion-charcoal mb-4">No products found</h3>
            <p className="text-fashion-charcoal/70 mb-8">
              {data?.category
                ? `No products available in ${data.category.name} category`
                : 'No products match your current filters'}
            </p>
            <a
              href="/products"
              className="inline-block bg-fashion-accent-brown text-white px-6 py-3 rounded-fashion hover:bg-fashion-accent-brown/90 transition-colors"
            >
              View All Products
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;