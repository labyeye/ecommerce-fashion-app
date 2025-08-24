import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Search,
  User,
  LogOut,
  Crown,
  Award,
  Medal,
  ChevronDown,
  Heart,
} from "lucide-react";
  // Handler for wishlist navigation with auth check

// Custom handbag SVG icon as React component
const HandbagIcon = ({ className = '', style = {}, width = 24, height = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-handbag-icon lucide-handbag ${className}`}
    style={style}
  >
    <path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z" />
    <path d="M8 11V6a4 4 0 0 1 8 0v5" />
  </svg>
);
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logoblack.png";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

interface NavigationLink {
  _id: string;
  name: string;
  slug: string;
  url: string;
  type: string;
  hasDropdown: boolean;
  dropdownItems: Array<{
    _id?: string;
    name: string;
    url: string;
    category?: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  isActive: boolean;
  sortOrder: number;
}

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  images?: Array<{ url: string }>;
  imageUrl?: string;
  category?: string;
  description?: string;
}

const getTierInfo = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case "bronze":
      return {
        icon: Medal,
        color: "#8B7355",
        bgColor: "bg-fashion-light-brown/20",
        textColor: "text-fashion-accent-brown",
        name: "Bronze",
      };
    case "silver":
      return {
        icon: Award,
        color: "#D4CFC7",
        bgColor: "bg-fashion-warm-gray/20",
        textColor: "text-fashion-dark-gray",
        name: "Silver",
      };
    case "gold":
      return {
        icon: Crown,
        color: "#B5A084",
        bgColor: "bg-fashion-nude/20",
        textColor: "text-fashion-accent-brown",
        name: "Gold",
      };
    default:
      return {
        icon: Medal,
        color: "#8B7355",
        bgColor: "bg-fashion-light-brown/20",
        textColor: "text-fashion-accent-brown",
        name: "Bronze",
      };
  }
};

const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [pageResults, setPageResults] = useState<NavigationLink[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Initialize with fallback navigation INCLUDING SHIRT
  useEffect(() => {
    const fallbackNavigation: NavigationLink[] = [
      {
        _id: "1",
        name: "Home",
        slug: "home",
        url: "/",
        type: "page",
        hasDropdown: false,
        dropdownItems: [],
        isActive: true,
        sortOrder: 1,
      },
      {
        _id: "2",
        name: "About",
        slug: "about",
        url: "/about",
        type: "page",
        hasDropdown: false,
        dropdownItems: [],
        isActive: true,
        sortOrder: 2,
      },
      {
        _id: "3",
        name: "Products",
        slug: "products",
        url: "/products",
        type: "category",
        hasDropdown: true,
        dropdownItems: [
          {
            name: "Shirt",
            url: "/products?category=shirt",
            isActive: true,
            sortOrder: 1,
          },
          {
            name: "Jumpsuit",
            url: "/products?category=jumpsuit",
            isActive: true,
            sortOrder: 2,
          },
          {
            name: "Kaftan",
            url: "/products?category=kaftan",
            isActive: true,
            sortOrder: 3,
          },
          {
            name: "Coord Set",
            url: "/products?category=coord-set",
            isActive: true,
            sortOrder: 4,
          },
          {
            name: "Dress",
            url: "/products?category=dress",
            isActive: true,
            sortOrder: 5,
          },
        ],
        isActive: true,
        sortOrder: 3,
      },
      {
        _id: "4",
        name: "Blogs",
        slug: "blogs",
        url: "/blogs",
        type: "page",
        hasDropdown: false,
        dropdownItems: [],
        isActive: true,
        sortOrder: 4,
      },
      {
        _id: "5",
        name: "Contact",
        slug: "contact",
        url: "/contact",
        type: "page",
        hasDropdown: false,
        dropdownItems: [],
        isActive: true,
        sortOrder: 5,
      },
    ];

    console.log(
      "🚀 Setting fallback navigation with shirts:",
      fallbackNavigation
    );
    setNavigationLinks(fallbackNavigation);

    // Try to fetch from API
    const fetchNavigation = async () => {
      try {
        console.log("🌐 Fetching navigation from API...");
        const response = await fetch(
          "https://ecommerce-fashion-app.onrender.com/api/navigation/public"
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log("✅ API navigation received:", data.data);
            setNavigationLinks(data.data);
          } else {
            console.log("❌ API navigation failed, using fallback");
          }
        } else {
          console.log("❌ API response not ok, using fallback");
        }
      } catch (error) {
        console.error("❌ Error fetching navigation, using fallback:", error);
      }
    };

    fetchNavigation();
  }, []);
    const handleWishlistNav = () => {
    if (user) {
      window.location.href = '/wishlist';
    } else {
      setShowLoginModal(true);
    }
  };
  // Search function with detailed logging
  const performSearch = async (term: string) => {
    console.log("🔍 Starting search for:", term);

    if (!term || term.length < 2) {
      console.log("🔍 Search term too short, clearing results");
      setSearchResults([]);
      setPageResults([]);
      return;
    }

    setSearchLoading(true);
    console.log("🔍 Search loading started");

    try {
      // Search in navigation first (guaranteed to work)
      const searchLower = term.toLowerCase();
      const matchingPages: NavigationLink[] = [];

      console.log("🔍 Searching in navigation links:", navigationLinks);

      navigationLinks.forEach((link) => {
        if (!link.isActive) return;

        // Check main navigation item
        if (
          link.name.toLowerCase().includes(searchLower) ||
          link.slug.toLowerCase().includes(searchLower)
        ) {
          console.log("✅ Found matching page:", link.name);
          matchingPages.push(link);
        }

        // Check dropdown items
        if (link.hasDropdown && link.dropdownItems) {
          link.dropdownItems.forEach((item) => {
            if (
              item.isActive &&
              item.name.toLowerCase().includes(searchLower)
            ) {
              console.log("✅ Found matching category:", item.name);
              const virtualLink: NavigationLink = {
                _id: `${link._id}-${item.name}`,
                name: item.name,
                slug: item.name.toLowerCase().replace(/\s+/g, "-"),
                url: item.url,
                type: "category",
                hasDropdown: false,
                dropdownItems: [],
                isActive: true,
                sortOrder: item.sortOrder,
              };
              matchingPages.push(virtualLink);
            }
          });
        }
      });

      console.log("🔍 Total matching pages found:", matchingPages.length);
      setPageResults(matchingPages);

      // Try to search products from API
      let products: Product[] = [];

      try {
        console.log("🌐 Searching products via API...");
        const productResponse = await fetch(
          `/api/products?search=${encodeURIComponent(term)}&limit=10`
        );

        if (productResponse.ok) {
          const data = await productResponse.json();
          products = data.products || [];
          console.log("✅ Products found from main API:", products.length);
        } else {
          console.log("❌ Main API failed, trying alternative...");
          // Try alternative API
          const altResponse = await fetch(
            `https://ecommerce-fashion-app.onrender.com/api/products?search=${encodeURIComponent(
              term
            )}`
          );
          if (altResponse.ok) {
            const altData = await altResponse.json();
            products = altData.products || altData.data || [];
            console.log("✅ Products found from alt API:", products.length);
          }
        }
      } catch (error) {
        console.error("❌ Product API error:", error);
      }

      setSearchResults(products);
      console.log(
        "🔍 Final search results - Pages:",
        matchingPages.length,
        "Products:",
        products.length
      );
    } catch (error) {
      console.error("❌ Search error:", error);
      setSearchResults([]);
      setPageResults([]);
    } finally {
      setSearchLoading(false);
      console.log("🔍 Search loading ended");
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (!isSearchOpen) {
      console.log("🔍 Search modal closed, skipping search");
      return;
    }

    console.log("🔍 Search term changed:", searchTerm);

    const timeout = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => {
      console.log("🔍 Clearing search timeout");
      clearTimeout(timeout);
    };
  }, [searchTerm, isSearchOpen, navigationLinks]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > 100);
      } else {
        setIsScrolled(true);
      }
    };

    handleScroll();
    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (isHomePage) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isHomePage]);

  const getTextColorClass = () => {
    if (isHomePage && !isScrolled) {
      return "text-dark";
    }
    return "text-dark";
  };

  const getBackgroundClass = () => {
    if (isHomePage && !isScrolled) {
      return "bg-none";
    }
    return "bg-white shadow-sm";
  };

  const handleSearchOpen = () => {
    console.log("🔍 Opening search modal");
    setIsSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        console.log("🔍 Search input focused");
      }
    }, 100);
  };

  // Helper to handle protected navigation
  const handleProtectedNav = (url: string) => {
    if (user) {
      window.location.href = url;
    } else {
      setShowLoginModal(true);
    }
  };

  // Simple login modal
  const LoginModal = () => (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
        <User className="w-10 h-10 text-fashion-accent-brown mb-2" />
        <h2 className="text-lg font-semibold mb-2">Login Required</h2>
        <p className="text-gray-600 mb-4 text-center">
          Please login to view this page or use wishlist features.
        </p>
        <div className="flex space-x-3">
          <a
            href="/login"
            className="px-4 py-2 rounded bg-fashion-accent-brown text-white font-medium"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="px-4 py-2 rounded bg-fashion-cream text-fashion-accent-brown font-medium"
          >
            Sign Up
          </a>
        </div>
        <button
          className="mt-4 text-sm text-gray-400 hover:text-red-500"
          onClick={() => setShowLoginModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-fashion-charcoal/10 transition-all duration-300 ${getBackgroundClass()}`}
    >
      {showLoginModal && <LoginModal />}
      <div className="px-7">
        <div className="flex items-center h-16 md:h-20">
          {/* Left Navigation (Desktop) */}
          <div className="hidden md:flex items-center">
            <nav className="flex space-x-8">
              {navigationLinks
                .filter((link) => link.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link) =>
                  link.hasDropdown ? (
                    <div
                      key={link._id}
                      className="relative group"
                      onMouseEnter={() => setIsDropdownOpen(link._id)}
                      onMouseLeave={() => setIsDropdownOpen(null)}
                    >
                      <a
                        href={link.url}
                        className={`text-lg font-small tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group flex items-center ${getTextColorClass()}`}
                        style={{ color: '#493628' }}
                      >
                        {link.name}
                        <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" style={{ color: '#493628' }} />
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full"></span>
                      </a>

                      {link.dropdownItems && link.dropdownItems.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-lg border border-fashion-charcoal/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                          <div className="py-2">
                            {link.dropdownItems
                              .filter((item) => item.isActive)
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((item, index) => (
                                <a
                                  key={index}
                                  href={item.url}
                                  className="block px-4 py-3 text-lg hover:bg-fashion-cream hover:text-fashion-accent-brown transition-colors duration-300"
                                  style={{ color: '#493628' }}
                                >
                                  {item.name}
                                </a>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      key={link._id}
                      href={link.url}
                      className={`text-lg font-medium tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group ${getTextColorClass()}`}
                      style={{ color: '#493628' }}
                    >
                      {link.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full"></span>
                    </a>
                  )
                )}
            </nav>
          </div>

          {/* Centered Logo */}
          <div className="flex items-center justify-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <a href="/" className="flex items-center">
              <div className="relative">
                <div className="w-24 h-24">
                  <img src={logo} alt="Flaunt by Nishi" />
                </div>
              </div>
            </a>
          </div>

          {/* Right Navigation (Desktop) */}
          <div className="hidden md:flex items-center justify-end flex-1 space-x-4">
            {/* Heart/Wishlist Icon */}
            
            <div className="flex items-center w-96 max-w-xs bg-white border border-fashion-charcoal/20 rounded-lg shadow-sm px-3 py-1 mr-4 relative">
              <Search className="w-5 h-5 mr-2" style={{ color: '#493628' }} />
              <input
                ref={searchInputRef}
                type="text"
                className="flex-1 text-base border-0 focus:outline-none placeholder-gray-400 bg-transparent"
                placeholder="Search products, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ color: '#493628' }}
              />
              {searchTerm.length > 1 && (
                <div className="absolute top-12 left-0 w-full bg-white border border-fashion-charcoal/10 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fashion-accent-brown"></div>
                        <span className="ml-2 text-gray-500">Searching...</span>
                      </div>
                    )}
                    {!searchLoading &&
                      searchResults.length === 0 &&
                      pageResults.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <Search className="w-8 h-8 mx-auto mb-2" style={{ color: '#493628' }} />
                          <p>No results found for "{searchTerm}"</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try searching for: shirt, jumpsuit, kaftan, dress,
                            coord set
                          </p>
                        </div>
                      )}
                    {!searchLoading &&
                      (searchResults.length > 0 || pageResults.length > 0) && (
                        <div className="divide-y divide-gray-100">
                          {pageResults.length > 0 && (
                            <div className="mb-2">
                              <h3 className="text-xs font-semibold text-gray-600 mb-1 flex items-center">
                                <ChevronDown className="w-4 h-4 mr-1" style={{ color: '#493628' }} />
                                Categories & Pages ({pageResults.length})
                              </h3>
                              {pageResults.map((link) => (
                                <a
                                  key={link._id}
                                  href={link.url}
                                  className="block px-2 py-1 hover:bg-gray-50 rounded transition-colors group"
                                >
                                  <span className="font-medium text-blue-700 group-hover:text-blue-800">
                                    {link.name}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                    {link.type === "category"
                                      ? "Category"
                                      : "Page"}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                          {searchResults.length > 0 && (
                            <div>
                              <h3 className="text-xs font-semibold text-gray-600 mb-1 flex items-center">
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Products ({searchResults.length})
                              </h3>
                              {searchResults.slice(0, 6).map((product) => (
                                <a
                                  key={product._id || product.id}
                                  href={`/product/${product._id || product.id}`}
                                  className="block px-2 py-2 hover:bg-gray-50 rounded transition-colors group"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                      {product.images?.[0]?.url ||
                                      product.imageUrl ? (
                                        <img
                                          src={
                                            product.images?.[0]?.url ||
                                            product.imageUrl
                                          }
                                          alt={product.name}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-none flex items-center justify-center">
                                          <ShoppingCart className="w-5 h-5 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 group-hover:text-fashion-accent-brown truncate">
                                        {product.name}
                                      </p>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-fashion-accent-brown font-semibold">
                                          ₹{product.price}
                                        </span>
                                        {product.category && (
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {product.category}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative group flex flex-col items-center">
              <button className="w-10 h-10 bg-none text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center" id="profile-icon">
                <User className="w-5 h-5" style={{ color: '#493628' }} />
              </button>
              <span className="text-xs text-[#493628]">Profile</span>
              <div
                className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 shadow-xl border border-fashion-charcoal/10 bg-white md:bg-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
                style={{ top: "100%" }}
              >
                <div className="py-4">
                  {user ? (
                    <>
                      <div className="px-4 py-3 text-sm text-fashion-charcoal border-b border-fashion-charcoal/10 ">
                        <span className="font-medium">
                          Welcome, {user.firstName}!
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() =>
                          handleProtectedNav("/profile?tab=orders")
                        }
                        className="block w-full text-left px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/wishlist")}
                        className="block w-full text-left px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Wishlist
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/addresses")}
                        className="block w-full text-left px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Addresses
                      </button>
                      <button
                        onClick={useAuth().logout}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors duration-300 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" style={{ color: '#493628' }} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 text-sm text-fashion-charcoal border-b border-fashion-charcoal/10 text-center bg-white">
                        <span className="font-medium">Welcome</span>
                        <div className="mt-2">
                          <Link
                            to="/login"
                            className="inline-block w-30 px-4 py-2 text-sm rounded-lg bg-fashion-accent-brown text-white hover:bg-fashion-accent-brown/90 transition-colors duration-300 shadow mr-2"
                          >
                            Sign In / Sign Up
                          </Link>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleProtectedNav("/profile?tab=orders")
                        }
                        className="block w-full text-left px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/wishlist")}
                        className="block w-full text-left px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Wishlist
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/addresses")}
                        className="block w-full text-left px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Addresses
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center relative">
              <button
                onClick={handleWishlistNav}
                className="w-50 h-10 bg-none text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" style={{ color: '#493628' }} />
              </button>
              <span className="text-xs text-[#493628]">Wishlist</span>
            </div>

            <div className="flex flex-col items-center relative">
              <button
                onClick={onCartClick}
                data-cart-button
                className="w-10 h-10 bg-none text-[#493628] hover:text-fashion-accent-brown https://ecommerce-fashion-app.onrender.com transition-all duration-300 flex items-center justify-center group"
              >
                <HandbagIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" style={{ color: '#493628' }} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-fashion-accent-brown text-white text-xs w-5 h-5 flex items-center justify-center animate-soft-pulse font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
              <span className="text-xs text-[#493628]">Bag</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Heart/Wishlist Icon Mobile */}
            <button
              onClick={handleWishlistNav}
              className="circle-element w-9 h-9 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" style={{ color: '#493628' }} />
            </button>
            <button
              onClick={handleSearchOpen}
              className="circle-element w-9 h-9 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              <Search className="w-4 h-4" style={{ color: '#493628' }} />
            </button>
            <button
              onClick={onCartClick}
              data-cart-button
              className="relative circle-element w-9 h-9 text-[#493628] hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              <HandbagIcon className="w-4 h-4" style={{ color: '#493628' }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-fashion-accent-brown text-white text-xs circle-element w-4 h-4 flex items-center justify-center animate-soft-pulse font-medium">
                  {cartCount}
                </span>
              )}
            </button>
            <span
              className="text-xs text-[#2D2D2D]"
              style={{ display: "block", width: "100%", textAlign: "center" }}
            >
              Bag
            </span>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="circle-element w-9 h-9 bg-fashion-warm-white shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute top-1/2 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1"
                  }`}
                />
                <span
                  className={`absolute top-1/2 left-0 w-5 h-0.5 bg-current transition-opacity duration-300 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute top-1/2 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 bg-[#FFF2E1] backdrop-blur-lg border-b border-fashion-charcoal/10 transition-all duration-500 ease-in-out transform ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="px-6 py-8 space-y-6">
              {navigationLinks
                .filter((link) => link.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link, index) => (
                  <div
                    key={link._id}
                    className={`py-1 transition-all duration-500 ease-out transform ${
                      isMenuOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${150 + index * 50}ms` }}
                  >
                    <a
                      href={link.url}
                      className="block text-fashion-charcoal hover:text-fashion-accent-brown transition-colors duration-300 font-medium text-lg sm:text-xl tracking-wide flex items-center justify-between"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                      {link.hasDropdown && <ChevronDown className="w-5 h-5" style={{ color: '#493628' }} />}
                    </a>

                    {link.hasDropdown &&
                      link.dropdownItems &&
                      link.dropdownItems.length > 0 && (
                        <div className="ml-4 mt-3 space-y-3 overflow-hidden">
                          {link.dropdownItems
                            .filter((item) => item.isActive)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((item, dropdownIndex) => (
                              <a
                                key={dropdownIndex}
                                href={item.url}
                                className="block text-fashion-charcoal/80 hover:text-fashion-accent-brown transition-all duration-300 text-base sm:text-lg transform"
                                style={{
                                  opacity: isMenuOpen ? 1 : 0,
                                  transform: `translateX(${
                                    isMenuOpen ? "0" : "-10px"
                                  })`,
                                  transitionDelay: `${
                                    index * 50 + dropdownIndex * 30
                                  }ms`,
                                }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item.name}
                              </a>
                            ))}
                        </div>
                      )}
                  </div>
                ))}

              <div className="flex items-center justify-center space-x-4 pt-6 border-t border-fashion-charcoal/10">
                {user ? (
                  <div className="relative group flex items-center space-x-3">
                    {(() => {
                      const tierInfo = getTierInfo(
                        user.loyaltyTier || "bronze"
                      );
                      const TierIcon = tierInfo.icon;
                      return (
                        <div
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-fashion ${tierInfo.bgColor} border border-fashion-charcoal/10`}
                        >
                          <TierIcon
                            className="w-4 h-4"
                            style={{ color: tierInfo.color }}
                          />
                          <span
                            className={`text-xs font-medium ${tierInfo.textColor}`}
                          >
                            {tierInfo.name}
                          </span>
                        </div>
                      );
                    })()}

                    <button className="circle-element w-10 h-10 shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown hover:shadow-gentle transition-all duration-300 flex items-center justify-center">
                      <User className="w-5 h-5" style={{ color: '#493628' }} />
                    </button>

                    <div
                      className="absolute right-0 mt-2 w-56 fashion-card bg-white md:bg-[#FFF2E1] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
                      style={{ top: "100%" }}
                    >
                      <div className="py-2">
                        <div className="px-4 py-3 text-sm text-fashion-charcoal border-b border-fashion-charcoal/10">
                          <span className="font-medium">
                            Welcome, {user.firstName}!
                          </span>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-3 text-sm text-fashion-charcoal hover:bg-fashion-cream transition-colors duration-300"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <button className="circle-element w-10 h-10 bg-none shadow-soft border border-fashion-charcoal/10 text-fashion-charcoal hover:text-fashion-accent-brown hover:shadow-gentle transition-all duration-300 flex items-center justify-center">
                      <User className="w-5 h-5" style={{ color: '#493628' }} />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 fashion-card bg-white md:bg-[#FFF2E1] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-4 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full  flex items-center justify-center shadow-md mb-2">
                          <User className="w-6 h-6" style={{ color: '#493628' }} />
                        </div>
                        <span className="text-sm text-fashion-charcoal font-medium mb-2">
                          Customer Login
                        </span>
                        <Link
                          to="/login"
                          className="block w-20 px-4 py-2 text-sm text-center rounded-lg bg-fashion-accent-brown text-white hover:bg-fashion-accent-brown/90 transition-colors duration-300 shadow"
                        >
                          Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
