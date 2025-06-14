
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedDashboardData {
  profile: any;
  userProducts: any[];
  recentProducts: any[];
  stats: {
    totalProducts: number;
    totalFavorites: number;
  };
}

const PRODUCTS_LIMIT = 6; // Reduced for faster loading

export const fetchOptimizedDashboardData = async (userId: string): Promise<OptimizedDashboardData> => {
  try {
    // Batch critical queries with minimal data selection
    const [profileResult, userProductsResult, recentProductsResult] = await Promise.all([
      // User profile - only essential fields
      supabase
        .from('profiles')
        .select('id, name, email, phone, room_number, academic_year')
        .eq('id', userId)
        .maybeSingle(),
      
      // User's products (limited) - only essential fields
      supabase
        .from('products')
        .select('id, name, selling_price, category, image_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(PRODUCTS_LIMIT),
      
      // Recent products for activity feed (limited) - minimal fields
      supabase
        .from('products')
        .select('id, name, category, selling_price, created_at, seller_name')
        .order('created_at', { ascending: false })
        .limit(3) // Even more limited for performance
    ]);

    // Handle errors individually but don't throw
    if (profileResult.error) {
      console.error('Error fetching profile:', profileResult.error);
    }

    if (userProductsResult.error) {
      console.error('Error fetching user products:', userProductsResult.error);
    }

    if (recentProductsResult.error) {
      console.error('Error fetching recent products:', recentProductsResult.error);
    }

    // Get counts separately to avoid blocking main queries
    const statsPromise = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .then(({ count, error }) => {
        if (error) console.error('Error fetching product count:', error);
        return {
          totalProducts: count || 0,
          totalFavorites: 0 // This will come from localStorage
        };
      });

    const stats = await statsPromise;

    return {
      profile: profileResult.data,
      userProducts: userProductsResult.data || [],
      recentProducts: recentProductsResult.data || [],
      stats
    };
  } catch (error) {
    console.error('Error fetching optimized dashboard data:', error);
    throw error;
  }
};

export const fetchUserProductsPaginated = async (
  userId: string, 
  page: number, 
  limit: number = PRODUCTS_LIMIT
) => {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('products')
    .select('id, name, selling_price, category, image_url, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    products: data || [],
    hasMore: count ? (from + limit) < count : false,
    total: count || 0
  };
};
