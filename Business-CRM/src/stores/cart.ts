import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)

  // Load cart from localStorage on initialization
  function loadCartFromStorage() {
    try {
      const storedCart = localStorage.getItem('cart_items')
      const storedTimestamp = localStorage.getItem('cart_timestamp')
      
      if (storedCart && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp)
        const now = Date.now()
        const sevenDays = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        
        // Clear cart if older than 7 days
        if (now - timestamp > sevenDays) {
          localStorage.removeItem('cart_items')
          localStorage.removeItem('cart_timestamp')
          items.value = []
        } else {
          const parsedCart = JSON.parse(storedCart)
          // Validate cart structure
          if (Array.isArray(parsedCart)) {
            items.value = parsedCart.filter(item => 
              item && 
              typeof item.id === 'string' && 
              typeof item.name === 'string' && 
              typeof item.price === 'number' && 
              typeof item.quantity === 'number' &&
              item.quantity > 0
            )
          } else {
            items.value = []
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem('cart_items')
      localStorage.removeItem('cart_timestamp')
      items.value = []
    }
  }

  // Save cart to localStorage with improved error handling
  function saveCartToStorage() {
    try {
      const cartData = JSON.stringify(items.value)
      const timestamp = Date.now().toString()
      
      // Check if we're approaching localStorage quota
      const testKey = 'cart_quota_test'
      const testValue = 'x'.repeat(1024) // 1KB test
      
      try {
        localStorage.setItem(testKey, testValue)
        localStorage.removeItem(testKey)
      } catch (quotaError) {
        console.warn('localStorage quota exceeded, clearing old data')
        // Clear old cart data if quota exceeded
        localStorage.removeItem('cart_items')
        localStorage.removeItem('cart_timestamp')
      }
      
      localStorage.setItem('cart_items', cartData)
      localStorage.setItem('cart_timestamp', timestamp)
      
      // Broadcast cart update to other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart_items',
        newValue: cartData,
        storageArea: localStorage
      }))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
      // Fallback: try to save just the essential data
      try {
        const essentialCart = items.value.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
        localStorage.setItem('cart_items', JSON.stringify(essentialCart))
      } catch (fallbackError) {
        console.error('Critical error: Unable to save cart data')
      }
    }
  }

  // Actions
  function addToCart(product: { id: string; name: string; price: number; image?: string }, quantity: number = 1) {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      })
    }
    
    saveCartToStorage()
  }

  function removeFromCart(itemId: string) {
    items.value = items.value.filter(item => item.id !== itemId)
    saveCartToStorage()
  }

  function updateItemQuantity(itemId: string, quantity: number) {
    const item = items.value.find(item => item.id === itemId)
    if (item && quantity > 0) {
      item.quantity = quantity
      saveCartToStorage()
    } else if (item && quantity === 0) {
      removeFromCart(itemId)
    }
  }

  function clearCart() {
    items.value = []
    saveCartToStorage()
  }

  // Getters
  const cartTotal = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const cartItemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0)
  })

  const formattedCart = computed(() => {
    return items.value.map(item => ({
      ...item,
      subtotal: item.price * item.quantity,
      formattedPrice: `$${item.price.toFixed(2)}`,
      formattedSubtotal: `$${(item.price * item.quantity).toFixed(2)}`
    }))
  })

  // Cross-tab synchronization
  function setupCrossTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart_items' && e.newValue) {
        try {
          const updatedCart = JSON.parse(e.newValue)
          if (Array.isArray(updatedCart)) {
            items.value = updatedCart
          }
        } catch (error) {
          console.error('Error syncing cart across tabs:', error)
        }
      }
    })
  }

  // Debounced save function
  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  function debouncedSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      saveCartToStorage()
    }, 300) // 300ms debounce
  }

  // Enhanced actions with better error handling
  function addToCartWithValidation(product: { id: string; name: string; price: number; image?: string }, quantity: number = 1) {
    if (!product.id || !product.name || typeof product.price !== 'number' || quantity <= 0) {
      console.error('Invalid product data or quantity')
      return false
    }

    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      })
    }
    
    debouncedSave()
    return true
  }

  // Initialize cart from localStorage and setup sync
  loadCartFromStorage()
  setupCrossTabSync()

  return {
    // State
    items,
    isLoading,
    
    // Actions
    addToCart,
    addToCartWithValidation,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    
    // Getters
    cartTotal,
    cartItemCount,
    formattedCart
  }
})