import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { blogService, Blog } from '../../services/blogService';
import BlogCard from './BlogCard';

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
      setError('Failed to load featured blogs');
      console.error('Error fetching featured blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blog: Blog) => {
    // Navigate to blog detail page
    window.location.href = `/blogs/${blog.slug}`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading featured blogs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredBlogs.length === 0) {
    return null; // Don't show section if no featured blogs
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover insights, tips, and stories from our expert team
          </p>
        </div>

        {/* Featured Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredBlogs.slice(0, 6).map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onClick={() => handleBlogClick(blog)}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <a
            href="/blogs"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 group"
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
