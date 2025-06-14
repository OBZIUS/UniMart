
import { supabase } from '@/integrations/supabase/client';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';

interface CreateDealRequestParams {
  productId: string;
  sellerId: string;
  buyerId: string;
}

export const secureNotificationService = {
  async createDealRequest({ productId, sellerId, buyerId }: CreateDealRequestParams) {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== buyerId) {
        throw new Error('Unauthorized: Authentication required');
      }

      // Prevent self-dealing (additional frontend check)
      if (buyerId === sellerId) {
        throw new Error('Cannot create deal request with yourself');
      }

      // Create notification - the database trigger will handle validation
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          status: 'pending_seller_confirmation'
        })
        .select()
        .single();

      if (error) {
        console.error('Deal request creation failed:', error);
        
        // Log suspicious activity for certain error types
        if (error.message.includes('already have a pending')) {
          await supabase.rpc('log_suspicious_activity', {
            action_type: 'duplicate_deal_attempt',
            details: { productId, error: error.message }
          });
        }
        
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Secure notification service error:', error);
      throw error;
    }
  },

  async getContactInfo(notificationId: string) {
    try {
      const { data, error } = await supabase.rpc('get_contact_info_for_deal', {
        notification_id: notificationId
      });

      if (error) {
        console.error('Failed to get contact info:', error);
        throw new Error('Failed to retrieve contact information');
      }

      return data[0] || null;
    } catch (error) {
      console.error('Contact info retrieval error:', error);
      throw error;
    }
  },

  async markDealComplete(notificationId: string, userId: string) {
    try {
      const { data, error } = await supabase.rpc('complete_deal', {
        notification_id: notificationId,
        user_id: userId
      });

      if (error) {
        console.error('Failed to mark deal complete:', error);
        throw new Error('Failed to complete deal');
      }

      return data;
    } catch (error) {
      console.error('Deal completion error:', error);
      throw error;
    }
  }
};
