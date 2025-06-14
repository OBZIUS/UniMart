
import { supabase } from '@/integrations/supabase/client';

export const checkUserProductCount = async (): Promise<number> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return 0;

    const { data, error } = await supabase.rpc('get_user_product_count', {
      user_uuid: session.user.id
    });

    if (error) {
      console.error('Error checking product count:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error checking product count:', error);
    return 0;
  }
};

export const isProductLimitReached = async (): Promise<boolean> => {
  const count = await checkUserProductCount();
  return count >= 5;
};
