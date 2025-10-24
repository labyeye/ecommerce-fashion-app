import React from "react";
import { Zap, Globe, IndianRupee, Heart, ThumbsUp } from "lucide-react";

const Features: React.FC = () => {
  const features = [
    { icon: Zap, name: "Modern Design" },

    {
      icon: IndianRupee,
      name: "Pocket Friendly",
    },
    { icon: ThumbsUp, name: "Quality Assured" },
    { icon: Globe, name: "Global Shipping" },
    { icon: Heart, name: "Customer Loved" },
  ];

  return (
    <section className="relative bg-[#FFF2E1] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-0 max-w-8xl mx-auto">
            <h2 className="text-6xl sm:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
                Timeless elegance, crafted with precision
              </span>
            </h2>
          </div>

          <p className="text-base sm:text-lg text-[#2D2D2D] font-dark leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Every piece in our collection represents a commitment to exceptional
            quality, sustainable practices, and enduring style.
          </p>

          {/* Single-row features layout: horizontal scroll on small screens, evenly spaced on large screens */}
          <div className="glass rounded-lg sm:rounded-fashion p-4 sm:p-8 lg:p-12 shadow-fashion border border-primary/5">
            <div className="flex items-center w-full gap-6 overflow-x-auto py-6 px-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center flex-shrink-0 min-w-[140px] sm:min-w-[160px] lg:min-w-0 lg:flex-1"
                  >
                    <div className="circle-element w-14 h-14 sm:w-16 sm:h-16 bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#2D2D2D]" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-[#2D2D2D] mb-1 sm:mb-2 tracking-wide">
                      {feature.name}
                    </h3>
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
