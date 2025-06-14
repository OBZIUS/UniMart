
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, getProductsByCategory, subscribeToProducts } from '@/services/productService';
import { useAuthSync } from '../contexts/AuthSyncContext';

export const useRealtimeProducts = (category: string, limit: number = 6) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { isFetching, setIsFetching } = useAuthSync();
  
  // Refs to prevent duplicate subscriptions and fetches
  const subscriptionRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const fetchProducts = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    // Rate limiting: don't fetch more than once per 300ms
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 300) return;
    
    if (isFetching) return;

    try {
      setError(null);
      setIsFetching(true);
      lastFetchTimeRef.current = now;
      
      if (reset) {
        setLoading(true);
        setProducts([]);
      }

      const newProducts = await getProductsByCategory(category, pageNum, limit);
      
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === limit);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [category, limit, isFetching, setIsFetching]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isFetching) {
      fetchProducts(page + 1, false);
    }
  }, [fetchProducts, page, loading, hasMore, isFetching]);

  const refresh = useCallback(() => {
    lastFetchTimeRef.current = 0; // Reset rate limit
    fetchProducts(0, true);
  }, [fetchProducts]);

  // Initial fetch
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchProducts(0, true);
    }
  }, [fetchProducts]);

  // Real-time subscription - only subscribe once per category
  useEffect(() => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    const unsubscribe = subscribeToProducts((payload) => {
      console.count(`Real-time update for ${category}`);
      console.log('Real-time update:', payload);
      
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT' && newRecord?.category === category) {
        setProducts(prev => {
          // Prevent duplicates
          const exists = prev.find(p => p.id === newRecord.id);
          if (exists) return prev;
          return [newRecord, ...prev];
        });
      } else if (eventType === 'UPDATE' && newRecord?.category === category) {
        setProducts(prev => 
          prev.map(product => 
            product.id === newRecord.id ? newRecord : product
          )
        );
      } else if (eventType === 'DELETE') {
        // Handle deletion for any category - remove from current products
        console.log('Product deleted, removing from local state:', oldRecord?.id);
        setProducts(prev => 
          prev.filter(product => product.id !== oldRecord?.id)
        );
      }
    });

    subscriptionRef.current = unsubscribe;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [category]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};
