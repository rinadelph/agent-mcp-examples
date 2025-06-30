-- Storage Policies for product_images bucket
-- Run these queries AFTER creating the bucket in Supabase Dashboard

-- Policy 1: Public Read Access
-- Allows anyone to view/download images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product_images');

-- Policy 2: Admin Upload Access
-- Only admins can upload new images
CREATE POLICY "Admin upload access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product_images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Policy 3: Admin Update Access
-- Only admins can update/replace existing images
CREATE POLICY "Admin update access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product_images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Policy 4: Admin Delete Access
-- Only admins can delete images
CREATE POLICY "Admin delete access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product_images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Verify policies are created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';