import React from "react";
import { Sparkles, Palette, Crown, Globe } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-br from-white via-[#FEFCF8]/50 to-white"
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 mt-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#2D2D2D] to-[#666666] bg-clip-text text-transparent">
              Our Story
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Where vision meets fashion in every stitch, pattern, and hue
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-4">
                Welcome to Flauntbynishi
              </h3>
              <p className="text-gray-600 mb-4">
                Welcome to Flauntbynishi, where the vision of our founder, Nishi, comes to life in every stitch, pattern, and hue. After graduating from Symbiosis University of Design and completing masters from Nottingham Trent University, Nishi embarked on a journey to redefine the landscape of fashion.
              </p>
              <p className="text-gray-600 mb-4">
                At Flauntbynishi, we pride ourselves on pushing the boundaries of conventional fashion. Our collections transcend trends, offering timeless pieces that resonate with the modern woman's desire for both style and comfort.
              </p>
              <p className="text-gray-600">
                From elegant couture to chic resort wear, every garment reflects our commitment to excellence and dedication to craftsmanship. Using only the finest fabrics and meticulous attention to detail, we ensure that each piece exudes sophistication and grace.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#2D2D2D] to-[#666666] rounded-2xl p-1">
              <div className="bg-white/90 rounded-xl p-6 h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#2D2D2D]/10 rounded-xl p-4 flex flex-col items-center text-center">
                    <Crown className="w-8 h-8 text-[#2D2D2D] mb-2" />
                    <h4 className="font-semibold text-[#2D2D2D]">
                      Elegant Couture
                    </h4>
                    <p className="text-sm text-gray-600">
                      Timeless sophistication
                    </p>
                  </div>
                  <div className="bg-[#2D2D2D]/10 rounded-xl p-4 flex flex-col items-center text-center">
                    <Sparkles className="w-8 h-8 text-[#2D2D2D] mb-2" />
                    <h4 className="font-semibold text-[#2D2D2D]">
                      Chic Resort Wear
                    </h4>
                    <p className="text-sm text-gray-600">Vacation ready</p>
                  </div>
                  <div className="bg-[#2D2D2D]/10 rounded-xl p-4 flex flex-col items-center text-center">
                    <Palette className="w-8 h-8 text-[#2D2D2D] mb-2" />
                    <h4 className="font-semibold text-[#2D2D2D]">
                      Fine Craftsmanship
                    </h4>
                    <p className="text-sm text-gray-600">
                      Meticulous attention
                    </p>
                  </div>
                  <div className="bg-[#2D2D2D]/10 rounded-xl p-4 flex flex-col items-center text-center">
                    <Globe className="w-8 h-8 text-[#2D2D2D] mb-2" />
                    <h4 className="font-semibold text-[#2D2D2D]">
                      Global Style
                    </h4>
                    <p className="text-sm text-gray-600">World-class fashion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-[#2D2D2D] rounded-2xl p-8 shadow-lg mb-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Our Philosophy</h3>
          <p className="text-gray-200 text-lg leading-relaxed max-w-4xl mx-auto">
            We're all about those good vibes, at Flauntbynishi. Picture yourself lounging by the pool, strolling on sandy beaches, or dazzling at glamorous soirées. Our curated collections blend sophistication with flair, empowering you to showcase your unique style.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-[#FEFCF8] to-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-[#2D2D2D] mb-4">Join Our Journey</h3>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            So join us on this journey, as we explore the world in style and create memories that will last a lifetime. With Flauntbynishi, every vacation is an opportunity to express yourself, embrace yourself, and leave a lasting mark on the world.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
