
import { supabase } from '@/integrations/supabase/client';
import { deleteImageFromStorage } from './storageCleanupService';

export const deleteProduct = async (productId: string, imageUrl?: string): Promise<void> => {
  try {
    // Verify user authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated');
    }

    // Delete the product from database (with user_id verification via RLS)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', session.user.id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      throw new Error(`Failed to delete product: ${deleteError.message}`);
    }

    // Delete associated image from storage if it exists
    if (imageUrl) {
      const imageDeleted = await deleteImageFromStorage(imageUrl);
      if (!imageDeleted) {
        console.warn('Failed to delete image from storage, but product was deleted successfully');
      }
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};
