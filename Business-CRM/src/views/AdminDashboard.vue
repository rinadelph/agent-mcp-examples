<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar
      :is-open="sidebarOpen"
      :current-section="currentSection"
      :stats="dashboardStats"
      @toggle="sidebarOpen = !sidebarOpen"
      @navigate="handleNavigation"
    />

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Mobile header -->
      <div class="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 class="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <Button
          variant="ghost"
          size="sm"
          @click="sidebarOpen = true"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>

      <!-- Page Content -->
      <main class="p-6">
        <!-- Dashboard Overview -->
        <div v-if="currentSection === 'dashboard'">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p class="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>
            <div class="text-sm text-gray-500">
              Last updated: {{ new Date().toLocaleString() }}
            </div>
          </div>
          
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Products</CardTitle>
                <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ productsStore.products.length }}</div>
                <p class="text-xs text-muted-foreground">
                  {{ activeProductsCount }} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
                <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ ordersStore.orders.length }}</div>
                <p class="text-xs text-muted-foreground">
                  {{ pendingOrdersCount }} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Revenue</CardTitle>
                <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">${{ totalRevenue.toFixed(2) }}</div>
                <p class="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Low Stock</CardTitle>
                <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ lowStockCount }}</div>
                <p class="text-xs text-muted-foreground">
                  Below 5 items
                </p>
              </CardContent>
            </Card>
          </div>

          <!-- Quick Actions and Recent Orders -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common admin tasks</CardDescription>
              </CardHeader>
              <CardContent class="grid grid-cols-2 gap-4">
                <Button @click="handleNavigation('products')" class="w-full">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Manage Products
                </Button>
                <Button @click="handleNavigation('orders')" variant="outline" class="w-full">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Orders
                </Button>
                <Button @click="exportData" variant="outline" class="w-full">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </Button>
                <Button @click="refreshData" variant="outline" class="w-full">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div v-if="recentOrders.length === 0" class="text-center py-4 text-muted-foreground">
                    No recent orders
                  </div>
                  <div v-else>
                    <div 
                      v-for="order in recentOrders.slice(0, 5)" 
                      :key="order.id"
                      class="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                      @click="viewOrderDetails(order)"
                    >
                      <div>
                        <p class="font-medium text-sm">#{{ order.id.slice(-8) }}</p>
                        <p class="text-xs text-muted-foreground">{{ order.shipping_name }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-medium text-sm">${{ order.total_amount.toFixed(2) }}</p>
                        <span 
                          class="text-xs px-2 py-1 rounded-full"
                          :class="getStatusColor(order.status)"
                        >
                          {{ order.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Products Section -->
        <div v-else-if="currentSection === 'products'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Product Management</h1>
            <p class="text-gray-600">Manage your product catalog and inventory</p>
          </div>
          <ProductManagement />
        </div>

        <!-- Orders Section -->
        <div v-else-if="currentSection === 'orders'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
            <p class="text-gray-600">View and manage customer orders</p>
          </div>
          <OrderManagement />
        </div>

        <!-- Categories Section -->
        <div v-else-if="currentSection === 'categories'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Category Management</h1>
            <p class="text-gray-600">Organize your product categories and classifications</p>
          </div>
          <CategoryManagement />
        </div>

        <!-- Inventory Section -->
        <div v-else-if="currentSection === 'inventory'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p class="text-gray-600">Monitor stock levels and manage inventory</p>
          </div>
          <InventoryManagement />
        </div>

        <!-- Customers Section -->
        <div v-else-if="currentSection === 'customers'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p class="text-gray-600">View and manage customer information</p>
          </div>
          <CustomerManagement />
        </div>

        <!-- Suppliers Section -->
        <div v-else-if="currentSection === 'suppliers'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Supplier Management</h1>
            <p class="text-gray-600">Manage your suppliers and vendor relationships</p>
          </div>
          <SupplierManagement />
        </div>

        <!-- Analytics Section -->
        <div v-else-if="currentSection === 'analytics'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Sales Analytics</h1>
            <p class="text-gray-600">View detailed sales reports and analytics</p>
          </div>
          <ReportsAnalytics />
        </div>

        <!-- Performance Section -->
        <div v-else-if="currentSection === 'performance'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Performance Metrics</h1>
            <p class="text-gray-600">Monitor product and store performance</p>
          </div>
          <PerformanceMetrics />
        </div>

        <!-- Settings Section -->
        <div v-else-if="currentSection === 'settings'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p class="text-gray-600">Configure system settings and preferences</p>
          </div>
          <AdminSettings />
        </div>

        <!-- Users Section -->
        <div v-else-if="currentSection === 'users'">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
            <p class="text-gray-600">Manage admin users and permissions</p>
          </div>
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">User Management</h3>
            <p class="mt-1 text-sm text-gray-500">User management features coming soon!</p>
          </div>
        </div>

        <!-- Default placeholder for unknown sections -->
        <div v-else>
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ currentSection }} Section</h3>
            <p class="mt-1 text-sm text-gray-500">This section is coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button
} from '@/components/ui'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ProductManagement from '@/components/admin/ProductManagement.vue'
import OrderManagement from '@/components/admin/OrderManagement.vue'
import CategoryManagement from '@/components/admin/CategoryManagement.vue'
import InventoryManagement from '@/components/admin/InventoryManagement.vue'
import CustomerManagement from '@/components/admin/CustomerManagement.vue'
import ReportsAnalytics from '@/components/admin/ReportsAnalytics.vue'
import PerformanceMetrics from '@/components/admin/PerformanceMetrics.vue'
import AdminSettings from '@/components/admin/AdminSettings.vue'
import SupplierManagement from '@/components/admin/SupplierManagement.vue'
import type { Order } from '@/types/supabase'
import { toast } from 'vue-sonner'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

// Sidebar state
const sidebarOpen = ref(false)
const currentSection = ref('dashboard')

// Computed stats
const activeProductsCount = computed(() => 
  productsStore.products.filter(p => p.is_active).length
)

const pendingOrdersCount = computed(() => 
  ordersStore.orders.filter(o => o.status === 'pending').length
)

const totalRevenue = computed(() => 
  ordersStore.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total_amount, 0)
)

const lowStockCount = computed(() => 
  productsStore.products.filter(p => p.quantity < 5 && p.is_active).length
)

const recentOrders = computed(() => 
  [...ordersStore.orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
)

// Dashboard stats for sidebar
const dashboardStats = computed(() => ({
  lowStockCount: lowStockCount.value,
  pendingOrdersCount: pendingOrdersCount.value
}))

// Navigation handler
function handleNavigation(section: string) {
  currentSection.value = section
  sidebarOpen.value = false // Close mobile sidebar
}

function getStatusColor(status: string) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function viewOrderDetails(order: Order) {
  // Will be handled by OrderManagement component
  handleNavigation('orders')
  toast.info(`Viewing order #${order.id.slice(-8)}`)
}

function exportData() {
  toast.info('Export functionality coming soon')
}

async function refreshData() {
  try {
    await Promise.all([
      productsStore.fetchProducts(),
      ordersStore.fetchAllOrdersAdmin()
    ])
    toast.success('Data refreshed successfully')
  } catch (error) {
    toast.error('Failed to refresh data')
  }
}

// Redirect if not admin
if (!authStore.isAdmin) {
  throw new Error('Admin access required')
}

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    ordersStore.fetchAllOrdersAdmin()
  ])
})
</script>