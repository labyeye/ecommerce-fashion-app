import React, { useRef, useEffect, useState } from "react";

const useFadeOnScroll = <T extends HTMLElement = HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
  const rect = ref.current!.getBoundingClientRect();
      setIsVisible(rect.top < window.innerHeight - 100 && rect.bottom > 100);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return [ref, isVisible] as const;
};

export default useFadeOnScroll;
