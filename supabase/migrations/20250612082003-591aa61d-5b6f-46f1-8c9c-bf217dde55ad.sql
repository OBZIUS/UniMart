
-- Create an index on the category column for faster product queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

-- Create a composite index for category and created_at for optimized pagination
CREATE INDEX IF NOT EXISTS idx_products_category_created_at ON public.products (category, created_at DESC);

-- Create an index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products (user_id);
