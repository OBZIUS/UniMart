
import { useState, useEffect, useCallback } from 'react';
import { getProductsByCategory } from '../services/productService';
import { Product } from '../services/productService';

const PRODUCTS_PER_PAGE = 10;

export const useOptimizedProducts = (category: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadProducts = useCallback(async (pageNumber: number, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const newProducts = await getProductsByCategory(category, pageNumber, PRODUCTS_PER_PAGE);
      
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [category]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  }, [loading, hasMore, page, loadProducts]);

  const refresh = useCallback(() => {
    setPage(0);
    setProducts([]);
    setHasMore(true);
    loadProducts(0, true);
  }, [loadProducts]);

  useEffect(() => {
    loadProducts(0, true);
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
