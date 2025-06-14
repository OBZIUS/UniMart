
-- Reset the deals completed counter to 0
UPDATE deals_metadata 
SET value = 0, updated_at = NOW()
WHERE key = 'deals_completed';

-- Insert the record if it doesn't exist
INSERT INTO deals_metadata (key, value)
VALUES ('deals_completed', 0)
ON CONFLICT (key) DO UPDATE SET value = 0, updated_at = NOW();
