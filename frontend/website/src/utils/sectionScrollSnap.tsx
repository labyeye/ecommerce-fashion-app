/**
 * CSS-based Section Scroll Snap Utility
 * Applies scroll-snap for mobile-first, section-by-section scrolling
 */

// CSS classes to be added to your global CSS or Tailwind config
export const sectionScrollStyles = `
  /* Scroll snap container - apply to main container */
  .scroll-snap-container {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    overflow-y: scroll;
    height: 100vh;
  }

  /* Scroll snap sections - apply to each section */
  .scroll-snap-section {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    min-height: 100vh;
  }

  /* Mobile only scroll snap */
  @media (max-width: 1023px) {
    .scroll-snap-container-mobile {
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;
    }

    .scroll-snap-section-mobile {
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }
  }

  /* Disable scroll snap on desktop */
  @media (min-width: 1024px) {
    .scroll-snap-container-mobile {
      scroll-snap-type: none;
    }

    .scroll-snap-section-mobile {
      scroll-snap-align: none;
      scroll-snap-stop: normal;
    }
  }

  /* Smooth scrolling for all scenarios */
  .scroll-smooth {
    scroll-behavior: smooth;
  }

  /* Optional: Hide scrollbar while maintaining functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

/**
 * React Component Wrapper for Section Scroll
 */
export const SectionScrollContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  mobileOnly?: boolean;
}> = ({ children, className = "", mobileOnly = true }) => {
  const containerClass = mobileOnly
    ? "scroll-snap-container-mobile"
    : "scroll-snap-container";

  return <div className={`${containerClass} ${className}`}>{children}</div>;
};

/**
 * Section Component
 */
export const ScrollSnapSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  mobileOnly?: boolean;
  fullHeight?: boolean;
}> = ({ children, className = "", mobileOnly = true, fullHeight = true }) => {
  const sectionClass = mobileOnly
    ? "scroll-snap-section-mobile"
    : "scroll-snap-section";

  const heightClass = fullHeight ? "min-h-screen" : "";

  return (
    <section className={`${sectionClass} ${heightClass} ${className}`}>
      {children}
    </section>
  );
};

/**
 * Tailwind CSS Config Extension
 * Add to your tailwind.config.js
 */
export const tailwindScrollSnapConfig = {
  theme: {
    extend: {
      // Add scroll snap utilities
      scrollSnapType: {
        none: "none",
        x: "x var(--tw-scroll-snap-strictness)",
        y: "y var(--tw-scroll-snap-strictness)",
        both: "both var(--tw-scroll-snap-strictness)",
        mandatory: "mandatory",
        proximity: "proximity",
      },
      scrollSnapAlign: {
        start: "start",
        end: "end",
        center: "center",
        none: "none",
      },
      scrollSnapStop: {
        normal: "normal",
        always: "always",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      const newUtilities = {
        ".scroll-snap-type-y-mandatory": {
          "scroll-snap-type": "y mandatory",
        },
        ".scroll-snap-type-y-proximity": {
          "scroll-snap-type": "y proximity",
        },
        ".scroll-snap-type-none": {
          "scroll-snap-type": "none",
        },
        ".scroll-snap-align-start": {
          "scroll-snap-align": "start",
        },
        ".scroll-snap-align-center": {
          "scroll-snap-align": "center",
        },
        ".scroll-snap-align-end": {
          "scroll-snap-align": "end",
        },
        ".scroll-snap-stop-always": {
          "scroll-snap-stop": "always",
        },
        ".scroll-snap-stop-normal": {
          "scroll-snap-stop": "normal",
        },
      };
      addUtilities(newUtilities, ["responsive"]);
    },
  ],
};
