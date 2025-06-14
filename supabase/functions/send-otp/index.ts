
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface SendOTPRequest {
  phoneNumber: string;
}

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string, timestamp: number }>();

// Enhanced phone number normalization - strips all non-numeric chars and gets last 10 digits
const normalizePhoneToLast10Digits = (phoneInput: string): string => {
  console.log('=== PHONE NORMALIZATION DEBUG ===');
  console.log('Original phone input:', phoneInput);
  
  // Remove all non-digit characters
  const digitsOnly = phoneInput.replace(/\D/g, '');
  console.log('After removing non-digits:', digitsOnly);
  
  // Get the last 10 digits
  const last10Digits = digitsOnly.slice(-10);
  console.log('Last 10 digits extracted:', last10Digits);
  
  // Validate that we have exactly 10 digits and it's a valid Indian mobile number
  if (last10Digits.length !== 10 || !/^[6-9][0-9]{9}$/.test(last10Digits)) {
    console.log('Invalid phone format - must be 10 digits starting with 6-9');
    throw new Error('Invalid phone number format');
  }
  
  console.log('Final normalized phone (last 10 digits):', last10Digits);
  return last10Digits;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Send OTP Function Started ===');
  console.log('Method:', req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check Twilio credentials first
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({
          success: false,
          error: "SMS service is not configured"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Parse request body
    let requestBody: SendOTPRequest;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Empty request body');
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request format - please send valid JSON"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    const { phoneNumber } = requestBody;
    console.log('Processing phone number:', phoneNumber);

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      console.error('Invalid phone number:', phoneNumber);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Valid phone number is required"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Normalize phone number to last 10 digits
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneToLast10Digits(phoneNumber);
    } catch (normalizeError) {
      console.error('Phone normalization error:', normalizeError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Phone number must be a valid 10-digit Indian mobile number (6-9 followed by 9 digits)"
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

    console.log('=== DATABASE LOOKUP DEBUG ===');
    console.log('Searching for users with last 10 digits matching:', normalizedPhone);
    
    // Query database using SQL to match last 10 digits of stored phone numbers
    const { data: matchedUsers, error: dbError } = await supabase
      .from('profiles')
      .select('id, phone_number, name')
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
    let existingUser = null;
    if (matchedUsers && matchedUsers.length > 0) {
      console.log('=== FILTERING MATCHES ===');
      for (const user of matchedUsers) {
        const storedPhone = user.phone_number || user.phone || '';
        console.log(`Checking user ${user.id}: stored phone = "${storedPhone}"`);
        
        // Extract last 10 digits from stored phone
        const storedLast10 = storedPhone.replace(/\D/g, '').slice(-10);
        console.log(`Stored phone last 10 digits: "${storedLast10}"`);
        console.log(`Input normalized: "${normalizedPhone}"`);
        console.log(`Match: ${storedLast10 === normalizedPhone}`);
        
        if (storedLast10 === normalizedPhone) {
          existingUser = user;
          console.log('✅ EXACT MATCH FOUND:', user);
          break;
        }
      }
    }

    if (!existingUser) {
      console.log('=== NO MATCH FOUND ===');
      console.log('Searched for last 10 digits:', normalizedPhone);
      console.log('No users found with matching phone number');
      
      // Fallback: Let's also try a direct query approach
      console.log('=== FALLBACK QUERY ===');
      const { data: fallbackUsers, error: fallbackError } = await supabase
        .rpc('find_users_by_phone_suffix', { phone_suffix: normalizedPhone })
        .select();

      if (!fallbackError && fallbackUsers && fallbackUsers.length > 0) {
        console.log('Fallback query found users:', fallbackUsers);
        existingUser = fallbackUsers[0];
      } else {
        console.log('Fallback query also returned no results');
      }
    }

    if (!existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Phone number not found. Please sign up first."
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    console.log('✅ User found for OTP:', existingUser);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP ${otp} for phone ${normalizedPhone}`);
    
    // Store OTP with the full international format for consistency
    const fullPhoneNumber = `+91${normalizedPhone}`;
    otpStorage.set(fullPhoneNumber, {
      otp,
      timestamp: Date.now()
    });

    console.log(`Stored OTP in memory for: ${fullPhoneNumber}`);

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    const formData = new URLSearchParams();
    formData.append("From", TWILIO_PHONE_NUMBER);
    formData.append("To", fullPhoneNumber);
    formData.append("Body", `Your UniMart verification code is: ${otp}. Valid for 5 minutes.`);

    console.log('Sending SMS via Twilio...');
    console.log('From:', TWILIO_PHONE_NUMBER);
    console.log('To:', fullPhoneNumber);
    
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const twilioResponseText = await twilioResponse.text();
    console.log('Twilio response status:', twilioResponse.status);
    console.log('Twilio response:', twilioResponseText);

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioResponseText);
      let twilioError;
      try {
        const twilioErrorData = JSON.parse(twilioResponseText);
        twilioError = twilioErrorData.message || "Failed to send SMS";
      } catch {
        twilioError = "Failed to send SMS. Please try again.";
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: twilioError
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log(`✅ OTP ${otp} sent successfully to ${fullPhoneNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully"
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error("Unexpected error in send-otp function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred while sending OTP"
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};

serve(handler);
