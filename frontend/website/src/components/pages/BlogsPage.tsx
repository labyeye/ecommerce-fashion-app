import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, BookOpen, Loader2 } from "lucide-react";
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
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentPage, searchQuery]);

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
    // Accept null/undefined and invalid values gracefully.
    if (!dateString) return "Unknown Date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown Date";

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
        className="py-28"
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
                  : "bg-background text-[#95522C] hover:bg-[#95522C] hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">All</span>
              <span className="text-xs bg-background/20 text-white px-2 py-1 rounded-full">
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
                    : "bg-background text-[#95522C] hover:bg-[#95522C] hover:text-white"
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
        <section className="py-1">
          <div className="w-full mx-auto ">
            <span
              className="block text-2xl sm:text-5xl font-bold mb-8 text-center"
              style={{ color: "#95522C" }}
            >
              Featured Article
            </span>
            <article className="w-full">
              <Link to={`/blog/${featuredBlog.slug}`} className="w-full">
                <div className="flex flex-col md:flex-row w-full  overflow-hidden shadow-lg">
                  <div className="md:w-3/5 relative">
                    <img
                      src={featuredBlog.featuredImage.url}
                      alt={featuredBlog.featuredImage.alt}
                      className="w-full h-[500px] md:h-[740px] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>

                  <div className="md:w-full bg-background p-12 flex flex-col justify-center">
                    <span className="text-xs text-gray-500">
                      {formatDate(
                        featuredBlog.publishedAt || featuredBlog.createdAt
                      )}{" "}
                      • {formatReadTime(featuredBlog.readTime)}
                    </span>
                    <h2
                      className="text-3xl md:text-4xl font-bold mt-4"
                      style={{ color: "#95522C" }}
                    >
                      {featuredBlog.title}
                    </h2>
                    <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                      {featuredBlog.excerpt}
                    </p>

                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#95522C" }}
                        >
                          <span className="text-white font-semibold text-sm">
                            {(featuredBlog.author?.name || "Flaunt By Nishi")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-tertiary">
                            {featuredBlog.author?.name || "Flaunt By Nishi"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {featuredBlog.views || 0} views
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="inline-flex items-center text-sm text-[#95522C] font-medium">
                          READ MORE
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          </div>
        </section>
      )}

      {/* Blogs Grid */}
      <section className="py-12">
        <div className="w-1/2 mx-auto px-4 sm:px-6 lg:px-8">
          <span
            className="block text-5xl font-bold mb-8 text-center"
            style={{ color: "#95522C" }}
          >
            Latest Articles
          </span>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#A79277] mx-auto mb-4" />
              <span className="text-tertiary block">
                Loading more articles...
              </span>
            </div>
          ) : regularBlogs.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-gray-500 text-lg block">
                No articles found.
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {regularBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    to={`/blog/${blog.slug}`}
                    className="block"
                  >
                    <article className="bg-background shadow-lg overflow-hidden group">
                      {/* Image on top */}
                      <div className="w-full">
                        <img
                          src={blog.featuredImage.url}
                          alt={blog.featuredImage.alt}
                          className="w-full h-[400px] object-cover"
                        />
                      </div>

                      {/* Title + Read more */}
                      <div className="p-4">
                        <span className="text-4xl font-semibold mb-10 text-tertiary">
                          {blog.title}
                        </span>
                        <div>
                          <span
                            className="text-sm font-medium text-[#95522C]
                          "
                          >
                            Read more
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-background border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
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
                      className="px-4 py-2 bg-background border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
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
