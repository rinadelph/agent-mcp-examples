# 925 Silver LLC E-commerce Database Schema Documentation

This document provides comprehensive documentation of the database schema for the 925 Silver LLC e-commerce platform. It includes detailed descriptions of tables, relationships, security policies, and business logic.

## Table of Contents
1. [Database Overview](#database-overview)
2. [Table Schemas](#table-schemas)
3. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
4. [Functions and Triggers](#functions-and-triggers)
5. [Storage Configuration](#storage-configuration)
6. [Entity Relationships](#entity-relationships)
7. [Business Logic Implementation](#business-logic-implementation)

## Database Overview

The database is built on PostgreSQL via Supabase and implements:
- **4 main tables**: profiles, products, orders, order_items
- **Row Level Security (RLS)**: Comprehensive access control for all tables
- **2 automated triggers**: User profile creation and inventory management
- **Storage bucket**: For product images with access policies

### Key Features:
- Automatic user profile creation on registration
- Real-time inventory tracking with automatic decrements
- Secure multi-tenant data isolation
- Admin-only product and order management capabilities

## Table Schemas

### 1. profiles Table

**Purpose**: Stores user profile information linked to Supabase Auth

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE | User's unique identifier from auth system |
| full_name | TEXT | NULL allowed | User's display name |
| shipping_address | TEXT | NULL allowed | Default shipping address |
| phone_number | TEXT | NULL allowed | Contact phone number |
| is_admin | BOOLEAN | NOT NULL, DEFAULT false | Admin privileges flag |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Profile creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last update timestamp |

**Business Rules**:
- Profiles are automatically created when users sign up (via trigger)
- Only one profile per auth user
- Admin status controls access to management features

### 2. products Table

**Purpose**: Product catalog with inventory tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Product unique identifier |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Product creation timestamp |
| name | TEXT | NOT NULL | Product display name |
| description | TEXT | NULL allowed | Detailed product description |
| category | TEXT | NOT NULL | Product category (Rings, Necklaces, etc.) |
| price | DECIMAL(10,2) | NOT NULL, CHECK (price >= 0) | Product price in USD |
| quantity | INTEGER | NOT NULL, DEFAULT 0, CHECK (quantity >= 0) | Available inventory |
| image_url | TEXT | NULL allowed | Main product image URL |
| is_featured | BOOLEAN | NOT NULL, DEFAULT false | Featured product flag |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Product visibility flag |

**Business Rules**:
- Prices cannot be negative
- Quantity cannot be negative (enforced by check constraint and trigger)
- Only active products are shown to customers
- Featured products get homepage prominence

### 3. orders Table

**Purpose**: Customer order records with status tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Order unique identifier |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Order placement timestamp |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE SET NULL | Customer's user ID (NULL for guests) |
| total_amount | DECIMAL(10,2) | NOT NULL, CHECK (total_amount >= 0) | Order total in USD |
| status | TEXT | NOT NULL, DEFAULT 'pending' | Order status (see below) |
| shipping_address | TEXT | NOT NULL | Delivery address |
| shipping_name | TEXT | NOT NULL | Recipient name |
| shipping_phone | TEXT | NULL allowed | Contact phone |
| guest_email | TEXT | NULL allowed | Email for guest orders |
| notes | TEXT | NULL allowed | Order notes/instructions |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Last update timestamp |

**Status Values**:
- pending: Order placed, awaiting processing
- processing: Order being prepared
- shipped: Order shipped to customer
- delivered: Order delivered successfully
- cancelled: Order cancelled

**Business Rules**:
- Total amount cannot be negative
- Status must be one of the defined values
- Guest orders store email for communication
- User deletion preserves order history (SET NULL)

### 4. order_items Table

**Purpose**: Line items for each order with product references

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Line item unique identifier |
| order_id | UUID | NOT NULL, REFERENCES orders(id) ON DELETE CASCADE | Parent order ID |
| product_id | UUID | NOT NULL, REFERENCES products(id) ON DELETE RESTRICT | Referenced product |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) | Quantity ordered |
| unit_price | DECIMAL(10,2) | NOT NULL, CHECK (unit_price >= 0) | Price at time of order |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Line item creation timestamp |

**Business Rules**:
- Quantity must be positive
- Unit price captures historical pricing
- Product deletion restricted if referenced in orders
- Order deletion cascades to order items

## Row Level Security (RLS) Policies

### profiles Table RLS Policies

1. **Users can view own profile**
   - Policy: SELECT
   - Rule: `auth.uid() = id`
   - Purpose: Users can only see their own profile data

2. **Users can update own profile**
   - Policy: UPDATE
   - Rule: `auth.uid() = id`
   - Purpose: Users can only modify their own profile

3. **Admins can view all profiles**
   - Policy: SELECT
   - Rule: User must have `is_admin = true` in their profile
   - Purpose: Admin oversight of all user profiles

### products Table RLS Policies

1. **Anyone can view active products**
   - Policy: SELECT
   - Rule: `is_active = true`
   - Purpose: Public product browsing

2. **Admins can insert products**
   - Policy: INSERT
   - Rule: User must have `is_admin = true`
   - Purpose: Only admins can add new products

3. **Admins can update products**
   - Policy: UPDATE
   - Rule: User must have `is_admin = true`
   - Purpose: Only admins can modify products

4. **Admins can delete products**
   - Policy: DELETE
   - Rule: User must have `is_admin = true`
   - Purpose: Only admins can remove products

### orders Table RLS Policies

1. **Users can view own orders**
   - Policy: SELECT
   - Rule: `auth.uid() = user_id`
   - Purpose: Order privacy for customers

2. **Users can create own orders**
   - Policy: INSERT
   - Rule: `auth.uid() = user_id`
   - Purpose: Users can only create orders for themselves

3. **Admins can view all orders**
   - Policy: SELECT
   - Rule: User must have `is_admin = true`
   - Purpose: Admin order management

4. **Admins can update any order**
   - Policy: UPDATE
   - Rule: User must have `is_admin = true`
   - Purpose: Admin can change order status

### order_items Table RLS Policies

1. **Users can view own order items**
   - Policy: SELECT
   - Rule: Order's `user_id` matches `auth.uid()`
   - Purpose: Users see items from their orders only

2. **Users can create own order items**
   - Policy: INSERT
   - Rule: Parent order's `user_id` matches `auth.uid()`
   - Purpose: Users can only add items to their orders

3. **Admins can view all order items**
   - Policy: SELECT
   - Rule: User must have `is_admin = true`
   - Purpose: Complete order visibility for admins

4. **Admins can manage all order items**
   - Policy: ALL
   - Rule: User must have `is_admin = true`
   - Purpose: Full admin control over order items

## Functions and Triggers

### 1. handle_new_user Function

**Purpose**: Automatically creates a profile when a new user registers

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Trigger**: `on_auth_user_created`
- Fires: AFTER INSERT ON auth.users
- For: EACH ROW
- Effect: Creates profile with user's ID and full name from metadata

**Edge Cases**:
- Duplicate profile prevention (ID is primary key)
- NULL full_name is acceptable
- Runs with SECURITY DEFINER privileges

### 2. decrement_product_quantity Function

**Purpose**: Automatically decreases product inventory when orders are placed

```sql
CREATE OR REPLACE FUNCTION public.decrement_product_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.product_id;
  
  -- Check if product is out of stock
  IF (SELECT quantity FROM public.products WHERE id = NEW.product_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient product quantity';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger**: `decrement_quantity_on_order_item`
- Fires: AFTER INSERT ON order_items
- For: EACH ROW
- Effect: Reduces product quantity by ordered amount

**Edge Cases**:
- Prevents negative inventory (raises exception)
- Atomic operation ensures consistency
- Concurrent orders handled by PostgreSQL MVCC

### 3. handle_updated_at Function

**Purpose**: Automatically updates the updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Triggers**:
- `set_profiles_updated_at`: BEFORE UPDATE ON profiles
- `set_orders_updated_at`: BEFORE UPDATE ON orders

## Storage Configuration

### product_images Bucket

**Configuration**:
- **Bucket Name**: `product_images`
- **Public Access**: Yes (for reading)
- **Allowed MIME Types**: image/jpeg, image/png, image/webp
- **Max File Size**: 5MB
- **URL Format**: `https://[project-id].supabase.co/storage/v1/object/public/product_images/[filename]`

**Access Policies**:

1. **Public Read Access**
   - Anyone can view product images
   - No authentication required

2. **Admin Upload Access**
   - Only admins can upload new images
   - Requires authenticated admin user

3. **Admin Delete Access**
   - Only admins can delete images
   - Prevents accidental/malicious deletion

## Entity Relationships

### Database Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐
│    profiles     │     │    products     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ full_name       │     │ name            │
│ shipping_address│     │ description     │
│ phone_number    │     │ category        │
│ is_admin        │     │ price           │
│ created_at      │     │ quantity        │
│ updated_at      │     │ image_url       │
└────────┬────────┘     │ is_featured     │
         │              │ is_active       │
         │              └────────┬────────┘
         │                       │
         │                       │
    ┌────▼────────┐         ┌───▼──────────┐
    │   orders    │         │ order_items  │
    ├─────────────┤         ├──────────────┤
    │ id (PK)     │◄────────┤ id (PK)      │
    │ user_id (FK)│         │ order_id (FK)│
    │ total_amount│         │ product_id(FK)│
    │ status      │         │ quantity     │
    │ shipping_*  │         │ unit_price   │
    │ guest_email │         │ created_at   │
    │ notes       │         └──────────────┘
    │ created_at  │
    │ updated_at  │
    └─────────────┘
```

### Relationships:
- **profiles ← auth.users**: One-to-one (CASCADE DELETE)
- **orders → profiles**: Many-to-one (SET NULL on delete)
- **order_items → orders**: Many-to-one (CASCADE DELETE)
- **order_items → products**: Many-to-one (RESTRICT DELETE)

## Business Logic Implementation

### User Registration Flow
1. User signs up via Supabase Auth
2. `handle_new_user` trigger fires
3. Profile automatically created with user ID
4. User can update profile with shipping info

### Product Management
1. Admin adds products with inventory levels
2. Products marked as active/inactive for visibility
3. Featured products highlighted on homepage
4. Images stored in Supabase Storage

### Order Processing Flow
1. Customer adds items to cart (frontend)
2. Order created with pending status
3. Order items created, triggering inventory decrement
4. If insufficient inventory, transaction rolls back
5. Admin updates order status through lifecycle
6. Customer views order history and status

### Inventory Management
1. Products have quantity field
2. Order placement decrements quantity atomically
3. Negative inventory prevented by trigger
4. Admin can adjust inventory manually
5. Out-of-stock products remain visible but unbuyable

### Security Model
1. RLS policies enforce data isolation
2. Users access only their own data
3. Public can browse active products
4. Admins have elevated privileges
5. All policies evaluated at database level

## RLS Policy Flow Charts

### Product Access Flow
```
User Request → products table
    │
    ├─ SELECT Operation?
    │   └─ is_active = true? → ✅ ALLOW (public access)
    │       └─ else → ❌ DENY
    │
    ├─ INSERT/UPDATE/DELETE Operation?
    │   └─ User authenticated?
    │       ├─ No → ❌ DENY
    │       └─ Yes → Check admin status
    │           └─ is_admin = true? → ✅ ALLOW
    │               └─ else → ❌ DENY
```

### Order Access Flow
```
User Request → orders table
    │
    ├─ SELECT Operation?
    │   ├─ User is admin? → ✅ ALLOW ALL
    │   └─ User authenticated?
    │       ├─ No → ❌ DENY
    │       └─ Yes → user_id matches? → ✅ ALLOW
    │           └─ else → ❌ DENY
    │
    ├─ INSERT Operation?
    │   └─ User authenticated AND user_id matches? → ✅ ALLOW
    │       └─ else → ❌ DENY
    │
    └─ UPDATE Operation?
        └─ User is admin? → ✅ ALLOW
            └─ else → ❌ DENY
```

### Profile Access Flow
```
User Request → profiles table
    │
    ├─ User is admin? → ✅ ALLOW ALL (SELECT only)
    │
    └─ Regular User?
        ├─ SELECT/UPDATE own profile (id = auth.uid())? → ✅ ALLOW
        └─ else → ❌ DENY
```

## Trigger Execution Flow Diagrams

### User Registration Flow
```
New User Signs Up
    │
    ▼
auth.users INSERT
    │
    ▼
TRIGGER: on_auth_user_created
    │
    ▼
FUNCTION: handle_new_user()
    │
    ├─ Extract full_name from metadata
    ├─ Create profile with user ID
    └─ Return success
        │
        ▼
    Profile Ready for Use
```

### Order Item Creation Flow
```
Order Item INSERT
    │
    ▼
TRIGGER: decrement_quantity_on_order_item
    │
    ▼
FUNCTION: decrement_product_quantity()
    │
    ├─ UPDATE products SET quantity = quantity - ordered_amount
    ├─ CHECK resulting quantity
    │   ├─ quantity >= 0? → ✅ COMMIT
    │   └─ quantity < 0? → ❌ ROLLBACK
    │       └─ RAISE EXCEPTION 'Insufficient product quantity'
    │
    ▼
Transaction Complete/Failed
```

## Detailed Test Scenarios

### RLS Policy Test Suite

#### 1. Anonymous User Tests
```sql
-- Test 1.1: Anonymous can view active products
SET ROLE anon;
SELECT id, name, price FROM products WHERE is_active = true;
-- Expected: Returns all active products

-- Test 1.2: Anonymous cannot view inactive products
SET ROLE anon;
SELECT id, name FROM products WHERE is_active = false;
-- Expected: Returns empty set

-- Test 1.3: Anonymous cannot access profiles
SET ROLE anon;
SELECT * FROM profiles;
-- Expected: Returns empty set

-- Test 1.4: Anonymous cannot create orders
SET ROLE anon;
INSERT INTO orders (total_amount, shipping_address, shipping_name) 
VALUES (100.00, '123 Test St', 'Test User');
-- Expected: ERROR - new row violates row-level security policy
```

#### 2. Authenticated User Tests
```sql
-- Setup: Create test user and get their ID
-- Assume user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- Test 2.1: User can view own profile
SET LOCAL auth.uid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SELECT * FROM profiles WHERE id = auth.uid();
-- Expected: Returns user's profile

-- Test 2.2: User cannot view other profiles
SET LOCAL auth.uid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SELECT * FROM profiles WHERE id != auth.uid();
-- Expected: Returns empty set

-- Test 2.3: User can create own orders
SET LOCAL auth.uid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
INSERT INTO orders (user_id, total_amount, shipping_address, shipping_name)
VALUES (auth.uid(), 150.00, '456 User Ave', 'Test Customer');
-- Expected: Success

-- Test 2.4: User cannot create orders for others
SET LOCAL auth.uid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
INSERT INTO orders (user_id, total_amount, shipping_address, shipping_name)
VALUES ('different-user-id', 150.00, '789 Other St', 'Other User');
-- Expected: ERROR - new row violates row-level security policy
```

#### 3. Admin User Tests
```sql
-- Setup: Assume admin_id = 'admin123-e5f6-7890-abcd-ef1234567890'

-- Test 3.1: Admin can view all profiles
SET LOCAL auth.uid = 'admin123-e5f6-7890-abcd-ef1234567890';
SELECT COUNT(*) FROM profiles;
-- Expected: Returns total count of all profiles

-- Test 3.2: Admin can insert products
SET LOCAL auth.uid = 'admin123-e5f6-7890-abcd-ef1234567890';
INSERT INTO products (name, category, price, quantity)
VALUES ('Test Product', 'Rings', 99.99, 10);
-- Expected: Success

-- Test 3.3: Admin can update any order
SET LOCAL auth.uid = 'admin123-e5f6-7890-abcd-ef1234567890';
UPDATE orders SET status = 'shipped' WHERE id = 'any-order-id';
-- Expected: Success

-- Test 3.4: Admin can manage all order items
SET LOCAL auth.uid = 'admin123-e5f6-7890-abcd-ef1234567890';
SELECT * FROM order_items;
-- Expected: Returns all order items
```

### Trigger Test Suite

#### 1. User Creation Trigger Tests
```sql
-- Test 1.1: Basic user creation
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  'test-user-001',
  'test@example.com',
  '{"full_name": "Test User"}'::jsonb
);
-- Verify profile created
SELECT * FROM profiles WHERE id = 'test-user-001';
-- Expected: Profile exists with full_name = 'Test User'

-- Test 1.2: User creation with null metadata
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  'test-user-002',
  'test2@example.com',
  '{}'::jsonb
);
-- Verify profile created
SELECT * FROM profiles WHERE id = 'test-user-002';
-- Expected: Profile exists with full_name = NULL
```

#### 2. Inventory Decrement Trigger Tests
```sql
-- Setup: Create test product with quantity 10
INSERT INTO products (id, name, category, price, quantity)
VALUES ('prod-001', 'Test Ring', 'Rings', 50.00, 10);

-- Test 2.1: Normal order
BEGIN;
INSERT INTO orders (id, user_id, total_amount, shipping_address, shipping_name)
VALUES ('order-001', auth.uid(), 50.00, 'Test Address', 'Test Name');

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES ('order-001', 'prod-001', 3, 50.00);

SELECT quantity FROM products WHERE id = 'prod-001';
-- Expected: quantity = 7
COMMIT;

-- Test 2.2: Insufficient inventory
BEGIN;
INSERT INTO orders (id, user_id, total_amount, shipping_address, shipping_name)
VALUES ('order-002', auth.uid(), 500.00, 'Test Address', 'Test Name');

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES ('order-002', 'prod-001', 20, 50.00);
-- Expected: ERROR - Insufficient product quantity
ROLLBACK;

-- Test 2.3: Concurrent orders (simulate race condition)
-- Run these in two separate transactions simultaneously
-- Transaction 1:
BEGIN;
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES ('order-003', 'prod-001', 5, 50.00);
-- Transaction 2:
BEGIN;
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES ('order-004', 'prod-001', 5, 50.00);
-- One should succeed, one should fail if total exceeds inventory
```

### Edge Cases and Error Handling

#### 1. Data Integrity Edge Cases
```sql
-- Edge Case 1: Deleting user with orders
DELETE FROM auth.users WHERE id = 'user-with-orders';
-- Expected: Profile deleted (CASCADE), orders remain with user_id = NULL

-- Edge Case 2: Attempting to delete product with order history
DELETE FROM products WHERE id = 'ordered-product-id';
-- Expected: ERROR - RESTRICT prevents deletion

-- Edge Case 3: Invalid order status
INSERT INTO orders (user_id, total_amount, status, shipping_address, shipping_name)
VALUES (auth.uid(), 100.00, 'invalid_status', 'Address', 'Name');
-- Expected: ERROR - check constraint violation

-- Edge Case 4: Negative prices
INSERT INTO products (name, category, price, quantity)
VALUES ('Invalid Product', 'Rings', -50.00, 10);
-- Expected: ERROR - check constraint violation
```

#### 2. Concurrent Operation Edge Cases
```sql
-- Edge Case 1: Simultaneous profile updates
-- Two users updating the same profile field simultaneously
-- PostgreSQL MVCC handles this with last-write-wins

-- Edge Case 2: Inventory race conditions
-- Multiple users ordering the last item
-- Trigger's SELECT after UPDATE ensures consistency

-- Edge Case 3: Cascade operations
-- Deleting an order with many order_items
-- CASCADE ensures all related items are removed atomically
```

#### 3. Storage Edge Cases
- **File too large**: Uploads over 5MB rejected by Supabase
- **Invalid MIME type**: Non-image files rejected
- **Concurrent uploads**: Same filename handling (Supabase adds timestamps)
- **Storage quota**: Monitor usage to prevent quota exceeded errors

## Testing Recommendations

### RLS Policy Tests
- Test anonymous product browsing
- Test authenticated user profile access
- Test cross-user data access (should fail)
- Test admin access to all resources

### Trigger Tests
- Create new user and verify profile creation
- Place order and verify inventory decrement
- Test concurrent orders for same product
- Test order with insufficient inventory

### Data Integrity Tests
- Verify foreign key constraints
- Test cascade deletes
- Verify check constraints (price, quantity)
- Test status enum enforcement

## Performance Optimization

### Recommended Indexes
```sql
-- Index for product searches by category
CREATE INDEX idx_products_category ON products(category) WHERE is_active = true;

-- Index for product searches by price range
CREATE INDEX idx_products_price ON products(price) WHERE is_active = true;

-- Index for order lookups by user
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Index for order status filtering
CREATE INDEX idx_orders_status ON orders(status);

-- Index for order items by order
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Index for featured products
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_active = true;
```

### Query Optimization Tips
1. **Product Listings**: Always filter by `is_active = true` first
2. **Order History**: Use pagination with LIMIT/OFFSET for large datasets
3. **Inventory Checks**: Consider caching popular product quantities
4. **Admin Dashboards**: Use aggregated views for statistics

### Database Maintenance
```sql
-- Regular VACUUM for optimal performance
VACUUM ANALYZE products;
VACUUM ANALYZE orders;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;
```

## Monitoring and Alerts

### Key Metrics to Monitor
1. **Inventory Levels**
   ```sql
   -- Products with low inventory
   SELECT id, name, quantity 
   FROM products 
   WHERE quantity < 5 AND is_active = true
   ORDER BY quantity ASC;
   ```

2. **Order Processing**
   ```sql
   -- Orders pending for too long
   SELECT id, created_at, shipping_name
   FROM orders
   WHERE status = 'pending' 
   AND created_at < NOW() - INTERVAL '24 hours';
   ```

3. **Failed Transactions**
   ```sql
   -- Monitor failed inventory decrements
   -- Set up alerts on 'Insufficient product quantity' errors
   ```

4. **User Activity**
   ```sql
   -- Active users in last 30 days
   SELECT COUNT(DISTINCT user_id)
   FROM orders
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```

### Supabase Dashboard Monitoring
1. **Database Size**: Monitor growth trends
2. **Connection Pool**: Watch for exhaustion
3. **Query Performance**: Identify slow queries
4. **Error Rates**: Track RLS policy violations
5. **Storage Usage**: Monitor image bucket size

## Backup and Recovery Strategy

### Automated Backups
- Supabase provides daily backups on paid plans
- Point-in-time recovery available for Pro+ plans
- Consider additional backup strategies for critical data

### Manual Backup Script
```sql
-- Export critical data
COPY (SELECT * FROM products) TO '/tmp/products_backup.csv' CSV HEADER;
COPY (SELECT * FROM profiles) TO '/tmp/profiles_backup.csv' CSV HEADER;
COPY (SELECT * FROM orders) TO '/tmp/orders_backup.csv' CSV HEADER;
COPY (SELECT * FROM order_items) TO '/tmp/order_items_backup.csv' CSV HEADER;
```

### Disaster Recovery Plan
1. Regular backup verification
2. Test restore procedures quarterly
3. Document recovery time objectives (RTO)
4. Maintain backup access credentials securely

## Deployment Checklist

1. Enable uuid-ossp extension
2. Execute schema.sql in correct order
3. Configure storage bucket and policies
4. Load sample data for testing
5. Verify all RLS policies active
6. Test triggers with sample transactions
7. Create recommended indexes
8. Set up monitoring alerts
9. Configure backup strategy
10. Document any modifications needed

## Version History

- **v1.0.0** (Current): Initial schema with 4 tables, RLS policies, and triggers
- Future versions should document schema migrations here