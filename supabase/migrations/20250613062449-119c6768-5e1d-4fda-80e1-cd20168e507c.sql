
-- First, let's safely enable RLS only on tables that don't have it yet
DO $$
BEGIN
  -- Enable RLS on products if not already enabled
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'products' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on notifications if not already enabled  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on profiles if not already enabled
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on user_action_logs if not already enabled
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_action_logs' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    ALTER TABLE public.user_action_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Drop existing policies if they exist to avoid conflicts, then recreate them
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

-- Recreate products policies
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert their own products" ON public.products
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON public.products
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT TO authenticated 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE TO authenticated 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can delete their notifications" ON public.notifications
  FOR DELETE TO authenticated 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

-- User action logs policies
DROP POLICY IF EXISTS "Users can view their own action logs" ON public.user_action_logs;
DROP POLICY IF EXISTS "System can insert action logs" ON public.user_action_logs;

CREATE POLICY "Users can view their own action logs" ON public.user_action_logs
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert action logs" ON public.user_action_logs
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Create storage bucket only if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT TO public 
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own product images" ON storage.objects
  FOR UPDATE TO authenticated 
  USING (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own product images" ON storage.objects
  FOR DELETE TO authenticated 
  USING (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
