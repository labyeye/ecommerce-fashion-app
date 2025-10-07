import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Eye } from 'lucide-react';
import { Blog } from '../../services/blogService';

interface BlogCardProps {
  blog: Blog;
  onClick?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadTime = (minutes: number) => {
    if (minutes < 1) return 'Less than 1 min';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
  };

  const images = (blog.images && blog.images.length > 0)
    ? blog.images
    : [{ url: blog.featuredImage.url, alt: blog.featuredImage.alt }];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images]);

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Featured Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[index]?.url}
          alt={images[index]?.alt || blog.featuredImage.alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {blog.isFeatured && (
          <div className="absolute top-3 right-3 text-white px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FFD166' }}>
            Featured
          </div>
        )}
        <div className="absolute top-3 left-3 text-white px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#95522C' }}>
          {blog.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 transition-colors" style={{ color: '#2B463C' }}>
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(blog.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatReadTime(blog.readTime)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{blog.views}</span>
          </div>
        </div>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                +{blog.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#95522C' }}>
              <span className="text-white text-sm font-semibold">
                {(blog.author?.name || 'U').charAt(0).toUpperCase()
              }
              </span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#95522C' }}>{blog.author?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">Author</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
