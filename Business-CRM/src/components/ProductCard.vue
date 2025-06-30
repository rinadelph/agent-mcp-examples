<template>
  <div 
    @click="handleCardClick"
    class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
    <div class="aspect-square bg-gray-200 relative overflow-hidden">
      <img 
        v-if="product.image_url"
        :src="product.image_url" 
        :alt="product.name"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <div class="text-6xl">💎</div>
      </div>
      
      <!-- Featured badge -->
      <div 
        v-if="product.is_featured"
        class="absolute top-3 right-3 bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
      >
        Featured
      </div>
      
      <!-- Out of stock overlay -->
      <div 
        v-if="product.quantity === 0"
        class="absolute inset-0 bg-black/60 flex items-center justify-center"
      >
        <span class="text-white font-semibold">Out of Stock</span>
      </div>
    </div>
    
    <div class="p-6 flex-1 flex flex-col">
      <h3 class="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
        {{ product.name }}
      </h3>
      <p class="text-gray-600 text-sm mb-3 capitalize">
        {{ product.category }}
      </p>
      <div class="mt-auto">
        <div class="flex items-center justify-between mb-3">
          <span class="text-2xl font-bold text-gray-900">
            ${{ product.price.toFixed(2) }}
          </span>
        </div>
        <button 
          @click="handleAddToCart($event)"
          :disabled="product.quantity === 0"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ product.quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '@/types/supabase'
import { useCartStore } from '@/stores/cart'
import { toast } from 'vue-sonner'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const router = useRouter()
const cartStore = useCartStore()

// Handle card click - navigate to product detail
const handleCardClick = () => {
  router.push({ name: 'product-detail', params: { id: props.product.id } })
}

// Handle broken images
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Add to cart handler
const handleAddToCart = (event: Event) => {
  // Prevent navigation when clicking the button
  event.preventDefault()
  event.stopPropagation()
  
  if (props.product.quantity === 0) {
    return
  }
  
  // Add item to cart
  cartStore.addToCart({
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.image_url || undefined
  }, 1)
  
  // Show success notification
  toast.success(`${props.product.name} added to cart`)
  
  // Show visual feedback
  const button = event?.target as HTMLButtonElement
  if (button) {
    const originalText = button.textContent
    button.textContent = 'Added!'
    button.classList.add('bg-green-600')
    setTimeout(() => {
      button.textContent = originalText
      button.classList.remove('bg-green-600')
    }, 1000)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>