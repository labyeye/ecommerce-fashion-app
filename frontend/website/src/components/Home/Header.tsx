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
  X,
} from "lucide-react";
// Handler for wishlist navigation with auth check

// Custom handbag SVG icon as React component
const HandbagIcon = ({
  className = "",
  style = {},
  width = 24,
  height = 24,
}) => (
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

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [pageResults, setPageResults] = useState<NavigationLink[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll and handle Escape when search panel is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isSearchOpen]);

  const { user } = useAuth();
  useEffect(() => {
    void getTierInfo("bronze");
  }, []);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
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
        name: "About Us",
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
        name: "Shop",
        slug: "products",
        url: "/products",
        type: "category",
        hasDropdown: true,
        dropdownItems: [],
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
        name: "Contact Us",
        slug: "contact",
        url: "/contact",
        type: "page",
        hasDropdown: false,
        dropdownItems: [],
        isActive: true,
        sortOrder: 5,
      },
    ];
    setNavigationLinks(fallbackNavigation);

    const fetchNavigation = async () => {
      try {
        const response = await fetch(
          "https://ecommerce-fashion-app-som7.vercel.app/api/navigation/public"
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            let navLinks: NavigationLink[] = data.data;

            try {
              const catResp = await fetch(
                "https://ecommerce-fashion-app-som7.vercel.app/api/categories/navigation"
              );
              if (catResp.ok) {
                const catData = await catResp.json();
                const categories = catData.data || [];

                const categoryItems: Array<any> = [];
                categories.forEach((cat: any) => {
                  categoryItems.push({
                    name: cat.name,
                    url: `/products?category=${cat.slug}`,
                    isActive: cat.isActive,
                    sortOrder: cat.sortOrder,
                  });
                  if (Array.isArray(cat.subcategories)) {
                    cat.subcategories.forEach((sub: any) => {
                      categoryItems.push({
                        name: sub.name,
                        url: `/products?category=${sub.slug}`,
                        isActive: sub.isActive,
                        sortOrder: sub.sortOrder,
                      });
                    });
                  }
                });
                const productsIndex = navLinks.findIndex(
                  (n) => n.type === "category" || n.slug === "products"
                );
                if (productsIndex !== -1) {
                  const updated = { ...navLinks[productsIndex] };
                  const existingUrls = new Set(
                    (updated.dropdownItems || []).map((d: any) => d.url)
                  );
                  const merged = [...(updated.dropdownItems || [])];
                  categoryItems.forEach((it: any) => {
                    if (!existingUrls.has(it.url)) merged.push(it);
                  });
                  updated.dropdownItems = merged.sort(
                    (a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)
                  );
                  navLinks[productsIndex] = updated as NavigationLink;
                } else {
                  navLinks.push({
                    _id: "categories-nav",
                    name: "Categories",
                    slug: "categories",
                    url: "/products",
                    type: "category",
                    hasDropdown: true,
                    dropdownItems: categoryItems,
                    isActive: true,
                    sortOrder: 3,
                  });
                }
              }
            } catch (err) {
              console.error("Error fetching categories for nav merge", err);
            }

            setNavigationLinks(navLinks);
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
      window.location.href = "/wishlist";
    } else {
      setShowLoginModal(true);
    }
  };
  const performSearch = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setPageResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const searchLower = term.toLowerCase();
      const matchingPages: NavigationLink[] = [];

      navigationLinks.forEach((link) => {
        if (!link.isActive) return;
        if (
          link.name.toLowerCase().includes(searchLower) ||
          link.slug.toLowerCase().includes(searchLower)
        ) {
          matchingPages.push(link);
        }
        if (link.hasDropdown && link.dropdownItems) {
          link.dropdownItems.forEach((item) => {
            if (
              item.isActive &&
              item.name.toLowerCase().includes(searchLower)
            ) {
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

      setPageResults(matchingPages);
      let products: Product[] = [];

      try {
        const productResponse = await fetch(
          `/api/products?search=${encodeURIComponent(term)}&limit=10`
        );

        if (productResponse.ok) {
          const contentType = (
            productResponse.headers.get("content-type") || ""
          ).toLowerCase();

          if (contentType.includes("application/json")) {
            try {
              const data = await productResponse.json();
              products = data.products || data.data || [];
            } catch (parseErr) {
              console.warn(
                "⚠️ Failed to parse main API JSON, will try alternative:",
                parseErr
              );
            }
          } else {
            console.warn(
              "⚠️ Main API returned non-JSON response (Content-Type:",
              contentType,
              "), trying alternative..."
            );
          }
        } else {
          console.log(
            "❌ Main API failed with status:",
            productResponse.status,
            "trying alternative..."
          );
        }
        if (!products || products.length === 0) {
          try {
            const altResponse = await fetch(
              `https://ecommerce-fashion-app-som7.vercel.app/api/products?search=${encodeURIComponent(
                term
              )}&limit=10`
            );

            if (altResponse.ok) {
              const altContentType = (
                altResponse.headers.get("content-type") || ""
              ).toLowerCase();
              if (altContentType.includes("application/json")) {
                try {
                  const altData = await altResponse.json();
                  products = altData.products || altData.data || [];
                } catch (altParseErr) {
                  console.warn("⚠️ Failed to parse alt API JSON:", altParseErr);
                }
              } else {
                console.warn(
                  "⚠️ Alt API returned non-JSON response (Content-Type:",
                  altContentType,
                  ")"
                );
              }
            } else {
              console.log("❌ Alt API failed with status:", altResponse.status);
            }
          } catch (altErr) {
            console.error("❌ Alternative Product API error:", altErr);
          }
        }
      } catch (error) {
        console.error("❌ Product API error:", error);
      }

      setSearchResults(products);
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
      return;
    }
    const timeout = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => {
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
      return "bg-[#FFF2E1]";
    }
    return "bg-[#FFF2E1] shadow-sm";
  };

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
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
        <h3 className="text-4xl font-semibold mb-2">Login Required</h3>
        <p className="text-tertiary mb-4 text-center">
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
          className="mt-4 text-sm text-tertiary hover:text-red-500"
          onClick={() => setShowLoginModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-tertiary/10 transition-all duration-300 ${getBackgroundClass()}`}
    >
      {showLoginModal && <LoginModal />}
      <div className="px-7">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo (left) */}
          <div className="flex items-center justify-start flex-none">
            <a href="/" className="flex items-center">
              <div className="relative">
                {/* larger on mobile, original size on md+; small top margin on mobile */}
                <div className="w-28 h-28 md:w-24 md:h-24 mt-2 md:mt-0">
                  <img
                    src={logo}
                    alt="Flaunt by Nishi"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </a>
          </div>
          <div className="hidden md:flex items-center flex-1">
            <nav className="flex space-x-8 ml-6 md:ml-8 lg:ml-12">
              {navigationLinks
                .filter((link) => link.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link) =>
                  link.hasDropdown ? (
                    <div key={link._id} className="relative group">
                      <h6>
                        <a
                          href={link.url}
                          className={`text-lg font-bold tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group flex items-center ${getTextColorClass()} text-fashion-dark-gray`}
                        >
                          {link.name}
                          <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180 text-fashion-dark-gray" />
                          <p className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full m-0"></p>
                        </a>
                      </h6>

                      {link.dropdownItems && link.dropdownItems.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-lg border border-tertiary/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                          <div className="py-2">
                            {link.dropdownItems
                              .filter((item) => item.isActive)
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((item, dropdownIndex) => (
                                <h6
                                  key={item.url || item.name || dropdownIndex}
                                >
                                  <a
                                    href={item.url}
                                    className="block px-4 py-3 font-bold hover:bg-fashion-cream hover:text-fashion-accent-brown transition-colors duration-300 text-fashion-dark-gray"
                                  >
                                    {item.name}
                                  </a>
                                </h6>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <h6 key={link._id}>
                      <a
                        href={link.url}
                        className={`flex items-center text-lg font-bold tracking-wide hover:text-fashion-accent-brown transition-colors duration-300 relative group ${getTextColorClass()} text-fashion-dark-gray`}
                      >
                        {link.name}
                        <p className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fashion-accent-brown transition-all duration-300 group-hover:w-full rounded-full m-0"></p>
                      </a>
                    </h6>
                  )
                )}
            </nav>
          </div>

          {/* Right Navigation (Desktop) */}
          <div className="hidden md:flex items-center justify-end space-x-2">
            {/* Heart/Wishlist Icon */}

            <div className="relative group flex flex-col items-center -mr-2">
              <button
                onClick={() => {
                  setIsSearchOpen((s) => !s);
                  if (!isSearchOpen) {
                    setTimeout(() => {
                      if (searchInputRef.current)
                        searchInputRef.current.focus();
                    }, 100);
                  }
                }}
                className="w-10 h-10 bg-none text-tertiary hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-6 h-6 text-fashion-dark-gray" />
              </button>

              {isSearchOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setIsSearchOpen(false)}
                    aria-hidden
                  />

                  {/* Sliding panel */}
                  <div
                    className={`fixed top-0 right-0 w-[500px] h-full z-50 transform transition-transform duration-300 ${
                      isSearchOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                    role="dialog"
                    aria-modal="true"
                  >
                    <div className="bg-white h-full flex flex-col">
                      <div className="border-b border-tertiary/10 p-4">
                        <div className="flex items-center">
                          <Search className="w-6 h-6 mr-3 text-fashion-dark-gray" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            className="flex-1 text-md border-0 focus:outline-none placeholder-gray-400 bg-transparent text-fashion-dark-gray"
                            style={{ fontSize: 16 }}
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            aria-label="Search products"
                          />

                          {/* Clear button: visible only when there's text */}
                          {searchTerm.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm("");
                                // keep focus so user can type immediately
                                setTimeout(
                                  () => searchInputRef.current?.focus(),
                                  0
                                );
                              }}
                              className="ml-3 text-tertiary hover:text-fashion-accent-brown font-bold"
                              aria-label="Clear search"
                            >
                              Clear{" "}
                            </button>
                          )}

                          <button
                            onClick={() => setIsSearchOpen(false)}
                            className="ml-3 text-tertiary hover:text-fashion-accent-brown"
                            aria-label="Close search"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Results container */}
                      <div className="flex-1 overflow-y-auto p-4 bg-white">
                        {searchLoading && (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fashion-accent-brown"></div>
                            <p className="ml-2 text-tertiary m-0">
                              Searching...
                            </p>
                          </div>
                        )}

                        {!searchLoading && searchTerm.length <= 1 && (
                          <div className="text-center py-8 text-tertiary">
                            <p>Start typing to search</p>
                          </div>
                        )}

                        {!searchLoading && searchTerm.length > 1 && (
                          <div className="space-y-4">
                            {pageResults.length === 0 &&
                            searchResults.length === 0 ? (
                              <div className="text-center py-4 text-tertiary">
                                <Search className="w-8 h-8 mx-auto mb-2 text-fashion-dark-gray" />
                                <p>No results found for "{searchTerm}"</p>
                              </div>
                            ) : (
                              <>
                                {searchResults.length > 0 && (
                                  <div>
                                    <span className="text-lg font-semibold text-tertiary mb-2">
                                      Products
                                    </span>
                                    <div className="space-y-2">
                                      {searchResults.map((product) => (
                                        <a
                                          key={product._id || product.id}
                                          href={`/product/${
                                            product._id || product.id
                                          }`}
                                          className="flex items-center space-x-3 px-2 py-2 hover:bg-gray-50 rounded transition-colors"
                                        >
                                          <div className="w-10 h-18 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            {(() => {
                                              const p: any = product;
                                              const imgSrc =
                                                p.colors &&
                                                p.colors.length > 0 &&
                                                p.colors[0].images &&
                                                p.colors[0].images.length > 0
                                                  ? p.colors[0].images[0].url
                                                  : p.imageUrl || null;
                                              return imgSrc ? (
                                                <img
                                                  src={imgSrc}
                                                  alt={p.name}
                                                  className="w-full h-full object-contain"
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-tertiary">
                                                  <ShoppingCart className="w-4 h-4" />
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-tertiary truncate text-xl m-0">
                                              {product.name}
                                            </span>
                                            <span className="block text-tertiary federo-numeric text-lg">
                                              ₹{product.price}
                                            </span>
                                          </div>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative group flex flex-col items-center">
              {/* Loyalty badge hidden for now; kept code removed so User button remains */}
              <div className="flex items-center">
                <button
                  className="w-10 h-10 bg-none text-tertiary hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
                  id="profile-icon"
                >
                  <User className="w-6 h-6 text-fashion-dark-gray" />
                </button>
              </div>
              <div
                className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 shadow-xl border border-tertiary/10 bg-white md:bg-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
                style={{ top: "100%" }}
              >
                <div className="py-4">
                  {user ? (
                    <>
                      <div className="px-4 py-3 text-sm text-tertiary border-b border-tertiary/10 ">
                        <p className="font-medium m-0">
                          Welcome, {user.firstName}!
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm text-tertiary hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() =>
                          handleProtectedNav("/profile?tab=orders")
                        }
                        className="block w-full text-left px-4 py-3 text-sm text-tertiary hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/wishlist")}
                        className="block w-full text-left px-4 py-3 text-sm text-tertiary hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Wishlist
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/addresses")}
                        className="block w-full text-left px-4 py-3 text-sm text-tertiary hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Addresses
                      </button>
                      <button
                        onClick={useAuth().logout}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors duration-300 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-fashion-dark-gray" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 text-sm text-tertiary border-b border-tertiary/10 text-center bg-white">
                        <p className="font-medium m-0">Welcome</p>
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
                        className="block w-full text-left px-4 py-3 text-sm text-tertiary hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/wishlist")}
                        className="block w-full text-left px-4 py-3 text-sm text-tertiary hover:bg-fashion-cream transition-colors duration-300"
                      >
                        My Wishlist
                      </button>
                      <button
                        onClick={() => handleProtectedNav("/addresses")}
                        className="block w-full text-left px-4 py-3 text-sm text-tertiary hover:bg-fashion-cream transition-colors duration-300"
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
                className="w-50 h-10 bg-none text-tertiary hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
                aria-label="Wishlist"
              >
                <Heart className="w-6 h-6 text-fashion-dark-gray" />
              </button>
            </div>

            <div className="flex flex-col items-center relative">
              <button
                onClick={onCartClick}
                data-cart-button
                className="w-10 h-10 bg-none text-fashion-dark-gray hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center group"
              >
                <HandbagIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 text-fashion-dark-gray" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full federo-numeric bg-fashion-accent-brown text-white text-lg w-6 h-6 flex items-center justify-center animate-soft-pulse font-medium m-0">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-1 md:mt-0">
            {/* Heart/Wishlist Icon Mobile */}
            <button
              onClick={handleWishlistNav}
              className="relative circle-element w-9 h-9 text-fashion-dark-gray hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-7 h-7 text-fashion-dark-gray" />
            </button>
            <button
              onClick={handleSearchOpen}
              className="relative circle-element w-9 h-9 text-fashion-dark-gray hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              <Search className="w-7 h-7 text-fashion-dark-gray" />
            </button>
            <button
              onClick={onCartClick}
              data-cart-button
              className="relative circle-element w-9 h-9 text-fashion-dark-gray hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              <HandbagIcon className="w-7 h-7 text-fashion-dark-gray" />
              {cartCount > 0 && (
                <span className="federo-numeric absolute -top-1 -right-1 bg-fashion-accent-brown text-white text-xl circle-element w-5 h-5 flex items-center justify-center animate-soft-pulse font-medium m-0">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Loyalty badge hidden for now; show only User button on mobile */}
            <div className="flex items-center">
              <button
                onClick={() => handleProtectedNav("/profile")}
                className="relative circle-element w-9 h-9 text-fashion-dark-gray hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
              >
                <User className="w-7 h-7 text-fashion-dark-gray" />
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative circle-element w-6 h-6 text-fashion-dark-gray hover:text-fashion-accent-brown transition-all duration-300 flex items-center justify-center"
            >
              <div className="relative w-6 h-6">
                <p
                  className={`absolute top-1/2 left-0 w-8 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1"
                  }`}
                />
                <p
                  className={`absolute top-1/2 left-0 w-8 h-0.5 bg-current transition-opacity duration-300 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <p
                  className={`absolute top-1/2 left-0 w-8 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 bg-background backdrop-blur-lg border-b border-tertiary/10 transition-all duration-500 ease-in-out transform ${
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
                    <h6>
                      <a
                        href={link.url}
                        className="block text-tertiary text-2xl hover:text-fashion-accent-brown transition-colors duration-300 font-medium tracking-wide flex items-center justify-between"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                        {link.hasDropdown && (
                          <ChevronDown className="w-6 h-6 text-fashion-dark-gray" />
                        )}
                      </a>
                    </h6>

                    {link.hasDropdown &&
                      link.dropdownItems &&
                      link.dropdownItems.length > 0 && (
                        <div className="ml-4 mt-3 space-y-3 overflow-hidden">
                          {link.dropdownItems
                            .filter((item) => item.isActive)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((item, dropdownIndex) => (
                              <h6 key={item.url || item.name || dropdownIndex}>
                                <a
                                  href={item.url}
                                  className="block text-xl text-tertiary hover:text-fashion-accent-brown transition-all duration-300 transform"
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
                              </h6>
                            ))}
                        </div>
                      )}
                  </div>
                ))}

              <div className="pt-6 border-t border-tertiary/10" />
            </nav>
          </div>
        </div>

        {/* Mobile slide-in search panel (mirrors desktop side panel) */}
        {isSearchOpen && (
          <>
            {/* Backdrop for mobile */}
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setIsSearchOpen(false)}
              aria-hidden
            />

            {/* Sliding panel (mobile) */}
            <div
              className={`fixed top-0 right-0 md:hidden w-full sm:w-[420px] h-full z-50 transform transition-transform duration-300 ${
                isSearchOpen ? "translate-x-0" : "translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white h-full flex flex-col">
                <div className="border-b border-tertiary/10 p-4">
                  <div className="flex items-center">
                    <Search className="w-6 h-6 mr-3 text-fashion-dark-gray" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="flex-1 text-md border-0 focus:outline-none placeholder-gray-400 bg-transparent text-fashion-dark-gray"
                      style={{ fontSize: 16 }}
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      aria-label="Search products"
                    />

                    {searchTerm.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setTimeout(() => searchInputRef.current?.focus(), 0);
                        }}
                        className="ml-3 text-tertiary hover:text-fashion-accent-brown text-xl"
                        aria-label="Clear search"
                      >
                        Clear{" "}
                      </button>
                    )}

                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-3 text-tertiary font-bold hover:text-fashion-accent-brown"
                      aria-label="Close search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Results container (same behavior as desktop) */}
                <div className="flex-1 overflow-y-auto p-4 bg-white">
                  {searchLoading && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fashion-accent-brown"></div>
                      <p className="ml-2 text-tertiary m-0">Searching...</p>
                    </div>
                  )}

                  {!searchLoading && searchTerm.length <= 1 && (
                    <div className="text-center py-8 text-tertiary">
                      <p>Start typing to search</p>
                    </div>
                  )}

                  {!searchLoading && searchTerm.length > 1 && (
                    <div className="space-y-4">
                      {pageResults.length === 0 &&
                      searchResults.length === 0 ? (
                        <div className="text-center py-4 text-tertiary">
                          <Search className="w-8 h-8 mx-auto mb-2 text-fashion-dark-gray" />
                          <p>No results found for "{searchTerm}"</p>
                        </div>
                      ) : (
                        <>
                          {searchResults.length > 0 && (
                            <div>
                              <span className="text-2xl font-semibold text-tertiary mb-2">
                                Products
                              </span>
                              <div className="space-y-2">
                                {searchResults.map((product) => (
                                  <a
                                    key={product._id || product.id}
                                    href={`/product/${
                                      product._id || product.id
                                    }`}
                                    className="flex items-center space-x-3 px-2 py-2 hover:bg-gray-50 rounded transition-colors"
                                  >
                                    <div className="w-10 h-18 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                      {(() => {
                                        const p: any = product;
                                        const imgSrc =
                                          p.colors &&
                                          p.colors.length > 0 &&
                                          p.colors[0].images &&
                                          p.colors[0].images.length > 0
                                            ? p.colors[0].images[0].url
                                            : p.imageUrl || null;
                                        return imgSrc ? (
                                          <img
                                            src={imgSrc}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-tertiary">
                                            <ShoppingCart className="w-4 h-4" />
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-medium text-tertiary truncate text-2xl m-0">
                                        {product.name}
                                      </span>
                                      <span className="block text-tertiary text-xl federo-numeric">
                                        ₹{product.price}
                                      </span>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
