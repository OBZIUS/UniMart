
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/utils/imageCompression';

export interface Product {
  id: string;
  name: string;
  description?: string;
  market_price: number;
  selling_price: number;
  category: string;
  image_url?: string;
  seller_name: string;
  seller_room_number: string;
  seller_email: string;
  seller_phone_number?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Valid categories that match the database constraint
export const VALID_CATEGORIES = [
  'Electronics',
  'Beauty & Personal Care',
  'Munchies',
  'Stationary',
  'Fruits & Veggies',
  'Other Products'
];

export const uploadProductImage = async (file: File, userId: string, productId: string): Promise<string> => {
  try {
    // Verify user session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('User not authenticated');
    }

    // Compress the image to ensure it's ≤ 400KB for faster loading
    const compressedFile = await compressImage(file, {
      maxSizeMB: 0.4, // 400KB limit for faster loading
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      initialQuality: 0.7
    });
    
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${userId}/${productId}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, compressedFile, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const createProduct = async (productData: {
  name: string;
  description?: string;
  market_price: number;
  selling_price: number;
  category: string;
  image?: File;
}): Promise<Product> => {
  try {
    // Verify authentication with session check
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated');
    }

    const user = session.user;

    // Fetch user profile to get seller details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, room_number, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found. Please complete your profile first.');
    }

    // Validate category against allowed values
    if (!VALID_CATEGORIES.includes(productData.category)) {
      throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // First create the product without image
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        market_price: productData.market_price,
        selling_price: productData.selling_price,
        category: productData.category,
        seller_name: profile.name,
        seller_room_number: profile.room_number,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    // Create the complete product object with seller_email
    const completeProduct: Product = {
      ...product,
      seller_email: profile.email
    };

    // If there's an image, upload it and update the product
    if (productData.image && product) {
      try {
        const imageUrl = await uploadProductImage(productData.image, user.id, product.id);
        
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', product.id)
          .select()
          .single();

        if (updateError) {
          console.error('Product update error:', updateError);
          throw new Error(`Failed to update product with image: ${updateError.message}`);
        }
        return {
          ...updatedProduct,
          seller_email: profile.email
        };
      } catch (imageError) {
        console.error('Image upload failed, but product created:', imageError);
        // Return product without image if upload fails
        return completeProduct;
      }
    }

    return completeProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string, page: number = 0, limit: number = 6): Promise<Product[]> => {
  try {
    const from = page * limit;
    const to = from + limit - 1;

    console.log(`Fetching products for category: ${category}, page: ${page}`);

    // Use inner join to get profile data with the product
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        profiles!fk_products_user_id(
          email,
          phone_number
        )
      `)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    if (!products || products.length === 0) {
      console.log('No products found for category:', category);
      return [];
    }

    console.log(`Found ${products.length} products for category ${category}`);
    console.log('Raw products with profiles:', products);

    // Transform the data to match our Product interface
    const transformedData = products.map(product => {
      const sellerEmail = product.profiles?.email;
      const sellerPhone = product.profiles?.phone_number;
      console.log(`Product ${product.name} (user_id: ${product.user_id}) -> email: ${sellerEmail}, phone: ${sellerPhone}`);
      
      return {
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
        seller_email: sellerEmail || 'Email not available',
        seller_phone_number: sellerPhone
      };
    });

    console.log('Final transformed products:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getUserProducts = async (page: number = 0, limit: number = 6): Promise<Product[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log('No session found for getUserProducts');
      return [];
    }

    const from = page * limit;
    const to = from + limit - 1;

    console.log(`Fetching user products for user: ${session.user.id}, page: ${page}`);

    // Use inner join to get profile data with the product
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        profiles!fk_products_user_id(
          email,
          phone_number
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (productsError) {
      console.error('Error fetching user products:', productsError);
      throw productsError;
    }

    if (!products || products.length === 0) {
      console.log('No products found for user:', session.user.id);
      return [];
    }

    console.log(`Found ${products.length} products for user ${session.user.id}`);
    console.log('Raw user products with profiles:', products);

    // Transform the data to match our Product interface
    const transformedData = products.map(product => {
      const sellerEmail = product.profiles?.email;
      const sellerPhone = product.profiles?.phone_number;
      console.log(`User product ${product.name} -> email: ${sellerEmail}, phone: ${sellerPhone}`);
      
      return {
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
        seller_email: sellerEmail || 'Email not available',
        seller_phone_number: sellerPhone
      };
    });

    console.log('Final user products with emails and phones:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching user products:', error);
    return [];
  }
};

// Real-time subscription for products
export const subscribeToProducts = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
