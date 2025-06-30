<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Category Management</h3>
        <p class="text-sm text-muted-foreground">Organize your product categories</p>
      </div>
      <Button @click="showCreateCategory = true">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Category
      </Button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="category in categories" :key="category.name" class="relative">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="capitalize">{{ category.name }}</CardTitle>
            <div class="flex items-center space-x-2">
              <Button variant="ghost" size="sm" @click="editCategory(category)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Products</span>
              <span class="font-medium">{{ category.count }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Active Products</span>
              <span class="font-medium text-green-600">{{ category.activeCount }}</span>
            </div>
            <div v-if="category.description" class="text-xs text-muted-foreground">
              {{ category.description }}
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Add Category Card -->
      <Card 
        class="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
        @click="showCreateCategory = true"
      >
        <CardContent class="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="text-sm font-medium">Add New Category</span>
        </CardContent>
      </Card>
    </div>

    <!-- Create/Edit Category Dialog -->
    <Dialog v-model:open="showCreateCategory">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingCategory ? 'Edit Category' : 'Create New Category' }}</DialogTitle>
          <DialogDescription>
            {{ editingCategory ? 'Update category information' : 'Add a new product category' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="saveCategory" class="space-y-4">
          <div class="space-y-2">
            <label for="categoryName" class="text-sm font-medium">Category Name</label>
            <Input
              id="categoryName"
              v-model="categoryForm.name"
              placeholder="e.g., rings, necklaces, earrings"
              required
            />
          </div>
          <div class="space-y-2">
            <label for="categoryDescription" class="text-sm font-medium">Description</label>
            <textarea
              id="categoryDescription"
              v-model="categoryForm.description"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Optional category description"
              rows="3"
            />
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" @click="cancelEdit">
              Cancel
            </Button>
            <Button type="submit">
              {{ editingCategory ? 'Update' : 'Create' }} Category
            </Button>
          </div>
        </form>
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui'
import { useProductsStore } from '@/stores/products'
import { toast } from 'vue-sonner'

const productsStore = useProductsStore()

const showCreateCategory = ref(false)
const editingCategory = ref<any>(null)
const categoryForm = ref({
  name: '',
  description: ''
})

// Get unique categories from products
const categories = computed(() => {
  const categoryMap = new Map()
  
  productsStore.products.forEach(product => {
    const category = product.category.toLowerCase()
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        count: 0,
        activeCount: 0,
        description: ''
      })
    }
    
    const cat = categoryMap.get(category)
    cat.count++
    if (product.is_active) {
      cat.activeCount++
    }
  })
  
  return Array.from(categoryMap.values())
})

function editCategory(category: any) {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    description: category.description
  }
  showCreateCategory.value = true
}

function cancelEdit() {
  showCreateCategory.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    description: ''
  }
}

function saveCategory() {
  // This would typically integrate with the backend to save category metadata
  // For now, we'll just show a success message
  toast.success(editingCategory.value ? 'Category updated' : 'Category created')
  cancelEdit()
}
</script>