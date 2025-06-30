<template>
  <div class="space-y-2">
    <label for="captcha" class="text-sm font-medium">
      Security Check: {{ question }}
    </label>
    <Input
      id="captcha"
      v-model="userAnswer"
      type="text"
      placeholder="Enter answer"
      required
      :disabled="disabled || loading"
    />
    <div class="flex items-center gap-2">
      <button 
        type="button"
        @click="refreshCaptcha"
        class="text-xs text-blue-600 hover:text-blue-800 underline"
        :disabled="disabled || loading"
      >
        {{ loading ? 'Loading...' : 'Refresh Question' }}
      </button>
      <span v-if="isValid && !loading" class="text-xs text-green-600">✓ Correct</span>
      <span v-else-if="errorMessage && !loading" class="text-xs text-red-600">✗ {{ errorMessage }}</span>
      <span v-else-if="loading" class="text-xs text-gray-500">Validating...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Input } from '@/components/ui'
import CaptchaService from '@/services/captcha'

interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  valid: [isValid: boolean]
  validate: []
}>()

// Captcha state
const question = ref('')
const userAnswer = ref('')
const sessionId = ref('')
const hashedAnswer = ref('')
const isValid = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Generate new captcha using secure service
async function generateCaptcha() {
  try {
    loading.value = true
    errorMessage.value = ''
    userAnswer.value = ''
    isValid.value = false
    
    // Cleanup expired sessions
    CaptchaService.cleanupExpiredSessions()
    
    const captcha = await CaptchaService.generateCaptcha()
    question.value = captcha.question
    sessionId.value = captcha.sessionId
    hashedAnswer.value = captcha.hashedAnswer
    
    emit('valid', false)
  } catch (error) {
    console.error('Failed to generate captcha:', error)
    errorMessage.value = 'Failed to generate captcha'
  } finally {
    loading.value = false
  }
}

async function refreshCaptcha() {
  await generateCaptcha()
}

async function validateAnswer(): Promise<boolean> {
  if (!userAnswer.value || !sessionId.value || loading.value) {
    isValid.value = false
    errorMessage.value = 'Please enter an answer'
    return false
  }

  try {
    loading.value = true
    errorMessage.value = ''
    
    const answer = parseInt(userAnswer.value.trim())
    if (isNaN(answer)) {
      isValid.value = false
      errorMessage.value = 'Please enter a valid number'
      return false
    }

    const result = await CaptchaService.validateCaptcha(
      sessionId.value,
      answer,
      hashedAnswer.value
    )

    isValid.value = result.valid
    
    if (!result.valid && result.error) {
      errorMessage.value = result.error
      
      // If session expired or too many attempts, generate new captcha
      if (result.error.includes('expired') || result.error.includes('Too many attempts')) {
        setTimeout(() => {
          generateCaptcha()
        }, 1000)
      }
    } else {
      errorMessage.value = ''
    }
    
    emit('valid', result.valid)
    return result.valid
  } catch (error) {
    console.error('Captcha validation error:', error)
    isValid.value = false
    errorMessage.value = 'Validation failed'
    emit('valid', false)
    return false
  } finally {
    loading.value = false
  }
}

// Watch for user input changes - only reset state, don't validate
watch(userAnswer, () => {
  // Reset validation state when user types
  isValid.value = false
  errorMessage.value = ''
  emit('valid', false)
})

// Expose validateAnswer method to parent component
defineExpose({
  validateAnswer
})

// Initialize on mount
onMounted(() => {
  generateCaptcha()
})
</script>