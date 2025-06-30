-- Test RLS Policies for 925 Silver E-commerce
-- This file contains test queries to verify RLS policies are working correctly

-- Create test users for testing
-- Note: In production, use Supabase Auth to create users

-- Test 1: Public Product Access (Anonymous)
-- Expected: Should return all active products
SET ROLE anon;
SELECT id, name, price, is_active FROM products WHERE is_active = true;
RESET ROLE;

-- Test 2: Guest Checkout Flow
-- Create a guest session
SET ROLE anon;
SELECT public.create_guest_session('guest@example.com') as session_token;

-- Simulate guest creating an order with session token
-- In real app, this would be set via application context
SET LOCAL app.guest_session_token = 'YOUR_SESSION_TOKEN_HERE';

-- Test guest order creation
INSERT INTO orders (
  total_amount, 
  status, 
  shipping_address, 
  shipping_name, 
  shipping_phone, 
  guest_email
) VALUES (
  99.99,
  'pending',
  '123 Guest St, City, State 12345',
  'Guest User',
  '555-0123',
  'guest@example.com'
) RETURNING id;

-- Test guest viewing their order
SELECT id, total_amount, status, guest_email 
FROM orders 
WHERE guest_email = 'guest@example.com';

RESET ROLE;

-- Test 3: Authenticated User Access
-- Simulate authenticated user (replace with actual user ID)
SET LOCAL auth.uid = 'USER_ID_HERE';

-- User should see only their orders
SELECT id, total_amount, status 
FROM orders 
WHERE user_id = current_setting('auth.uid')::uuid;

-- User creating an order
INSERT INTO orders (
  user_id,
  total_amount, 
  status, 
  shipping_address, 
  shipping_name
) VALUES (
  current_setting('auth.uid')::uuid,
  149.99,
  'pending',
  '456 User Ave, City, State 67890',
  'Auth User'
) RETURNING id;

RESET ROLE;

-- Test 4: Admin Access
-- Simulate admin user
SET LOCAL auth.uid = 'ADMIN_USER_ID_HERE';

-- Admin should see all orders
SELECT COUNT(*) as total_orders FROM orders;

-- Admin should be able to update any order
UPDATE orders 
SET status = 'processing' 
WHERE status = 'pending' 
RETURNING id, status;

-- Admin can manage products
INSERT INTO products (
  name,
  description,
  category,
  price,
  quantity
) VALUES (
  'Test Product',
  'Test Description',
  'Rings',
  99.99,
  10
) RETURNING id;

RESET ROLE;

-- Test 5: Guest Order Lookup Functions
-- Test retrieving order by ID and email
SELECT * FROM public.get_guest_order(
  'ORDER_ID_HERE'::uuid,
  'guest@example.com'
);

-- Test retrieving order items
SELECT * FROM public.get_guest_order_items(
  'ORDER_ID_HERE'::uuid,
  'guest@example.com'
);

-- Test 6: Security Validation - These should fail
-- Guest trying to access another guest's order
SET ROLE anon;
SELECT * FROM orders WHERE guest_email = 'other@example.com';

-- User trying to access another user's order
SET LOCAL auth.uid = 'USER_ID_HERE';
SELECT * FROM orders WHERE user_id != current_setting('auth.uid')::uuid;

-- Non-admin trying to insert product
INSERT INTO products (name, category, price) 
VALUES ('Unauthorized', 'Rings', 50.00);

RESET ROLE;

-- Test 7: Profile Creation Trigger
-- When a new user signs up, a profile should be created automatically
-- This would be tested through Supabase Auth signup

-- Test 8: Inventory Decrement Trigger
-- Create a test order and add items
BEGIN;
  -- Check initial quantity
  SELECT id, name, quantity FROM products WHERE name LIKE 'Classic Silver%' LIMIT 1;
  
  -- Create order
  INSERT INTO orders (user_id, total_amount, status, shipping_address, shipping_name)
  VALUES (null, 45.00, 'pending', 'Test Address', 'Test User')
  RETURNING id as order_id;
  
  -- Add order item (should decrement product quantity)
  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  VALUES ('ORDER_ID_HERE', 'PRODUCT_ID_HERE', 2, 45.00);
  
  -- Check quantity after (should be reduced by 2)
  SELECT id, name, quantity FROM products WHERE id = 'PRODUCT_ID_HERE';
ROLLBACK;

-- Test 9: Guest Session Cleanup
-- Check for expired sessions
SELECT COUNT(*) as expired_sessions 
FROM guest_sessions 
WHERE expires_at < now();

-- Run cleanup
SELECT public.cleanup_expired_guest_sessions();

-- Verify cleanup worked
SELECT COUNT(*) as remaining_expired 
FROM guest_sessions 
WHERE expires_at < now();

-- Summary Query: Check all table RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;