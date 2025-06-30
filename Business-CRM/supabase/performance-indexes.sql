-- Performance Optimization Indexes for 925 Silver E-commerce
-- These indexes improve query performance for common operations

-- Index for product searches by category
CREATE INDEX IF NOT EXISTS idx_products_category 
ON products(category) 
WHERE is_active = true;

-- Index for product searches by price range
CREATE INDEX IF NOT EXISTS idx_products_price 
ON products(price) 
WHERE is_active = true;

-- Index for order lookups by user
CREATE INDEX IF NOT EXISTS idx_orders_user_id 
ON orders(user_id);

-- Index for order status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

-- Index for order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- Index for featured products
CREATE INDEX IF NOT EXISTS idx_products_featured 
ON products(is_featured) 
WHERE is_active = true;

-- Compound index for common product queries
CREATE INDEX IF NOT EXISTS idx_products_active_category_price 
ON products(is_active, category, price);

-- Index for updated_at sorting
CREATE INDEX IF NOT EXISTS idx_orders_updated_at 
ON orders(updated_at DESC);

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;