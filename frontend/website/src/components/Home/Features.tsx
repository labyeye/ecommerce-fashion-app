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
      <div className="w-full mx-auto px-0 relative z-10 mb-10">
        <div className="text-center w-full mx-auto max-w-full">
          <div className="text-center w-full mx-auto">
            <span className=" text-6xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
              Timeless elegance, crafted with precision
            </span>
          </div>

          <span className="block text-2xl sm:text-lg md:text-xl text-[#B56932] font-dark leading-relaxed mb-8 sm:mb-12 max-w-lg mx-auto mt-10">
            Every piece in our collection represents a commitment to exceptional
            quality, sustainable practices, and enduring style.
          </span>

          <div className="w-full p-0">
            <div className="flex items-center w-full gap-6 overflow-x-auto py-8 px-0 justify-between max-w-full">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center flex-1"
                  >
                    <div className="circle-element w-16 h-16 sm:w-20 sm:h-20 bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-[#2D2D2D]" />
                    </div>
                    <span className="block text-base sm:text-lg md:text-xl font-medium text-[#2D2D2D] mb-2 sm:mb-3 tracking-wide">
                      {feature.name}
                    </span>
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
