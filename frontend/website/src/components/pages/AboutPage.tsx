import React from "react";
import { Sparkles, Palette, Crown, Globe } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <section
      id="about"
      className="py-20"
      style={{ background: 'linear-gradient(135deg, #FFF2E1 0%, #FFFFFF 50%)' }}
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 mt-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span style={{ color: '#95522C' }}>Our Story</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#5a4a42' }}>
            Where vision meets fashion in every stitch, pattern, and hue
          </p>
        </div>

        {/* Mission Section */}
  <div className="rounded-2xl p-8 shadow-lg mb-16" style={{ background: '#FFF2E1', border: '1px solid rgba(149,82,44,0.06)' }}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#95522C' }}>
                Welcome to Flauntbynishi
              </h3>
              <p className="mb-4" style={{ color: '#5a4a42' }}>
                Welcome to Flauntbynishi, where the vision of our founder, Nishi, comes to life in every stitch, pattern, and hue. After graduating from Symbiosis University of Design and completing masters from Nottingham Trent University, Nishi embarked on a journey to redefine the landscape of fashion.
              </p>
              <p className="mb-4" style={{ color: '#5a4a42' }}>
                At Flauntbynishi, we pride ourselves on pushing the boundaries of conventional fashion. Our collections transcend trends, offering timeless pieces that resonate with the modern woman's desire for both style and comfort.
              </p>
              <p style={{ color: '#5a4a42' }}>
                From elegant couture to chic resort wear, every garment reflects our commitment to excellence and dedication to craftsmanship. Using only the finest fabrics and meticulous attention to detail, we ensure that each piece exudes sophistication and grace.
              </p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(149,82,44,0.12), rgba(149,82,44,0.06))' }} className="rounded-2xl p-1">
              <div style={{ background: '#FFFFFF' }} className="rounded-xl p-6 h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-4 flex flex-col items-center text-center" style={{ background: 'rgba(149,82,44,0.06)' }}>
                    <Crown className="w-8 h-8 text-[#95522C] mb-2" />
                    <h4 className="font-semibold text-[#95522C]">
                      Elegant Couture
                    </h4>
                    <p className="text-sm" style={{ color: '#5a4a42' }}>
                      Timeless sophistication
                    </p>
                  </div>
                  <div className="rounded-xl p-4 flex flex-col items-center text-center" style={{ background: 'rgba(149,82,44,0.06)' }}>
                    <Sparkles className="w-8 h-8 text-[#95522C] mb-2" />
                    <h4 className="font-semibold text-[#95522C]">
                      Chic Resort Wear
                    </h4>
                    <p className="text-sm" style={{ color: '#5a4a42' }}>Vacation ready</p>
                  </div>
                  <div className="rounded-xl p-4 flex flex-col items-center text-center" style={{ background: 'rgba(149,82,44,0.06)' }}>
                    <Palette className="w-8 h-8 text-[#95522C] mb-2" />
                    <h4 className="font-semibold text-[#95522C]">
                      Fine Craftsmanship
                    </h4>
                    <p className="text-sm" style={{ color: '#5a4a42' }}>
                      Meticulous attention
                    </p>
                  </div>
                  <div className="rounded-xl p-4 flex flex-col items-center text-center" style={{ background: 'rgba(149,82,44,0.06)' }}>
                    <Globe className="w-8 h-8 text-[#95522C] mb-2" />
                    <h4 className="font-semibold text-[#95522C]">
                      Global Style
                    </h4>
                    <p className="text-sm" style={{ color: '#5a4a42' }}>World-class fashion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="rounded-2xl p-8 shadow-lg mb-16 text-center" style={{ background: '#95522C' }}>
          <h3 className="text-2xl font-bold text-white mb-6">Our Philosophy</h3>
          <p className="text-white text-lg leading-relaxed max-w-4xl mx-auto">
            We're all about those good vibes, at Flauntbynishi. Picture yourself lounging by the pool, strolling on sandy beaches, or dazzling at glamorous soirées. Our curated collections blend sophistication with flair, empowering you to showcase your unique style.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center rounded-2xl p-8 shadow-lg" style={{ background: '#FFF2E1' }}>
          <h3 className="text-2xl font-bold" style={{ color: '#95522C' }}>Join Our Journey</h3>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: '#5a4a42' }}>
            So join us on this journey, as we explore the world in style and create memories that will last a lifetime. With Flauntbynishi, every vacation is an opportunity to express yourself, embrace yourself, and leave a lasting mark on the world.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
