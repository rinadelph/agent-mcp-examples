import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchProfile, 
  updateProfile as updateProfileApi,
  checkIsAdmin 
} from '../services/api'
import type { AuthUser, Profile } from '../types/supabase'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const profile = ref<Profile | null>(null)
  const isAuthenticated = ref(false)
  const isAdmin = ref(false)
  const loading = ref(false)
  
  // Security enhancement state
  const loginAttempts = ref(0)
  const lastFailedLogin = ref<Date | null>(null)
  const isLockedOut = ref(false)
  const sessionTimeout = ref<NodeJS.Timeout | null>(null)

  // Getters
  const currentUser = computed(() => user.value)
  const userEmail = computed(() => user.value?.email || '')
  const isLoggedIn = computed(() => isAuthenticated.value)
  
  // Security getters
  const canAttemptLogin = computed(() => {
    if (!isLockedOut.value) return true
    
    const now = new Date()
    const lockoutDuration = 15 * 60 * 1000 // 15 minutes
    
    if (lastFailedLogin.value && (now.getTime() - lastFailedLogin.value.getTime()) > lockoutDuration) {
      isLockedOut.value = false
      loginAttempts.value = 0
      return true
    }
    
    return false
  })
  
  const lockoutTimeRemaining = computed(() => {
    if (!isLockedOut.value || !lastFailedLogin.value) return 0
    
    const now = new Date()
    const lockoutDuration = 15 * 60 * 1000 // 15 minutes
    const elapsed = now.getTime() - lastFailedLogin.value.getTime()
    const remaining = Math.max(0, lockoutDuration - elapsed)
    
    return Math.ceil(remaining / 1000) // Return seconds
  })

  // Actions
  async function login(email: string, password: string) {
    // Check rate limiting
    if (!canAttemptLogin.value) {
      const timeRemaining = Math.ceil(lockoutTimeRemaining.value / 60)
      const message = `Too many failed attempts. Please try again in ${timeRemaining} minutes.`
      toast.error(message)
      return { success: false, error: message }
    }
    
    loading.value = true
    try {
      const response = await signIn(email, password)
      
      if (!response.success) {
        // Handle failed login attempt
        handleFailedLogin()
        
        // Generic error message to prevent information leakage
        const message = 'Invalid email or password. Please try again.'
        toast.error(message)
        return { success: false, error: message }
      }

      // Successful login - reset security counters
      resetSecurityCounters()
      
      user.value = response.data
      isAuthenticated.value = true
      
      // Important: Wait a moment for Supabase to establish session
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Fetch profile and admin status
      await fetchUserProfile()
      
      // Set up session timeout
      setupSessionTimeout()
      
      // Double-check auth status to ensure session is established
      const sessionCheck = await getCurrentUser()
      if (!sessionCheck.success || !sessionCheck.data) {
        console.error('Session not properly established after login')
        clearAllState()
        toast.error('Session could not be established. Please try again.')
        return { success: false, error: 'Session establishment failed' }
      }
      
      toast.success('Successfully logged in')
      return { success: true }
    } catch (error) {
      handleFailedLogin()
      const message = 'Login failed. Please try again.'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, fullName: string) {
    loading.value = true
    try {
      const response = await signUp(email, password, fullName)
      
      if (!response.success) {
        throw new Error(response.error)
      }

      user.value = response.data
      isAuthenticated.value = true
      
      // Profile is created automatically via database trigger
      // Fetch it to populate our state
      await fetchUserProfile()
      
      toast.success('Account created successfully')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      const response = await signOut()
      
      if (!response.success) {
        throw new Error(response.error)
      }

      // Clear all state including security state
      clearAllState()
      
      toast.success('Successfully logged out')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to logout'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function fetchUserProfile() {
    if (!user.value?.id) return
    
    try {
      const profileResponse = await fetchProfile(user.value.id)
      
      if (profileResponse.success) {
        profile.value = profileResponse.data
        
        // Set admin status from profile data directly
        isAdmin.value = profileResponse.data?.is_admin || false
        
        // Double-check with API as backup
        try {
          const adminResponse = await checkIsAdmin(user.value.id)
          if (adminResponse.success && adminResponse.data !== isAdmin.value) {
            isAdmin.value = adminResponse.data
          }
        } catch (adminError) {
          console.warn('Admin API check failed, using profile data:', adminError)
        }
      } else {
        console.warn('Profile fetch failed:', profileResponse.error)
        // Set default values instead of failing completely
        profile.value = null
        isAdmin.value = false
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Set safe defaults
      profile.value = null
      isAdmin.value = false
    }
  }

  async function updateProfile(profileData: Partial<Profile>) {
    if (!user.value?.id) {
      toast.error('No user logged in')
      return { success: false, error: 'No user logged in' }
    }
    
    loading.value = true
    try {
      const response = await updateProfileApi(user.value.id, profileData)
      
      if (!response.success) {
        throw new Error(response.error)
      }

      profile.value = response.data
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function checkAuthStatus() {
    loading.value = true
    try {
      const response = await getCurrentUser()
      
      if (response.success && response.data) {
        user.value = response.data
        isAuthenticated.value = true
        setupSessionTimeout()
        
        // Fetch profile in background - don't block auth check
        fetchUserProfile().catch(error => {
          console.warn('Profile fetch failed but auth check succeeded:', error)
          // Don't clear auth state if just profile fetch fails
        })
      } else {
        // Not authenticated
        clearAllState()
      }
    } catch (error) {
      console.error('Failed to check auth status:', error)
      clearAllState()
    } finally {
      loading.value = false
    }
  }
  
  // Security helper functions
  function handleFailedLogin() {
    loginAttempts.value++
    lastFailedLogin.value = new Date()
    
    const maxAttempts = 5
    if (loginAttempts.value >= maxAttempts) {
      isLockedOut.value = true
      toast.warning(`Account temporarily locked after ${maxAttempts} failed attempts. Try again in 15 minutes.`)
    } else {
      const remaining = maxAttempts - loginAttempts.value
      toast.warning(`Invalid credentials. ${remaining} attempts remaining before lockout.`)
    }
  }
  
  function resetSecurityCounters() {
    loginAttempts.value = 0
    lastFailedLogin.value = null
    isLockedOut.value = false
  }
  
  function setupSessionTimeout() {
    // Clear existing timeout
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value)
    }
    
    // Set 2-hour session timeout
    const timeoutDuration = 2 * 60 * 60 * 1000 // 2 hours
    sessionTimeout.value = setTimeout(() => {
      toast.warning('Your session has expired. Please log in again.')
      logout()
    }, timeoutDuration)
  }
  
  function clearAllState() {
    // Clear auth state
    user.value = null
    profile.value = null
    isAuthenticated.value = false
    isAdmin.value = false
    
    // Clear security state
    resetSecurityCounters()
    
    // Clear session timeout
    if (sessionTimeout.value) {
      clearTimeout(sessionTimeout.value)
      sessionTimeout.value = null
    }
  }
  
  function extendSession() {
    if (isAuthenticated.value) {
      setupSessionTimeout()
    }
  }

  return {
    // State
    user,
    profile,
    isAuthenticated,
    isAdmin,
    loading,
    
    // Security state
    loginAttempts,
    isLockedOut,
    
    // Getters
    currentUser,
    userEmail,
    isLoggedIn,
    canAttemptLogin,
    lockoutTimeRemaining,
    
    // Actions
    login,
    register,
    logout,
    fetchProfile: fetchUserProfile,
    updateProfile,
    checkAuthStatus,
    
    // Security actions
    extendSession,
    resetSecurityCounters,
    clearAllState
  }
})