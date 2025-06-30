# Supabase Setup Guide for 925 Silver LLC E-commerce

This guide provides step-by-step instructions for setting up the Supabase backend for the 925 Silver LLC e-commerce platform.

## Prerequisites

- Node.js 14+ installed
- A Supabase account (sign up at https://supabase.com)
- Basic knowledge of SQL and PostgreSQL

## Step 1: Create a New Supabase Project

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Click "New project"
3. Fill in the project details:
   - **Name**: 925 Silver LLC Ecommerce
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Select the closest region to your users
   - **Pricing Plan**: Choose based on your needs (Free tier is sufficient for development)
4. Click "Create new project" and wait for provisioning (takes 1-2 minutes)

## Step 2: Apply the Database Schema

1. Once your project is ready, navigate to the SQL Editor in the Supabase dashboard
2. Click "New query"
3. Copy the entire contents of `schema.sql` and paste it into the SQL editor
4. Click "Run" to execute the SQL
5. You should see success messages for each created table, function, and policy

### Verify Schema Creation

Run these queries to verify everything was created correctly:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Step 3: Configure Storage Bucket

1. Navigate to Storage in the Supabase dashboard
2. Click "Create bucket"
3. Configure the bucket:
   - **Name**: `product_images`
   - **Public bucket**: Toggle ON
   - **Allowed MIME types**: Click "Add MIME type" and add:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
   - **Max file size**: 5 MB
4. Click "Create bucket"

### Configure Storage Policies

1. Click on the `product_images` bucket
2. Navigate to "Policies" tab
3. Create the following policies:

**Public Read Policy:**
- Click "New policy"
- Select "For full customization"
- Name: `Public read access`
- Policy definition:
  ```sql
  CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product_images');
  ```

**Admin Upload Policy:**
- Click "New policy"
- Select "For full customization"
- Name: `Admin upload access`
- Policy definition:
  ```sql
  CREATE POLICY "Admin upload access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product_images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
  ```

**Admin Delete Policy:**
- Click "New policy"
- Select "For full customization"
- Name: `Admin delete access`
- Policy definition:
  ```sql
  CREATE POLICY "Admin delete access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product_images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
  ```

## Step 4: Environment Variable Configuration

1. In the Supabase dashboard, navigate to Settings > API
2. Copy the following values:
   - **Project URL** (looks like `https://[project-id].supabase.co`)
   - **Anon/Public key** (safe to use in frontend)
   - **Service role key** (keep secret, only for backend)

3. Create a `.env` file in your project root:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. For backend/admin operations, store the service role key securely (never commit to git)

## Step 5: Create Initial Admin User

1. Navigate to Authentication > Users in Supabase dashboard
2. Click "Invite user"
3. Enter the admin email address
4. After the user signs up, run this SQL to make them an admin:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE id = 'user_id_here';
```

Alternatively, create an admin programmatically:

```sql
-- First create the user in auth.users (this is just an example)
-- In production, use Supabase Auth to create users

-- Then update their profile
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@925silver.com'
);
```

## Step 6: Apply Sample Data

1. Navigate to the SQL Editor
2. Copy and paste the contents of `sample-data.sql`
3. Click "Run" to insert sample products

## Step 7: Verify RLS Policies

Test that Row Level Security is working correctly:

1. **Test anonymous access:**
   ```sql
   -- Should return only active products
   SELECT * FROM public.products;
   
   -- Should return empty (no auth)
   SELECT * FROM public.profiles;
   SELECT * FROM public.orders;
   ```

2. **Test authenticated user access:**
   - Use the Supabase client library or REST API with a user token
   - Users should only see their own profiles and orders

3. **Test admin access:**
   - Authenticate as an admin user
   - Should have full access to all tables

## Step 8: Enable Realtime (Optional)

If you want real-time updates for orders or products:

1. Navigate to Database > Replication
2. Enable replication for desired tables:
   - `products` (for live inventory updates)
   - `orders` (for order status updates)

## Troubleshooting

### Common Issues

1. **"permission denied for schema public"**
   - Make sure you're running queries as the postgres user
   - Check that you've enabled the extensions

2. **"relation does not exist"**
   - Ensure you ran the schema.sql in the correct order
   - Check that the uuid-ossp extension is enabled

3. **Storage upload fails**
   - Verify the storage policies are created
   - Check that the user is authenticated and is an admin
   - Ensure file size is under 5MB

4. **RLS policies not working**
   - Verify RLS is enabled on the table
   - Check auth.uid() is returning the expected user ID
   - Test policies using the Supabase dashboard's policy editor

### Useful SQL Queries for Debugging

```sql
-- Check current user
SELECT auth.uid();

-- Check if user is admin
SELECT is_admin FROM public.profiles WHERE id = auth.uid();

-- List all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Next Steps

1. Install the Supabase client library in your Vue.js application:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Initialize the Supabase client with your environment variables

3. Implement authentication flows using Supabase Auth

4. Start building your application features using the configured database

## Security Best Practices

1. **Never expose your service role key** in client-side code
2. **Always use RLS** for data access control
3. **Validate data** on both client and server (database constraints)
4. **Use environment variables** for sensitive configuration
5. **Enable 2FA** for admin accounts
6. **Regular backups** - Supabase provides automatic backups on paid plans
7. **Monitor usage** through the Supabase dashboard

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: [Your GitHub repo]/issues