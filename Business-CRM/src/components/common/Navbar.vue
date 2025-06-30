<template>
  <nav class="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow">
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <router-link to="/" class="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            925 Silver
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            to="/" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            :class="{ 'text-blue-600': $route.path === '/' }"
          >
            Home
          </router-link>
          <router-link 
            to="/shop" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            :class="{ 'text-blue-600': $route.path === '/shop' }"
          >
            Shop
          </router-link>
          <router-link 
            to="/about" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            :class="{ 'text-blue-600': $route.path === '/about' }"
          >
            About
          </router-link>
          <router-link 
            to="/contact" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            :class="{ 'text-blue-600': $route.path === '/contact' }"
          >
            Contact
          </router-link>
        </div>

        <!-- Right side actions -->
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <button 
            @click="showSearchDialog = true"
            class="p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"></path>
            </svg>
          </button>

          <!-- Cart with Preview -->
          <div class="relative" @mouseenter="showCartPreview" @mouseleave="hideCartPreview">
            <button 
              @click="handleCartClick"
              class="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"></path>
              </svg>
              <!-- Cart badge -->
              <span 
                v-if="cartStore.cartItemCount > 0"
                class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium"
              >
                {{ cartStore.cartItemCount > 99 ? '99+' : cartStore.cartItemCount }}
              </span>
            </button>

            <!-- Cart Preview Dropdown -->
            <div 
              v-if="isCartPreviewVisible && cartStore.items.length > 0"
              class="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              <div class="p-4">
                <h3 class="font-semibold mb-3 text-gray-900">Cart Preview</h3>
                
                <!-- Cart Items -->
                <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  <div 
                    v-for="item in cartStore.items.slice(0, 3)" 
                    :key="item.id"
                    class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <div class="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        v-if="item.image" 
                        :src="item.image" 
                        :alt="item.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                      <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                    </div>
                    <div class="text-sm font-medium text-gray-900">
                      ${{ (item.price * item.quantity).toFixed(2) }}
                    </div>
                  </div>
                  
                  <!-- Show more items indicator -->
                  <div v-if="cartStore.items.length > 3" class="text-sm text-gray-500 text-center">
                    +{{ cartStore.items.length - 3 }} more items
                  </div>
                </div>
                
                <!-- Cart Total -->
                <div class="border-t pt-3 mb-4">
                  <div class="flex justify-between items-center font-semibold text-gray-900">
                    <span>Total:</span>
                    <span>${{ cartStore.cartTotal.toFixed(2) }}</span>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-2">
                  <button 
                    @click="handleCartClick"
                    class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    View Cart
                  </button>
                  <button 
                    @click="handleCheckoutClick"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty Cart Preview -->
            <div 
              v-else-if="isCartPreviewVisible && cartStore.items.length === 0"
              class="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              <div class="p-4 text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
                <p class="text-gray-500 text-sm mb-3">Your cart is empty</p>
                <button 
                  @click="router.push('/shop')"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          </div>

          <!-- Account Dropdown -->
          <div class="relative" @mouseenter="showAccountMenu" @mouseleave="hideAccountMenu">
            <button 
              @click="handleAccountClick"
              class="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>

            <!-- Account Dropdown Menu -->
            <div 
              v-if="isAccountMenuVisible && authStore.isAuthenticated"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              <div class="py-2">
                <div class="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                  {{ authStore.userEmail }}
                </div>
                <button 
                  @click="handleAccountClick"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  My Account
                </button>
                <button 
                  v-if="authStore.isAdmin"
                  @click="handleAdminClick"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Admin Dashboard
                </button>
                <hr class="my-1">
                <button 
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile menu button -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg 
              v-if="!mobileMenuOpen"
              class="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg 
              v-else
              class="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div 
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-gray-200 py-4"
      >
        <div class="flex flex-col space-y-2">
          <router-link 
            to="/" 
            class="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/' }"
            @click="mobileMenuOpen = false"
          >
            Home
          </router-link>
          <router-link 
            to="/shop" 
            class="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/shop' }"
            @click="mobileMenuOpen = false"
          >
            Shop
          </router-link>
          <router-link 
            to="/about" 
            class="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/about' }"
            @click="mobileMenuOpen = false"
          >
            About
          </router-link>
          <router-link 
            to="/contact" 
            class="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/contact' }"
            @click="mobileMenuOpen = false"
          >
            Contact
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Search Dialog -->
    <SearchDialog :is-open="showSearchDialog" @close="showSearchDialog = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import SearchDialog from './SearchDialog.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// State
const showSearchDialog = ref(false)
const mobileMenuOpen = ref(false)
const isCartPreviewVisible = ref(false)
const isAccountMenuVisible = ref(false)
let cartPreviewTimeout: ReturnType<typeof setTimeout> | null = null
let accountMenuTimeout: ReturnType<typeof setTimeout> | null = null

// Handlers
const handleCartClick = () => {
  hideCartPreview()
  router.push('/cart')
}

const handleCheckoutClick = () => {
  hideCartPreview()
  router.push('/checkout')
}

const handleAccountClick = () => {
  hideAccountMenu()
  router.push('/account')
}

const handleAdminClick = () => {
  hideAccountMenu()
  router.push('/admin')
}

const handleLogout = async () => {
  hideAccountMenu()
  await authStore.logout()
  router.push('/')
}

const showCartPreview = () => {
  if (cartPreviewTimeout) {
    clearTimeout(cartPreviewTimeout)
    cartPreviewTimeout = null
  }
  isCartPreviewVisible.value = true
}

const hideCartPreview = () => {
  cartPreviewTimeout = setTimeout(() => {
    isCartPreviewVisible.value = false
  }, 100) // Small delay to prevent flickering
}

const showAccountMenu = () => {
  if (accountMenuTimeout) {
    clearTimeout(accountMenuTimeout)
    accountMenuTimeout = null
  }
  isAccountMenuVisible.value = true
}

const hideAccountMenu = () => {
  accountMenuTimeout = setTimeout(() => {
    isAccountMenuVisible.value = false
  }, 100) // Small delay to prevent flickering
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>