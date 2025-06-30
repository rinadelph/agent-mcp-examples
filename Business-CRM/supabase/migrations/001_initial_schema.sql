-- 925 Silver E-commerce Initial Database Migration
-- This migration sets up the complete database schema with RLS policies

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Main schema from schema.sql
\i ../schema.sql

-- 3. Guest checkout support from guest-checkout-policies.sql
\i ../guest-checkout-policies.sql

-- 4. Performance indexes from performance-indexes.sql
\i ../performance-indexes.sql

-- 5. Create storage bucket (manual step - see instructions below)
-- Storage bucket creation must be done via Supabase Dashboard:
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Create new bucket named 'product_images'
-- 3. Set as PUBLIC bucket
-- 4. Set file size limit to 5MB
-- 5. Allow MIME types: image/jpeg, image/png, image/webp
-- 6. Then run storage-policies.sql to set up RLS

-- 6. Load sample data (optional - remove for production)
-- \i ../sample-data.sql

-- 7. Grant necessary permissions for anonymous access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.guest_sessions TO anon;
GRANT INSERT ON public.guest_sessions TO anon;
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;

-- 8. Create admin user (replace with your actual email)
-- This must be done through Supabase Auth, then update the profile:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_ADMIN_USER_ID';

-- Migration complete message
DO $$
BEGIN
  RAISE NOTICE 'Database migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create storage bucket "product_images" in Supabase Dashboard';
  RAISE NOTICE '2. Run storage-policies.sql to set up storage RLS';
  RAISE NOTICE '3. Create admin user via Supabase Auth';
  RAISE NOTICE '4. Update admin user profile: UPDATE profiles SET is_admin = true';
  RAISE NOTICE '5. Load sample data if needed: psql -f sample-data.sql';
END $$;