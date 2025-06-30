<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">My Account</h1>
    
    <!-- Profile Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            <Button variant="outline" size="sm" @click="openEditProfile">
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Full Name</label>
              <p class="text-sm">{{ authStore.profile?.full_name || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Email</label>
              <p class="text-sm">{{ authStore.userEmail }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Shipping Address</label>
              <p class="text-sm">{{ authStore.profile?.shipping_address || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Phone Number</label>
              <p class="text-sm">{{ authStore.profile?.phone_number || 'Not provided' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Account Status -->
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Account Type</label>
              <p class="text-sm">{{ authStore.isAdmin ? 'Administrator' : 'Customer' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Member Since</label>
              <p class="text-sm">{{ formatDate(authStore.profile?.created_at) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Total Orders</label>
              <p class="text-sm">{{ ordersStore.orders.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Order History Section -->
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          Track your orders and view order details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="ordersStore.loading" class="flex justify-center py-8">
          <p class="text-muted-foreground">Loading orders...</p>
        </div>
        
        <div v-else-if="ordersStore.orders.length === 0" class="text-center py-8">
          <p class="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Button @click="$router.push('/shop')">Start Shopping</Button>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2 px-4">Order ID</th>
                <th class="text-left py-2 px-4">Date</th>
                <th class="text-left py-2 px-4">Total</th>
                <th class="text-left py-2 px-4">Status</th>
                <th class="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="order in ordersStore.orders" 
                :key="order.id"
                class="border-b hover:bg-muted/50"
              >
                <td class="py-3 px-4">
                  <span class="font-mono text-sm">#{{ order.id.slice(-8) }}</span>
                </td>
                <td class="py-3 px-4">{{ formatDate(order.created_at) }}</td>
                <td class="py-3 px-4">${{ order.total_amount.toFixed(2) }}</td>
                <td class="py-3 px-4">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getStatusColor(order.status)"
                  >
                    {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    @click="viewOrderDetails(order)"
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Edit Profile Dialog -->
    <Dialog v-model:open="showEditProfile">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and shipping details
          </DialogDescription>
        </DialogHeader>
        <ProfileForm 
          :profile="authStore.profile"
          @success="handleProfileUpdateSuccess"
          @cancel="showEditProfile = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Order Details Dialog -->
    <Dialog v-model:open="showOrderDetails">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription v-if="selectedOrder">
            Order #{{ selectedOrder.id.slice(-8) }} - {{ formatDate(selectedOrder.created_at) }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedOrder" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">Status</label>
              <p class="text-sm">{{ selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">Total Amount</label>
              <p class="text-sm">${{ selectedOrder.total_amount.toFixed(2) }}</p>
            </div>
          </div>
          
          <div>
            <label class="text-sm font-medium text-muted-foreground">Shipping Address</label>
            <p class="text-sm">{{ selectedOrder.shipping_address }}</p>
          </div>
          
          <div>
            <label class="text-sm font-medium text-muted-foreground">Shipping Name</label>
            <p class="text-sm">{{ selectedOrder.shipping_name }}</p>
          </div>
          
          <div v-if="selectedOrder.shipping_phone">
            <label class="text-sm font-medium text-muted-foreground">Phone</label>
            <p class="text-sm">{{ selectedOrder.shipping_phone }}</p>
          </div>
          
          <div v-if="selectedOrder.notes">
            <label class="text-sm font-medium text-muted-foreground">Notes</label>
            <p class="text-sm">{{ selectedOrder.notes }}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui'
import ProfileForm from '@/components/common/ProfileForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import type { Order } from '@/types/supabase'

const authStore = useAuthStore()
const ordersStore = useOrdersStore()

const showEditProfile = ref(false)
const showOrderDetails = ref(false)
const selectedOrder = ref<Order | null>(null)

function openEditProfile() {
  showEditProfile.value = true
}

function handleProfileUpdateSuccess() {
  showEditProfile.value = false
}

function viewOrderDetails(order: Order) {
  selectedOrder.value = order
  showOrderDetails.value = true
}

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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

onMounted(() => {
  // Fetch orders when component mounts
  ordersStore.fetchOrders()
})
</script>