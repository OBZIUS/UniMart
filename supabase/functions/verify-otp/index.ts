
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

// In-memory storage for OTPs (shared with send-otp function)
const otpStorage = new Map<string, { otp: string, timestamp: number }>();

// Enhanced phone number normalization - strips all non-numeric chars and gets last 10 digits
const normalizePhoneToLast10Digits = (phoneInput: string): string => {
  console.log('=== PHONE NORMALIZATION DEBUG (VERIFY) ===');
  console.log('Original phone input:', phoneInput);
  
  // Remove all non-digit characters
  const digitsOnly = phoneInput.replace(/\D/g, '');
  console.log('After removing non-digits:', digitsOnly);
  
  // Get the last 10 digits
  const last10Digits = digitsOnly.slice(-10);
  console.log('Last 10 digits extracted:', last10Digits);
  
  console.log('Final normalized phone (last 10 digits):', last10Digits);
  return last10Digits;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Verify OTP Function Started ===');

    // Parse request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request format"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    const { phoneNumber, otp }: VerifyOTPRequest = requestBody;
    console.log('Verifying OTP for phone number:', phoneNumber);

    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Phone number and OTP are required"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Normalize phone number to last 10 digits
    const normalizedPhone = normalizePhoneToLast10Digits(phoneNumber);
    console.log('Normalized phone for OTP lookup:', normalizedPhone);
    
    // Create the full international format for OTP lookup (consistent with send-otp)
    const fullPhoneNumber = `+91${normalizedPhone}`;
    console.log('Full phone number for OTP lookup:', fullPhoneNumber);

    // Check if OTP exists and is valid
    const storedOTP = otpStorage.get(fullPhoneNumber);
    
    if (!storedOTP) {
      console.log('OTP not found for:', fullPhoneNumber);
      console.log('Available OTPs:', Array.from(otpStorage.keys()));
      return new Response(
        JSON.stringify({
          success: false,
          error: "OTP not found or expired. Please request a new one."
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedOTP.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      otpStorage.delete(fullPhoneNumber);
      return new Response(
        JSON.stringify({
          success: false,
          error: "OTP has expired. Please request a new one."
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid OTP. Please try again."
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database configuration error"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('=== DATABASE LOOKUP DEBUG (VERIFY) ===');
    console.log('Searching for users with last 10 digits matching:', normalizedPhone);
    
    // Query database using SQL to match last 10 digits of stored phone numbers
    const { data: matchedUsers, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .or(`phone_number.like.%${normalizedPhone},phone.like.%${normalizedPhone}`);

    if (dbError) {
      console.error('Database error during phone lookup:', dbError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database lookup failed"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log('Database query returned:', matchedUsers?.length || 0, 'potential matches');
    console.log('Raw database results:', matchedUsers);

    // Filter results to find exact match of last 10 digits
    let userProfile = null;
    if (matchedUsers && matchedUsers.length > 0) {
      console.log('=== FILTERING MATCHES (VERIFY) ===');
      for (const user of matchedUsers) {
        const storedPhone = user.phone_number || user.phone || '';
        console.log(`Checking user ${user.id}: stored phone = "${storedPhone}"`);
        
        // Extract last 10 digits from stored phone
        const storedLast10 = storedPhone.replace(/\D/g, '').slice(-10);
        console.log(`Stored phone last 10 digits: "${storedLast10}"`);
        console.log(`Input normalized: "${normalizedPhone}"`);
        console.log(`Match: ${storedLast10 === normalizedPhone}`);
        
        if (storedLast10 === normalizedPhone) {
          userProfile = user;
          console.log('✅ EXACT MATCH FOUND:', user);
          break;
        }
      }
    }

    if (!userProfile) {
      console.error('Profile not found for normalized phone:', normalizedPhone);
      return new Response(
        JSON.stringify({
          success: false,
          error: "User not found. Please sign up first."
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // Create a session for the user (sign them in)
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userProfile.email,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication failed"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Clean up used OTP
    otpStorage.delete(fullPhoneNumber);

    console.log(`✅ OTP verified successfully for ${fullPhoneNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP verified successfully",
        user: userProfile,
        session: authData
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred"
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};

serve(handler);
