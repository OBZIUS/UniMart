
import { supabase } from '@/integrations/supabase/client';

export const deleteProduct = async (productId: string, imageUrl?: string): Promise<void> => {
  try {
    // Verify user authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated');
    }

    console.log('Deleting product with cleanup:', productId);

    // Use the new secure function that handles both product and image deletion
    const { data, error } = await supabase.rpc('delete_product_with_cleanup', {
      product_uuid: productId
    });

    if (error) {
      console.error('Error deleting product with cleanup:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    if (!data) {
      throw new Error('Product deletion failed - no response from server');
    }

    console.log('Product and image successfully deleted from backend');
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};
