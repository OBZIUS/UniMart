
import { supabase } from '@/integrations/supabase/client';
import { Product } from './productService';

// Optimized product fetching with better query structure
export const getOptimizedProductsByCategory = async (
  category: string, 
  page: number = 0, 
  limit: number = 20
): Promise<Product[]> => {
  try {
    const from = page * limit;
    const to = from + limit - 1;

    console.log(`Optimized fetch: ${category}, page: ${page}, limit: ${limit}`);

    // Use the new indexes for optimized query
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        market_price,
        selling_price,
        category,
        image_url,
        seller_name,
        seller_room_number,
        created_at,
        updated_at,
        user_id,
        profiles!fk_products_user_id(
          email,
          phone_number
        )
      `)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (productsError) {
      console.error('Optimized query error:', productsError);
      throw productsError;
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Transform the data efficiently
    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      market_price: product.market_price,
      selling_price: product.selling_price,
      category: product.category,
      image_url: product.image_url,
      seller_name: product.seller_name,
      seller_room_number: product.seller_room_number,
      created_at: product.created_at,
      updated_at: product.updated_at,
      user_id: product.user_id,
      seller_email: product.profiles?.email || 'Email not available',
      seller_phone_number: product.profiles?.phone_number
    }));
  } catch (error) {
    console.error('Error in optimized product fetch:', error);
    throw error;
  }
};
