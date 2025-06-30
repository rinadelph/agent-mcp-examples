<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Toaster } from 'vue-sonner'
import Navbar from './components/common/Navbar.vue'
import { useAuthStore } from './stores/auth'
import { supabase } from './services/supabase'

const authStore = useAuthStore()

// Listen for auth state changes
const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state change:', event, session?.user?.id)
  
  if (event === 'SIGNED_IN' && session) {
    // User signed in - don't await to prevent blocking UI
    authStore.checkAuthStatus().catch(error => {
      console.error('Auth status check failed:', error)
    })
  } else if (event === 'SIGNED_OUT') {
    // User signed out
    authStore.clearAllState()
  } else if (event === 'TOKEN_REFRESHED' && session) {
    // Token was refreshed - don't await to prevent blocking UI
    authStore.checkAuthStatus().catch(error => {
      console.error('Auth status check failed on token refresh:', error)
    })
  }
})

// Check authentication status on app initialization
onMounted(() => {
  // Don't await to prevent blocking initial render
  authStore.checkAuthStatus().catch(error => {
    console.error('Initial auth check failed:', error)
  })
})

// Clean up listener on unmount
onUnmounted(() => {
  authListener?.subscription.unsubscribe()
})
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view />
    <Toaster />
  </div>
</template>

<style>
</style>
