import React from "react";
import { Calendar, Clock, ArrowRight, Tag, Users, TrendingUp } from "lucide-react";

const UpdatesPage: React.FC = () => {
  const updates = [
    {
      id: 1,
      title: "New Protein Shake Flavors Launch",
      date: "December 15, 2024",
      time: "2 hours ago",
      category: "Product Launch",
      description: "We're excited to announce our latest protein shake flavors: Chocolate Mint and Vanilla Berry. These new additions feature our signature 25g protein formula with natural ingredients.",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "3 min read",
      author: "Vital Team"
    },
    {
      id: 2,
      title: "Expanded Distribution Network",
      date: "December 12, 2024",
      time: "1 day ago",
      category: "Company News",
      description: "Vital is now available in 50+ cities across India! Our expanded distribution network ensures faster delivery and better accessibility for our customers nationwide.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "2 min read",
      author: "Operations Team"
    },
    {
      id: 3,
      title: "Sustainability Initiative Launch",
      date: "December 10, 2024",
      time: "3 days ago",
      category: "Sustainability",
      description: "We're proud to announce our new sustainability initiative. All our packaging is now 100% recyclable, and we've partnered with local farmers for sustainable sourcing.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "4 min read",
      author: "Sustainability Team"
    },
    {
      id: 4,
      title: "Customer Appreciation Month",
      date: "December 8, 2024",
      time: "5 days ago",
      category: "Events",
      description: "Join us for Customer Appreciation Month! Enjoy special discounts, exclusive offers, and participate in our community challenges. Thank you for choosing Vital!",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "2 min read",
      author: "Marketing Team"
    },
    {
      id: 5,
      title: "New Research Partnership",
      date: "December 5, 2024",
      time: "1 week ago",
      category: "Research",
      description: "We've partnered with leading nutrition research institutes to further enhance our product formulations. This collaboration will bring cutting-edge nutrition science to our products.",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "5 min read",
      author: "Research Team"
    },
    {
      id: 6,
      title: "Mobile App Launch",
      date: "December 1, 2024",
      time: "2 weeks ago",
      category: "Technology",
      description: "The official Vital mobile app is now available! Track your nutrition, order products, and access exclusive content all in one place. Download now on iOS and Android.",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "3 min read",
      author: "Tech Team"
    }
  ];

  const categories = [
    { name: "All", count: updates.length, icon: TrendingUp },
    { name: "Product Launch", count: 1, icon: Tag },
    { name: "Company News", count: 1, icon: Users },
    { name: "Sustainability", count: 1, icon: Tag },
    { name: "Events", count: 1, icon: Calendar },
    { name: "Research", count: 1, icon: TrendingUp },
    { name: "Technology", count: 1, icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F1E9] via-white to-[#B1D182]/10">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-[#688F4E] to-[#5a7a42]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Latest Updates
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Stay informed about our latest products, company news, and exciting developments at Vital.
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
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-[#688F4E] hover:text-white border border-[#B1D182]/30"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs bg-[#688F4E]/10 text-[#688F4E] px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Updates Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {updates.map((update) => (
              <article
                key={update.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={update.image}
                    alt={update.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#688F4E] text-white text-xs px-3 py-1 rounded-full font-medium">
                      {update.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{update.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{update.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#2B463C] mb-3 group-hover:text-[#688F4E] transition-colors duration-300">
                    {update.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {update.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {update.author}</span>
                    <button className="flex items-center gap-2 text-[#688F4E] hover:text-[#5a7a42] transition-colors duration-300 group">
                      <span className="text-sm font-medium">Read More</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-[#688F4E]/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2B463C] mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter to receive the latest updates, exclusive offers, and nutrition tips directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-[#B1D182]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
              />
              <button className="px-6 py-3 bg-[#688F4E] text-white font-medium rounded-lg hover:bg-[#5a7a42] transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpdatesPage; 