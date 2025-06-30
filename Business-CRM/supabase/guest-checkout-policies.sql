-- Guest Checkout RLS Policies for 925 Silver E-commerce
-- This file contains additional RLS policies to support guest (unauthenticated) checkout

-- Create a session token table for tracking guest orders
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  guest_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours') NOT NULL
);

-- Enable RLS on guest_sessions table
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- Function to validate guest session
CREATE OR REPLACE FUNCTION public.validate_guest_session(session_token TEXT)
RETURNS TABLE(session_id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT id, guest_email
  FROM public.guest_sessions
  WHERE guest_sessions.session_token = validate_guest_session.session_token
    AND expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create guest session
CREATE OR REPLACE FUNCTION public.create_guest_session(email TEXT)
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Generate a secure random token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO public.guest_sessions (session_token, guest_email)
  VALUES (new_token, email);
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Guest Checkout Policies for orders table
-- Allow guests to create orders with a valid session token
CREATE POLICY "Guests can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    -- Either authenticated user creating their own order
    (auth.uid() = user_id)
    OR
    -- Or guest with valid session creating order
    (
      user_id IS NULL 
      AND guest_email IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.validate_guest_session(
          current_setting('app.guest_session_token', true)
        )
        WHERE email = guest_email
      )
    )
  );

-- Allow guests to view their orders with session token
CREATE POLICY "Guests can view own orders" ON public.orders
  FOR SELECT USING (
    -- Authenticated users can see their orders
    (auth.uid() = user_id)
    OR
    -- Guests can see their orders with valid session
    (
      user_id IS NULL 
      AND guest_email IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.validate_guest_session(
          current_setting('app.guest_session_token', true)
        )
        WHERE email = guest_email
      )
    )
  );

-- Guest Checkout Policies for order_items table
-- Allow guests to create order items for their orders
CREATE POLICY "Guests can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        -- Authenticated user's order
        (orders.user_id = auth.uid())
        OR
        -- Guest's order with valid session
        (
          orders.user_id IS NULL
          AND orders.guest_email IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.validate_guest_session(
              current_setting('app.guest_session_token', true)
            )
            WHERE email = orders.guest_email
          )
        )
      )
    )
  );

-- Allow guests to view order items for their orders
CREATE POLICY "Guests can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        -- Authenticated user's order
        (orders.user_id = auth.uid())
        OR
        -- Guest's order with valid session
        (
          orders.user_id IS NULL
          AND orders.guest_email IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.validate_guest_session(
              current_setting('app.guest_session_token', true)
            )
            WHERE email = orders.guest_email
          )
        )
      )
    )
  );

-- Guest session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.guest_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired sessions (requires pg_cron extension)
-- This would need to be set up in Supabase Dashboard or via SQL editor:
-- SELECT cron.schedule('cleanup-guest-sessions', '0 * * * *', 'SELECT public.cleanup_expired_guest_sessions();');

-- Alternative approach using order lookup by ID and email
-- This function allows guests to retrieve their order without a session token
CREATE OR REPLACE FUNCTION public.get_guest_order(
  order_id UUID,
  email TEXT
)
RETURNS TABLE(
  id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL(10,2),
  status TEXT,
  shipping_address TEXT,
  shipping_name TEXT,
  shipping_phone TEXT,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.created_at,
    o.total_amount,
    o.status,
    o.shipping_address,
    o.shipping_name,
    o.shipping_phone,
    o.notes,
    o.updated_at
  FROM public.orders o
  WHERE o.id = get_guest_order.order_id
    AND o.guest_email = get_guest_order.email
    AND o.user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get guest order items
CREATE OR REPLACE FUNCTION public.get_guest_order_items(
  order_id UUID,
  email TEXT
)
RETURNS TABLE(
  id UUID,
  product_id UUID,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  product_name TEXT,
  product_image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.id,
    oi.product_id,
    oi.quantity,
    oi.unit_price,
    p.name as product_name,
    p.image_url as product_image_url
  FROM public.order_items oi
  JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id IN (
    SELECT o.id FROM public.orders o
    WHERE o.id = get_guest_order_items.order_id
      AND o.guest_email = get_guest_order_items.email
      AND o.user_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON public.orders(guest_email) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires ON public.guest_sessions(expires_at);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.validate_guest_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_guest_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guest_order(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guest_order_items(UUID, TEXT) TO anon, authenticated;