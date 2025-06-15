import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { checkUserProductCount, clearProductCountCache } from '../services/productLimitService';

interface ProductCountContextType {
  productCount: number;
  isLoading: boolean;
  isLimitReached: boolean;
  refresh: () => void;
  clearCache: () => void;
}

const ProductCountContext = createContext<ProductCountContextType | undefined>(undefined);

// Global state to prevent multiple API calls across different component instances
let globalState = {
  productCount: 0,
  isLoading: false,
  lastFetch: 0,
  initialized: false,
  currentUserId: null as string | null,
};

const RATE_LIMIT_MS = 30000; // 30 seconds
const listeners = new Set<() => void>();

export const ProductCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [productCount, setProductCount] = useState(globalState.productCount);
  const [isLoading, setIsLoading] = useState(globalState.isLoading);
  const mountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  // Register this component as a listener for global state changes
  useEffect(() => {
    const updateLocalState = () => {
      if (mountedRef.current) {
        setProductCount(globalState.productCount);
        setIsLoading(globalState.isLoading);
      }
    };

    listeners.add(updateLocalState);
    
    // Set initial state
    updateLocalState();

    return () => {
      listeners.delete(updateLocalState);
    };
  }, []);

  // Notify all listeners when global state changes
  const notifyListeners = useCallback(() => {
    listeners.forEach(listener => listener());
  }, []);

  // Core fetch function with strict rate limiting
  const fetchProductCount = useCallback(async (force = false) => {
    const now = Date.now();
    const userId = user?.id;

    if (!userId || !isAuthenticated) {
      console.log('ProductCount: No authenticated user, skipping fetch');
      return;
    }

    // Rate limiting check
    if (!force && (now - globalState.lastFetch) < RATE_LIMIT_MS) {
      console.log(`ProductCount: Rate limited, ${Math.ceil((RATE_LIMIT_MS - (now - globalState.lastFetch)) / 1000)}s remaining`);
      return;
    }

    // Prevent concurrent fetches
    if (globalState.isLoading) {
      console.log('ProductCount: Fetch already in progress');
      return;
    }

    console.log('ProductCount: Starting fetch for user:', userId);
    
    globalState.isLoading = true;
    globalState.lastFetch = now;
    notifyListeners();

    try {
      const count = await checkUserProductCount();
      
      globalState.productCount = count;
      globalState.initialized = true;
      globalState.currentUserId = userId;
      
      console.log(`ProductCount: Fetched count: ${count}`);
    } catch (error) {
      console.error('ProductCount: Fetch error:', error);
    } finally {
      globalState.isLoading = false;
      notifyListeners();
    }
  }, [user?.id, isAuthenticated, notifyListeners]);

  // Handle authentication state changes
  useEffect(() => {
    if (!mountedRef.current) return;

    const userId = user?.id;

    if (!isAuthenticated || !userId) {
      // Reset on logout
      console.log('ProductCount: User logged out, resetting state');
      globalState.productCount = 0;
      globalState.initialized = false;
      globalState.currentUserId = null;
      globalState.lastFetch = 0;
      notifyListeners();
      
      // Clear any pending initialization
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = undefined;
      }
      return;
    }

    // User changed - reset and refetch
    if (globalState.currentUserId && globalState.currentUserId !== userId) {
      console.log('ProductCount: User changed, resetting state');
      globalState.productCount = 0;
      globalState.initialized = false;
      globalState.currentUserId = userId;
      globalState.lastFetch = 0;
    }

    // Initialize for new session (with delay to prevent rapid auth state changes)
    if (!globalState.initialized && !globalState.isLoading) {
      console.log('ProductCount: Initializing for new session');
      
      // Clear any existing timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      // Delay initialization to prevent rapid successive calls during app startup
      initTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && isAuthenticated && user?.id === userId) {
          fetchProductCount();
        }
      }, 2000); // 2 second delay
    }

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = undefined;
      }
    };
  }, [isAuthenticated, user?.id, fetchProductCount, notifyListeners]);

  // Manual refresh with throttling
  const refresh = useCallback(() => {
    const now = Date.now();
    if (now - globalState.lastFetch < 10000) { // 10 second minimum for manual refresh
      console.log('ProductCount: Manual refresh throttled');
      return;
    }
    
    if (isAuthenticated && user?.id) {
      console.log('ProductCount: Manual refresh triggered');
      fetchProductCount(true);
    }
  }, [isAuthenticated, user?.id, fetchProductCount]);

  // Clear cache function
  const clearCache = useCallback(() => {
    console.log('ProductCount: Clearing cache');
    clearProductCountCache(user?.id);
    globalState.lastFetch = 0;
    globalState.initialized = false;
    
    // Immediately refetch if authenticated
    if (isAuthenticated && user?.id) {
      setTimeout(() => fetchProductCount(true), 100);
    }
  }, [user?.id, isAuthenticated, fetchProductCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: ProductCountContextType = {
    productCount,
    isLoading,
    isLimitReached: productCount >= 5,
    refresh,
    clearCache,
  };

  return (
    <ProductCountContext.Provider value={contextValue}>
      {children}
    </ProductCountContext.Provider>
  );
};

export const useProductCount = () => {
  const context = useContext(ProductCountContext);
  if (!context) {
    throw new Error('useProductCount must be used within ProductCountProvider');
  }
  return context;
};

// Export function to clear cache when products are added/deleted
export const clearGlobalProductCountCache = () => {
  console.log('ProductCount: Global cache clear requested');
  globalState.productCount = 0;
  globalState.lastFetch = 0;
  globalState.initialized = false;
  
  // Notify all listeners
  listeners.forEach(listener => listener());
  
  // Clear service cache
  clearProductCountCache();
};
