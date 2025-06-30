<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Sign up to start shopping for beautiful sterling silver jewelry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label for="fullName" class="text-sm font-medium">Full Name</label>
            <Input
              id="fullName"
              v-model="formData.fullName"
              type="text"
              placeholder="John Doe"
              required
              :disabled="loading"
              @blur="validateFullName"
            />
            <p v-if="errors.fullName" class="text-sm text-red-500">{{ errors.fullName }}</p>
          </div>
          
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
            
            <!-- Password Strength Meter -->
            <PasswordStrengthMeter 
              :password="formData.password" 
              ref="passwordMeter"
            />
          </div>
          
          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
            <Input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
              @blur="validateConfirmPassword"
            />
            <p v-if="errors.confirmPassword" class="text-sm text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Captcha -->
          <MathCaptcha 
            ref="captchaRef"
            :disabled="loading"
          />
          
          <Button type="submit" class="w-full" :disabled="loading || !isFormValid">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          Already have an account?
          <RouterLink to="/login" class="text-primary hover:underline">
            Login here
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
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue'
import MathCaptcha from '@/components/common/MathCaptcha.vue'

const router = useRouter()
const authStore = useAuthStore()

// Enhanced password validation schema - without the refine for shape access
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter') 
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character')

const baseSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string()
})

const registerSchema = baseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Form data
const formData = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Form errors
const errors = ref<{
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}>({})

// Password strength meter reference
const passwordMeter = ref<InstanceType<typeof PasswordStrengthMeter> | null>(null)

// Captcha reference
const captchaRef = ref()

// Loading state
const loading = computed(() => authStore.loading)

// Form validation
const isFormValid = computed(() => {
  const basicValidation = formData.value.fullName && 
         formData.value.email && 
         formData.value.password &&
         formData.value.confirmPassword &&
         !errors.value.fullName &&
         !errors.value.email && 
         !errors.value.password &&
         !errors.value.confirmPassword
         
  // Also check password strength
  const passwordStrong = passwordMeter.value?.isStrong ?? false
  
  return basicValidation && passwordStrong
})

// Validate full name field
function validateFullName() {
  try {
    baseSchema.shape.fullName.parse(formData.value.fullName)
    errors.value.fullName = undefined
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value.fullName = error.errors[0].message
    }
  }
}

// Validate email field
function validateEmail() {
  try {
    baseSchema.shape.email.parse(formData.value.email)
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
    passwordSchema.parse(formData.value.password)
    errors.value.password = undefined
    // Also revalidate confirm password when password changes
    if (formData.value.confirmPassword) {
      validateConfirmPassword()
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value.password = error.errors[0].message
    }
  }
}

// Validate confirm password field
function validateConfirmPassword() {
  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = "Passwords don't match"
  } else {
    errors.value.confirmPassword = undefined
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
    registerSchema.parse(formData.value)
    errors.value = {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors.value
        errors.value[field] = err.message
      })
      return
    }
  }

  // Attempt registration
  const result = await authStore.register(
    formData.value.email, 
    formData.value.password,
    formData.value.fullName
  )
  
  if (result.success) {
    // Redirect to account page after successful registration
    router.push('/account')
  }
}
</script>