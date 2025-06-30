<template>
  <div v-if="password" class="space-y-2">
    <div class="flex items-center space-x-2">
      <div class="flex-1 bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300"
          :class="strengthColor"
          :style="{ width: `${strengthPercentage}%` }"
        ></div>
      </div>
      <span class="text-sm font-medium" :class="strengthTextColor">
        {{ strengthText }}
      </span>
    </div>
    
    <div class="text-xs space-y-1">
      <div class="flex items-center space-x-2">
        <component :is="lengthValid ? CheckIcon : XMarkIcon" 
          class="w-4 h-4" 
          :class="lengthValid ? 'text-green-500' : 'text-red-500'" 
        />
        <span :class="lengthValid ? 'text-green-700' : 'text-red-700'">
          At least 8 characters
        </span>
      </div>
      
      <div class="flex items-center space-x-2">
        <component :is="uppercaseValid ? CheckIcon : XMarkIcon" 
          class="w-4 h-4" 
          :class="uppercaseValid ? 'text-green-500' : 'text-red-500'" 
        />
        <span :class="uppercaseValid ? 'text-green-700' : 'text-red-700'">
          At least one uppercase letter
        </span>
      </div>
      
      <div class="flex items-center space-x-2">
        <component :is="numbersValid ? CheckIcon : XMarkIcon" 
          class="w-4 h-4" 
          :class="numbersValid ? 'text-green-500' : 'text-red-500'" 
        />
        <span :class="numbersValid ? 'text-green-700' : 'text-red-700'">
          At least one number
        </span>
      </div>
      
      <div class="flex items-center space-x-2">
        <component :is="specialCharValid ? CheckIcon : XMarkIcon" 
          class="w-4 h-4" 
          :class="specialCharValid ? 'text-green-500' : 'text-red-500'" 
        />
        <span :class="specialCharValid ? 'text-green-700' : 'text-red-700'">
          At least one special character
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Simple icons (using SVG paths)
const CheckIcon = {
  template: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`
}

const XMarkIcon = {
  template: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`
}

interface Props {
  password: string
}

const props = defineProps<Props>()

// Password validation rules
const lengthValid = computed(() => props.password.length >= 8)
const uppercaseValid = computed(() => /[A-Z]/.test(props.password))
const lowercaseValid = computed(() => /[a-z]/.test(props.password))
const numbersValid = computed(() => /\d/.test(props.password))
const specialCharValid = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(props.password))

// Calculate password strength
const validCriteria = computed(() => {
  const criteria = [lengthValid.value, uppercaseValid.value, lowercaseValid.value, numbersValid.value, specialCharValid.value]
  return criteria.filter(Boolean).length
})

const strengthPercentage = computed(() => {
  return (validCriteria.value / 5) * 100
})

const strengthText = computed(() => {
  if (validCriteria.value <= 1) return 'Very Weak'
  if (validCriteria.value === 2) return 'Weak'
  if (validCriteria.value === 3) return 'Fair'
  if (validCriteria.value === 4) return 'Good'
  return 'Strong'
})

const strengthColor = computed(() => {
  if (validCriteria.value <= 1) return 'bg-red-500'
  if (validCriteria.value === 2) return 'bg-orange-500'
  if (validCriteria.value === 3) return 'bg-yellow-500'
  if (validCriteria.value === 4) return 'bg-blue-500'
  return 'bg-green-500'
})

const strengthTextColor = computed(() => {
  if (validCriteria.value <= 1) return 'text-red-600'
  if (validCriteria.value === 2) return 'text-orange-600'
  if (validCriteria.value === 3) return 'text-yellow-600'
  if (validCriteria.value === 4) return 'text-blue-600'
  return 'text-green-600'
})

// Export strength for parent component
const isStrong = computed(() => validCriteria.value >= 4)

defineExpose({
  isStrong,
  strengthPercentage: strengthPercentage.value
})
</script>