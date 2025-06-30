<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-8 text-sm">
        <ol class="flex items-center gap-2">
          <li>
            <router-link to="/" class="text-gray-500 hover:text-primary">
              Home
            </router-link>
          </li>
          <li class="text-gray-500">/</li>
          <li>
            <router-link to="/shop" class="text-gray-500 hover:text-primary">
              Shop
            </router-link>
          </li>
          <li class="text-gray-500">/</li>
          <li class="text-gray-900" v-if="product">
            {{ product.name }}
          </li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Product Not Found -->
      <div v-else-if="!product" class="text-center py-12 bg-white rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Product Not Found</h2>
        <p class="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button @click="router.push('/shop')">
          Back to Shop
        </Button>
      </div>

      <!-- Product Details -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Image Gallery (Left Column) -->
        <div class="bg-white rounded-lg p-6">
          <div class="aspect-square relative overflow-hidden bg-gray-100 rounded-lg">
            <img 
              v-if="product.image_url"
              :src="product.image_url" 
              :alt="product.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="96" 
                height="96" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="1" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            
            <!-- Featured badge -->
            <div 
              v-if="product.is_featured"
              class="absolute top-4 right-4 bg-primary text-primary-foreground text-sm px-3 py-1 rounded-md"
            >
              Featured
            </div>
          </div>
        </div>

        <!-- Product Info (Right Column) -->
        <div class="bg-white rounded-lg p-6">
          <div class="mb-6">
            <h1 class="text-3xl font-bold mb-2">{{ product.name }}</h1>
            <p class="text-lg text-gray-600 capitalize">{{ product.category }}</p>
          </div>

          <div class="mb-6">
            <p class="text-3xl font-bold text-primary">${{ product.price.toFixed(2) }}</p>
          </div>

          <!-- Stock Status -->
          <div class="mb-6">
            <div v-if="product.quantity > 0" class="flex items-center gap-2 text-green-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="font-medium">In Stock</span>
              <span class="text-gray-600">({{ product.quantity }} available)</span>
            </div>
            <div v-else class="flex items-center gap-2 text-red-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span class="font-medium">Out of Stock</span>
            </div>
          </div>

          <!-- Add to Cart Section -->
          <div class="mb-8 pb-8 border-b">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  @click="decrementQuantity"
                  :disabled="quantity <= 1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </Button>
                <input 
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="product.quantity"
                  class="w-16 text-center border-t border-b py-2 focus:outline-none"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  @click="incrementQuantity"
                  :disabled="quantity >= product.quantity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </Button>
              </div>
            </div>

            <Button 
              size="lg"
              class="w-full"
              :disabled="product.quantity === 0"
              @click="handleAddToCart"
            >
              {{ product.quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </Button>
          </div>

          <!-- Product Information Sections -->
          <div class="space-y-6">
            <!-- Description -->
            <div>
              <h3 class="text-lg font-semibold mb-2">Description</h3>
              <p class="text-gray-600 whitespace-pre-wrap">{{ product.description || 'No description available.' }}</p>
            </div>

            <!-- Details -->
            <div>
              <h3 class="text-lg font-semibold mb-2">Product Details</h3>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-gray-600">SKU:</dt>
                  <dd class="font-medium">{{ product.id.slice(-8).toUpperCase() }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">Category:</dt>
                  <dd class="font-medium capitalize">{{ product.category }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">Added:</dt>
                  <dd class="font-medium">{{ formatDate(product.created_at) }}</dd>
                </div>
              </dl>
            </div>

            <!-- Shipping Info -->
            <div>
              <h3 class="text-lg font-semibold mb-2">Shipping Information</h3>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Free shipping on orders over $100</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Ships within 1-2 business days</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>30-day return policy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold mb-6">You May Also Like</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="relatedProduct in relatedProducts.slice(0, 4)" 
            :key="relatedProduct.id"
            :product="relatedProduct"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'
import { Button } from '../components/ui'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

// State
const quantity = ref(1)

// Store data
const loading = computed(() => productsStore.loading)
const product = computed(() => productsStore.currentProduct)

// Related products (same category, excluding current)
const relatedProducts = computed(() => {
  if (!product.value) return []
  
  const categoryProducts = productsStore.productsByCategory.get(product.value.category) || []
  return categoryProducts.filter(p => p.id !== product.value!.id)
})

// Methods
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const incrementQuantity = () => {
  if (product.value && quantity.value < product.value.quantity) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// Add to cart functionality
const handleAddToCart = () => {
  if (!product.value || product.value.quantity === 0) {
    return
  }
  
  // Add item to cart
  cartStore.addToCart({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image_url || undefined
  }, quantity.value)
  
  // Show success notification
  toast.success(`${quantity.value} × ${product.value.name} added to cart`)
  
  // Reset quantity to 1
  quantity.value = 1
}

// Load product data
const loadProduct = async () => {
  const productId = route.params.id as string
  if (productId) {
    await productsStore.fetchProductById(productId)
  }
}

// Lifecycle
onMounted(async () => {
  await productsStore.fetchProducts() // Ensure we have all products for related items
  await loadProduct()
})

// Watch for route changes
watch(() => route.params.id, async () => {
  quantity.value = 1 // Reset quantity
  await loadProduct()
})
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>