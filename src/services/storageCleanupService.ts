
import { supabase } from '@/integrations/supabase/client';

export const cleanupOrphanedImages = async (): Promise<{ cleaned: number; errors: string[] }> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated');
    }

    // Get all files in the product-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', {
        limit: 1000,
        offset: 0
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return { cleaned: 0, errors: [listError.message] };
    }

    if (!files || files.length === 0) {
      return { cleaned: 0, errors: [] };
    }

    let cleanedCount = 0;
    const errors: string[] = [];

    // Check each file to see if it corresponds to an existing product
    for (const file of files) {
      try {
        // Extract user_id from file path (assuming format: user_id/filename)
        const pathParts = file.name.split('/');
        if (pathParts.length < 2) continue;

        const userId = pathParts[0];
        const fileName = pathParts[1];

        // Check if there's a product that uses this image
        const { data: publicUrl } = supabase.storage
          .from('product-images')
          .getPublicUrl(file.name);

        const { data: products, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('image_url', publicUrl.publicUrl)
          .limit(1);

        if (productError) {
          errors.push(`Error checking product for ${file.name}: ${productError.message}`);
          continue;
        }

        // If no product uses this image, delete it
        if (!products || products.length === 0) {
          const { error: deleteError } = await supabase.storage
            .from('product-images')
            .remove([file.name]);

          if (deleteError) {
            errors.push(`Error deleting ${file.name}: ${deleteError.message}`);
          } else {
            cleanedCount++;
            console.log(`Cleaned up orphaned image: ${file.name}`);
          }
        }
      } catch (error) {
        errors.push(`Error processing ${file.name}: ${error}`);
      }
    }

    return { cleaned: cleanedCount, errors };
  } catch (error) {
    console.error('Error in cleanupOrphanedImages:', error);
    return { cleaned: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
};

export const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl) return true;

    // Extract the file path from the URL
    const urlParts = imageUrl.split('/');
    const productImagesIndex = urlParts.findIndex(part => part === 'product-images');
    
    if (productImagesIndex === -1 || productImagesIndex >= urlParts.length - 1) {
      console.warn('Invalid image URL format:', imageUrl);
      return false;
    }

    // Get the path after 'product-images/'
    const filePath = urlParts.slice(productImagesIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image from storage:', error);
      return false;
    }

    console.log('Successfully deleted image from storage:', filePath);
    return true;
  } catch (error) {
    console.error('Error in deleteImageFromStorage:', error);
    return false;
  }
};
