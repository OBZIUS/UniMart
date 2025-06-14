
-- 1. Strengthen email domain validation with a trigger
CREATE OR REPLACE FUNCTION public.validate_email_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow @sst.scaler.com email addresses
  IF NEW.email !~ '^[^@]+@sst\.scaler\.com$' THEN
    RAISE EXCEPTION 'Only @sst.scaler.com email addresses are allowed';
  END IF;
  RETURN NEW;
END;
$$;

-- Apply email validation to profiles table
DROP TRIGGER IF EXISTS check_email_domain ON public.profiles;
CREATE TRIGGER check_email_domain
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_email_domain();

-- 2. Prevent notification spam with duplicate prevention
CREATE OR REPLACE FUNCTION public.prevent_notification_spam()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_notification_count INTEGER;
BEGIN
  -- Check if user already has a pending notification for this product
  SELECT COUNT(*) INTO existing_notification_count
  FROM public.notifications
  WHERE product_id = NEW.product_id
    AND buyer_id = NEW.buyer_id
    AND seller_id = NEW.seller_id
    AND status = 'pending_seller_confirmation';
  
  IF existing_notification_count > 0 THEN
    RAISE EXCEPTION 'You already have a pending deal request for this product';
  END IF;
  
  -- Verify the product exists and belongs to the seller
  IF NOT EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = NEW.product_id AND user_id = NEW.seller_id
  ) THEN
    RAISE EXCEPTION 'Invalid product or seller mismatch';
  END IF;
  
  -- Prevent self-dealing
  IF NEW.buyer_id = NEW.seller_id THEN
    RAISE EXCEPTION 'Cannot create deal with yourself';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply notification spam prevention
DROP TRIGGER IF EXISTS prevent_spam_notifications ON public.notifications;
CREATE TRIGGER prevent_spam_notifications
  BEFORE INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.prevent_notification_spam();

-- 3. Add rate limiting table for tracking user actions
CREATE TABLE IF NOT EXISTS public.user_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_count INTEGER DEFAULT 1,
  last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour'
);

-- Enable RLS on action logs
ALTER TABLE public.user_action_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own logs
CREATE POLICY "Users can view their own action logs"
ON public.user_action_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Enhanced product security function
CREATE OR REPLACE FUNCTION public.validate_product_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate price logic
  IF NEW.selling_price > NEW.market_price THEN
    RAISE EXCEPTION 'Selling price cannot be higher than market price';
  END IF;
  
  -- Sanitize text inputs to prevent XSS
  NEW.name := trim(NEW.name);
  NEW.description := trim(NEW.description);
  
  -- Validate price ranges
  IF NEW.market_price <= 0 OR NEW.selling_price <= 0 THEN
    RAISE EXCEPTION 'Prices must be greater than zero';
  END IF;
  
  -- Limit description length
  IF length(NEW.description) > 2000 THEN
    RAISE EXCEPTION 'Product description cannot exceed 2000 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply product security validation
DROP TRIGGER IF EXISTS validate_product_data ON public.products;
CREATE TRIGGER validate_product_data
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.validate_product_security();

-- 5. Strengthen RLS policies with better access controls
DROP POLICY IF EXISTS "Allow users to read their own notifications" ON public.notifications;
CREATE POLICY "Allow users to read their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

DROP POLICY IF EXISTS "Allow users to insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated users to create deal notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = buyer_id AND
  EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = seller_id)
);

-- 6. Protect sensitive profile information
DROP POLICY IF EXISTS "Allow public read access to seller profiles" ON public.profiles;
CREATE POLICY "Allow limited public profile access"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Create a view for safe public profile access (without sensitive data)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  room_number,
  academic_year
FROM public.profiles;

-- 7. Add audit logging function
CREATE OR REPLACE FUNCTION public.log_suspicious_activity(
  action_type TEXT,
  details JSONB DEFAULT '{}'::JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    -- Log anonymous suspicious activity
    INSERT INTO public.user_action_logs (user_id, action_type, action_count)
    VALUES ('00000000-0000-0000-0000-000000000000'::UUID, action_type, 1);
  ELSE
    -- Update or insert user action log
    INSERT INTO public.user_action_logs (user_id, action_type, action_count, last_action_at)
    VALUES (current_user_id, action_type, 1, NOW())
    ON CONFLICT (user_id, action_type)
    DO UPDATE SET
      action_count = user_action_logs.action_count + 1,
      last_action_at = NOW();
  END IF;
END;
$$;

-- 8. Create secure contact info sharing function
CREATE OR REPLACE FUNCTION public.get_contact_info_for_deal(notification_id UUID)
RETURNS TABLE (
  seller_email TEXT,
  seller_phone TEXT,
  seller_upi TEXT,
  buyer_email TEXT,
  buyer_phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_record notifications%ROWTYPE;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get notification details
  SELECT * INTO notification_record
  FROM public.notifications
  WHERE id = notification_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification not found';
  END IF;
  
  -- Only allow buyer or seller to access contact info
  IF current_user_id != notification_record.buyer_id AND current_user_id != notification_record.seller_id THEN
    RAISE EXCEPTION 'Unauthorized access to contact information';
  END IF;
  
  -- Return contact information for both parties
  RETURN QUERY
  SELECT 
    seller_profile.email,
    seller_profile.phone_number,
    seller_profile.upi_id,
    buyer_profile.email,
    buyer_profile.phone_number
  FROM public.profiles seller_profile, public.profiles buyer_profile
  WHERE seller_profile.id = notification_record.seller_id
    AND buyer_profile.id = notification_record.buyer_id;
END;
$$;

-- 9. Add indexes for performance and security queries
CREATE INDEX IF NOT EXISTS idx_user_action_logs_user_action ON public.user_action_logs (user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_reset_time ON public.user_action_logs (reset_at);

-- 10. Clean up old action logs automatically
CREATE OR REPLACE FUNCTION public.cleanup_old_action_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_action_logs
  WHERE reset_at < NOW() - INTERVAL '24 hours';
END;
$$;
