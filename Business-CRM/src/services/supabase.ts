import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit', // Changed from 'pkce' to 'implicit' for simpler auth flow
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  }
})

// Listen for auth state changes
supabase.auth.onAuthStateChange((_event, _session) => {
  // Auth state change handled by auth store
})