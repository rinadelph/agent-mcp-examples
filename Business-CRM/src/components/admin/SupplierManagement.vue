<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Supplier Management</h3>
        <p class="text-sm text-muted-foreground">Manage your suppliers and vendor relationships</p>
      </div>
      <Button @click="showAddSupplier = true">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Supplier
      </Button>
    </div>

    <!-- Supplier Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Suppliers</CardTitle>
          <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ suppliers.length }}</div>
          <p class="text-xs text-muted-foreground">{{ activeSuppliers }} active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Products</CardTitle>
          <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalSuppliedProducts }}</div>
          <p class="text-xs text-muted-foreground">From suppliers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pending Orders</CardTitle>
          <svg class="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ pendingOrders }}</div>
          <p class="text-xs text-muted-foreground">Need attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Spend</CardTitle>
          <svg class="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">${{ totalSpend.toFixed(2) }}</div>
          <p class="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          placeholder="Search suppliers..."
          class="w-full"
        />
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="supplierFilter = supplierFilter === 'active' ? 'all' : 'active'"
          :class="{ 'bg-green-50 text-green-700 border-green-200': supplierFilter === 'active' }"
        >
          Active Only
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="supplierFilter = supplierFilter === 'preferred' ? 'all' : 'preferred'"
          :class="{ 'bg-blue-50 text-blue-700 border-blue-200': supplierFilter === 'preferred' }"
        >
          Preferred
        </Button>
        <Button variant="outline" size="sm" @click="exportSuppliers">
          Export
        </Button>
      </div>
    </div>

    <!-- Suppliers Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Total Spend</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="filteredSuppliers.length === 0">
              <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
                No suppliers found
              </TableCell>
            </TableRow>
            <TableRow v-for="supplier in filteredSuppliers" :key="supplier.id" class="hover:bg-muted/50">
              <TableCell>
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-700">
                      {{ getInitials(supplier.name) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium">{{ supplier.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ supplier.company }}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p class="text-sm">{{ supplier.email }}</p>
                  <p class="text-sm text-muted-foreground">{{ supplier.phone }}</p>
                </div>
              </TableCell>
              <TableCell>
                <span class="font-medium">{{ supplier.product_count || 0 }}</span>
              </TableCell>
              <TableCell>
                {{ supplier.last_order_date && supplier.last_order_date !== '' ? formatDate(supplier.last_order_date) : 'Never' }}
              </TableCell>
              <TableCell>
                <span class="font-medium">${{ supplier.total_spend?.toFixed(2) || '0.00' }}</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <div class="flex text-yellow-400">
                    <svg v-for="star in 5" :key="star" class="w-4 h-4" :class="star <= supplier.rating ? 'fill-current' : 'text-gray-300'" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="text-sm text-muted-foreground">({{ supplier.rating }})</span>
                </div>
              </TableCell>
              <TableCell>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getSupplierStatusColor(supplier.status)"
                >
                  {{ supplier.status }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="viewSupplierDetails(supplier)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="editSupplier(supplier)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Add/Edit Supplier Dialog -->
    <Dialog v-model:open="showAddSupplier">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingSupplier ? 'Edit Supplier' : 'Add New Supplier' }}</DialogTitle>
          <DialogDescription>
            {{ editingSupplier ? 'Update supplier information' : 'Add a new supplier to your network' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="saveSupplier" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Company Name *</label>
              <Input v-model="supplierForm.company" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Contact Name *</label>
              <Input v-model="supplierForm.name" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Email *</label>
              <Input v-model="supplierForm.email" type="email" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Phone</label>
              <Input v-model="supplierForm.phone" />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Address</label>
            <textarea
              v-model="supplierForm.address"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows="3"
              placeholder="Street address, city, state, zip code"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Rating</label>
              <select v-model.number="supplierForm.rating" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Status</label>
              <select v-model="supplierForm.status" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Preferred">Preferred</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Payment Terms</label>
              <select v-model="supplierForm.payment_terms" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="NET 30">NET 30</option>
                <option value="NET 60">NET 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Notes</label>
            <textarea
              v-model="supplierForm.notes"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows="3"
              placeholder="Additional notes about this supplier..."
            />
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="cancelSupplierForm">
              Cancel
            </Button>
            <Button type="submit">
              {{ editingSupplier ? 'Update' : 'Add' }} Supplier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Supplier Details Dialog -->
    <Dialog v-model:open="showSupplierDetails">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Supplier Details</DialogTitle>
          <DialogDescription>
            Complete information for {{ selectedSupplier?.company }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedSupplier" class="space-y-6">
          <!-- Supplier Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Company</label>
              <p class="text-sm">{{ selectedSupplier.company }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Contact Name</label>
              <p class="text-sm">{{ selectedSupplier.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="text-sm">{{ selectedSupplier.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Phone</label>
              <p class="text-sm">{{ selectedSupplier.phone || 'N/A' }}</p>
            </div>
          </div>

          <!-- Address -->
          <div v-if="selectedSupplier.address">
            <label class="text-sm font-medium text-gray-500">Address</label>
            <p class="text-sm">{{ selectedSupplier.address }}</p>
          </div>

          <!-- Statistics -->
          <div class="border-t pt-4">
            <h4 class="font-medium mb-3">Supplier Statistics</h4>
            <div class="grid grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ selectedSupplier.product_count || 0 }}</p>
                <p class="text-xs text-gray-500">Products</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">${{ selectedSupplier.total_spend?.toFixed(2) || '0.00' }}</p>
                <p class="text-xs text-gray-500">Total Spend</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-purple-600">{{ selectedSupplier.rating }}/5</p>
                <p class="text-xs text-gray-500">Rating</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-orange-600">{{ selectedSupplier.payment_terms || 'N/A' }}</p>
                <p class="text-xs text-gray-500">Payment Terms</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedSupplier.notes" class="border-t pt-4">
            <h4 class="font-medium mb-3">Notes</h4>
            <p class="text-sm text-gray-600">{{ selectedSupplier.notes }}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui'
import { toast } from 'vue-sonner'

// Mock supplier data
const suppliers = ref([
  {
    id: '1',
    name: 'John Smith',
    company: 'Sterling Silver Supplies Co.',
    email: 'john@sterlingsilver.com',
    phone: '+1 (555) 234-5678',
    address: '123 Silver Street, New York, NY 10001',
    status: 'Preferred',
    rating: 5,
    product_count: 45,
    total_spend: 12500.00,
    last_order_date: '2024-06-20T00:00:00Z',
    payment_terms: 'NET 30',
    notes: 'Excellent quality and fast shipping. Preferred supplier for rings.'
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    company: 'Artisan Jewelry Supply',
    email: 'maria@artisanjewelry.com',
    phone: '+1 (555) 345-6789',
    address: '456 Craft Lane, Los Angeles, CA 90210',
    status: 'Active',
    rating: 4,
    product_count: 23,
    total_spend: 8750.00,
    last_order_date: '2024-06-15T00:00:00Z',
    payment_terms: 'NET 60',
    notes: 'Good for specialty items and custom pieces.'
  },
  {
    id: '3',
    name: 'David Chen',
    company: 'Premium Metals Ltd.',
    email: 'david@premiummetals.com',
    phone: '+1 (555) 456-7890',
    address: '789 Industrial Blvd, Chicago, IL 60601',
    status: 'Active',
    rating: 3,
    product_count: 12,
    total_spend: 3200.00,
    last_order_date: '2024-05-30T00:00:00Z',
    payment_terms: 'Due on Receipt',
    notes: 'Lower prices but slower shipping times.'
  }
])

const searchQuery = ref('')
const supplierFilter = ref<'all' | 'active' | 'preferred'>('all')
const showAddSupplier = ref(false)
const showSupplierDetails = ref(false)
const selectedSupplier = ref<any>(null)
const editingSupplier = ref<any>(null)

const supplierForm = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  status: 'Active',
  rating: 5,
  payment_terms: 'NET 30',
  notes: ''
})

// Computed values
const activeSuppliers = computed(() => 
  suppliers.value.filter(s => s.status === 'Active' || s.status === 'Preferred').length
)

const totalSuppliedProducts = computed(() =>
  suppliers.value.reduce((sum, s) => sum + (s.product_count || 0), 0)
)

const pendingOrders = computed(() => 8) // Mock data

const totalSpend = computed(() =>
  suppliers.value.reduce((sum, s) => sum + (s.total_spend || 0), 0)
)

const filteredSuppliers = computed(() => {
  let filtered = suppliers.value

  // Apply text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.company.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    )
  }

  // Apply supplier filter
  if (supplierFilter.value === 'active') {
    filtered = filtered.filter(s => s.status === 'Active')
  } else if (supplierFilter.value === 'preferred') {
    filtered = filtered.filter(s => s.status === 'Preferred')
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

function getSupplierStatusColor(status: string) {
  const colors = {
    'Preferred': 'bg-purple-100 text-purple-800',
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Blocked': 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function viewSupplierDetails(supplier: any) {
  selectedSupplier.value = supplier
  showSupplierDetails.value = true
}

function editSupplier(supplier: any) {
  editingSupplier.value = supplier
  supplierForm.value = {
    name: supplier.name,
    company: supplier.company,
    email: supplier.email,
    phone: supplier.phone || '',
    address: supplier.address || '',
    status: supplier.status,
    rating: supplier.rating,
    payment_terms: supplier.payment_terms,
    notes: supplier.notes || ''
  }
  showAddSupplier.value = true
}

function cancelSupplierForm() {
  showAddSupplier.value = false
  editingSupplier.value = null
  supplierForm.value = {
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    rating: 5,
    payment_terms: 'NET 30',
    notes: ''
  }
}

function saveSupplier() {
  if (editingSupplier.value) {
    // Update existing supplier
    const index = suppliers.value.findIndex(s => s.id === editingSupplier.value.id)
    if (index !== -1) {
      suppliers.value[index] = { 
        ...suppliers.value[index], 
        ...supplierForm.value 
      }
    }
    toast.success('Supplier updated successfully')
  } else {
    // Add new supplier
    const newSupplier = {
      id: Date.now().toString(),
      ...supplierForm.value,
      product_count: 0,
      total_spend: 0,
      last_order_date: ''
    }
    suppliers.value.push(newSupplier)
    toast.success('Supplier added successfully')
  }
  
  cancelSupplierForm()
}

function exportSuppliers() {
  toast.info('Supplier export functionality coming soon')
}
</script>