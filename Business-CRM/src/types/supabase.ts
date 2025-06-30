export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          shipping_address: string | null
          phone_number: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          shipping_address?: string | null
          phone_number?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          shipping_address?: string | null
          phone_number?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          category: string
          price: number
          quantity: number
          image_url: string | null
          is_featured: boolean
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          category: string
          price: number
          quantity?: number
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          category?: string
          price?: number
          quantity?: number
          image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          total_amount: number
          status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          shipping_address: string
          shipping_name: string
          shipping_phone: string | null
          guest_email: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          total_amount: number
          status?: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          shipping_address: string
          shipping_name: string
          shipping_phone?: string | null
          guest_email?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          total_amount?: number
          status?: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          shipping_address?: string
          shipping_name?: string
          shipping_phone?: string | null
          guest_email?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']

// Auth types
export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

// API Response types
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

// Order status type
export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled'