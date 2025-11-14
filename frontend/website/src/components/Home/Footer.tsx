import React, { useEffect, useState } from "react";
import { Facebook, Instagram } from "lucide-react";
import axios from "axios";
import photo from "../../assets/IMG_6285.jpg";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get("https://ecommerce-fashion-app-som7.vercel.app/api/categories");
        const data = res.data && res.data.data ? res.data.data : [];
        setCategories(data.slice(0, 10));
      } catch (err) {
        console.error("Failed to load categories for footer:", err);
      }
    };
    loadCategories();
  }, []);

  return (
    // subtle SVG sand texture applied via data URL

    <footer
      className="bg-[#f2e0cb] text-dark w-full"
      style={{
        backgroundImage: `linear-gradient(rgba(242,224,203,0.82), rgba(242,224,203,0.82)), url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-10 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-44 items-start">
          <div className="lg:col-span-1">
            <div className="flex items-start space-x-2 mb-4 sm:mb-6">
              <h6>
                <span className="font-bold text-dark">Flaunt by Nishi</span>
              </h6>
            </div>
            <span className="text-lg text-dark mb-4 sm:mb-6 leading-relaxed max-w-[280px] space-y-3">
              Fashion that speaks your language. Curated collections for the
              modern wardrobe. Style without compromise.
            </span>
            <div className="flex space-x-3 sm:space-x-4 mt-7 mb-6">
              <button className="w-10 h-10 sm:w-10 sm:h-10  flex items-center justify-center transition-all duration-300">
                <Facebook className="w-7 h-7 sm:w-7 sm:h-7" />
              </button>
              <button className="w-10 h-10 sm:w-10 sm:h-10  flex items-center justify-center transition-all duration-300">
                <Instagram className="w-7 h-7 sm:w-7 sm:h-7" />
              </button>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-8 h-8 sm:w-10 sm:h-10  flex items-center justify-center hover:scale-110 transition-all duration-300"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1384/1384023.png"
                  alt="WhatsApp"
                  className="w-7 h-7 sm:w-7 sm:h-7 object-contain"
                  loading="lazy"
                />
              </a>
            </div>
          </div>

          {/* Categories Column */}
          <div className="lg:col-span-1">
            <h1 className="text-2xl font-semibold mb-3 text-dark">
              <span className="text-transparent bg-clip-text bg-black">
                Categories
              </span>
            </h1>
            <ul className="space-y-3 mb-6 mt-7">
              {categories.length === 0 && (
                <li className="text-sm text-dark/70">No categories</li>
              )}
              {categories.map((cat) => (
                <li key={cat._id}>
                  <a
                    href={`/products?category=${encodeURIComponent(cat.slug)}`}
                    className="text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[180px] block"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-1 ">
            <h1 className="text-2xl font-semibold mb-3 text-dark ">
              <span className="text-transparent bg-clip-text bg-black">
                Company
              </span>
            </h1>
            <ul className="space-y-3 mb-6 mt-7">
              <li>
                <p>
                  <a
                    href="/about"
                    className="bg-clip-text text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[200px] block"
                  >
                    Our Story
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="/blogs"
                    className="text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[200px] block"
                  >
                    Blog
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="#"
                    className="text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[200px] block"
                  >
                    Quality Promise
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="#"
                    className="text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[200px] block"
                  >
                    Careers
                  </a>
                </p>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-1">
            <h1 className="text-2xl font-semibold mb-3 text-dark ">
              <span className="text-transparent bg-clip-text bg-black">
                Support
              </span>
            </h1>
            <ul className="space-y-3 mb-6 mt-7">
              <li>
                <p>
                  <a
                    href="/shipping"
                    className="text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[200px] block"
                  >
                    Shipping Info
                  </a>
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="/returns"
                    className="text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[200px] block"
                  >
                    Returns & Refunds
                  </a>
                </p>
              </li>

              <li>
                <p>
                  <a
                    href="/contact"
                    className="text-xl text-dark/80 hover:text-dark transition-colors duration-200 max-w-[200px] block"
                  >
                    Contact Us
                  </a>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-dark/80">
              <span className="text-lg">
                &copy; {currentYear} Flaunt by Nishi. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="/privacy"
                className="text-dark/80 hover:text-dark text-lg transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-dark/80 hover:text-dark text-lg transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="/returns"
                className="text-dark/80 hover:text-dark text-lg transition-colors duration-200"
              >
                Return Policy
              </a>
              <a
                href="/faq"
                className="text-dark/80 hover:text-dark text-lg transition-colors duration-200"
              >
                FAQ
              </a>
            </div>
            <div className="flex items-center space-x-2 text-[#2D2D2D]/80">
              <a
                href="https://pixelatenest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg hover:text-dark transition-colors duration-200"
              >
                Developed by Pixelate Nest
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* General review UI removed — product reviews live on product detail pages to prevent spam */}
    </footer>
  );
};

export default Footer;
