import { supabase } from '@/integrations/supabase/client';

// Enhanced caching with better tracking
const cache = new Map<string, { count: number; timestamp: number }>();
const CACHE_DURATION = 90000; // 1.5 minutes cache
const callLog = new Map<string, number[]>(); // Track call frequency per user

// Global rate limiting with enhanced logging
let lastGlobalCall = 0;
const GLOBAL_RATE_LIMIT = 30000; // 30 seconds

// Function to log API call frequency
const logApiCall = (userId: string) => {
  const now = Date.now();
  
  if (!callLog.has(userId)) {
    callLog.set(userId, []);
  }
  
  const userCalls = callLog.get(userId)!;
  userCalls.push(now);
  
  // Keep only calls from last 5 minutes for analysis
  const fiveMinutesAgo = now - 300000;
  const recentCalls = userCalls.filter(timestamp => timestamp > fiveMinutesAgo);
  callLog.set(userId, recentCalls);
  
  if (recentCalls.length > 5) {
    console.warn(`⚠️ ProductLimitService: High API frequency detected for user ${userId}: ${recentCalls.length} calls in 5 minutes`);
  }
  
  console.log(`📊 ProductLimitService: API call logged for user ${userId}. Recent calls: ${recentCalls.length}`);
};

export const checkUserProductCount = async (): Promise<number> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log('❌ ProductLimitService: No authenticated session');
      return 0;
    }

    const userId = session.user.id;
    const now = Date.now();
    
    // Log this API attempt
    logApiCall(userId);
    
    // Strict global rate limiting
    if (now - lastGlobalCall < GLOBAL_RATE_LIMIT) {
      const remainingTime = Math.ceil((GLOBAL_RATE_LIMIT - (now - lastGlobalCall)) / 1000);
      console.log(`🚫 ProductLimitService: Global rate limit active (${remainingTime}s remaining), using cache`);
      const cached = cache.get(userId);
      return cached ? cached.count : 0;
    }
    
    // Check cache first
    const cached = cache.get(userId);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`✅ ProductLimitService: Using cached product count: ${cached.count} (age: ${Math.round((now - cached.timestamp) / 1000)}s)`);
      return cached.count;
    }

    console.log(`🔄 ProductLimitService: Making fresh API call to get_user_product_count for user: ${userId}`);
    lastGlobalCall = now;
    
    const startTime = Date.now();
    const { data, error } = await supabase.rpc('get_user_product_count', {
      user_uuid: session.user.id
    });
    const duration = Date.now() - startTime;

    if (error) {
      console.error(`❌ ProductLimitService: RPC error (${duration}ms):`, error);
      return cached ? cached.count : 0;
    }

    const count = data || 0;
    console.log(`✅ ProductLimitService: API response received (${duration}ms): count = ${count}`);
    
    // Update cache
    cache.set(userId, { count, timestamp: now });
    
    // Clean up old cache entries (keep only last 5)
    if (cache.size > 5) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cache.clear();
      entries.slice(0, 5).forEach(([key, value]) => cache.set(key, value));
      console.log('🧹 ProductLimitService: Cache cleaned up');
    }

    return count;
  } catch (error) {
    console.error('❌ ProductLimitService: Unexpected error:', error);
    return 0;
  }
};

export const isProductLimitReached = async (): Promise<boolean> => {
  const count = await checkUserProductCount();
  return count >= 5;
};

// Enhanced cache clearing with logging
export const clearProductCountCache = (userId?: string) => {
  if (userId) {
    cache.delete(userId);
    callLog.delete(userId);
    console.log(`🗑️ ProductLimitService: Cleared cache for user: ${userId}`);
  } else {
    cache.clear();
    callLog.clear();
    console.log('🗑️ ProductLimitService: Cleared all cache');
  }
  // Reset global rate limit when cache is cleared intentionally
  lastGlobalCall = 0;
};

// Function to get API call statistics (for debugging)
export const getApiCallStats = () => {
  const stats: Record<string, number> = {};
  callLog.forEach((calls, userId) => {
    stats[userId] = calls.length;
  });
  return {
    totalUsers: callLog.size,
    cacheSize: cache.size,
    userCallCounts: stats,
    lastGlobalCall: new Date(lastGlobalCall).toISOString(),
  };
};