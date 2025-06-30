import { supabase } from './supabase'
import type { 
  Product, ProductInsert, ProductUpdate,
  Order, OrderInsert,
  Profile, ProfileUpdate,
  ApiResponse, OrderStatus, AuthUser
} from '../types/supabase'
import { toast } from 'vue-sonner'
import { logger } from '../lib/logger'

// Products API
export async function fetchProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products'
    return { success: false, error: message }
  }
}

export async function fetchProductById(id: string): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Product not found')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product'
    return { success: false, error: message }
  }
}

export async function createProduct(productData: ProductInsert): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to create product')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product'
    return { success: false, error: message }
  }
}

export async function updateProduct(id: string, productData: ProductUpdate): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to update product')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update product'
    return { success: false, error: message }
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true, data: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete product'
    return { success: false, error: message }
  }
}

export async function uploadProductImages(files: File[]): Promise<ApiResponse<string[]>> {
  try {
    const urls: string[] = []
    
    for (const file of files) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.type}`)
        continue
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`)
        continue
      }
      
      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileExt = file.name.split('.').pop()
      const fileName = `product-${timestamp}-${randomId}.${fileExt}`
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('product_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`)
        continue
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product_images')
        .getPublicUrl(fileName)
      
      urls.push(publicUrl)
    }
    
    if (urls.length === 0) {
      throw new Error('No images uploaded successfully')
    }
    
    return { success: true, data: urls }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload images'
    return { success: false, error: message }
  }
}

// Orders API
export async function createOrder(orderData: OrderInsert): Promise<ApiResponse<Order>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to create order')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return { success: false, error: message }
  }
}

export async function fetchOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders'
    return { success: false, error: message }
  }
}

export async function fetchOrderById(id: string): Promise<ApiResponse<Order>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Order not found')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch order'
    return { success: false, error: message }
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Failed to update order status')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order status'
    return { success: false, error: message }
  }
}

export async function fetchOrdersByUserId(userId: string): Promise<ApiResponse<Order[]>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user orders'
    return { success: false, error: message }
  }
}

export async function createOrderItems(orderItems: Array<{
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}>): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (error) throw error
    return { success: true, data: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order items'
    return { success: false, error: message }
  }
}

// Profiles API
export async function fetchProfile(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Profile not found')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile'
    return { success: false, error: message }
  }
}

export async function updateProfile(userId: string, profileData: ProfileUpdate): Promise<ApiResponse<Profile>> {
  try {
    // First attempt to update
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      // Check for infinite recursion error
      if (error.message?.includes('infinite recursion')) {
        logger.warn('Infinite recursion detected in profile update, attempting workaround...')
        
        // Workaround: Update without select, then fetch separately
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId)
        
        if (updateError) throw updateError
        
        // Fetch the updated profile separately
        const { data: fetchedData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (fetchError) throw fetchError
        if (!fetchedData) throw new Error('Failed to fetch updated profile')
        
        return { success: true, data: fetchedData }
      }
      throw error
    }
    
    if (!data) throw new Error('Failed to update profile')
    
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile'
    return { success: false, error: message }
  }
}

export async function checkIsAdmin(userId: string): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return { success: true, data: data?.is_admin || false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check admin status'
    return { success: false, error: message }
  }
}

// Auth API
export async function signUp(email: string, password: string, fullName: string): Promise<ApiResponse<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: window.location.origin
      }
    })
    
    if (error) {
      // Handle specific Supabase auth errors
      logger.error('Supabase signup error:', error)
      
      if (error.message?.includes('Email address') || error.code === 'email_address_invalid') {
        throw new Error('Email authentication is not properly configured. Please contact support.')
      }
      
      if (error.message?.includes('not allowed') || error.code === 'signup_disabled') {
        throw new Error('User registration is currently disabled. Please try again later.')
      }
      
      throw error
    }
    
    if (!data.user) throw new Error('Failed to create user')
    
    // If email confirmations are disabled, user can login immediately
    // If enabled, they need to check their email
    return { 
      success: true, 
      data: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign up'
    return { success: false, error: message }
  }
}

export async function signIn(email: string, password: string): Promise<ApiResponse<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    if (!data.user) throw new Error('Failed to sign in')
    
    return { 
      success: true, 
      data: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in'
    return { success: false, error: message }
  }
}

export async function signOut(): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    return { success: true, data: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign out'
    return { success: false, error: message }
  }
}

export async function getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
  try {
    // First check for an active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }
    
    if (!session) {
      // No active session
      return { success: true, data: null }
    }
    
    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User error:', userError)
      throw userError
    }
    
    if (!user) {
      return { success: true, data: null }
    }
    
    return { 
      success: true, 
      data: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get current user'
    console.error('getCurrentUser error:', error)
    return { success: false, error: message }
  }
}