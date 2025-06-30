<template>
  <div class="space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Product Management</h3>
        <p class="text-sm text-muted-foreground">Manage your product catalog</p>
      </div>
      <Button @click="openCreateProduct">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Product
      </Button>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          placeholder="Search products..."
          class="w-full"
        />
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="filterStatus = filterStatus === 'active' ? 'all' : 'active'"
          :class="{ 'bg-primary text-primary-foreground': filterStatus === 'active' }"
        >
          Active Only
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="filterStatus = filterStatus === 'low_stock' ? 'all' : 'low_stock'"
          :class="{ 'bg-warning text-warning-foreground': filterStatus === 'low_stock' }"
        >
          Low Stock
        </Button>
      </div>
    </div>

    <!-- Products Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="filteredProducts.length === 0">
              <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                {{ productsStore.loading ? 'Loading products...' : 'No products found' }}
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
                    @error="(e: Event) => { const img = e.target as HTMLImageElement; img.style.display = 'none' }"
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
                  <p class="text-sm text-muted-foreground truncate max-w-[200px]">
                    {{ product.description || 'No description' }}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span class="capitalize">{{ product.category }}</span>
              </TableCell>
              <TableCell>
                ${{ product.price.toFixed(2) }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span :class="{ 'text-red-600': product.quantity < 5 }">
                    {{ product.quantity }}
                  </span>
                  <svg v-if="product.quantity < 5" class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </TableCell>
              <TableCell>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="product.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'"
                >
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="editProduct(product)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="toggleProductStatus(product)"
                  >
                    <svg v-if="product.is_active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l4.242 4.242m0 0L15.536 15.536M14.12 14.12L8.464 8.464" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="deleteProduct(product)"
                  >
                    <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Product Form Dialog -->
    <Dialog v-model:open="showProductForm">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingProduct ? 'Edit Product' : 'Create New Product' }}</DialogTitle>
          <DialogDescription>
            {{ editingProduct ? 'Update product information' : 'Add a new product to your catalog' }}
          </DialogDescription>
        </DialogHeader>
        <ProductForm 
          :product="editingProduct"
          @success="handleProductFormSuccess"
          @cancel="closeProductForm"
        />
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation -->
    <AlertDialog v-model:open="showDeleteConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{{ productToDelete?.name }}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteConfirm = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Card, CardContent,
  Button,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui'
import { useProductsStore } from '@/stores/products'
import ProductForm from '@/components/admin/ProductForm.vue'
import type { Product } from '@/types/supabase'
import { toast } from 'vue-sonner'

const productsStore = useProductsStore()

const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'low_stock'>('all')
const showProductForm = ref(false)
const editingProduct = ref<Product | null>(null)
const showDeleteConfirm = ref(false)
const productToDelete = ref<Product | null>(null)

const filteredProducts = computed(() => {
  let products = productsStore.products

  // Apply text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (filterStatus.value === 'active') {
    products = products.filter(p => p.is_active)
  } else if (filterStatus.value === 'low_stock') {
    products = products.filter(p => p.quantity < 5 && p.is_active)
  }

  return products
})

function openCreateProduct() {
  editingProduct.value = null
  showProductForm.value = true
}

function editProduct(product: Product) {
  editingProduct.value = product
  showProductForm.value = true
}

function closeProductForm() {
  showProductForm.value = false
  editingProduct.value = null
}

function handleProductFormSuccess() {
  closeProductForm()
  toast.success(editingProduct.value ? 'Product updated successfully' : 'Product created successfully')
}

async function toggleProductStatus(product: Product) {
  try {
    await productsStore.updateProduct(product.id, {
      is_active: !product.is_active
    })
    toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'}`)
  } catch (error) {
    toast.error('Failed to update product status')
  }
}

function deleteProduct(product: Product) {
  productToDelete.value = product
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!productToDelete.value) return

  try {
    await productsStore.deleteProduct(productToDelete.value.id)
    toast.success('Product deleted successfully')
  } catch (error) {
    toast.error('Failed to delete product')
  } finally {
    showDeleteConfirm.value = false
    productToDelete.value = null
  }
}
</script>