import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchOrdersByUserId, fetchOrderById, fetchOrders as fetchAllOrders, createOrder as createOrderApi, createOrderItems } from '../services/api'
import type { Order, OrderInsert } from '../types/supabase'
import { useAuthStore } from './auth'
import { toast } from 'vue-sonner'

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)

  // Getters
  const ordersByStatus = computed(() => {
    const grouped: Record<string, Order[]> = {
      pending: [],
      processing: [],
      paid: [],
      shipped: [],
      delivered: [],
      cancelled: []
    }
    
    orders.value.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order)
      }
    })
    
    return grouped
  })

  const userOrders = computed(() => orders.value)
  
  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'pending')
  )

  // Actions
  async function fetchOrders() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    loading.value = true
    try {
      const response = await fetchOrdersByUserId(authStore.user.id)
      
      if (response.success) {
        orders.value = response.data
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchSingleOrder(orderId: string) {
    loading.value = true
    try {
      const response = await fetchOrderById(orderId)
      
      if (response.success) {
        currentOrder.value = response.data
        
        // Update in orders list if exists
        const index = orders.value.findIndex(o => o.id === orderId)
        if (index !== -1) {
          orders.value[index] = response.data
        }
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      currentOrder.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchAllOrdersAdmin() {
    const authStore = useAuthStore()
    if (!authStore.isAdmin) {
      console.warn('Admin access required to fetch all orders')
      return
    }

    loading.value = true
    try {
      const response = await fetchAllOrders()
      
      if (response.success) {
        orders.value = response.data
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error('Failed to fetch all orders:', error)
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  function clearCurrentOrder() {
    currentOrder.value = null
  }

  async function createOrder(orderData: OrderInsert, orderItems: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>): Promise<boolean> {
    loading.value = true
    try {
      // Create the order first
      const orderResponse = await createOrderApi(orderData)
      
      if (!orderResponse.success) {
        // Check for specific database policy errors
        const errorMessage = orderResponse.error || 'Failed to create order'
        if (errorMessage.includes('infinite recursion') || errorMessage.includes('policy')) {
          console.error('Database policy error detected:', errorMessage)
          throw new Error('There is a database configuration issue. Please contact support.')
        }
        throw new Error(errorMessage)
      }
      
      if (!orderResponse.data) {
        throw new Error('No order data returned')
      }
      
      const orderId = orderResponse.data.id
      
      // Add a small delay to ensure the order is fully committed in the database
      // This helps prevent race conditions with RLS policies
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Create order items
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: orderId
      }))
      
      const itemsResponse = await createOrderItems(itemsWithOrderId)
      
      if (!itemsResponse.success) {
        // If order items fail due to policy, try once more after a longer delay
        if (itemsResponse.error?.includes('policy') || itemsResponse.error?.includes('violates')) {
          console.warn('Order items creation failed due to policy, retrying after delay...')
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const retryResponse = await createOrderItems(itemsWithOrderId)
          if (!retryResponse.success) {
            throw new Error(retryResponse.error || 'Failed to create order items after retry')
          }
        } else {
          throw new Error(itemsResponse.error || 'Failed to create order items')
        }
      }
      
      // Add the new order to the list
      orders.value.unshift(orderResponse.data)
      
      toast.success('Order placed successfully!')
      return true
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create order')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    
    // Getters
    ordersByStatus,
    userOrders,
    pendingOrders,
    
    // Actions
    fetchOrders,
    fetchAllOrdersAdmin,
    fetchOrderById: fetchSingleOrder,
    clearCurrentOrder,
    createOrder
  }
})