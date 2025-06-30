<template>
  <div class="space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Order Management</h3>
        <p class="text-sm text-muted-foreground">Manage and track customer orders</p>
      </div>
      <Button @click="refreshOrders" variant="outline">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </Button>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          placeholder="Search orders by ID or customer name..."
          class="w-full"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="status in orderStatuses"
          :key="status"
          variant="outline"
          size="sm"
          @click="toggleStatusFilter(status)"
          :class="{ 'bg-primary text-primary-foreground': statusFilter.includes(status) }"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </Button>
      </div>
    </div>

    <!-- Orders Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="filteredOrders.length === 0">
              <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                {{ ordersStore.loading ? 'Loading orders...' : 'No orders found' }}
              </TableCell>
            </TableRow>
            <TableRow v-for="order in paginatedOrders" :key="order.id" class="hover:bg-muted/50">
              <TableCell>
                <span class="font-mono text-sm">#{{ order.id.slice(-8) }}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p class="font-medium">{{ order.shipping_name }}</p>
                  <p class="text-sm text-muted-foreground">{{ order.guest_email || 'Registered user' }}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p class="font-medium">{{ formatDate(order.created_at) }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatTime(order.created_at) }}</p>
                </div>
              </TableCell>
              <TableCell>
                <select
                  :value="order.status"
                  @change="updateOrderStatus(order, ($event.target as HTMLSelectElement).value)"
                  class="text-xs px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary"
                  :class="getStatusColor(order.status)"
                >
                  <option v-for="status in orderStatuses" :key="status" :value="status">
                    {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                  </option>
                </select>
              </TableCell>
              <TableCell>
                <span class="font-medium">${{ order.total_amount.toFixed(2) }}</span>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="viewOrderDetails(order)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="printOrder(order)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredOrders.length) }} 
        of {{ filteredOrders.length }} orders
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="currentPage--"
          :disabled="currentPage === 1"
        >
          Previous
        </Button>
        <span class="text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
        <Button
          variant="outline"
          size="sm"
          @click="currentPage++"
          :disabled="currentPage === totalPages"
        >
          Next
        </Button>
      </div>
    </div>

    <!-- Order Details Dialog -->
    <Dialog v-model:open="showOrderDetails">
      <DialogContent class="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription v-if="selectedOrder">
            Order #{{ selectedOrder.id.slice(-8) }} - {{ formatDate(selectedOrder.created_at) }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedOrder" class="space-y-6">
          <!-- Order Status -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Status</label>
              <select
                :value="selectedOrder.status"
                @change="updateOrderStatus(selectedOrder, ($event.target as HTMLSelectElement).value)"
                class="mt-1 w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option v-for="status in orderStatuses" :key="status" :value="status">
                  {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Total Amount</label>
              <p class="text-lg font-semibold">${{ selectedOrder.total_amount.toFixed(2) }}</p>
            </div>
          </div>

          <!-- Customer Information -->
          <div>
            <h4 class="text-md font-semibold mb-3">Customer Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Name</label>
                <p class="text-sm">{{ selectedOrder.shipping_name }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Email</label>
                <p class="text-sm">{{ selectedOrder.guest_email || 'Registered user' }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-muted-foreground">Shipping Address</label>
                <p class="text-sm">{{ selectedOrder.shipping_address }}</p>
              </div>
              <div v-if="selectedOrder.shipping_phone">
                <label class="text-sm font-medium text-muted-foreground">Phone</label>
                <p class="text-sm">{{ selectedOrder.shipping_phone }}</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div>
            <h4 class="text-md font-semibold mb-3">Order Items</h4>
            <div class="text-sm text-muted-foreground">
              Order items details would be shown here when order_items relationship is implemented.
            </div>
          </div>

          <!-- Order Notes -->
          <div v-if="selectedOrder.notes">
            <h4 class="text-md font-semibold mb-3">Notes</h4>
            <p class="text-sm bg-muted p-3 rounded">{{ selectedOrder.notes }}</p>
          </div>

          <!-- Order Timeline -->
          <div>
            <h4 class="text-md font-semibold mb-3">Order Timeline</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Order placed - {{ formatDateTime(selectedOrder.created_at) }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Last updated - {{ formatDateTime(selectedOrder.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Card, CardContent,
  Button,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui'
import { useOrdersStore } from '@/stores/orders'
import { updateOrderStatus as updateOrderStatusAPI } from '@/services/api'
import type { Order, OrderStatus } from '@/types/supabase'
import { toast } from 'vue-sonner'

const ordersStore = useOrdersStore()

const searchQuery = ref('')
const statusFilter = ref<OrderStatus[]>([])
const currentPage = ref(1)
const pageSize = 10
const showOrderDetails = ref(false)
const selectedOrder = ref<Order | null>(null)

const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const filteredOrders = computed(() => {
  let orders = ordersStore.orders

  // Apply text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    orders = orders.filter(order => 
      order.id.includes(query) ||
      order.shipping_name.toLowerCase().includes(query) ||
      order.guest_email?.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value.length > 0) {
    orders = orders.filter(order => statusFilter.value.includes(order.status))
  }

  // Sort by creation date (newest first)
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredOrders.value.slice(start, end)
})

function toggleStatusFilter(status: OrderStatus) {
  const index = statusFilter.value.indexOf(status)
  if (index > -1) {
    statusFilter.value.splice(index, 1)
  } else {
    statusFilter.value.push(status)
  }
  currentPage.value = 1 // Reset to first page
}

function getStatusColor(status: string) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function updateOrderStatus(order: Order, newStatus: string) {
  try {
    const result = await updateOrderStatusAPI(order.id, newStatus as OrderStatus)
    
    if (result.success) {
      // Update local state
      const index = ordersStore.orders.findIndex(o => o.id === order.id)
      if (index !== -1) {
        ordersStore.orders[index] = result.data
      }
      
      // Update selected order if it's the same
      if (selectedOrder.value?.id === order.id) {
        selectedOrder.value = result.data
      }
      
      toast.success(`Order status updated to ${newStatus}`)
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Failed to update order status:', error)
    toast.error('Failed to update order status')
  }
}

function viewOrderDetails(order: Order) {
  selectedOrder.value = order
  showOrderDetails.value = true
}

function printOrder(order: Order) {
  // In a real implementation, this would generate a printable invoice
  toast.info(`Print functionality for order #${order.id.slice(-8)} coming soon`)
}

async function refreshOrders() {
  try {
    await ordersStore.fetchAllOrdersAdmin()
    toast.success('Orders refreshed successfully')
  } catch (error) {
    toast.error('Failed to refresh orders')
  }
}
</script>