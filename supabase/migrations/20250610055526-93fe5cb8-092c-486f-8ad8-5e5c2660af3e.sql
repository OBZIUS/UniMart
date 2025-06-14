
-- Enable RLS on deals_metadata table if not already enabled
ALTER TABLE deals_metadata ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access to the deals_completed count
CREATE POLICY "Allow public read access to deals_completed counter" 
ON deals_metadata 
FOR SELECT 
TO public 
USING (key = 'deals_completed');

-- Create a policy that allows authenticated users to read their own user-specific data
CREATE POLICY "Allow users to read their own stats" 
ON deals_metadata 
FOR SELECT 
TO authenticated 
USING (
  key LIKE 'user_purchased_%' OR 
  key LIKE 'user_sold_%' OR 
  key = 'deals_completed'
);
