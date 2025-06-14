
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityAudit = () => {
  const logSuspiciousActivity = useCallback(async (
    actionType: string, 
    details: Record<string, any> = {}
  ) => {
    try {
      const { error } = await supabase.rpc('log_suspicious_activity', {
        action_type: actionType,
        details: details
      });
      
      if (error) {
        console.error('Failed to log suspicious activity:', error);
      }
    } catch (error) {
      console.error('Security audit error:', error);
    }
  }, []);

  const checkRateLimit = useCallback(async (actionType: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_action_logs')
        .select('action_count, reset_at')
        .eq('action_type', actionType)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Rate limit check error:', error);
        return false;
      }

      if (data) {
        const resetTime = new Date(data.reset_at);
        const now = new Date();
        
        // Reset if time has passed
        if (now > resetTime) {
          return true;
        }

        // Check if user has exceeded reasonable limits
        const limits = {
          'product_upload': 5,
          'deal_request': 10,
          'profile_update': 3,
          'login_attempt': 5
        };

        const limit = limits[actionType as keyof typeof limits] || 10;
        return data.action_count < limit;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }, []);

  return {
    logSuspiciousActivity,
    checkRateLimit
  };
};
