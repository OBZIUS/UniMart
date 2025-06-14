
import React, { useEffect, useRef, useCallback } from 'react';

interface InfiniteScrollProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  threshold?: number;
}

const InfiniteScroll = ({ 
  hasMore, 
  loading, 
  onLoadMore, 
  children, 
  threshold = 300 
}: InfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: `${threshold}px`
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [handleObserver, threshold]);

  return (
    <>
      {children}
      <div ref={sentinelRef} className="h-4" />
    </>
  );
};

export default InfiniteScroll;
