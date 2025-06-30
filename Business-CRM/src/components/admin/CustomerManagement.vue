<template>
  <div class="space-y-6">
    <!-- Header with Customer Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Customers</CardTitle>
          <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ customers.length }}</div>
          <p class="text-xs text-muted-foreground">Registered users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active Customers</CardTitle>
          <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">{{ activeCustomers }}</div>
          <p class="text-xs text-muted-foreground">With recent orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Average Order Value</CardTitle>
          <svg class="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-purple-600">${{ averageOrderValue.toFixed(2) }}</div>
          <p class="text-xs text-muted-foreground">Per customer</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Customer Lifetime Value</CardTitle>
          <svg class="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">${{ customerLifetimeValue.toFixed(2) }}</div>
          <p class="text-xs text-muted-foreground">Average CLV</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          placeholder="Search customers by name or email..."
          class="w-full"
        />
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="customerFilter = customerFilter === 'active' ? 'all' : 'active'"
          :class="{ 'bg-green-50 text-green-700 border-green-200': customerFilter === 'active' }"
        >
          Active Only
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="customerFilter = customerFilter === 'vip' ? 'all' : 'vip'"
          :class="{ 'bg-purple-50 text-purple-700 border-purple-200': customerFilter === 'vip' }"
        >
          VIP Customers
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="exportCustomers"
        >
          Export
        </Button>
      </div>
    </div>

    <!-- Customers Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="filteredCustomers.length === 0">
              <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
                {{ loading ? 'Loading customers...' : 'No customers found' }}
              </TableCell>
            </TableRow>
            <TableRow v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-muted/50">
              <TableCell>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-700">
                      {{ getInitials(customer.full_name || customer.email) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium">{{ customer.full_name || 'N/A' }}</p>
                    <p class="text-sm text-muted-foreground">
                      Customer since {{ formatDate(customer.created_at) }}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{{ customer.email }}</TableCell>
              <TableCell>{{ customer.phone || 'N/A' }}</TableCell>
              <TableCell>
                <span class="font-medium">{{ customer.order_count || 0 }}</span>
              </TableCell>
              <TableCell>
                <span class="font-medium">${{ customer.total_spent?.toFixed(2) || '0.00' }}</span>
              </TableCell>
              <TableCell>
                {{ customer.last_order_date ? formatDate(customer.last_order_date) : 'Never' }}
              </TableCell>
              <TableCell>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getCustomerStatusColor(customer)"
                >
                  {{ getCustomerStatus(customer) }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="viewCustomerDetails(customer)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="sendEmail(customer)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Customer Details Dialog -->
    <Dialog v-model:open="showCustomerDetails">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Complete information for {{ selectedCustomer?.full_name || selectedCustomer?.email }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedCustomer" class="space-y-6">
          <!-- Customer Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Full Name</label>
              <p class="text-sm">{{ selectedCustomer.full_name || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="text-sm">{{ selectedCustomer.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Phone</label>
              <p class="text-sm">{{ selectedCustomer.phone || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Customer Since</label>
              <p class="text-sm">{{ formatDate(selectedCustomer.created_at) }}</p>
            </div>
          </div>

          <!-- Order Statistics -->
          <div class="border-t pt-4">
            <h4 class="font-medium mb-3">Order Statistics</h4>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ selectedCustomer.order_count || 0 }}</p>
                <p class="text-xs text-gray-500">Total Orders</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">${{ selectedCustomer.total_spent?.toFixed(2) || '0.00' }}</p>
                <p class="text-xs text-gray-500">Total Spent</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-purple-600">${{ selectedCustomer.avg_order_value?.toFixed(2) || '0.00' }}</p>
                <p class="text-xs text-gray-500">Avg Order</p>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="border-t pt-4">
            <h4 class="font-medium mb-3">Recent Orders</h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div v-if="!selectedCustomer.recent_orders?.length" class="text-sm text-gray-500">
                No recent orders
              </div>
              <div v-else v-for="order in selectedCustomer.recent_orders" :key="order.id" 
                   class="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                <span>#{{ order.id.slice(-8) }}</span>
                <span>${{ order.total_amount.toFixed(2) }}</span>
                <span class="text-gray-500">{{ formatDate(order.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui'
import { toast } from 'vue-sonner'

// Mock customer data - in real app, this would come from API/store
const customers = ref([
  {
    id: '1',
    email: 'test@test.com',
    full_name: 'Test Administrator',
    phone: '+1 (555) 123-4567',
    created_at: '2024-01-15T00:00:00Z',
    order_count: 5,
    total_spent: 450.00,
    avg_order_value: 90.00,
    last_order_date: '2024-06-25T00:00:00Z',
    recent_orders: [
      { id: 'ord_123456789', total_amount: 125.00, created_at: '2024-06-25T00:00:00Z' },
      { id: 'ord_123456788', total_amount: 75.50, created_at: '2024-06-20T00:00:00Z' }
    ]
  },
  {
    id: '2',
    email: 'john.doe@email.com',
    full_name: 'John Doe',
    phone: '+1 (555) 234-5678',
    created_at: '2024-02-01T00:00:00Z',
    order_count: 12,
    total_spent: 1200.00,
    avg_order_value: 100.00,
    last_order_date: '2024-06-28T00:00:00Z',
    recent_orders: [
      { id: 'ord_123456790', total_amount: 200.00, created_at: '2024-06-28T00:00:00Z' }
    ]
  },
  {
    id: '3',
    email: 'jane.smith@email.com',
    full_name: 'Jane Smith',
    phone: null,
    created_at: '2024-03-10T00:00:00Z',
    order_count: 3,
    total_spent: 180.00,
    avg_order_value: 60.00,
    last_order_date: '2024-05-15T00:00:00Z',
    recent_orders: []
  }
])

const loading = ref(false)
const searchQuery = ref('')
const customerFilter = ref<'all' | 'active' | 'vip'>('all')
const showCustomerDetails = ref(false)
const selectedCustomer = ref<any>(null)

// Computed values
const activeCustomers = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return customers.value.filter(c => 
    c.last_order_date && new Date(c.last_order_date) > thirtyDaysAgo
  ).length
})

const averageOrderValue = computed(() => {
  const totalSpent = customers.value.reduce((sum, c) => sum + (c.total_spent || 0), 0)
  const totalOrders = customers.value.reduce((sum, c) => sum + (c.order_count || 0), 0)
  return totalOrders > 0 ? totalSpent / totalOrders : 0
})

const customerLifetimeValue = computed(() => {
  const totalSpent = customers.value.reduce((sum, c) => sum + (c.total_spent || 0), 0)
  return customers.value.length > 0 ? totalSpent / customers.value.length : 0
})

const filteredCustomers = computed(() => {
  let filtered = customers.value

  // Apply text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.email.toLowerCase().includes(query) ||
      c.full_name?.toLowerCase().includes(query)
    )
  }

  // Apply customer filter
  if (customerFilter.value === 'active') {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    filtered = filtered.filter(c => 
      c.last_order_date && new Date(c.last_order_date) > thirtyDaysAgo
    )
  } else if (customerFilter.value === 'vip') {
    filtered = filtered.filter(c => (c.total_spent || 0) > 500)
  }

  return filtered
})

// Methods
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function getCustomerStatus(customer: any) {
  if ((customer.total_spent || 0) > 1000) return 'VIP'
  if ((customer.total_spent || 0) > 500) return 'Premium'
  if ((customer.order_count || 0) > 0) return 'Active'
  return 'New'
}

function getCustomerStatusColor(customer: any) {
  const status = getCustomerStatus(customer)
  const colors = {
    VIP: 'bg-purple-100 text-purple-800',
    Premium: 'bg-blue-100 text-blue-800',
    Active: 'bg-green-100 text-green-800',
    New: 'bg-gray-100 text-gray-800'
  }
  return colors[status as keyof typeof colors]
}

function viewCustomerDetails(customer: any) {
  selectedCustomer.value = customer
  showCustomerDetails.value = true
}

function sendEmail(customer: any) {
  toast.info(`Email functionality for ${customer.email} coming soon`)
}

function exportCustomers() {
  toast.info('Customer export functionality coming soon')
}

onMounted(() => {
  // In real app, fetch customers from API
  loading.value = false
})
</script>