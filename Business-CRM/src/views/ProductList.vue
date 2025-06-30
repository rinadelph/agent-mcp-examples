<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Shop All Products</h1>
        <p class="text-gray-600">Discover our complete collection of sterling silver jewelry</p>
      </div>

      <!-- Filter/Sort Bar -->
      <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <!-- Search and Category Filter -->
          <div class="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <Input
              v-model="searchQuery"
              type="search"
              placeholder="Search products..."
              class="w-full sm:w-64"
              @input="handleSearch"
            />
            
            <select
              v-model="selectedCategory"
              class="px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              @change="handleCategoryChange"
            >
              <option value="all">All Categories</option>
              <option 
                v-for="category in categories" 
                :key="category"
                :value="category"
              >
                {{ formatCategoryName(category) }}
              </option>
            </select>
          </div>

          <!-- Sort Options -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Sort by:</span>
            <select
              v-model="sortBy"
              class="px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              @change="handleSort"
            >
              <option value="newest">Newest</option>
              <option value="name">Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <!-- Active filters display -->
        <div v-if="searchQuery || selectedCategory !== 'all'" class="mt-4 flex items-center gap-2">
          <span class="text-sm text-gray-600">Active filters:</span>
          <div class="flex gap-2">
            <button
              v-if="searchQuery"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              @click="clearSearch"
            >
              Search: {{ searchQuery }}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <button
              v-if="selectedCategory !== 'all'"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              @click="clearCategory"
            >
              {{ formatCategoryName(selectedCategory) }}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- No Products -->
      <div v-else-if="displayedProducts.length === 0" class="text-center py-12 bg-white rounded-lg">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <h3 class="text-lg font-semibold mb-2">No products found</h3>
        <p class="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
        <Button variant="outline" @click="clearAllFilters">
          Clear all filters
        </Button>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in displayedProducts" 
          :key="product.id"
          :product="product"
        />
      </div>

      <!-- Results Summary -->
      <div v-if="!loading && displayedProducts.length > 0" class="mt-8 text-center text-sm text-gray-600">
        Showing {{ displayedProducts.length }} of {{ products.length }} products
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import ProductCard from '../components/ProductCard.vue'
import { Input, Button } from '../components/ui'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref<'newest' | 'name' | 'price-asc' | 'price-desc'>('newest')

// Store data
const loading = computed(() => productsStore.loading)
const products = computed(() => productsStore.products)
const categories = computed(() => productsStore.categories)

// Computed displayed products
const displayedProducts = computed(() => {
  // Filter products
  let filtered = productsStore.filterProducts(searchQuery.value, selectedCategory.value)
  
  // Sort products
  return productsStore.sortProducts(filtered, sortBy.value)
})

// Methods
const formatCategoryName = (category: string) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const handleSearch = () => {
  updateUrlParams()
}

const handleCategoryChange = () => {
  updateUrlParams()
}

const handleSort = () => {
  updateUrlParams()
}

const clearSearch = () => {
  searchQuery.value = ''
  updateUrlParams()
}

const clearCategory = () => {
  selectedCategory.value = 'all'
  updateUrlParams()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  sortBy.value = 'newest'
  updateUrlParams()
}

const updateUrlParams = () => {
  const params: Record<string, string> = {}
  
  if (searchQuery.value) {
    params.search = searchQuery.value
  }
  
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  
  if (sortBy.value !== 'newest') {
    params.sort = sortBy.value
  }
  
  router.push({ 
    path: route.path, 
    query: params 
  })
}

const loadFromUrlParams = () => {
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }
  
  if (route.query.category) {
    selectedCategory.value = route.query.category as string
  }
  
  if (route.query.sort) {
    sortBy.value = route.query.sort as any
  }
}

// Lifecycle
onMounted(async () => {
  loadFromUrlParams()
  await productsStore.fetchProducts()
})

// Watch for route changes
watch(() => route.query, () => {
  loadFromUrlParams()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>