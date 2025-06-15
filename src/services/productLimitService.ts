import { supabase } from '@/integrations/supabase/client';

// Simple in-memory cache to reduce database calls
const cache = new Map<string, { count: number; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds cache (increased from 5 seconds)

export const checkUserProductCount = async (): Promise<number> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return 0;

    const userId = session.user.id;
    const now = Date.now();
    
    // Check cache first
    const cached = cache.get(userId);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Using cached product count:', cached.count);
      return cached.count;
    }

    console.log('Fetching fresh product count from database');
    const { data, error } = await supabase.rpc('get_user_product_count', {
      user_uuid: session.user.id
    });

    if (error) {
      console.error('Error checking product count:', error);
      return 0;
    }

    const count = data || 0;
    
    // Update cache
    cache.set(userId, { count, timestamp: now });
    
    // Clean up old cache entries (keep only last 10)
    if (cache.size > 10) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cache.clear();
      entries.slice(0, 10).forEach(([key, value]) => cache.set(key, value));
    }

    return count;
  } catch (error) {
    console.error('Error checking product count:', error);
    return 0;
  }
};

export const isProductLimitReached = async (): Promise<boolean> => {
  const count = await checkUserProductCount();
  return count >= 5;
};

// Function to clear cache when products are added/deleted
export const clearProductCountCache = (userId?: string) => {
  if (userId) {
    cache.delete(userId);
    console.log('Cleared product count cache for user:', userId);
  } else {
    cache.clear();
    console.log('Cleared all product count cache');
  }
};
