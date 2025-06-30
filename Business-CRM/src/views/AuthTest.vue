<template>
  <div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">Authentication Test Page</h1>
    
    <div class="space-y-4">
      <!-- Auth Status -->
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <p><strong>Is Authenticated:</strong> {{ authStore.isAuthenticated }}</p>
            <p><strong>User ID:</strong> {{ authStore.user?.id || 'Not logged in' }}</p>
            <p><strong>Email:</strong> {{ authStore.userEmail || 'Not logged in' }}</p>
            <p><strong>Is Admin:</strong> {{ authStore.isAdmin }}</p>
            <p><strong>Loading:</strong> {{ authStore.loading }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Session Storage -->
      <Card>
        <CardHeader>
          <CardTitle>Session Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <p><strong>Local Storage Token:</strong> {{ hasLocalStorageToken ? 'Present' : 'Not found' }}</p>
            <p><strong>Session Storage Token:</strong> {{ hasSessionStorageToken ? 'Present' : 'Not found' }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Supabase Session -->
      <Card>
        <CardHeader>
          <CardTitle>Supabase Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <p><strong>Has Session:</strong> {{ supabaseSession ? 'Yes' : 'No' }}</p>
            <p><strong>Session User ID:</strong> {{ supabaseSession?.user?.id || 'No session' }}</p>
            <p><strong>Session Email:</strong> {{ supabaseSession?.user?.email || 'No session' }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Test Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <Button @click="checkAuth" :disabled="authStore.loading">
              Check Auth Status
            </Button>
            
            <Button @click="testLogin" :disabled="authStore.loading" variant="outline">
              Test Login (test@test.com)
            </Button>
            
            <Button @click="testLogout" :disabled="authStore.loading" variant="destructive">
              Test Logout
            </Button>
            
            <Button @click="navigateToProtected" variant="secondary">
              Navigate to Protected Route (/account)
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Debug Log -->
      <Card>
        <CardHeader>
          <CardTitle>Debug Log</CardTitle>
        </CardHeader>
        <CardContent>
          <pre class="text-xs overflow-auto max-h-64 p-2 bg-gray-100 rounded">{{ debugLog }}</pre>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
// import { toast } from 'vue-sonner' // Unused import

const router = useRouter()
const authStore = useAuthStore()

const supabaseSession = ref<any>(null)
const debugLog = ref<string[]>([])

const hasLocalStorageToken = computed(() => {
  return !!localStorage.getItem('supabase.auth.token')
})

const hasSessionStorageToken = computed(() => {
  return !!sessionStorage.getItem('supabase.auth.token')
})

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  debugLog.value.unshift(`[${timestamp}] ${message}`)
  if (debugLog.value.length > 50) {
    debugLog.value = debugLog.value.slice(0, 50)
  }
}

async function checkSupabaseSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      addLog(`Error getting session: ${error.message}`)
    } else {
      supabaseSession.value = session
      addLog(`Supabase session: ${session ? 'Found' : 'Not found'}`)
    }
  } catch (error) {
    addLog(`Exception getting session: ${error}`)
  }
}

async function checkAuth() {
  addLog('Checking auth status...')
  await authStore.checkAuthStatus()
  await checkSupabaseSession()
  addLog(`Auth check complete. Authenticated: ${authStore.isAuthenticated}`)
}

async function testLogin() {
  addLog('Attempting test login...')
  const result = await authStore.login('test@test.com', 'test123')
  if (result.success) {
    addLog('Login successful!')
    await checkSupabaseSession()
  } else {
    addLog(`Login failed: ${result.error}`)
  }
}

async function testLogout() {
  addLog('Attempting logout...')
  const result = await authStore.logout()
  if (result.success) {
    addLog('Logout successful!')
    await checkSupabaseSession()
  } else {
    addLog(`Logout failed: ${result.error}`)
  }
}

function navigateToProtected() {
  addLog('Navigating to /account...')
  router.push('/account')
}

onMounted(async () => {
  addLog('Auth test page mounted')
  await checkSupabaseSession()
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    addLog(`Auth state changed: ${event}`)
    supabaseSession.value = session
  })
  
  // Check initial state
  await checkAuth()
})
</script>