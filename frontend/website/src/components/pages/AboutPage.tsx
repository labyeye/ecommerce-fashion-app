import React, { useEffect, useState } from "react";
import p1 from "../../assets/images/a1.webp";
import p2 from "../../assets/images/a2.webp";
import p3 from "../../assets/images/a3.webp";

type VisibleMap = Record<string, boolean>;

function getPlaceholderDataUri(label = "photo"): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='1000'><rect width='100%' height='100%' fill='%23F6EDE3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%2395522C' font-family='Arial, Helvetica, sans-serif'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function useRevealOnScroll(): VisibleMap {
  const [visibleIds, setVisibleIds] = useState<VisibleMap>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.revealId;
            if (id) setVisibleIds((s) => ({ ...s, [id]: true }));
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-id]")
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return visibleIds;
}

const AboutPage: React.FC = () => {
  const visible = useRevealOnScroll();

  const createImageErrorHandler =
    (label: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src = getPlaceholderDataUri(label);
    };

  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-br from-[#FFF2E1] to-white"
    >
      <div className="container mx-auto px-6 mt-8">
        <div
          className={`space-y-6 ${
            visible["story"] ? "fade-up-visible" : "fade-up"
          }`}
          data-reveal-id="story"
        >
          <span className="block font-bold text-[#95522C] text-center text-2xl sm:text-3xl md:text-4xl">
            Our Journey
          </span>
          <span className="block text-base sm:text-lg md:text-xl lg:text-xl text-tertiary leading-relaxed text-center">
            Every trip brought the same question: "What do we wear?" Bags full,
            yet nothing felt right. Outfits looked good, but didn’t feel like
            us.
          </span>
          <span className="block text-base sm:text-lg md:text-xl lg:text-xl text-tertiary leading-relaxed text-center md:text-justify">
            After years of packing chaos, last-minute outfit stress, and endless
            shopping hunts, we decided to create what we could never find —
            effortless resort wear that looks good, feels good, and doesn’t cost
            a fortune.
          </span>
        </div>

        <div
          className={`grid md:grid-cols-2 gap-6 items-stretch rounded-2xl overflow-hidden shadow-lg mt-8 ${
            visible["panel1"] ? "slide-from-left-visible" : "slide-from-left"
          }`}
          data-reveal-id="panel1"
        >
          <div className="p-8 flex flex-col justify-center bg-background">
            <span className="block text-base sm:text-lg md:text-lg lg:text-xl text-tertiary leading-relaxed text-justify">
              Every brand has a beginning. Ours started with two boarding passes
              and a dream. What started as two people’s love for travel turned
              into a journey that redefined their purpose. From late-night
              stitching sessions to customising for friends, Flaunt grew from a
              small idea into a self-made label built with heart.
            </span>
          </div>

          <div className="relative h-60 md:h-80">
            <img
              src={p1}
              alt="travel scene"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 10%" }}
              onError={createImageErrorHandler("travel1.jpg")}
            />
          </div>
        </div>

        <div
          className={`grid md:grid-cols-2 gap-6 items-stretch rounded-2xl overflow-hidden shadow-lg mt-8 ${
            visible["panel2"] ? "slide-from-right-visible" : "slide-from-right"
          }`}
          data-reveal-id="panel2"
        >
          <div className="relative h-60 md:h-100">
            <img
              src={p2}
              alt="founder stitching"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
              onError={createImageErrorHandler("travel2.jpg")}
            />
          </div>

          <div className="p-8 flex flex-col justify-center bg-background">
            <span className="block text-base sm:text-lg md:text-lg lg:text-xl text-tertiary leading-relaxed text-justify">
              After years of packing chaos, last-minute outfit stress, and
              endless shopping hunts, we decided to create what we could never
              find — effortless resort wear that looks good, feels good, and
              doesn’t cost a fortune. Flaunt by Nishi is built for the
              explorers, the dreamers, the women who chase sunsets and
              confidence in equal measure. We’re not here to follow trends.
              We’re here to make you feel like you wherever you go.
            </span>
          </div>
        </div>

        <div
          className={`grid md:grid-cols-2 gap-6 items-stretch rounded-2xl overflow-hidden shadow-lg mt-8 ${
            visible["panel3"] ? "slide-from-left-visible" : "slide-from-left"
          }`}
          data-reveal-id="panel3"
        >
          <div className="p-8 flex flex-col justify-center bg-background">
            <span className="block text-base sm:text-lg md:text-lg lg:text-xl text-tertiary leading-relaxed text-justify">
              We had no roadmap — just a belief that maybe, somehow, we could
              turn our travel struggles into a solution for every woman who’s
              ever stood in front of her suitcase thinking, “I have nothing to
              wear.” Flaunt by Nishi is crafted to complement your unique style
              and needs. Every piece is thoughtfully designed to ensure comfort,
              versatility, and elegance, making your travel wardrobe effortless
              and chic.
            </span>
          </div>

          <div className="relative h-60 md:h-80">
            <img
              src={p3}
              alt="designer sketching"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 40%" }}
              onError={createImageErrorHandler("travel3.jpg")}
            />
          </div>
        </div>
      </div>

      <style>{`[data-reveal-id] { transition: opacity 1600ms ease, transform 1600ms ease; opacity:0; transform: translateY(12px) scale(0.995); } .fade-up-visible, .fade-up-visible * { opacity:1; transform:none; } .zoom { transform: scale(.98); opacity:0; transition: transform 1600ms cubic-bezier(.2,.9,.3,1), opacity 600ms; } .zoom-visible { transform: scale(1); opacity:1; } .slide-from-left { opacity: 0; transform: translateX(-36px); transition: opacity 600ms ease, transform 600ms ease; } .slide-from-right { opacity: 0; transform: translateX(36px); transition: opacity 600ms ease, transform 600ms ease; } .slide-from-left-visible, .slide-from-right-visible, .slide-from-left-visible *, .slide-from-right-visible * { opacity: 1; transform: none; }`}</style>
    </section>
  );
};

export default AboutPage;
