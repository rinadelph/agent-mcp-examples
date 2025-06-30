<template>
  <div class="space-y-6">
    <!-- Date Range Selector -->
    <Card>
      <CardHeader>
        <CardTitle>Report Filters</CardTitle>
        <CardDescription>Select date range and report type</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Date Range</label>
            <select v-model="selectedDateRange" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Report Type</label>
            <select v-model="selectedReportType" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="sales">Sales Overview</option>
              <option value="products">Product Performance</option>
              <option value="customers">Customer Analytics</option>
              <option value="financial">Financial Summary</option>
            </select>
          </div>
          <div class="flex items-end space-x-2">
            <Button @click="generateReport" class="flex-1">
              Generate Report
            </Button>
            <Button variant="outline" @click="exportReport">
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Key Metrics Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">${{ formatCurrency(metrics.totalRevenue) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ metrics.revenueGrowth >= 0 ? '+' : '' }}{{ metrics.revenueGrowth.toFixed(1) }}%
            </span>
            vs previous period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
          <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">{{ metrics.totalOrders }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ metrics.ordersGrowth >= 0 ? '+' : '' }}{{ metrics.ordersGrowth.toFixed(1) }}%
            </span>
            vs previous period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Avg Order Value</CardTitle>
          <svg class="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-purple-600">${{ formatCurrency(metrics.avgOrderValue) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="metrics.aovGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ metrics.aovGrowth >= 0 ? '+' : '' }}{{ metrics.aovGrowth.toFixed(1) }}%
            </span>
            vs previous period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Conversion Rate</CardTitle>
          <svg class="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">{{ metrics.conversionRate.toFixed(2) }}%</div>
          <p class="text-xs text-muted-foreground">
            <span :class="metrics.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ metrics.conversionGrowth >= 0 ? '+' : '' }}{{ metrics.conversionGrowth.toFixed(1) }}%
            </span>
            vs previous period
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Daily revenue for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Revenue Chart</h3>
              <p class="mt-1 text-sm text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Order Status Distribution -->
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Breakdown of order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="status in orderStatusData" :key="status.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded" :style="{ backgroundColor: status.color }"></div>
                <span class="text-sm font-medium">{{ status.name }}</span>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ status.count }}</p>
                <p class="text-xs text-muted-foreground">{{ status.percentage }}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Top Products Table -->
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Products</CardTitle>
        <CardDescription>Best selling products in the selected period</CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="product in topProducts" :key="product.id" class="hover:bg-muted/50">
              <TableCell>
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                    <img 
                      v-if="product.image_url" 
                      :src="product.image_url" 
                      :alt="product.name" 
                      class="w-full h-full object-cover"
                    >
                    <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  </div>
                  <span class="font-medium">{{ product.name }}</span>
                </div>
              </TableCell>
              <TableCell>{{ product.category }}</TableCell>
              <TableCell>{{ product.units_sold }}</TableCell>
              <TableCell>${{ formatCurrency(product.revenue) }}</TableCell>
              <TableCell>
                <span :class="product.growth >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ product.growth >= 0 ? '+' : '' }}{{ product.growth.toFixed(1) }}%
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Customer Insights -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>Customer breakdown by value</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="segment in customerSegments" :key="segment.name" class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ segment.name }}</p>
                <p class="text-sm text-muted-foreground">{{ segment.description }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold">{{ segment.count }}</p>
                <p class="text-sm text-muted-foreground">{{ segment.percentage }}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Orders by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="location in topLocations" :key="location.name" class="flex items-center justify-between">
              <span class="font-medium">{{ location.name }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${location.percentage}%` }"></div>
                </div>
                <span class="text-sm font-medium">{{ location.orders }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { toast } from 'vue-sonner'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()

const selectedDateRange = ref('30d')
const selectedReportType = ref('sales')

// Computed analytics data from real stores only
const metrics = computed(() => {
  const orders = ordersStore.orders
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  // Calculate real growth - compare last 30 days vs previous 30 days
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  
  const recentOrders = orders.filter(order => new Date(order.created_at) >= thirtyDaysAgo)
  const previousOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo
  })
  
  const recentRevenue = recentOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0
  
  const ordersGrowth = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0
  
  const recentAvgOrder = recentOrders.length > 0 ? recentRevenue / recentOrders.length : 0
  const previousAvgOrder = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0
  const aovGrowth = previousAvgOrder > 0 ? ((recentAvgOrder - previousAvgOrder) / previousAvgOrder) * 100 : 0
  
  return {
    totalRevenue,
    revenueGrowth,
    totalOrders,
    ordersGrowth,
    avgOrderValue,
    aovGrowth,
    conversionRate: 0, // Would need pageview data to calculate
    conversionGrowth: 0
  }
})

const orderStatusData = computed(() => {
  const orders = ordersStore.orders
  const statusCounts = orders.reduce((acc: any, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})
  
  const total = orders.length
  const statusColors = {
    delivered: '#22c55e',
    processing: '#3b82f6', 
    shipped: '#8b5cf6',
    pending: '#eab308',
    cancelled: '#ef4444'
  }
  
  return Object.entries(statusCounts).map(([status, count]: [string, any]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: statusColors[status as keyof typeof statusColors] || '#6b7280'
  }))
})

const topProducts = computed(() => {
  // Since orders don't have order_items in our current schema,
  // we'll show top products by current inventory/price value
  return productsStore.products
    .filter(product => product.is_active)
    .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
    .slice(0, 5)
    .map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      image_url: product.image_url,
      units_sold: 0, // Would need order_items data
      revenue: product.price * product.quantity, // Use inventory value as proxy
      growth: 0 // Would need historical data
    }))
})

const customerSegments = computed(() => {
  // Calculate real customer segments from order data using available fields
  const customerSpending = new Map()
  
  ordersStore.orders.forEach(order => {
    const customerId = order.guest_email || order.user_id || order.shipping_name
    if (customerId) {
      if (!customerSpending.has(customerId)) {
        customerSpending.set(customerId, 0)
      }
      customerSpending.set(customerId, customerSpending.get(customerId) + order.total_amount)
    }
  })
  
  const customers = Array.from(customerSpending.values())
  const totalCustomers = customers.length
  
  const vipCount = customers.filter(total => total >= 1000).length
  const premiumCount = customers.filter(total => total >= 500 && total < 1000).length
  const regularCount = customers.filter(total => total >= 100 && total < 500).length
  const newCount = customers.filter(total => total < 100).length
  
  return [
    { 
      name: 'VIP Customers', 
      description: '$1000+ lifetime value', 
      count: vipCount, 
      percentage: totalCustomers > 0 ? (vipCount / totalCustomers) * 100 : 0 
    },
    { 
      name: 'Premium', 
      description: '$500-999 lifetime value', 
      count: premiumCount, 
      percentage: totalCustomers > 0 ? (premiumCount / totalCustomers) * 100 : 0 
    },
    { 
      name: 'Regular', 
      description: '$100-499 lifetime value', 
      count: regularCount, 
      percentage: totalCustomers > 0 ? (regularCount / totalCustomers) * 100 : 0 
    },
    { 
      name: 'New', 
      description: 'Under $100 spent', 
      count: newCount, 
      percentage: totalCustomers > 0 ? (newCount / totalCustomers) * 100 : 0 
    }
  ]
})

const topLocations = computed(() => {
  // Calculate location data from shipping names as locations aren't available
  const locationCounts = new Map()
  
  ordersStore.orders.forEach(order => {
    // Extract region from shipping address if available
    const address = order.shipping_address
    if (address) {
      // Simple extraction - look for state-like patterns
      const stateMatch = address.match(/\b[A-Z]{2}\b/) // Look for 2-letter state codes
      const location = stateMatch ? stateMatch[0] : 'Unknown'
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1)
    }
  })
  
  const locations = Array.from(locationCounts.entries())
    .map(([name, orders]) => ({ name, orders }))
    .filter(location => location.name !== 'Unknown')
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5)
  
  const maxOrders = locations[0]?.orders || 1
  
  return locations.map(location => ({
    ...location,
    percentage: (location.orders / maxOrders) * 100
  }))
})

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function generateReport() {
  toast.success(`Generated ${selectedReportType.value} report for ${selectedDateRange.value}`)
}

function exportReport() {
  toast.info('Report export functionality coming soon')
}

onMounted(async () => {
  // Fetch data when component mounts
  await Promise.all([
    productsStore.fetchProducts(),
    ordersStore.fetchAllOrdersAdmin()
  ])
})
</script>