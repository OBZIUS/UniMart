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
  const lastAuthStateRef = useRef(isAuthenticated);
  const hasInitializedRef = useRef(false);

  const fetchProductCount = useCallback(async () => {
    if (!isAuthenticated || isFetching || !mountedRef.current) return;

    // Rate limiting: don't fetch more than once per 5000ms (increased from 3000ms)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 5000) return;

    console.log('Fetching product count from API');
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

  // Only fetch when authentication state actually changes or on initial mount
  useEffect(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Only proceed if auth state actually changed or it's the first time
    const authStateChanged = lastAuthStateRef.current !== isAuthenticated;
    const isFirstLoad = !hasInitializedRef.current;
    
    if (authStateChanged || isFirstLoad) {
      lastAuthStateRef.current = isAuthenticated;
      hasInitializedRef.current = true;
      
      if (!isAuthenticated) {
        setProductCount(0);
        return;
      }

      // Debounced fetch with longer delay to reduce API calls
      fetchTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          fetchProductCount();
        }
      }, 2000); // Increased from 1000ms to 2000ms
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isAuthenticated]); // Remove fetchProductCount from dependencies to prevent re-renders

  const refresh = useCallback(() => {
    // Only allow manual refresh if enough time has passed
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 3000) {
      console.log('Refresh blocked - too frequent');
      return;
    }
    
    lastFetchTimeRef.current = 0; // Reset rate limit for manual refresh
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
