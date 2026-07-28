import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Reset window scroll position to the top
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
