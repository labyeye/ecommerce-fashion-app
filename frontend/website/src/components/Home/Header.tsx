import React, { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Search, Heart, User, LogOut, Crown, Award, Medal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

// Tier utility functions
const getTierInfo = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'bronze':
      return {
        icon: Medal,
        color: '#8B7355',
        bgColor: 'bg-fashion-light-brown/20',
        textColor: 'text-fashion-accent-brown',
        name: 'Bronze'
      };
    case 'silver':
      return {
        icon: Award,
        color: '#D4CFC7',
        bgColor: 'bg-fashion-warm-gray/20',
        textColor: 'text-fashion-dark-gray',
        name: 'Silver'
      };
    case 'gold':
      return {
        icon: Crown,
        color: '#B5A084',
        bgColor: 'bg-fashion-nude/20',
        textColor: 'text-fashion-accent-brown',
        name: 'Gold'
      };
    default:
      return {
        icon: Medal,
        color: '#8B7355',
        bgColor: 'bg-fashion-light-brown/20',
        textColor: 'text-fashion-accent-brown',
        name: 'Bronze'
      };
  }
};

const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        // On home page, change color based on scroll position
        setIsScrolled(window.scrollY > 100);
      } else {
        // On other pages, always use dark text
        setIsScrolled(true);
      }
    };

    // Set initial state
    handleScroll();

    // Add scroll listener only if on home page
    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
    }

    // Cleanup
    return () => {
      if (isHomePage) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isHomePage]);

  // Determine text color classes based on page and scroll
  const getTextColorClass = () => {
    if (isHomePage && !isScrolled) {
      return 'text-white'; // White text on home page when not scrolled
    }
    return 'text-fashion-charcoal'; // Dark text on other pages or when scrolled
  };

  // Determine logo color classes
  const getLogoColorClass = () => {
    if (isHomePage && !isScrolled) {
      return 'text-white'; // White logo on home page when not scrolled
    }
    return 'text-fashion-charcoal'; // Dark logo on other pages or when scrolled
  };

  // Determine background class
  const getBackgroundClass = () => {
    if (isHomePage && !isScrolled) {
      return 'bg-none'; // Transparent on home page when not scrolled
    }
    return 'bg-white shadow-sm'; // White background with shadow on other pages or when scrolled
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-fashion-charcoal/10 transition-all duration-300 ${getBackgroundClass()}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left Navigation (Desktop) */}
          <div className="hidden md:flex items-center flex-1">
            <nav className="flex items-center space-x-8">
              <a
                href="/"
                className={`text-sm font-medium tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group ${getTextColorClass()}`}
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
              <a
                href="about"
                className={`text-sm font-medium tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group ${getTextColorClass()}`}
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
              <a
                href="products"
                className={`text-sm font-medium tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group ${getTextColorClass()}`}
              >
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
              <a
                href="blogs"
                className={`text-sm font-medium tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group ${getTextColorClass()}`}
              >
                Blogs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
              <a
                href="contact"
                className={`text-sm font-medium tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group ${getTextColorClass()}`}
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
            </nav>
          </div>

          {/* Centered Logo */}
          <div className="flex items-center justify-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <a href="/" className="flex items-center">
              <div className="relative">
                <div className={`text-2xl md:text-3xl font-light tracking-wider transition-colors duration-300 ${getLogoColorClass()}`}>
                  <span className="font-medium">Flaunt</span>
                  <span className={`text-sm ml-2 transition-colors duration-300 ${getLogoColorClass()}`}>by Nishi</span>
                </div>
              </div>
            </a>
          </div>

          {/* Right Navigation (Desktop) */}
          <div className="hidden md:flex items-center justify-end flex-1 space-x-4">
            <button className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown hover:shadow-gentle transition-all duration-300 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
            <button className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown hover:shadow-gentle transition-all duration-300 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </button>
            {user ? (
              <div className="relative group flex items-center space-x-3">
                {/* Tier Badge */}
                {(() => {
                  const tierInfo = getTierInfo(user.loyaltyTier || 'bronze');
                  const TierIcon = tierInfo.icon;
                  return (
                    <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-fashion ${tierInfo.bgColor} border border-fashion-charcoal/10`}>
                      <TierIcon className="w-4 h-4" style={{ color: tierInfo.color }} />
                      <span className={`text-xs font-medium ${tierInfo.textColor}`}>
                        {tierInfo.name}
                      </span>
                    </div>
                  );
                })()}
                
                {/* Profile Button */}
                <button className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown hover:shadow-gentle transition-all duration-300 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </button>
                
                <div className="absolute right-0 mt-2 w-56 fashion-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50" style={{ top: '100%' }}>
                  <div className="py-2">
                    <div className="px-4 py-3 text-sm text-fashion-charcoal border-b border-fashion-charcoal/10">
                      <span className="font-medium">Welcome, {user.firstName}!</span>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                    >
                      Profile
                    </Link>
                    
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors duration-300 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <button className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown hover:shadow-gentle transition-all duration-300 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 fashion-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-2">
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                    >
                      Customer Login
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={onCartClick}
              data-cart-button
              className="relative circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown hover:shadow-gentle transition-all duration-300 flex items-center justify-center group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-fashion-accent-brown text-white text-xs circle-element w-5 h-5 flex items-center justify-center animate-soft-pulse font-medium">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={onCartClick}
              data-cart-button
              className="relative circle-element w-9 h-9 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-fashion-accent-brown text-white text-xs circle-element w-4 h-4 flex items-center justify-center animate-soft-pulse font-medium">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="circle-element w-9 h-9 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-dark backdrop-blur-lg border-b border-fashion-charcoal/10">
            <nav className="px-6 py-6 space-y-4">
              <a
                href="/"
                className="block text-fashion-charcoal hover:text-fashion-accent-brown transition-colors duration-300 font-medium text-base tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="about"
                className="block text-fashion-charcoal hover:text-fashion-accent-brown transition-colors duration-300 font-medium text-base tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="products"
                className="block text-fashion-charcoal hover:text-fashion-accent-brown transition-colors duration-300 font-medium text-base tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </a>
              <a
                href="blogs"
                className="block text-fashion-charcoal hover:text-fashion-accent-brown transition-colors duration-300 font-medium text-base tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Blogs
              </a>
              <a
                href="contact"
                className="block text-fashion-charcoal hover:text-fashion-accent-brown transition-colors duration-300 font-medium text-base tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              
              <div className="flex items-center justify-center space-x-4 pt-6 border-t border-fashion-charcoal/10">
                <button className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </button>
                <button className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </button>
                {user ? (
                  <div className="flex flex-col space-y-3 w-full">
                    <div className="px-4 py-3 text-sm text-fashion-charcoal border-b border-fashion-charcoal/10 flex items-center justify-between fashion-card">
                      <span className="font-medium">Welcome, {user.firstName}!</span>
                      {/* Mobile Tier Badge */}
                      {(() => {
                        const tierInfo = getTierInfo(user.loyaltyTier || 'bronze');
                        const TierIcon = tierInfo.icon;
                        return (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-fashion ${tierInfo.bgColor} border border-fashion-charcoal/10 text-xs`}>
                            <TierIcon className="w-3 h-3" style={{ color: tierInfo.color }} />
                            <span className={`font-medium ${tierInfo.textColor}`}>
                              {tierInfo.name}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <Link
                        to="/profile"
                        className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="circle-element w-10 h-10 bg-red-50 shadow-soft border border-red-200 text-red-500 hover:text-red-600 hover:bg-red-100 transition-all duration-300 flex items-center justify-center"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="circle-element w-10 h-10 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;