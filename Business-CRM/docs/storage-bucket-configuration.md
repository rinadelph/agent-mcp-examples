# Product Images Storage Bucket Configuration

This document provides the exact configuration needed for the product_images storage bucket in Supabase.

## Manual Configuration Steps

Since storage buckets cannot be created via SQL, you need to configure this through the Supabase Dashboard:

### 1. Access Storage Configuration
Navigate to: https://supabase.com/dashboard/project/qbbihusmlhhmwhidjxmm/storage/buckets

### 2. Create Bucket
Click "New bucket" and configure:
- **Bucket name**: `product_images`
- **Public bucket**: ✅ ON (Toggle this ON)
- **Allowed MIME types**: Add these one by one:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- **File size limit**: 5242880 (5MB in bytes)

### 3. Storage Policies
After creating the bucket, click on it and go to the "Policies" tab. Create these policies:

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product_images');
```

#### Policy 2: Admin Upload Access
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

#### Policy 3: Admin Update Access
```sql
CREATE POLICY "Admin update access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product_images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

#### Policy 4: Admin Delete Access
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

## Storage URL Format

Once configured, product images will be accessible at:
```
https://qbbihusmlhhmwhidjxmm.supabase.co/storage/v1/object/public/product_images/[filename]
```

## Testing the Configuration

### 1. Test Public Read (No Auth Required)
```javascript
// Should work for any user
const imageUrl = 'https://qbbihusmlhhmwhidjxmm.supabase.co/storage/v1/object/public/product_images/test.jpg';
// Try accessing this URL in a browser
```

### 2. Test Admin Upload (Requires Admin Auth)
```javascript
import { supabase } from '@/services/supabase';

// Authenticate as admin first
const { data: { user } } = await supabase.auth.getUser();

// Upload file
const file = new File(['...'], 'product1.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('product_images')
  .upload(`products/${file.name}`, file);

if (error) {
  console.error('Upload failed:', error.message);
  // Should fail if not admin
} else {
  console.log('Upload successful:', data);
}
```

### 3. Test Non-Admin Upload (Should Fail)
```javascript
// Authenticate as regular user
// Attempt upload - should receive permission denied error
```

## File Organization Best Practices

Recommended folder structure within the bucket:
```
product_images/
├── products/
│   ├── rings/
│   │   ├── classic-silver-band-001.jpg
│   │   └── celtic-knot-ring-002.jpg
│   ├── necklaces/
│   │   ├── heart-pendant-001.jpg
│   │   └── cross-pendant-002.jpg
│   ├── bracelets/
│   └── earrings/
└── thumbnails/
    ├── rings/
    ├── necklaces/
    └── ...
```

## Integration with Products Table

When creating/updating products, store the full URL in the `image_url` column:
```sql
UPDATE products 
SET image_url = 'https://qbbihusmlhhmwhidjxmm.supabase.co/storage/v1/object/public/product_images/products/rings/classic-silver-band-001.jpg'
WHERE id = 'product-uuid';
```

## Frontend Upload Component

Example Vue component for admin image upload:
```vue
<template>
  <div v-if="isAdmin">
    <input 
      type="file" 
      accept="image/jpeg,image/png,image/webp"
      @change="handleFileUpload"
      :disabled="uploading"
    >
    <p v-if="uploading">Uploading...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '@/services/supabase';

const uploading = ref(false);
const error = ref('');

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size must be less than 5MB';
    return;
  }

  uploading.value = true;
  error.value = '';

  const fileName = `products/${Date.now()}-${file.name}`;
  const { data, error: uploadError } = await supabase.storage
    .from('product_images')
    .upload(fileName, file);

  if (uploadError) {
    error.value = uploadError.message;
  } else {
    const publicUrl = `https://qbbihusmlhhmwhidjxmm.supabase.co/storage/v1/object/public/product_images/${fileName}`;
    // Use publicUrl to update product
  }

  uploading.value = false;
}
</script>
```

## Security Considerations

1. **File Type Validation**: Always validate MIME types on the client side as well
2. **File Size Limits**: Enforce 5MB limit in frontend before upload attempt
3. **Filename Sanitization**: Use timestamps and sanitize filenames to prevent conflicts
4. **Admin Verification**: Double-check admin status before showing upload UI
5. **CORS Configuration**: Already handled by Supabase for public buckets

## Monitoring and Maintenance

1. **Storage Usage**: Monitor via Supabase Dashboard > Storage
2. **Cleanup**: Implement admin tools to remove unused images
3. **Backup**: Consider periodic backups of product images
4. **CDN**: For production, consider using Supabase's CDN features

## Troubleshooting

### Common Issues:

1. **"Policy violation" error on upload**
   - Verify user is authenticated and has `is_admin = true` in profiles table
   - Check that policies were created correctly

2. **"File type not allowed" error**
   - Ensure MIME type is in the allowed list
   - Check file extension matches MIME type

3. **"File too large" error**
   - Verify file is under 5MB
   - Consider image compression before upload

4. **Images not displaying**
   - Check bucket is set to public
   - Verify URL format is correct
   - Test URL directly in browser

## Next Steps

After configuring the storage bucket:
1. Update sample products with real image URLs
2. Implement admin image upload in the admin panel
3. Add image optimization/resizing functionality
4. Consider implementing image thumbnails for performance