<template>
  <aside 
    class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col"
    :class="{ '-translate-x-full': !isOpen, 'translate-x-0': isOpen }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <p class="text-xs text-gray-500">925 Silver</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        @click="$emit('toggle')"
        class="lg:hidden"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      <!-- Dashboard -->
      <div class="space-y-1">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
          Main
        </p>
        <NavItem
          :active="currentSection === 'dashboard'"
          @click="$emit('navigate', 'dashboard')"
          icon="chart-bar"
          label="Dashboard"
          description="Overview & stats"
        />
      </div>

      <!-- Catalog Management -->
      <div class="space-y-1 pt-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
          Catalog
        </p>
        <NavItem
          :active="currentSection === 'products'"
          @click="$emit('navigate', 'products')"
          icon="cube"
          label="Products"
          description="Manage inventory"
          :badge="stats?.lowStockCount"
          badge-color="red"
        />
        <NavItem
          :active="currentSection === 'categories'"
          @click="$emit('navigate', 'categories')"
          icon="tag"
          label="Categories"
          description="Product categories"
        />
        <NavItem
          :active="currentSection === 'inventory'"
          @click="$emit('navigate', 'inventory')"
          icon="clipboard-list"
          label="Inventory"
          description="Stock management"
        />
      </div>

      <!-- Sales & Operations -->
      <div class="space-y-1 pt-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
          Sales
        </p>
        <NavItem
          :active="currentSection === 'orders'"
          @click="$emit('navigate', 'orders')"
          icon="shopping-bag"
          label="Orders"
          description="Customer orders"
          :badge="stats?.pendingOrdersCount"
          badge-color="yellow"
        />
        <NavItem
          :active="currentSection === 'customers'"
          @click="$emit('navigate', 'customers')"
          icon="users"
          label="Customers"
          description="Customer management"
        />
        <NavItem
          :active="currentSection === 'suppliers'"
          @click="$emit('navigate', 'suppliers')"
          icon="truck"
          label="Suppliers"
          description="Vendor management"
        />
      </div>

      <!-- Analytics -->
      <div class="space-y-1 pt-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
          Analytics
        </p>
        <NavItem
          :active="currentSection === 'analytics'"
          @click="$emit('navigate', 'analytics')"
          icon="chart-pie"
          label="Reports"
          description="Sales analytics"
        />
        <NavItem
          :active="currentSection === 'performance'"
          @click="$emit('navigate', 'performance')"
          icon="trending-up"
          label="Performance"
          description="Product metrics"
        />
      </div>

      <!-- Settings -->
      <div class="space-y-1 pt-4">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
          System
        </p>
        <NavItem
          :active="currentSection === 'settings'"
          @click="$emit('navigate', 'settings')"
          icon="cog"
          label="Settings"
          description="Admin settings"
        />
        <NavItem
          :active="currentSection === 'users'"
          @click="$emit('navigate', 'users')"
          icon="user-group"
          label="User Management"
          description="Admin users"
        />
      </div>
    </nav>

    <!-- User Info & Logout -->
    <div class="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-sm font-medium text-white">
            {{ authStore.userEmail?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ authStore.userEmail }}
          </p>
          <p class="text-xs text-gray-500">Administrator</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="handleLogout"
        class="w-full"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </Button>
    </div>
  </aside>

  <!-- Mobile overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
    @click="$emit('toggle')"
  />
</template>

<script setup lang="ts">
import { Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import NavItem from './NavItem.vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

interface Props {
  isOpen?: boolean
  currentSection?: string
  stats?: {
    lowStockCount?: number
    pendingOrdersCount?: number
  }
}

defineProps<Props>()

defineEmits<{
  toggle: []
  navigate: [section: string]
}>()

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  try {
    await authStore.logout()
    await router.push('/login')
    toast.success('Logged out successfully')
  } catch (error) {
    toast.error('Failed to logout')
  }
}
</script>