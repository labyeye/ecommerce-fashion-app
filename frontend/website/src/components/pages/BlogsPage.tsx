import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  Tag,
  BookOpen,
  Share2,
  Loader2,
} from "lucide-react";
import {
  blogService,
  Blog,
  BlogListResponse,
} from "../../services/blogService";

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentPage, searchQuery]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        limit: 12,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      };

      const response: BlogListResponse = await blogService.getBlogs(filters);
      setBlogs(response.blogs);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError("Failed to fetch blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await blogService.getCategories();
      setCategories(cats);
    } catch (_err) {
      // ignore category load failure silently
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  if (loading && blogs.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFF2E1" }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#95522C] mx-auto mb-4" />
          <span className="text-lg block" style={{ color: "#95522C" }}>
            Loading blogs...
          </span>
        </div>
      </div>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white to-[#B1D182]/10 flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg text-red-600 mb-4">{error}</span>
          <button
            onClick={fetchBlogs}
            className="px-6 py-3 bg-[#A79277] text-white font-medium rounded-lg hover:bg-[#5a7a42] transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const featuredBlog = blogs.find((blog) => blog.isFeatured) || blogs[0];
  const regularBlogs = blogs.filter((blog) => blog !== featuredBlog);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF2E1" }}>
      <section
        className="py-8"
        style={{ backgroundColor: "rgba(255,242,225,0.8)" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: "rgba(149,82,44,0.15)",
                    boxShadow: "none",
                  }}
                />
                <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </form>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border ${
                selectedCategory === "all"
                  ? "bg-[#95522C] text-white"
                  : "bg-white text-[#95522C] hover:bg-[#95522C] hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">All</span>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                {blogs.length}
              </span>
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border ${
                  selectedCategory === category
                    ? "bg-[#95522C] text-white"
                    : "bg-white text-[#95522C] hover:bg-[#95522C] hover:text-white"
                }`}
              >
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {featuredBlog && (
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <span
              className="block text-2xl sm:text-3xl font-bold mb-8 text-center"
              style={{ color: "#95522C" }}
            >
              Featured Article
            </span>
            <article className="bg-white rounded-xl shadow-lg overflow-hidden group max-w-4xl mx-auto">
              <div className="relative overflow-hidden">
                <img
                  src={featuredBlog.featuredImage.url}
                  alt={featuredBlog.featuredImage.alt}
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#95522C] text-white text-xs px-3 py-1 rounded-full font-medium">
                    {featuredBlog.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(
                        featuredBlog.publishedAt || featuredBlog.createdAt
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatReadTime(featuredBlog.readTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{featuredBlog.views} views</span>
                  </div>
                </div>

                <span
                  className="block text-2xl sm:text-3xl font-bold mb-4 transition-colors duration-300"
                  style={{ color: "#95522C" }}
                >
                  {featuredBlog.title}
                </span>

                <span className="block text-gray-600 mb-6 text-lg leading-relaxed">
                  {featuredBlog.excerpt}
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10"
                      style={{
                        backgroundColor: "#95522C",
                        borderRadius: "9999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span className="text-white font-semibold text-sm">
                        {(featuredBlog.author?.name || "Unknown")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#2B463C]">
                        {featuredBlog.author?.name || "Unknown"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {featuredBlog.views} views
                      </span>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-2"
                    style={{ color: "#95522C" }}
                  >
                    <span className="text-sm font-medium">
                      Read Full Article
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Blogs Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <span
            className="block font-bold mb-8 text-center"
            style={{ color: "#95522C" }}
          >
            Latest Articles
          </span>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#A79277] mx-auto mb-4" />
              <span className="text-[#2B463C] block">Loading more articles...</span>
            </div>
          ) : regularBlogs.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-gray-500 text-lg block">No articles found.</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {regularBlogs.map((blog) => (
                  <article
                    key={blog._id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={blog.featuredImage.url}
                        alt={blog.featuredImage.alt}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#95522C] text-white text-xs px-3 py-1 rounded-full font-medium">
                          {blog.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatReadTime(blog.readTime)}</span>
                        </div>
                      </div>

                      <span
                        className="block text-xl font-bold mb-3 transition-colors duration-300"
                        style={{ color: "#95522C" }}
                      >
                        {blog.title}
                      </span>

                      <span className="block text-gray-600 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </span>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8"
                            style={{
                              backgroundColor: "#95522C",
                              borderRadius: "9999px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span className="text-white font-semibold text-xs">
                              {(blog.author?.name || "Unknown")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{ color: "#95522C" }}
                          >
                            {blog.author?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{blog.views}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          className="flex items-center gap-2"
                          style={{ color: "#95522C" }}
                        >
                          <span className="text-sm font-medium">Read More</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#A79277] transition-colors duration-300">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      style={{ borderColor: "rgba(149,82,44,0.15)" }}
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2" style={{ color: "#95522C" }}>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      style={{ borderColor: "rgba(149,82,44,0.15)" }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
    </div>
  );
};

export default BlogsPage;
