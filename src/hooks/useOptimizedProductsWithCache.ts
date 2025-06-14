
import { useState, useEffect, useCallback, useRef } from 'react';
import { getProductsByCategory } from '../services/productService';
import { Product } from '../services/productService';

const PRODUCTS_PER_PAGE = 20; // Increased from 10 for better performance
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

interface CacheEntry {
  data: Product[];
  timestamp: number;
  page: number;
}

const productCache = new Map<string, CacheEntry>();

export const useOptimizedProductsWithCache = (category: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((cat: string, pageNum: number) => `${cat}-${pageNum}`, []);

  const loadProducts = useCallback(async (pageNumber: number, reset = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey(category, pageNumber);
      const cached = productCache.get(cacheKey);
      const now = Date.now();

      // Check if we have valid cached data
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log(`Using cached data for ${category} page ${pageNumber}`);
        if (reset) {
          setProducts(cached.data);
        } else {
          setProducts(prev => [...prev, ...cached.data]);
        }
        setHasMore(cached.data.length === PRODUCTS_PER_PAGE);
        setLoading(false);
        return;
      }

      console.log(`Fetching fresh data for ${category} page ${pageNumber}`);
      const newProducts = await getProductsByCategory(category, pageNumber, PRODUCTS_PER_PAGE);

      // Don't update state if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Cache the results
      productCache.set(cacheKey, {
        data: newProducts,
        timestamp: now,
        page: pageNumber
      });

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
      setPage(pageNumber);
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [category, getCacheKey]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(page + 1);
    }
  }, [loading, hasMore, page, loadProducts]);

  const refresh = useCallback(() => {
    // Clear cache for this category
    const keysToDelete = Array.from(productCache.keys()).filter(key => key.startsWith(category));
    keysToDelete.forEach(key => productCache.delete(key));
    
    setPage(0);
    setProducts([]);
    setHasMore(true);
    loadProducts(0, true);
  }, [category, loadProducts]);

  useEffect(() => {
    loadProducts(0, true);
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [category, loadProducts]);

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};
