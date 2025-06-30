<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Your Cart</h1>
    
    <div v-if="cartStore.items.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">Your cart is empty</p>
      <Button @click="$router.push('/shop')" variant="default">
        Continue Shopping
      </Button>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <!-- Desktop Table View -->
        <Card class="hidden md:block">
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[100px]">Product</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead class="text-right">Subtotal</TableHead>
                  <TableHead class="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in cartStore.formattedCart" :key="item.id">
                  <TableCell>
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.name"
                      class="w-16 h-16 object-cover rounded"
                    />
                    <div
                      v-else
                      class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center"
                    >
                      <span class="text-gray-400 text-xs">No image</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p class="font-medium">{{ item.name }}</p>
                      <p class="text-sm text-gray-500">{{ item.formattedPrice }}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="cartStore.updateItemQuantity(item.id, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                      >
                        -
                      </Button>
                      <span class="w-8 text-center">{{ item.quantity }}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        @click="cartStore.updateItemQuantity(item.id, item.quantity + 1)"
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell class="text-right">{{ item.formattedSubtotal }}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="cartStore.removeFromCart(item.id)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <!-- Mobile Card View -->
        <div class="md:hidden space-y-4">
          <Card v-for="item in cartStore.formattedCart" :key="`mobile-${item.id}`" class="overflow-hidden">
            <CardContent class="p-4">
              <div class="flex gap-4">
                <!-- Product Image -->
                <div class="flex-shrink-0">
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="w-20 h-20 object-cover rounded"
                  />
                  <div
                    v-else
                    class="w-20 h-20 bg-gray-200 rounded flex items-center justify-center"
                  >
                    <span class="text-gray-400 text-xs">No image</span>
                  </div>
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-base truncate">{{ item.name }}</h3>
                  <p class="text-sm text-gray-500 mb-2">{{ item.formattedPrice }}</p>
                  
                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-3 mb-3">
                    <button
                      @click="cartStore.updateItemQuantity(item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                      class="w-11 h-11 rounded-md border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      aria-label="Decrease quantity"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span class="w-12 text-center font-medium">{{ item.quantity }}</span>
                    
                    <button
                      @click="cartStore.updateItemQuantity(item.id, item.quantity + 1)"
                      class="w-11 h-11 rounded-md border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 touch-manipulation"
                      aria-label="Increase quantity"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <!-- Subtotal and Remove -->
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-sm text-gray-500">Subtotal: </span>
                      <span class="font-semibold">{{ item.formattedSubtotal }}</span>
                    </div>
                    
                    <button
                      @click="removeItem(item.id)"
                      class="w-11 h-11 rounded-md flex items-center justify-center text-red-600 hover:bg-red-50 touch-manipulation"
                      aria-label="Remove from cart"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <!-- Order Summary - Sticky on mobile -->
      <div class="lg:col-span-1">
        <div class="sticky top-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
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
            <CardFooter>
              <Button 
                @click="proceedToCheckout" 
                class="w-full h-12 text-base"
                :disabled="!authStore.isAuthenticated"
              >
                {{ authStore.isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout' }}
              </Button>
            </CardFooter>
          </Card>
          
          <div v-if="!authStore.isAuthenticated" class="mt-4">
            <Card>
              <CardContent class="pt-6">
                <p class="text-sm text-gray-600 mb-4">
                  Please login or create an account to continue with checkout.
                </p>
                <div class="space-y-2">
                  <Button @click="$router.push('/login')" variant="outline" class="w-full h-12 text-base">
                    Login
                  </Button>
                  <Button @click="$router.push('/register')" variant="default" class="w-full h-12 text-base">
                    Create Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { 
  Button,
  Card, CardContent, CardFooter, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui'
import { toast } from 'vue-sonner'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

function proceedToCheckout() {
  if (authStore.isAuthenticated) {
    router.push('/checkout')
  }
}

// Mobile-friendly remove item with confirmation
function removeItem(itemId: string) {
  if (window.innerWidth < 768) {
    // On mobile, show a quick confirmation toast
    const item = cartStore.items.find(i => i.id === itemId)
    if (item) {
      cartStore.removeFromCart(itemId)
      toast.success(`${item.name} removed from cart`)
    }
  } else {
    // On desktop, remove immediately
    cartStore.removeFromCart(itemId)
  }
}
</script>

<style scoped>
/* Ensure touch targets meet accessibility standards */
.touch-manipulation {
  touch-action: manipulation;
}

/* Improve tap feedback on mobile */
@media (max-width: 767px) {
  button {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  }
  
  /* Ensure minimum touch target size */
  button:not(.w-11) {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Smooth transitions for quantity changes */
.w-12 {
  transition: all 0.2s ease;
}

/* Card hover effects on desktop */
@media (min-width: 768px) {
  .hover\:bg-gray-50:hover {
    transition: background-color 0.2s ease;
  }
}
</style>