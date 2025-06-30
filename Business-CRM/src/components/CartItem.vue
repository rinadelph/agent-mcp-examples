<template>
  <div class="flex items-center space-x-4 py-4">
    <div class="flex-shrink-0 w-20 h-20">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover rounded"
      />
      <div
        v-else
        class="w-full h-full bg-gray-200 rounded flex items-center justify-center"
      >
        <span class="text-gray-400 text-xs">No image</span>
      </div>
    </div>
    
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
      <p class="text-sm text-gray-500">{{ formattedPrice }}</p>
    </div>
    
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        @click="decrementQuantity"
        :disabled="item.quantity <= 1"
      >
        -
      </Button>
      <Input
        type="number"
        :model-value="item.quantity"
        @update:modelValue="updateQuantity"
        class="w-16 text-center"
        :min="1"
      />
      <Button
        variant="outline"
        size="sm"
        @click="incrementQuantity"
      >
        +
      </Button>
    </div>
    
    <div class="text-sm font-medium text-gray-900 w-20 text-right">
      {{ formattedSubtotal }}
    </div>
    
    <Button
      variant="ghost"
      size="sm"
      @click="removeItem"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { Button, Input } from '@/components/ui'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Props {
  item: CartItem
}

const props = defineProps<Props>()
const cartStore = useCartStore()

const formattedPrice = computed(() => `$${props.item.price.toFixed(2)}`)
const formattedSubtotal = computed(() => `$${(props.item.price * props.item.quantity).toFixed(2)}`)

function updateQuantity(value: string | number) {
  const quantity = typeof value === 'string' ? parseInt(value, 10) : value
  if (!isNaN(quantity) && quantity >= 0) {
    cartStore.updateItemQuantity(props.item.id, quantity)
  }
}

function incrementQuantity() {
  cartStore.updateItemQuantity(props.item.id, props.item.quantity + 1)
}

function decrementQuantity() {
  if (props.item.quantity > 1) {
    cartStore.updateItemQuantity(props.item.id, props.item.quantity - 1)
  }
}

function removeItem() {
  cartStore.removeFromCart(props.item.id)
}
</script>