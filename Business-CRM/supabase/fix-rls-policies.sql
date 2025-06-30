-- Fix for infinite recursion in profiles RLS policy
-- and order creation issues

-- Drop the problematic admin view all profiles policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a new admin view all profiles policy that doesn't cause recursion
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

-- Fix the order_items insert policy to allow creation with orders
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;

-- Create a new policy that allows users to insert order items
-- when they are the owner of the order being referenced
CREATE POLICY "Users can create own order items" ON order_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Add a policy to allow users to update their own profile
-- (In case the update policy has issues)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure the order insert policy is correct
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

CREATE POLICY "Users can create own orders" ON orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Fixed to prevent infinite recursion by using subquery instead of self-referencing EXISTS';
COMMENT ON POLICY "Users can create own order items" ON order_items IS 'Allows users to create order items for their own orders';