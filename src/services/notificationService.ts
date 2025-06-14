import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  buyer_marked: boolean;
  seller_marked: boolean;
  created_at: string;
  updated_at: string;
  buyer_name?: string;
  seller_name?: string;
  product_name?: string;
}

export const createDealNotification = async (productId: string, sellerId: string): Promise<Notification> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating deal notification for:', { productId, sellerId, buyerId: session.user.id });

    // Check if notification already exists for this buyer-product combination
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id')
      .eq('product_id', productId)
      .eq('buyer_id', session.user.id)
      .eq('seller_id', sellerId)
      .single();

    if (existingNotification) {
      throw new Error('You have already marked this deal. Wait for seller confirmation.');
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        product_id: productId,
        buyer_id: session.user.id,
        seller_id: sellerId,
        status: 'pending_seller_confirmation',
        buyer_marked: true,
        seller_marked: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create deal notification: ${error.message}`);
    }

    console.log('Deal notification created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createDealNotification:', error);
    throw error;
  }
};

export const cancelDeal = async (notificationId: string): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    console.log('Canceling deal for notification:', notificationId, 'by user:', session.user.id);

    // Delete the notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('seller_id', session.user.id); // Only seller can cancel

    if (error) {
      console.error('Error canceling deal:', error);
      throw new Error(`Failed to cancel deal: ${error.message}`);
    }

    console.log('Deal canceled successfully');
  } catch (error) {
    console.error('Error in cancelDeal:', error);
    throw error;
  }
};

export const markDealComplete = async (notificationId: string): Promise<{ success: boolean; deal_completed: boolean }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    console.log('Marking deal complete for notification:', notificationId, 'by user:', session.user.id);

    // Use the updated complete_deal function that handles image cleanup
    const { data, error } = await supabase.rpc('complete_deal', {
      notification_id: notificationId,
      user_id: session.user.id
    });

    if (error) {
      console.error('Error marking deal complete:', error);
      throw new Error(`Failed to mark deal complete: ${error.message}`);
    }

    let result: { success: boolean; deal_completed: boolean };
    if (typeof data === 'string') {
      try {
        result = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }
    } else {
      result = data as { success: boolean; deal_completed: boolean };
    }

    console.log('Deal completion result:', result);
    
    // Log when deal is fully completed and cleanup happens
    if (result.deal_completed) {
      console.log('Deal fully completed - product and image have been removed from backend');
    }
    
    return result;
  } catch (error) {
    console.error('Error in markDealComplete:', error);
    throw error;
  }
};

export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return [];
    }

    console.log('Fetching notifications for user:', session.user.id);

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        buyer:profiles!notifications_buyer_id_fkey(name),
        seller:profiles!notifications_seller_id_fkey(name),
        product:products!notifications_product_id_fkey(name)
      `)
      .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    // Transform the data to include buyer_name, seller_name and product_name
    const transformedData = (data || []).map(notification => ({
      ...notification,
      buyer_name: notification.buyer?.name || 'Unknown Buyer',
      seller_name: notification.seller?.name || 'Unknown Seller',
      product_name: notification.product?.name || 'Unknown Product'
    }));

    console.log('Fetched notifications:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return [];
  }
};

export const getDealsCompletedCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('deals_metadata')
      .select('value')
      .eq('key', 'deals_completed')
      .single();

    if (error) {
      console.error('Error fetching deals count:', error);
      return 0;
    }

    return data?.value || 0;
  } catch (error) {
    console.error('Error in getDealsCompletedCount:', error);
    return 0;
  }
};

export const getUserPurchasedCount = async (): Promise<number> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('deals_metadata')
      .select('value')
      .eq('key', `user_purchased_${session.user.id}`)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user purchased count:', error);
      return 0;
    }

    return data?.value || 0;
  } catch (error) {
    console.error('Error in getUserPurchasedCount:', error);
    return 0;
  }
};

export const getUserSoldCount = async (): Promise<number> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('deals_metadata')
      .select('value')
      .eq('key', `user_sold_${session.user.id}`)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user sold count:', error);
      return 0;
    }

    return data?.value || 0;
  } catch (error) {
    console.error('Error in getUserSoldCount:', error);
    return 0;
  }
};
