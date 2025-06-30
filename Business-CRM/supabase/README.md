# 925 Silver E-commerce Database Setup

This directory contains all the SQL files needed to set up the database for the 925 Silver LLC e-commerce platform.

## Database Structure

### Tables
1. **profiles** - User profiles linked to Supabase Auth
2. **products** - Product catalog with inventory management
3. **orders** - Customer orders with guest checkout support
4. **order_items** - Line items for each order
5. **guest_sessions** - Session management for guest checkout

### Key Features
- Row Level Security (RLS) on all tables
- Guest checkout support without authentication
- Automatic inventory management
- Admin role-based access control
- Performance-optimized indexes

## Setup Instructions

### 1. Initial Database Setup

Run the migration file in your Supabase SQL editor:

```sql
-- Run the complete migration
\i supabase/migrations/001_initial_schema.sql
```

Or run files individually:

```sql
-- 1. Main schema
\i supabase/schema.sql

-- 2. Guest checkout policies
\i supabase/guest-checkout-policies.sql

-- 3. Performance indexes
\i supabase/performance-indexes.sql
```

### 2. Create Storage Bucket

In Supabase Dashboard:
1. Navigate to Storage section
2. Create new bucket named `product_images`
3. Configure:
   - Public bucket: YES
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
4. Run storage policies:
   ```sql
   \i supabase/storage-policies.sql
   ```

### 3. Create Admin User

1. Sign up a user via Supabase Auth
2. Update their profile to admin:
   ```sql
   UPDATE public.profiles 
   SET is_admin = true 
   WHERE id = 'YOUR_USER_ID';
   ```

### 4. Load Sample Data (Optional)

```sql
\i supabase/sample-data.sql
```

## Guest Checkout Flow

The database supports guest checkout through session-based authentication:

1. **Create Session**: Call `create_guest_session(email)` to get a session token
2. **Place Order**: Include session token in app context when creating orders
3. **Track Order**: Use `get_guest_order(order_id, email)` to retrieve order details

Example:
```sql
-- Create guest session
SELECT public.create_guest_session('guest@example.com') as token;

-- Set session context (in your app)
SET LOCAL app.guest_session_token = 'TOKEN_FROM_ABOVE';

-- Create order as guest
INSERT INTO orders (guest_email, total_amount, ...) 
VALUES ('guest@example.com', 99.99, ...);

-- Retrieve order later
SELECT * FROM public.get_guest_order(
  'ORDER_ID'::uuid, 
  'guest@example.com'
);
```

## RLS Policy Overview

### Public Access
- View active products
- Create guest sessions
- Create orders with valid session

### Authenticated Users
- View/update own profile
- View/create own orders
- View own order items

### Admin Users
- Full access to all tables
- Manage products
- View/update all orders
- Upload product images

## Testing

Run the test file to verify RLS policies:

```sql
\i supabase/test-rls-policies.sql
```

## File Structure

```
supabase/
├── README.md                    # This file
├── schema.sql                   # Main database schema
├── guest-checkout-policies.sql  # Guest checkout RLS policies
├── storage-policies.sql         # Storage bucket policies
├── performance-indexes.sql      # Performance optimization
├── sample-data.sql             # Sample product data
├── test-rls-policies.sql       # RLS testing queries
└── migrations/
    └── 001_initial_schema.sql  # Complete migration file
```

## Security Notes

1. Guest sessions expire after 24 hours
2. Guest orders require both order ID and email for access
3. All monetary values stored as DECIMAL(10,2)
4. Inventory automatically decrements on order placement
5. Admin status stored in profiles table, not auth metadata

## Troubleshooting

### Common Issues

1. **"permission denied for schema public"**
   - Run: `GRANT USAGE ON SCHEMA public TO anon;`

2. **Guest checkout not working**
   - Ensure guest session is created before order
   - Check session hasn't expired (24 hour limit)
   - Verify app.guest_session_token is set correctly

3. **Storage upload fails**
   - Verify storage bucket exists
   - Check storage policies are applied
   - Ensure user is authenticated admin

### Useful Queries

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View all policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public';

-- Check indexes
SELECT * FROM pg_indexes 
WHERE schemaname = 'public';
```