<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-blue-50 to-gray-100 py-20 px-4">
      <div class="container mx-auto max-w-7xl">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <!-- Hero Content -->
          <div class="text-center md:text-left">
            <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Elegant<br />
              <span class="text-blue-600">925 Sterling Silver</span>
            </h1>
            <p class="text-xl text-gray-600 mb-8 leading-relaxed">
              Handcrafted jewelry that tells your story. Explore our collection of 
              premium sterling silver pieces designed to last a lifetime.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <router-link 
                to="/shop" 
                class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Shop Collection
              </router-link>
              <router-link 
                to="/shop?category=rings" 
                class="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-blue-600"
              >
                View Rings
              </router-link>
            </div>
          </div>
          
          <!-- Hero Image -->
          <div class="relative">
            <div class="aspect-square bg-gradient-to-br from-blue-100 to-gray-200 rounded-full overflow-hidden shadow-2xl">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-9xl animate-pulse">💎</div>
              </div>
            </div>
            <!-- Decorative elements -->
            <div class="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-bounce"></div>
            <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-gray-300 rounded-full opacity-50 animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="py-16 px-4 bg-white">
      <div class="container mx-auto max-w-7xl">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Featured Collection</h2>
          <p class="text-lg text-gray-600">Handpicked pieces that showcase our finest craftsmanship</p>
        </div>

        <!-- Loading State -->
        <div v-if="productsStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else-if="productsStore.featuredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in productsStore.featuredProducts.slice(0, 4)" 
            :key="product.id"
            :product="product" 
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500 text-lg">No featured products available at the moment.</p>
        </div>

        <!-- View All Button -->
        <div class="text-center mt-12">
          <router-link 
            to="/shop" 
            class="inline-block bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            View All Products
          </router-link>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="container mx-auto max-w-7xl">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p class="text-lg text-gray-600">Find the perfect piece for every occasion</p>
        </div>

        <!-- Category Tabs -->
        <div class="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            v-for="category in ['rings', 'necklaces', 'bracelets', 'earrings']"
            :key="category"
            @click="selectedCategory = category"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-all',
              selectedCategory === category 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ formatCategoryName(category) }}
            <span class="ml-2 text-sm">
              ({{ getCategoryCount(category) }})
            </span>
          </button>
        </div>

        <!-- Products for Selected Category -->
        <div v-if="getCategoryProducts(selectedCategory).length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard 
              v-for="product in getCategoryProducts(selectedCategory).slice(0, 4)" 
              :key="product.id"
              :product="product"
            />
          </div>
          
          <!-- View All in Category -->
          <div class="text-center mt-8">
            <router-link 
              :to="`/shop?category=${selectedCategory}`"
              class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View All {{ formatCategoryName(selectedCategory) }}
            </router-link>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-500 text-lg">No {{ formatCategoryName(selectedCategory) }} available at the moment.</p>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-16 px-4 bg-white">
      <div class="container mx-auto max-w-7xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Free Shipping -->
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
            <p class="text-gray-600">On orders over $50</p>
          </div>

          <!-- Quality Guarantee -->
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
            <p class="text-gray-600">100% authentic sterling silver</p>
          </div>

          <!-- Easy Returns -->
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Easy Returns</h3>
            <p class="text-gray-600">30-day return policy</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-16 px-4 bg-gray-900">
      <div class="container mx-auto max-w-xl text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Stay in Touch</h2>
        <p class="text-gray-300 mb-8">Get exclusive offers and be the first to know about new collections</p>
        <form @submit.prevent="handleNewsletterSubmit" class="flex flex-col sm:flex-row gap-4">
          <input 
            v-model="email"
            type="email" 
            placeholder="Enter your email"
            class="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button 
            type="submit"
            class="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/ProductCard.vue'
import { toast } from 'vue-sonner'

const productsStore = useProductsStore()
const email = ref('')
const selectedCategory = ref('rings') // Default selected category

onMounted(() => {
  // Fetch products when component mounts
  productsStore.fetchProducts()
})

// Get product count for each category
const getCategoryCount = (category: string) => {
  return productsStore.products.filter(p => p.category.toLowerCase() === category.toLowerCase()).length
}

// Get products for a specific category
const getCategoryProducts = (category: string) => {
  return productsStore.products.filter(p => p.category.toLowerCase() === category.toLowerCase())
}

// Format category name for display
const formatCategoryName = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// Handle newsletter submission
const handleNewsletterSubmit = () => {
  toast.success('Thank you for subscribing!')
  email.value = ''
}
</script>

<style scoped>
.delay-300 {
  animation-delay: 300ms;
}
</style>