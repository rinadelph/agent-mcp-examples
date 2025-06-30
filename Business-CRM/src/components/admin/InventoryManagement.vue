<template>
  <div class="space-y-6">
    <!-- Header with Stock Alerts -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Low Stock Items</CardTitle>
          <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">{{ lowStockItems.length }}</div>
          <p class="text-xs text-muted-foreground">Items below 5 units</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Out of Stock</CardTitle>
          <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">{{ outOfStockItems.length }}</div>
          <p class="text-xs text-muted-foreground">Items with 0 units</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Stock Value</CardTitle>
          <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">${{ totalStockValue.toFixed(2) }}</div>
          <p class="text-xs text-muted-foreground">Total inventory value</p>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          placeholder="Search inventory..."
          class="w-full"
        />
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="stockFilter = stockFilter === 'low' ? 'all' : 'low'"
          :class="{ 'bg-red-50 text-red-700 border-red-200': stockFilter === 'low' }"
        >
          Low Stock
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="stockFilter = stockFilter === 'out' ? 'all' : 'out'"
          :class="{ 'bg-red-50 text-red-700 border-red-200': stockFilter === 'out' }"
        >
          Out of Stock
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="showBulkUpdate = true"
        >
          Bulk Update
        </Button>
      </div>
    </div>

    <!-- Inventory Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[100px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="filteredProducts.length === 0">
              <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
            <TableRow v-for="product in filteredProducts" :key="product.id" class="hover:bg-muted/50">
              <TableCell>
                <div class="w-12 h-12 rounded overflow-hidden bg-muted">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p class="font-medium">{{ product.name }}</p>
                  <p class="text-sm text-muted-foreground">${{ product.price.toFixed(2) }}</p>
                </div>
              </TableCell>
              <TableCell>
                <span class="capitalize">{{ product.category }}</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="adjustStock(product, -1)"
                    :disabled="product.quantity === 0"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </Button>
                  <span class="font-medium min-w-[30px] text-center">{{ product.quantity }}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="adjustStock(product, 1)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStockStatusColor(product.quantity)"
                >
                  {{ getStockStatus(product.quantity) }}
                </span>
              </TableCell>
              <TableCell>
                ${{ (product.price * product.quantity).toFixed(2) }}
              </TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="openStockAdjustment(product)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Stock Adjustment Dialog -->
    <Dialog v-model:open="showStockAdjustment">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock - {{ selectedProduct?.name }}</DialogTitle>
          <DialogDescription>
            Current stock: {{ selectedProduct?.quantity }} units
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="saveStockAdjustment" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">New Stock Quantity</label>
            <Input
              v-model.number="stockAdjustment.newQuantity"
              type="number"
              min="0"
              required
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Reason</label>
            <select
              v-model="stockAdjustment.reason"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select reason...</option>
              <option value="restock">Restock</option>
              <option value="adjustment">Stock Adjustment</option>
              <option value="damage">Damaged Items</option>
              <option value="return">Customer Return</option>
              <option value="promotion">Promotional Use</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Notes (Optional)</label>
            <textarea
              v-model="stockAdjustment.notes"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Additional notes..."
              rows="2"
            />
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="showStockAdjustment = false">
              Cancel
            </Button>
            <Button type="submit">
              Update Stock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Bulk Update Dialog -->
    <Dialog v-model:open="showBulkUpdate">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Stock Update</DialogTitle>
          <DialogDescription>
            Update stock levels for multiple products at once
          </DialogDescription>
        </DialogHeader>
        <div class="text-center py-8 text-muted-foreground">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Bulk Update Feature</h3>
          <p class="mt-1 text-sm text-gray-500">This feature is coming soon!</p>
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
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/types/supabase'
import { toast } from 'vue-sonner'

const productsStore = useProductsStore()

const searchQuery = ref('')
const stockFilter = ref<'all' | 'low' | 'out'>('all')
const showStockAdjustment = ref(false)
const showBulkUpdate = ref(false)
const selectedProduct = ref<Product | null>(null)

const stockAdjustment = ref({
  newQuantity: 0,
  reason: '',
  notes: ''
})

// Computed values
const lowStockItems = computed(() => 
  productsStore.products.filter(p => p.quantity > 0 && p.quantity < 5 && p.is_active)
)

const outOfStockItems = computed(() => 
  productsStore.products.filter(p => p.quantity === 0 && p.is_active)
)

const totalStockValue = computed(() => 
  productsStore.products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
)

const filteredProducts = computed(() => {
  let products = productsStore.products

  // Apply text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  // Apply stock filter
  if (stockFilter.value === 'low') {
    products = products.filter(p => p.quantity > 0 && p.quantity < 5)
  } else if (stockFilter.value === 'out') {
    products = products.filter(p => p.quantity === 0)
  }

  return products
})

// Methods
function getStockStatus(quantity: number) {
  if (quantity === 0) return 'Out of Stock'
  if (quantity < 5) return 'Low Stock'
  return 'In Stock'
}

function getStockStatusColor(quantity: number) {
  if (quantity === 0) return 'bg-red-100 text-red-800'
  if (quantity < 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

async function adjustStock(product: Product, change: number) {
  const newQuantity = Math.max(0, product.quantity + change)
  try {
    await productsStore.updateProduct(product.id, { quantity: newQuantity })
    toast.success(`Stock ${change > 0 ? 'increased' : 'decreased'} for ${product.name}`)
  } catch (error) {
    toast.error('Failed to update stock')
  }
}

function openStockAdjustment(product: Product) {
  selectedProduct.value = product
  stockAdjustment.value = {
    newQuantity: product.quantity,
    reason: '',
    notes: ''
  }
  showStockAdjustment.value = true
}

async function saveStockAdjustment() {
  if (!selectedProduct.value) return

  try {
    await productsStore.updateProduct(selectedProduct.value.id, {
      quantity: stockAdjustment.value.newQuantity
    })
    
    // Here you could also log the stock adjustment with reason and notes
    toast.success(`Stock updated for ${selectedProduct.value.name}`)
    showStockAdjustment.value = false
  } catch (error) {
    toast.error('Failed to update stock')
  }
}
</script>