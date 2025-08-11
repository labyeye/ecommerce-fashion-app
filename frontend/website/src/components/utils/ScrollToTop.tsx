import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top with a slight delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant' // Use instant instead of smooth for immediate effect
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
