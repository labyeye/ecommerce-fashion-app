import React from "react";
import {
  Sparkles,
  Leaf,
  Zap,
  Heart,
  Shield,
  Globe,
  CheckCircle,
  Award,
  Star,
} from "lucide-react";
import FloatingElements from "../ui/FloatingElements";
import CircularElement from "../ui/CircularElement";

const Features: React.FC = () => {
  const features = [
    { icon: Sparkles, name: "Premium Quality", description: "Curated materials" },
    { icon: Zap, name: "Modern Design", description: "Contemporary styles" },
    { icon: Shield, name: "Quality Assured", description: "Rigorous testing" },
    { icon: Globe, name: "Global Shipping", description: "Worldwide delivery" },
    { icon: CheckCircle, name: "Easy Returns", description: "Hassle-free policy" },
    { icon: Star, name: "Customer Loved", description: "5-star reviews" },
  ];

  return (
    <section className="relative py-10 sm:py-16 lg:py-24 bg-background overflow-hidden">
      <FloatingElements density="light" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Brand Mark */}
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <div className="text-2xl sm:text-3xl md:text-4xl font-dark text-[#2D2D2D] mb-3 tracking-[0.15em] sm:tracking-[0.2em]">FASHION</div>
            <div className="h-0.5 w-16 sm:w-20 bg-secondary mx-auto"></div>
          </div>

          {/* Main Heading */}
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-dark text-[#2D2D2D] mb-4 sm:mb-6 leading-tight tracking-wide">
            Timeless elegance,
            <br className="hidden sm:block" />
            <span className="text-secondary">crafted with precision.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#2D2D2D] font-dark leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Every piece in our collection represents a commitment to exceptional quality, 
            sustainable practices, and enduring style.
          </p>

          {/* Features Grid */}
          <div className="glass rounded-lg sm:rounded-fashion p-4 sm:p-8 lg:p-12 shadow-fashion border border-primary/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center group p-2 sm:p-3"
                  >
                    <div className="circle-element w-14 h-14 sm:w-16 sm:h-16 bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#2D2D2D]" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-[#2D2D2D] mb-1 sm:mb-2 tracking-wide">
                      {feature.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2D2D2D]/70 font-dark leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;