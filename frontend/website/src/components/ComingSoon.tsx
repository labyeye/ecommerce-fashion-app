import React from 'react';
import { Instagram } from 'lucide-react';
import logo from "../assets/images/logoblack.png";
const ComingSoon: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#FFF2E1] to-[#FCF4EA] flex items-center justify-center">
      <div className="text-center px-8 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-12 w-40 mx-auto">
          <img src={logo} alt="Logo" className="mx-auto" />
        </div>

        {/* Coming Soon */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-[#95522C] mb-6">
            Coming Soon
          </h2>
          <p className="text-lg md:text-xl text-[#95522C]/80 leading-relaxed">
            We're crafting something beautiful for you. <br />
            Stay tuned for timeless elegance.
          </p>
        </div>

        {/* Instagram Follow */}
        <div className="space-y-6">
          <p className="text-xl md:text-2xl text-[#95522C] font-medium">
            Follow us on Instagram for updates
          </p>
          
          <a 
            href="https://instagram.com/flauntbynishi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#95522C] text-[#FFF2E1] rounded-full font-semibold text-lg hover:bg-[#7A4423] transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Instagram className="w-6 h-6" />
            @flauntbynishi
          </a>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-[#95522C]/20 rounded-full opacity-50 animate-pulse hidden md:block"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-[#95522C]/20 rounded-full opacity-30 animate-pulse hidden md:block"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 border border-[#95522C]/15 rounded-full opacity-40 animate-pulse hidden lg:block"></div>
      </div>
    </div>
  );
};

export default ComingSoon;