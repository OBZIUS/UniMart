
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Products table RLS policies
CREATE POLICY "Allow public read access to products" 
ON public.products 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow users to insert their own products" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own products" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own products" 
ON public.products 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Notifications table RLS policies
CREATE POLICY "Allow users to read their own notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Allow users to insert notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Allow users to update their own notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Allow users to delete their own notifications" 
ON public.notifications 
FOR DELETE 
TO authenticated 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Profiles table RLS policies
CREATE POLICY "Allow users to read their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Allow public read access to basic profile info for product sellers
CREATE POLICY "Allow public read access to seller profiles" 
ON public.profiles 
FOR SELECT 
TO public 
USING (true);
