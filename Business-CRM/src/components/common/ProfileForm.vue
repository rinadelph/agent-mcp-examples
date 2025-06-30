<template>
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
      <label for="shippingAddress" class="text-sm font-medium">Shipping Address</label>
      <Input
        id="shippingAddress"
        v-model="formData.shippingAddress"
        type="text"
        placeholder="123 Main St, City, State, ZIP"
        :disabled="loading"
        @blur="validateShippingAddress"
      />
      <p v-if="errors.shippingAddress" class="text-sm text-red-500">{{ errors.shippingAddress }}</p>
    </div>
    
    <div class="space-y-2">
      <label for="phoneNumber" class="text-sm font-medium">Phone Number</label>
      <Input
        id="phoneNumber"
        v-model="formData.phoneNumber"
        type="tel"
        placeholder="(555) 123-4567"
        :disabled="loading"
        @blur="validatePhoneNumber"
      />
      <p v-if="errors.phoneNumber" class="text-sm text-red-500">{{ errors.phoneNumber }}</p>
    </div>
    
    <div class="flex justify-end space-x-2">
      <Button 
        type="button" 
        variant="outline" 
        @click="$emit('cancel')"
        :disabled="loading"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        :disabled="loading || !isFormValid"
      >
        {{ loading ? 'Saving...' : 'Save Changes' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { z } from 'zod'
import { Input, Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import type { Profile } from '@/types/supabase'

interface Props {
  profile?: Profile | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const authStore = useAuthStore()

// Form schema using Zod
const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  shippingAddress: z.string().optional(),
  phoneNumber: z.string().optional()
})

// Form data
const formData = ref({
  fullName: '',
  shippingAddress: '',
  phoneNumber: ''
})

// Form errors
const errors = ref<{
  fullName?: string
  shippingAddress?: string
  phoneNumber?: string
}>({})

// Loading state
const loading = computed(() => authStore.loading)

// Form validation
const isFormValid = computed(() => {
  return formData.value.fullName && 
         !errors.value.fullName && 
         !errors.value.shippingAddress && 
         !errors.value.phoneNumber
})

// Validation functions
function validateFullName() {
  try {
    profileSchema.shape.fullName.parse(formData.value.fullName)
    errors.value.fullName = undefined
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value.fullName = error.errors[0].message
    }
  }
}

function validateShippingAddress() {
  if (formData.value.shippingAddress) {
    try {
      z.string().min(10, 'Please enter a complete address').parse(formData.value.shippingAddress)
      errors.value.shippingAddress = undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.value.shippingAddress = error.errors[0].message
      }
    }
  } else {
    errors.value.shippingAddress = undefined
  }
}

function validatePhoneNumber() {
  if (formData.value.phoneNumber) {
    try {
      z.string().regex(/^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/, 'Please enter a valid phone number').parse(formData.value.phoneNumber)
      errors.value.phoneNumber = undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.value.phoneNumber = error.errors[0].message
      }
    }
  } else {
    errors.value.phoneNumber = undefined
  }
}

// Handle form submission
async function handleSubmit() {
  // Validate entire form
  try {
    profileSchema.parse(formData.value)
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

  // Attempt profile update
  const result = await authStore.updateProfile({
    full_name: formData.value.fullName,
    shipping_address: formData.value.shippingAddress || null,
    phone_number: formData.value.phoneNumber || null
  })
  
  if (result.success) {
    emit('success')
  }
}

// Initialize form with current profile data
onMounted(() => {
  if (props.profile) {
    formData.value = {
      fullName: props.profile.full_name || '',
      shippingAddress: props.profile.shipping_address || '',
      phoneNumber: props.profile.phone_number || ''
    }
  }
})
</script>