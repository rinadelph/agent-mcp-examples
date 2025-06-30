<template>
  <div class="space-y-4">
    <div class="p-4 border rounded-lg">
      <h3 class="font-semibold mb-4">Payment Information</h3>
      
      <!-- Card Element Container -->
      <div
        ref="cardElement"
        class="p-3 border rounded-md bg-white"
        :class="{ 'border-red-500': cardError }"
      />
      
      <!-- Error Display -->
      <div v-if="cardError" class="mt-2 text-sm text-red-600">
        {{ cardError }}
      </div>
      
      <!-- Processing State -->
      <div v-if="processing" class="mt-4 flex items-center justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-sm text-gray-600">Processing payment...</span>
      </div>
    </div>
    
    <!-- Payment Button -->
    <Button
      @click="handlePayment"
      :disabled="!cardComplete || processing"
      class="w-full"
      size="lg"
    >
      {{ processing ? 'Processing...' : `Pay $${amount.toFixed(2)}` }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { stripeService } from '../../services/stripe'
import Button from '../ui/button.vue'
import { toast } from 'vue-sonner'

interface Props {
  amount: number
  currency?: string
  billingDetails: {
    name: string
    email: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'usd'
})

const emit = defineEmits<{
  success: [paymentIntent: any]
  error: [error: string]
}>()

const cardElement = ref<HTMLElement>()
const cardError = ref('')
const cardComplete = ref(false)
const processing = ref(false)
let card: any = null

onMounted(async () => {
  try {
    // Create card element
    card = await stripeService.createElement('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    })

    // Mount card element
    if (cardElement.value) {
      card.mount(cardElement.value)
    }

    // Listen for card changes
    card.on('change', (event: any) => {
      cardError.value = event.error ? event.error.message : ''
      cardComplete.value = event.complete
    })
  } catch (error) {
    console.error('Error initializing Stripe:', error)
    toast.error('Failed to initialize payment form')
  }
})

onUnmounted(() => {
  if (card) {
    card.destroy()
  }
})

const handlePayment = async () => {
  if (!card) {
    toast.error('Payment form not initialized')
    return
  }

  processing.value = true
  cardError.value = ''

  try {
    // Create payment method
    const paymentMethodResult = await stripeService.createPaymentMethod(card, props.billingDetails)
    
    if (!paymentMethodResult.success) {
      throw new Error(paymentMethodResult.error || 'Failed to create payment method')
    }

    // Create payment intent (this would typically be done on the backend)
    const paymentIntentResult = await stripeService.createPaymentIntent({
      amount: Math.round(props.amount * 100), // Convert to cents
      currency: props.currency,
      orderId: `order_${Date.now()}`, // This should be the actual order ID
      metadata: {
        customer_email: props.billingDetails.email
      }
    })

    if (!paymentIntentResult.success) {
      throw new Error(paymentIntentResult.error || 'Failed to create payment intent')
    }

    // Confirm payment
    const confirmResult = await stripeService.confirmCardPayment(
      paymentIntentResult.data.client_secret,
      paymentMethodResult.paymentIntent
    )

    if (!confirmResult.success) {
      throw new Error(confirmResult.error || 'Payment failed')
    }

    // Payment successful
    toast.success('Payment completed successfully!')
    emit('success', confirmResult.paymentIntent)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    cardError.value = errorMessage
    toast.error(errorMessage)
    emit('error', errorMessage)
  } finally {
    processing.value = false
  }
}
</script>