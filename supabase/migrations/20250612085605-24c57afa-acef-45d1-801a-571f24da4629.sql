
-- Add indexes for foreign keys in notifications table to improve join performance
CREATE INDEX IF NOT EXISTS idx_notifications_buyer_id ON public.notifications (buyer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_seller_id ON public.notifications (seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_product_id ON public.notifications (product_id);

-- Add composite index for common notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_buyer_status ON public.notifications (buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_seller_status ON public.notifications (seller_id, status);

-- Remove unused indexes on products table that are not being utilized
-- (Keep the essential ones but remove redundant ones if they exist)
DROP INDEX IF EXISTS idx_products_category_created_at; -- This might be redundant with individual indexes
