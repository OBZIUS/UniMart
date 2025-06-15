
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

export const useEmailVerification = () => {
  const verifyEmail = async (email: string, action: 'signup' | 'signin' = 'signin'): Promise<EmailVerificationResult> => {
    console.log(`🔍 Starting email verification for: ${email}, action: ${action}`);
    
    try {
      console.log('📡 Calling verify-email Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { email, action }
      });

      console.log('📡 Edge Function response:', { data, error });

      // Handle FunctionsHttpError or other errors
      if (error) {
        console.error('❌ Email verification Edge Function error:', error);
        
        // Check if it's a FunctionsHttpError with details
        if (error.message?.includes('FunctionsHttpError')) {
          return {
            valid: false,
            error: 'Email verification service is temporarily unavailable. Please try again.'
          };
        }
        
        // Check if it's a network/connection error
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          return {
            valid: false,
            error: 'Network error. Please check your connection and try again.'
          };
        }
        
        return {
          valid: false,
          error: error.message || 'Email verification service is temporarily unavailable. Please try again.'
        };
      }

      // Handle successful response
      if (data) {
        console.log('✅ Email verification result:', data);
        return data as EmailVerificationResult;
      }

      // Fallback if no data and no error
      console.error('⚠️ No data received from email verification service');
      return {
        valid: false,
        error: 'Email verification service returned no data. Please try again.'
      };
      
    } catch (error: any) {
      console.error('💥 Email verification network/system error:', error);
      
      return {
        valid: false,
        error: 'Unable to verify email. Please check your connection and try again.'
      };
    }
  };

  return { verifyEmail };
};