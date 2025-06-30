<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Checkout</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{{ currentStepTitle }}</CardTitle>
            <CardDescription>{{ currentStepDescription }}</CardDescription>
          </CardHeader>
          <CardContent>
            <!-- Step 1: Shipping Information -->
            <form v-if="currentStep === 1" @submit.prevent="nextStep" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium mb-1">First Name</label>
                  <Input
                    id="firstName"
                    v-model="shippingInfo.firstName"
                    required
                    placeholder="John"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium mb-1">Last Name</label>
                  <Input
                    id="lastName"
                    v-model="shippingInfo.lastName"
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium mb-1">Email</label>
                <Input
                  id="email"
                  v-model="shippingInfo.email"
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                />
              </div>
              
              <div>
                <label for="address" class="block text-sm font-medium mb-1">Address</label>
                <Input
                  id="address"
                  v-model="shippingInfo.address"
                  required
                  placeholder="123 Main St"
                />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="city" class="block text-sm font-medium mb-1">City</label>
                  <Input
                    id="city"
                    v-model="shippingInfo.city"
                    required
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label for="state" class="block text-sm font-medium mb-1">State</label>
                  <Input
                    id="state"
                    v-model="shippingInfo.state"
                    required
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label for="zipCode" class="block text-sm font-medium mb-1">ZIP Code</label>
                  <Input
                    id="zipCode"
                    v-model="shippingInfo.zipCode"
                    required
                    placeholder="10001"
                  />
                </div>
              </div>
              
              <div class="flex justify-between pt-4">
                <Button type="button" variant="outline" @click="$router.push('/cart')">
                  Back to Cart
                </Button>
                <Button type="submit">
                  Continue to Payment
                </Button>
              </div>
            </form>
            
            <!-- Step 2: Payment Information -->
            <div v-else-if="currentStep === 2" class="space-y-4">
              <MockPaymentForm
                :amount="totalAmount"
                :shipping-address="shippingInfo"
                @success="handlePaymentSuccess"
                @error="handlePaymentError"
              />
              
              <div class="flex justify-between pt-4">
                <Button type="button" variant="outline" @click="currentStep = 1">
                  Back to Shipping
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 mb-4">
              <div v-for="item in cartStore.formattedCart" :key="item.id" class="flex justify-between text-sm">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>{{ item.formattedSubtotal }}</span>
              </div>
            </div>
            
            <div class="border-t pt-2 space-y-2">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>${{ cartStore.cartTotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Shipping</span>
                <span>$10.00</span>
              </div>
              <div class="border-t pt-2 mt-2">
                <div class="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${{ (cartStore.cartTotal + 10).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { 
  Button,
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Input
} from '@/components/ui'
import { toast } from 'vue-sonner'
import MockPaymentForm from '@/components/payment/MockPaymentForm.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()

const currentStep = ref(1)
const isProcessing = ref(false)

const shippingInfo = ref({
  firstName: '',
  lastName: '',
  email: authStore.user?.email || '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})

const totalAmount = computed(() => cartStore.cartTotal + 10) // Including shipping


const currentStepTitle = computed(() => {
  return currentStep.value === 1 ? 'Shipping Information' : 'Payment Information'
})

const currentStepDescription = computed(() => {
  return currentStep.value === 1 
    ? 'Enter your shipping address' 
    : 'Complete your payment to place your order'
})

function nextStep() {
  // Validate shipping info before proceeding
  if (!shippingInfo.value.firstName || !shippingInfo.value.lastName || 
      !shippingInfo.value.email || !shippingInfo.value.address || 
      !shippingInfo.value.city || !shippingInfo.value.state || 
      !shippingInfo.value.zipCode) {
    toast.error('Please fill in all shipping information fields')
    return
  }
  currentStep.value = 2
}

async function handlePaymentSuccess(paymentData: any) {
  isProcessing.value = true
  
  try {
    // Validate cart is not empty
    if (cartStore.items.length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
      return
    }
    
    // Prepare order data with payment information - mark as paid since mock payment succeeded
    const orderData = {
      user_id: authStore.user?.id || null,
      total_amount: totalAmount.value,
      status: 'paid' as const, // Mark as paid since payment succeeded
      shipping_address: `${shippingInfo.value.address}, ${shippingInfo.value.city}, ${shippingInfo.value.state} ${shippingInfo.value.zipCode}`,
      shipping_name: `${shippingInfo.value.firstName} ${shippingInfo.value.lastName}`,
      shipping_phone: null,
      guest_email: shippingInfo.value.email || authStore.user?.email || null,
      notes: paymentData.mock 
        ? `Mock Payment - ID: ${paymentData.id}, Amount: $${paymentData.amount / 100}, Card: ****${paymentData.payment_method.card.last4}` 
        : `Payment ID: ${paymentData.id}, Amount: $${paymentData.amount / 100}`
    }
    
    // Prepare order items
    const orderItems = cartStore.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }))
    
    // Create the order
    const success = await ordersStore.createOrder(orderData, orderItems)
    
    if (success) {
      // Clear cart after successful order
      cartStore.clearCart()
      
      // Show success message
      toast.success('Order placed successfully!')
      
      // Redirect to order confirmation or dashboard
      router.push('/account')
    } else {
      toast.error('Failed to create order. Please contact support.')
    }
  } catch (error) {
    console.error('Error processing order:', error)
    toast.error('Failed to process order. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

function handlePaymentError(error: string) {
  toast.error(`Payment failed: ${error}`)
}


// Redirect if cart is empty
if (cartStore.items.length === 0) {
  router.push('/cart')
}

// TEMPORARY: Allow guest checkout due to database policy issue
// Comment out authentication requirement for now
// if (!authStore.isAuthenticated) {
//   router.push('/login?redirect=/checkout')
// }
</script>