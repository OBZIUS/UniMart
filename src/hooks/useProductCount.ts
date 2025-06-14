
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkUserProductCount } from '../services/productLimitService';
import { useAuthSync } from '../contexts/AuthSyncContext';

export const useProductCount = () => {
  const { isAuthenticated } = useAuth();
  const { isFetching, setIsFetching } = useAuthSync();
  const [productCount, setProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchTimeRef = useRef(0);
  const mountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProductCount = useCallback(async () => {
    if (!isAuthenticated || isFetching || !mountedRef.current) return;

    // Rate limiting: don't fetch more than once per 1000ms
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) return;

    setIsLoading(true);
    setIsFetching(true);
    lastFetchTimeRef.current = now;

    try {
      const count = await checkUserProductCount();
      if (mountedRef.current) {
        setProductCount(count);
      }
    } catch (error) {
      console.error('Error fetching product count:', error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [isAuthenticated, isFetching, setIsFetching]);

  // Debounced fetch with cleanup
  useEffect(() => {
    if (!isAuthenticated) {
      setProductCount(0);
      return;
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set new timeout
    fetchTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        fetchProductCount();
      }
    }, 500);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isAuthenticated, fetchProductCount]);

  const refresh = useCallback(() => {
    lastFetchTimeRef.current = 0; // Reset rate limit
    if (mountedRef.current) {
      fetchProductCount();
    }
  }, [fetchProductCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    productCount,
    isLoading,
    refresh,
    isLimitReached: productCount >= 5
  };
};
