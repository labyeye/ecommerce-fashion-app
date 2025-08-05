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
    { icon: Leaf, name: "Sustainable", description: "Eco-conscious choices" },
    { icon: Zap, name: "Modern Design", description: "Contemporary styles" },
    { icon: Heart, name: "Comfort First", description: "All-day wearability" },
    { icon: Shield, name: "Quality Assured", description: "Rigorous testing" },
    { icon: Globe, name: "Global Shipping", description: "Worldwide delivery" },
    { icon: CheckCircle, name: "Easy Returns", description: "Hassle-free policy" },
    { icon: Award, name: "Award Winning", description: "Industry recognized" },
    { icon: Star, name: "Customer Loved", description: "5-star reviews" },
  ];

  return (
    <section className="relative py-16 lg:py-24 bg-fashion-cream overflow-hidden">
      <FloatingElements density="light" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Brand Mark */}
          <div className="mb-8 lg:mb-12">
            <div className="text-3xl md:text-4xl font-light text-fashion-charcoal mb-3 tracking-[0.2em]">FASHION</div>
            <div className="h-0.5 w-20 bg-fashion-accent-brown mx-auto"></div>
          </div>

          {/* Main Heading */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-fashion-charcoal mb-6 leading-tight tracking-wide">
            Timeless elegance,
            <br />
            <span className="text-fashion-accent-brown">crafted with precision.</span>
          </h2>

          <p className="text-lg text-fashion-dark-gray font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            Every piece in our collection represents a commitment to exceptional quality, 
            sustainable practices, and enduring style.
          </p>

          {/* Features Grid */}
          <div className="glass rounded-fashion p-8 lg:p-12 shadow-fashion border border-fashion-charcoal/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="circle-element w-16 h-16 bg-fashion-accent-brown/10 border-2 border-fashion-accent-brown/20 flex items-center justify-center mb-4 group-hover:bg-fashion-accent-brown/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-7 h-7 text-fashion-accent-brown" />
                    </div>
                    <h3 className="text-lg font-medium text-fashion-charcoal mb-2 tracking-wide">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-fashion-dark-gray font-light leading-relaxed">
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