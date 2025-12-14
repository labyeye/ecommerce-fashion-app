import { useEffect, useRef, useState } from "react";

interface SectionScrollOptions {
  threshold?: number; 
  duration?: number; 
  mobileOnly?: boolean; 
  debounceDelay?: number; 
}
export const useSectionScroll = (options: SectionScrollOptions = {}) => {
  const {
    threshold = 50,
    duration = 600,
    mobileOnly = true,
    debounceDelay = 150,
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const currentSectionRef = useRef(0);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const isSnapping = useRef(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); 
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const registerSection = (element: HTMLElement | null) => {
    if (element && !sectionsRef.current.includes(element)) {
      sectionsRef.current.push(element);
      sectionsRef.current.sort((a, b) => {
        const rect1 = a.getBoundingClientRect();
        const rect2 = b.getBoundingClientRect();
        return rect1.top - rect2.top;
      });
    }
  };
  const scrollToSection = (index: number) => {
    if (index < 0 || index >= sectionsRef.current.length) return;

    isSnapping.current = true;
    const section = sectionsRef.current[index];

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    currentSectionRef.current = index;
    setTimeout(() => {
      isSnapping.current = false;
    }, duration);
  };
  const findClosestSection = () => {
    let closestIndex = 0;
    let minDistance = Infinity;

    sectionsRef.current.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.top);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  // Handle scroll
  useEffect(() => {
    if (!isMobile && mobileOnly) return;
    if (sectionsRef.current.length === 0) return;

    const handleScroll = () => {
      if (isSnapping.current) return;

      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        if (Math.abs(scrollDelta) > threshold) {
          const closestSection = findClosestSection();

          if (scrollDelta > 0) {
            const nextSection = Math.min(
              closestSection + 1,
              sectionsRef.current.length - 1
            );
            scrollToSection(nextSection);
          } else {
            const prevSection = Math.max(closestSection - 1, 0);
            scrollToSection(prevSection);
          }
        } else {
          const closestSection = findClosestSection();
          scrollToSection(closestSection);
        }
      }, debounceDelay);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isMobile, mobileOnly, threshold, debounceDelay, duration]);

  return {
    registerSection,
    scrollToSection,
    currentSection: currentSectionRef.current,
    isScrolling,
    isMobile,
  };
};

export default useSectionScroll;
