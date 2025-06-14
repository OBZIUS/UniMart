
import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  profile: any;
  userProducts: any[];
  favorites: any[];
  // Add other dashboard data as needed
}

export const fetchDashboardData = async (userId: string): Promise<DashboardData> => {
  try {
    // Batch all dashboard queries into a single Promise.all for better performance
    const [profileResult, productsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    if (profileResult.error) {
      console.error('Error fetching profile:', profileResult.error);
    }

    if (productsResult.error) {
      console.error('Error fetching products:', productsResult.error);
    }

    return {
      profile: profileResult.data,
      userProducts: productsResult.data || [],
      favorites: [] // This will come from localStorage for now
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
