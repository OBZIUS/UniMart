
-- First, let's check if RLS policies are working correctly for deals_metadata
-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Allow public read access to deals_completed counter" ON deals_metadata;
DROP POLICY IF EXISTS "Allow users to read their own stats" ON deals_metadata;

-- Create a comprehensive policy that allows public read access to the global counter
-- and authenticated users to read their own stats
CREATE POLICY "Public can read deals_completed counter" 
ON deals_metadata 
FOR SELECT 
TO public 
USING (key = 'deals_completed');

-- Create a policy for authenticated users to read their personal stats
CREATE POLICY "Users can read their own purchase/sold stats" 
ON deals_metadata 
FOR SELECT 
TO authenticated 
USING (
  key = 'deals_completed' OR
  key LIKE 'user_purchased_' || auth.uid()::text OR 
  key LIKE 'user_sold_' || auth.uid()::text
);

-- Ensure the deals_completed counter exists and has the correct value
INSERT INTO deals_metadata (key, value)
VALUES ('deals_completed', 0)
ON CONFLICT (key) DO NOTHING;

-- Let's also add a policy to allow the backend functions to update the counter
CREATE POLICY "System can update deals metadata" 
ON deals_metadata 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
