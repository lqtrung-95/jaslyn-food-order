-- Add product_images column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_images JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN orders.product_images IS 'Array of base64-encoded product images for shopping orders';

