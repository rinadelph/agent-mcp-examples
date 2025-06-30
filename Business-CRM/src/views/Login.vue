<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to Your Account</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">Email</label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="john@example.com"
              required
              :disabled="loading"
              @blur="validateEmail"
            />
            <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
          </div>
          
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">Password</label>
            <Input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
              @blur="validatePassword"
            />
            <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
          </div>

          <!-- Captcha -->
          <MathCaptcha 
            ref="captchaRef"
            :disabled="loading"
          />
          
          <Button type="submit" class="w-full" :disabled="loading || !isFormValid || !authStore.canAttemptLogin">
            {{ loading ? 'Logging in...' : 'Login' }}
          </Button>
          
          <!-- Rate limiting warning -->
          <div v-if="authStore.isLockedOut" class="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <p class="font-medium">Account temporarily locked</p>
            <p>Too many failed attempts. Try again in {{ Math.ceil(authStore.lockoutTimeRemaining / 60) }} minutes.</p>
          </div>
          
          <!-- Login attempts warning -->
          <div v-else-if="authStore.loginAttempts > 0" class="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
            <p>{{ 5 - authStore.loginAttempts }} attempts remaining before temporary lockout</p>
          </div>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Don't have an account?
          <RouterLink to="/register" class="text-primary hover:underline">
            Register here
          </RouterLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Input,
  Button
} from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import MathCaptcha from '@/components/common/MathCaptcha.vue'

const router = useRouter()
const authStore = useAuthStore()

// Form schema using Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Form data
const formData = ref({
  email: '',
  password: ''
})

// Form errors
const errors = ref<{
  email?: string
  password?: string
}>({})

// Captcha reference
const captchaRef = ref()

// Loading state
const loading = computed(() => authStore.loading)

// Form validation
const isFormValid = computed(() => {
  return formData.value.email && 
         formData.value.password && 
         !errors.value.email && 
         !errors.value.password
})

// Validate email field
function validateEmail() {
  try {
    loginSchema.shape.email.parse(formData.value.email)
    errors.value.email = undefined
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value.email = error.errors[0].message
    }
  }
}

// Validate password field
function validatePassword() {
  try {
    loginSchema.shape.password.parse(formData.value.password)
    errors.value.password = undefined
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value.password = error.errors[0].message
    }
  }
}


// Handle form submission
async function handleSubmit() {
  // Validate captcha first
  const isCaptchaValid = await captchaRef.value?.validateAnswer()
  if (!isCaptchaValid) {
    return // Captcha validation failed
  }

  // Validate entire form
  try {
    loginSchema.parse(formData.value)
    errors.value = {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        if (err.path[0] === 'email') {
          errors.value.email = err.message
        } else if (err.path[0] === 'password') {
          errors.value.password = err.message
        }
      })
      return
    }
  }

  // Attempt login
  const result = await authStore.login(formData.value.email, formData.value.password)
  
  if (result.success) {
    // Redirect to home or previous page
    const redirectTo = router.currentRoute.value.query.redirect as string
    router.push(redirectTo || '/')
  }
}
</script>