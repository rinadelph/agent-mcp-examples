-- Fix Supabase Auth Settings
-- This script enables proper authentication for the e-commerce project

-- 1. Enable email/password authentication
-- Note: This needs to be done in Supabase Dashboard > Authentication > Providers

-- 2. Update auth.users RLS policies (if any exist)
-- Auth schema is managed by Supabase, but we can ensure profiles work correctly

-- 3. Ensure profile trigger is working correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;

-- 5. Ensure RLS is enabled on profiles but allows inserts from trigger
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the service role policy for profile creation
DROP POLICY IF EXISTS "Service role can do anything" ON profiles;
CREATE POLICY "Service role can do anything" ON profiles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- 6. Add auth configuration comments
COMMENT ON FUNCTION handle_new_user() IS 'Creates a profile entry when a new user signs up';