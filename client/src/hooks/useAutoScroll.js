import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Smart auto-scrolling hook that sticks to bottom unless user scrolls up
 */
export function useAutoScroll(dependencies = []) {
  const scrollRef = useRef(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
    setIsUserScrolledUp(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If distance from bottom > 120px, mark as scrolled up
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    setIsUserScrolledUp(distanceFromBottom > 120);
  }, []);

  useEffect(() => {
    if (!isUserScrolledUp && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, dependencies);

  return {
    scrollRef,
    isUserScrolledUp,
    scrollToBottom,
    handleScroll
  };
}
