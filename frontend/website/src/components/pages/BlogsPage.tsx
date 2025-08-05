import React from "react";
import { Calendar, Clock, ArrowRight, Tag, Heart, BookOpen, Share2 } from "lucide-react";

const BlogsPage: React.FC = () => {
  const blogs = [
    {
      id: 1,
      title: "Resort Wear Essentials: Your Ultimate Vacation Wardrobe Guide",
      date: "January 2, 2025",
      time: "2 hours ago",
      category: "Resort Wear",
      description: "Discover the must-have pieces for your next getaway. From flowing kaftans to chic swimwear, create the perfect vacation wardrobe that embodies effortless elegance.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "8 min read",
      author: "Nishi Sharma",
      authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      likes: 324,
      views: 4580
    },
    {
      id: 2,
      title: "2025 Fashion Trends: What's Hot This Season",
      date: "December 28, 2024",
      time: "1 week ago",
      category: "Trends",
      description: "From oversized blazers to delicate jewelry, explore the fashion trends that are defining 2025. Get inspired and update your wardrobe with these stunning looks.",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "6 min read",
      author: "Fashion Editor Maya",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      likes: 189,
      views: 2967
    },
    {
      id: 3,
      title: "The Art of Layering: Mastering Transitional Dressing",
      date: "December 25, 2024",
      time: "2 weeks ago",
      category: "Styling",
      description: "Learn the secrets of sophisticated layering. Create versatile looks that transition seamlessly from day to night, season to season.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "10 min read",
      author: "Style Expert Priya",
      authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      likes: 256,
      views: 3820
    },
    {
      id: 4,
      title: "Sustainable Fashion: Building a Conscious Wardrobe",
      date: "December 20, 2024",
      time: "2 weeks ago",
      category: "Sustainability",
      description: "Embrace sustainable fashion with timeless pieces that last. Discover how to build a conscious wardrobe that reflects your values and personal style.",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "7 min read",
      author: "Eco-Fashion Advocate Kavya",
      authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      likes: 403,
      views: 5456
    },
    {
      id: 5,
      title: "From Beach to Brunch: Versatile Summer Styling",
      date: "December 15, 2024",
      time: "3 weeks ago",
      category: "Lifestyle",
      description: "Master the art of versatile dressing with pieces that take you from poolside to sophisticated brunch. Effortless style for the modern woman.",
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "12 min read",
      author: "Lifestyle Editor Riya",
      authorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      likes: 278,
      views: 4190
    },
    {
      id: 6,
      title: "Color Psychology in Fashion: Dressing for Confidence",
      date: "December 10, 2024",
      time: "1 month ago",
      category: "Psychology",
      description: "Explore how colors influence mood and perception. Learn to choose colors that enhance your confidence and make a powerful statement.",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "5 min read",
      author: "Color Expert Anisha",
      authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      likes: 192,
      views: 2876
    }
  ];

  const categories = [
    { name: "All", count: blogs.length, icon: BookOpen },
    { name: "Resort Wear", count: 1, icon: Tag },
    { name: "Trends", count: 1, icon: Heart },
    { name: "Styling", count: 1, icon: BookOpen },
    { name: "Sustainability", count: 1, icon: Tag },
    { name: "Lifestyle", count: 1, icon: Heart },
    { name: "Psychology", count: 1, icon: BookOpen }
  ];

  const featuredBlog = blogs[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] via-white to-gray-50">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-black to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Fashion & Style Blog
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Discover the latest fashion trends, styling tips, and inspiration for your wardrobe. Express yourself through style.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-black hover:text-white border border-gray-200"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Blog */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8 text-center">
            Featured Article
          </h2>
          <article className="bg-white rounded-xl shadow-lg overflow-hidden group max-w-4xl mx-auto">
            <div className="relative overflow-hidden">
              <img
                src={featuredBlog.image}
                alt={featuredBlog.title}
                className="w-full h-64 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-medium">
                  {featuredBlog.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{featuredBlog.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{featuredBlog.readTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{featuredBlog.likes}</span>
                </div>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-black mb-4 group-hover:text-gray-600 transition-colors duration-300">
                {featuredBlog.title}
              </h3>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {featuredBlog.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredBlog.authorImage}
                    alt={featuredBlog.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-black">{featuredBlog.author}</p>
                    <p className="text-sm text-gray-500">{featuredBlog.views} views</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors duration-300 group">
                  <span className="text-sm font-medium">Read Full Article</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8 text-center">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {blogs.slice(1).map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-medium">
                      {blog.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{blog.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gray-600 transition-colors duration-300">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={blog.authorImage}
                        alt={blog.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-black">{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{blog.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{blog.views}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors duration-300 group">
                      <span className="text-sm font-medium">Read More</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-black transition-colors duration-300">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-black/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
              Stay Inspired
            </h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our fashion newsletter and get the latest style trends, seasonal lookbooks, and exclusive fashion insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogsPage; 