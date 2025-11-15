import LoadingMountainSunsetBeach from "../ui/LoadingMountainSunsetBeach";
import React, { useState, useEffect } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { blogService, Blog } from "../../services/blogService";
import BlogCard from "./BlogCard";

const FeaturedBlogs: React.FC = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const blogs = await blogService.getFeaturedBlogs();
      setFeaturedBlogs(blogs);
    } catch (err) {
      setError("Failed to load featured blogs");
      console.error("Error fetching featured blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blog: Blog) => {
    window.location.href = `/blogs/${blog.slug}`;
  };

  if (loading) {
    return <LoadingMountainSunsetBeach text="Loading featured blogs..." />;
  }

  if (error || featuredBlogs.length === 0) {
    return null; // Don't show section if no featured blogs
  }

  return (
    <section className="py-16" style={{ backgroundColor: "#FFF2E1" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 mr-3" style={{ color: "#95522C" }} />
            <h2 className="text-3xl font-bold" style={{ color: "#95522C" }}>
              Featured Articles
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover insights, tips, and stories from our expert team
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredBlogs.slice(0, 6).map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onClick={() => handleBlogClick(blog)}
            />
          ))}
        </div>
        <div className="text-center">
          <a
            href="/blogs"
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-300 group"
            style={{ backgroundColor: "#95522C" }}
          >
            View All Articles
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBlogs;
