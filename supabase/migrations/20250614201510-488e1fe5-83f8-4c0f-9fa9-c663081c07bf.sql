-- Create a function to safely delete product images from storage
CREATE OR REPLACE FUNCTION public.delete_product_with_cleanup(product_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_record products%ROWTYPE;
  image_path text;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get the product details first
  SELECT * INTO product_record
  FROM public.products 
  WHERE id = product_uuid AND user_id = current_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or unauthorized';
  END IF;
  
  -- Delete the image from storage if it exists
  IF product_record.image_url IS NOT NULL THEN
    -- Extract the file path from image URL
    image_path := regexp_replace(product_record.image_url, '.*product-images/', '');
    
    -- Delete the image from storage
    PERFORM storage.delete_object('product-images', image_path);
  END IF;
  
  -- Delete any related notifications
  DELETE FROM public.notifications 
  WHERE product_id = product_uuid;
  
  -- Delete the product
  DELETE FROM public.products 
  WHERE id = product_uuid AND user_id = current_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to delete product: %', SQLERRM;
END;
$$;

-- Update the complete_deal function to properly clean up images
CREATE OR REPLACE FUNCTION public.complete_deal(notification_id uuid, user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_record notifications%ROWTYPE;
    product_record products%ROWTYPE;
    is_buyer BOOLEAN := FALSE;
    is_seller BOOLEAN := FALSE;
    deal_completed BOOLEAN := FALSE;
    image_path text;
BEGIN
    -- Get the notification
    SELECT * INTO notification_record 
    FROM notifications 
    WHERE id = notification_id;
    
    IF NOT FOUND THEN
        RETURN '{"success": false, "error": "Notification not found"}'::JSON;
    END IF;
    
    -- Check if user is buyer or seller
    IF notification_record.buyer_id = user_id THEN
        is_buyer := TRUE;
    ELSIF notification_record.seller_id = user_id THEN
        is_seller := TRUE;
    ELSE
        RETURN '{"success": false, "error": "Unauthorized"}'::JSON;
    END IF;
    
    -- Update the appropriate flag
    IF is_buyer THEN
        UPDATE notifications 
        SET buyer_marked = TRUE, updated_at = NOW()
        WHERE id = notification_id;
    ELSIF is_seller THEN
        UPDATE notifications 
        SET seller_marked = TRUE, updated_at = NOW()
        WHERE id = notification_id;
    END IF;
    
    -- Check if both parties have marked the deal
    SELECT buyer_marked AND seller_marked INTO deal_completed
    FROM notifications 
    WHERE id = notification_id;
    
    -- If deal is completed, clean up and increment counters
    IF deal_completed THEN
        -- Get product details before deletion for image cleanup
        SELECT * INTO product_record
        FROM products 
        WHERE id = notification_record.product_id;
        
        -- Delete the image from storage if it exists
        IF product_record.image_url IS NOT NULL THEN
            image_path := regexp_replace(product_record.image_url, '.*product-images/', '');
            PERFORM storage.delete_object('product-images', image_path);
        END IF;
        
        -- Delete the product
        DELETE FROM products WHERE id = notification_record.product_id;
        
        -- Delete the notification
        DELETE FROM notifications WHERE id = notification_id;
        
        -- Increment global deals completed counter
        PERFORM increment_deals_completed();
        
        -- Increment buyer's purchased count
        INSERT INTO deals_metadata (key, value)
        VALUES ('user_purchased_' || notification_record.buyer_id::text, 1)
        ON CONFLICT (key) 
        DO UPDATE SET value = deals_metadata.value + 1, updated_at = NOW();
        
        -- Increment seller's sold count
        INSERT INTO deals_metadata (key, value)
        VALUES ('user_sold_' || notification_record.seller_id::text, 1)
        ON CONFLICT (key) 
        DO UPDATE SET value = deals_metadata.value + 1, updated_at = NOW();
        
        RETURN '{"success": true, "deal_completed": true}'::JSON;
    ELSE
        RETURN '{"success": true, "deal_completed": false}'::JSON;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;