import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Award,
  Shield,
  Leaf
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-background">
      {/* Newsletter Section */}
      <div className="border-b border-tertiary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-light mb-4 sm:mb-6 tracking-wide">Stay Connected</h3>
            <p className="text-sm sm:text-base text-background/90 mb-6 sm:mb-8 font-light leading-relaxed px-4">
              Subscribe to receive the latest updates on new collections, exclusive offers, and style inspirations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto px-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-fashion bg-background/10 backdrop-blur-sm border border-background/20 text-background placeholder-background/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent font-light"
              />
              <button className="fashion-button-outline text-sm sm:text-base border-background text-background hover:bg-background hover:text-primary flex items-center justify-center space-x-2 py-2.5 sm:py-3">
                <Mail className="w-4 h-4" />
                <span>Subscribe</span>
              </button>
            </div>
            <p className="text-xs text-background/80 mt-4 font-light">
              Curated content, no spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background rounded-full flex items-center justify-center">
                <span className="text-secondary font-bold text-base sm:text-lg">F</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold">Flaunt by Nishi</span>
            </div>
            <p className="text-sm sm:text-base text-background/90 mb-4 sm:mb-6 leading-relaxed">
              Fashion that speaks your language. Curated collections for the modern wardrobe. 
              Style without compromise.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Products</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-sm sm:text-base text-background/80 hover:text-background transition-colors duration-200">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-background/80 hover:text-background transition-colors duration-200">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-background/80 hover:text-background transition-colors duration-200">
                  Collections
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-background/80 hover:text-background transition-colors duration-200">
                  Sale
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Gift Cards
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-background">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Quality Promise
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition-colors duration-200">
                  Contact Us
                </a>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-background/90">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-background/90">
                <Mail className="w-4 h-4" />
                <span className="text-sm">hello@flauntbynishi.com</span>
              </div>
              <div className="flex items-center space-x-3 text-background/90">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-background/10 mt-16 pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-tertiary/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-tertiary/20 group-hover:scale-110 transition-all duration-300">
                <Award className="w-8 h-8 text-background" />
              </div>
              <h5 className="font-semibold mb-1 text-background">Quality Tested</h5>
              <p className="text-xs text-background/80">Rigorously tested for quality</p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                <Shield className="w-8 h-8" />
              </div>
              <h5 className="font-semibold mb-1">Safe & Secure</h5>
              <p className="text-xs text-white/60">100% secure payments</p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                <Leaf className="w-8 h-8" />
              </div>
              <h5 className="font-semibold mb-1">Clean Ingredients</h5>
              <p className="text-xs text-white/60">No artificial additives</p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-6 rounded-sm shadow">
                  <rect width="32" height="24" rx="3" fill="#fff" />
                  <rect y="0" width="32" height="8" fill="#FF9933" />
                  <rect y="16" width="32" height="8" fill="#138808" />
                  <circle cx="16" cy="12" r="3" fill="#000088" />
                  <circle cx="16" cy="12" r="2.2" fill="#fff" />
                  <g>
                    {[...Array(24)].map((_, i) => (
                      <rect key={i} x={16} y={12} width="2.2" height="0.2" fill="#000088" transform={`rotate(${(360/24)*i} 16 12)`} />
                    ))}
                  </g>
                </svg>
              </div>
              <h5 className="font-semibold mb-1">Made in India</h5>
              <p className="text-xs text-white/60">Proudly Indian brand</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-background/80">
              <span>&copy; {currentYear} Flaunt by Nishi. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-background/80 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-background/80 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-background/80 hover:text-white text-sm transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
            <div className="flex items-center space-x-2 text-background/80">
              <a href="https://pixelatenest.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors duration-200">
               Developed by Pixelate Nest</a>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;