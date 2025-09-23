import React from "react";
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
  Leaf,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
  <footer className="bg-primary text-dark">
      {/* Newsletter Section */}
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl font-bold text-dark">
                Flaunt by Nishi
              </span>
            </div>
            <p className="text-sm sm:text-base text-dark mb-4 sm:mb-6 leading-relaxed">
              Fashion that speaks your language. Curated collections for the
              modern wardrobe. Style without compromise.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-dark">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Our Story
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Quality Promise
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-dark">Support</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Size Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
            </ul>

            
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-dark/80">
              <span>
                &copy; {currentYear} Flaunt by Nishi. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-dark/80 hover:text-dark text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-dark/80 hover:text-dark text-sm transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-dark/80 hover:text-dark text-sm transition-colors duration-200"
              >
                Cookie Policy
              </a>
            </div>
            <div className="flex items-center space-x-2 text-[#2D2D2D]/80">
              <a
                href="https://pixelatenest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-dark transition-colors duration-200"
              >
                Developed by Pixelate Nest
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
