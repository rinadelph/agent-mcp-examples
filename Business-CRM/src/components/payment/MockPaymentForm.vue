<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
      
      <!-- Credit Card Form -->
      <div class="space-y-4">
        <!-- Card Number -->
        <div>
          <label for="cardNumber" class="block text-sm font-medium mb-1">Card Number</label>
          <Input
            id="cardNumber"
            v-model="cardInfo.number"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            @input="formatCardNumber"
            :class="{ 'border-red-500': !isValidCardNumber && cardInfo.number }"
          />
          <p v-if="!isValidCardNumber && cardInfo.number" class="mt-1 text-sm text-red-600">
            Please enter a valid 16-digit card number
          </p>
        </div>

        <!-- Expiry and CVV -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="expiry" class="block text-sm font-medium mb-1">Expiry Date</label>
            <Input
              id="expiry"
              v-model="cardInfo.expiry"
              placeholder="MM/YY"
              maxlength="5"
              @input="formatExpiry"
              :class="{ 'border-red-500': !isValidExpiry && cardInfo.expiry }"
            />
            <p v-if="!isValidExpiry && cardInfo.expiry" class="mt-1 text-sm text-red-600">
              Invalid expiry date
            </p>
          </div>
          <div>
            <label for="cvv" class="block text-sm font-medium mb-1">CVV</label>
            <Input
              id="cvv"
              v-model="cardInfo.cvv"
              placeholder="123"
              maxlength="4"
              type="password"
              :class="{ 'border-red-500': !isValidCVV && cardInfo.cvv }"
            />
            <p v-if="!isValidCVV && cardInfo.cvv" class="mt-1 text-sm text-red-600">
              Invalid CVV
            </p>
          </div>
        </div>

        <!-- Cardholder Name -->
        <div>
          <label for="cardholderName" class="block text-sm font-medium mb-1">Cardholder Name</label>
          <Input
            id="cardholderName"
            v-model="cardInfo.name"
            placeholder="John Doe"
            :class="{ 'border-red-500': !cardInfo.name.trim() && cardInfo.name }"
          />
        </div>
      </div>
      </CardContent>
    </Card>

    <!-- Billing Address -->
    <Card>
      <CardHeader>
        <CardTitle>Billing Address</CardTitle>
      </CardHeader>
      <CardContent>
      <div class="space-y-4">
        <!-- Address Line 1 -->
        <div>
          <label for="billingAddress" class="block text-sm font-medium mb-1">Address</label>
          <Input
            id="billingAddress"
            v-model="billingAddress.line1"
            placeholder="123 Main St"
            required
          />
        </div>

        <!-- Address Line 2 -->
        <div>
          <label for="billingAddress2" class="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
          <Input
            id="billingAddress2"
            v-model="billingAddress.line2"
            placeholder="Apt, Suite, etc."
          />
        </div>

        <!-- City, State, ZIP -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="billingCity" class="block text-sm font-medium mb-1">City</label>
            <Input
              id="billingCity"
              v-model="billingAddress.city"
              placeholder="New York"
              required
            />
          </div>
          <div>
            <label for="billingState" class="block text-sm font-medium mb-1">State</label>
            <Input
              id="billingState"
              v-model="billingAddress.state"
              placeholder="NY"
              required
            />
          </div>
          <div>
            <label for="billingZip" class="block text-sm font-medium mb-1">ZIP Code</label>
            <Input
              id="billingZip"
              v-model="billingAddress.postalCode"
              placeholder="10001"
              required
            />
          </div>
        </div>

        <!-- Country -->
        <div>
          <label for="billingCountry" class="block text-sm font-medium mb-1">Country</label>
          <select 
            id="billingCountry" 
            v-model="billingAddress.country" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>
      </CardContent>
    </Card>

    <!-- Same as Shipping Checkbox -->
    <div class="flex items-center space-x-2">
      <input
        id="sameAsShipping"
        type="checkbox"
        v-model="sameAsShipping"
        @change="handleSameAsShipping"
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label for="sameAsShipping" class="text-sm font-medium">
        Billing address is the same as shipping address
      </label>
    </div>

    <!-- Processing State -->
    <div v-if="processing" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-sm text-gray-600">Processing payment...</span>
    </div>

    <!-- Mock Payment Notice -->
    <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-sm text-yellow-800">
        <strong>Note:</strong> This is a mock payment system. No real payment will be processed.
        Any 16-digit card number will be accepted for testing purposes.
      </p>
    </div>

    <!-- Payment Button -->
    <Button
      @click="handlePayment"
      :disabled="!isFormValid || processing"
      class="w-full"
      size="lg"
    >
      {{ processing ? 'Processing...' : `Complete Order - $${amount.toFixed(2)}` }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { toast } from 'vue-sonner'

interface Props {
  amount: number
  shippingAddress?: {
    address: string
    city: string
    state: string
    zipCode: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: [paymentData: any]
  error: [error: string]
}>()

const processing = ref(false)
const sameAsShipping = ref(false)

const cardInfo = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

const billingAddress = ref({
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US'
})

// Validation computed properties
const isValidCardNumber = computed(() => {
  const cleaned = cardInfo.value.number.replace(/\s/g, '')
  return cleaned.length === 16 && /^\d{16}$/.test(cleaned)
})

const isValidExpiry = computed(() => {
  const expiry = cardInfo.value.expiry
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false
  
  const [month, year] = expiry.split('/').map(Number)
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  if (month < 1 || month > 12) return false
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false
  
  return true
})

const isValidCVV = computed(() => {
  const cvv = cardInfo.value.cvv
  return cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv)
})

const isFormValid = computed(() => {
  return (
    isValidCardNumber.value &&
    isValidExpiry.value &&
    isValidCVV.value &&
    cardInfo.value.name.trim() &&
    billingAddress.value.line1.trim() &&
    billingAddress.value.city.trim() &&
    billingAddress.value.state.trim() &&
    billingAddress.value.postalCode.trim()
  )
})

// Format card number with spaces
function formatCardNumber() {
  let value = cardInfo.value.number.replace(/\s/g, '').replace(/\D/g, '')
  value = value.substring(0, 16)
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  cardInfo.value.number = value
}

// Format expiry date
function formatExpiry() {
  let value = cardInfo.value.expiry.replace(/\D/g, '')
  if (value.length >= 3) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  cardInfo.value.expiry = value
}

// Handle same as shipping checkbox
function handleSameAsShipping() {
  if (sameAsShipping.value && props.shippingAddress) {
    billingAddress.value.line1 = props.shippingAddress.address
    billingAddress.value.city = props.shippingAddress.city
    billingAddress.value.state = props.shippingAddress.state
    billingAddress.value.postalCode = props.shippingAddress.zipCode
  }
}

// Watch for shipping address changes
watch(() => props.shippingAddress, (newAddress) => {
  if (sameAsShipping.value && newAddress) {
    billingAddress.value.line1 = newAddress.address
    billingAddress.value.city = newAddress.city
    billingAddress.value.state = newAddress.state
    billingAddress.value.postalCode = newAddress.zipCode
  }
}, { deep: true })

// Handle mock payment processing
async function handlePayment() {
  if (!isFormValid.value) {
    toast.error('Please fill in all required payment information')
    return
  }

  processing.value = true

  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create mock payment data
    const mockPaymentData = {
      id: `mock_payment_${Date.now()}`,
      amount: Math.round(props.amount * 100), // Convert to cents
      currency: 'usd',
      status: 'succeeded',
      payment_method: {
        card: {
          brand: 'visa',
          last4: cardInfo.value.number.slice(-4),
          exp_month: parseInt(cardInfo.value.expiry.split('/')[0]),
          exp_year: parseInt('20' + cardInfo.value.expiry.split('/')[1])
        }
      },
      billing_details: {
        name: cardInfo.value.name,
        address: {
          line1: billingAddress.value.line1,
          line2: billingAddress.value.line2,
          city: billingAddress.value.city,
          state: billingAddress.value.state,
          postal_code: billingAddress.value.postalCode,
          country: billingAddress.value.country
        }
      },
      created: Date.now(),
      mock: true
    }

    // Simulate successful payment
    toast.success('Payment completed successfully!')
    emit('success', mockPaymentData)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed'
    toast.error(errorMessage)
    emit('error', errorMessage)
  } finally {
    processing.value = false
  }
}
</script>