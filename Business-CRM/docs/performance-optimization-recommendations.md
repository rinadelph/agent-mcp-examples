# Performance Optimization Recommendations

Based on Supabase advisor analysis, here are the performance optimizations that should be considered:

## 1. RLS Policy Optimization (High Priority)

The current RLS policies use `auth.uid()` which gets re-evaluated for each row. This can cause performance issues at scale.

### Recommended Fix:
Replace `auth.uid()` with `(SELECT auth.uid())` in all RLS policies. This ensures the auth function is only called once per query.

Example optimization:
```sql
-- Current (suboptimal)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Optimized
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);
```

### Files to create:
- `supabase/optimize-rls-policies.sql` - Migration to update all RLS policies

## 2. Multiple Permissive Policies (Medium Priority)

Several tables have multiple permissive policies for the same action, which requires PostgreSQL to evaluate each policy. Consider combining policies where possible.

### Affected Tables:
- `order_items` - Has 3 SELECT policies and 2 INSERT policies
- `orders` - Has 2 SELECT policies  
- `profiles` - Has 2 SELECT policies

### Recommendation:
Consider using CASE statements or more complex logic in single policies rather than multiple policies.

## 3. Unused Indexes (Low Priority)

The following indexes have not been used yet (this is normal for a new database):
- All performance indexes just created

These will be used once the application starts querying data. Monitor usage and remove truly unused indexes after the application has been running for a while.

## 4. Index Creation Completed

✅ Added missing index: `idx_order_items_product_id` on `order_items(product_id)`
✅ All foreign keys now have covering indexes

## Current Performance Status

### Indexes Created:
1. `idx_products_category` - For category filtering
2. `idx_products_price` - For price range queries
3. `idx_orders_user_id` - For user order lookups
4. `idx_orders_status` - For order status filtering
5. `idx_order_items_order_id` - For order item queries
6. `idx_order_items_product_id` - For product foreign key (NEW)
7. `idx_products_featured` - For featured product queries
8. `idx_products_active_category_price` - Compound index
9. `idx_orders_updated_at` - For date sorting

### Security Fixes Applied:
✅ All functions now have explicit `search_path = public` set
✅ No security vulnerabilities detected

## Monitoring Recommendations

1. **Query Performance**: Use Supabase Dashboard to monitor slow queries
2. **Index Usage**: Check index usage statistics after application launch
3. **RLS Performance**: Monitor query execution times, especially for tables with multiple policies
4. **Connection Pooling**: Watch for connection exhaustion under load

## Next Steps

1. Consider implementing RLS policy optimizations if performance issues arise
2. Monitor index usage and remove unused indexes after 30 days of production use
3. Set up alerts for slow queries exceeding 100ms
4. Consider implementing query result caching for frequently accessed data

## Query Optimization Tips

1. Always include `is_active = true` when querying products
2. Use pagination (LIMIT/OFFSET) for large result sets
3. Consider materialized views for complex reporting queries
4. Use prepared statements to reduce query planning overhead