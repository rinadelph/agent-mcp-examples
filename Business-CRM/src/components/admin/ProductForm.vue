<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Product Name -->
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium">Product Name *</label>
        <Input
          id="name"
          v-model="formData.name"
          placeholder="Enter product name"
          required
          :disabled="loading"
        />
        <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
      </div>

      <!-- Category -->
      <div class="space-y-2">
        <label for="category" class="text-sm font-medium">Category *</label>
        <div class="relative">
          <Input
            id="category"
            v-model="formData.category"
            placeholder="e.g., rings, necklaces, earrings"
            required
            :disabled="loading"
            @input="showCategorySuggestions = true"
            @blur="hideCategorySuggestions"
          />
          <!-- Category Suggestions -->
          <div 
            v-if="showCategorySuggestions && categorySuggestions.length > 0"
            class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto"
          >
            <button
              v-for="suggestion in categorySuggestions"
              :key="suggestion"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm capitalize"
              @mousedown="selectCategory(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
        <p v-if="errors.category" class="text-sm text-red-500">{{ errors.category }}</p>
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <label for="description" class="text-sm font-medium">Description</label>
      <textarea
        id="description"
        v-model="formData.description"
        class="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Enter product description"
        :disabled="loading"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Price -->
      <div class="space-y-2">
        <label for="price" class="text-sm font-medium">Price ($) *</label>
        <Input
          id="price"
          v-model.number="formData.price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
          :disabled="loading"
        />
        <p v-if="errors.price" class="text-sm text-red-500">{{ errors.price }}</p>
      </div>

      <!-- Quantity -->
      <div class="space-y-2">
        <label for="quantity" class="text-sm font-medium">Stock Quantity *</label>
        <Input
          id="quantity"
          v-model.number="formData.quantity"
          type="number"
          min="0"
          placeholder="0"
          required
          :disabled="loading"
        />
        <p v-if="errors.quantity" class="text-sm text-red-500">{{ errors.quantity }}</p>
      </div>

      <!-- Status Toggles -->
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <input
            id="is_featured"
            v-model="formData.is_featured"
            type="checkbox"
            class="rounded border-input"
            :disabled="loading"
          />
          <label for="is_featured" class="text-sm font-medium">Featured Product</label>
        </div>
        <div class="flex items-center space-x-2">
          <input
            id="is_active"
            v-model="formData.is_active"
            type="checkbox"
            class="rounded border-input"
            :disabled="loading"
          />
          <label for="is_active" class="text-sm font-medium">Active</label>
        </div>
      </div>
    </div>

    <!-- Image Upload -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Product Image</label>
      <div class="space-y-4">
        <!-- Current Image -->
        <div v-if="formData.image_url" class="flex items-center gap-4">
          <div class="w-20 h-20 rounded border overflow-hidden">
            <img
              :src="formData.image_url"
              :alt="formData.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="removeImage"
            :disabled="loading"
          >
            Remove Image
          </Button>
        </div>

        <!-- Upload Input -->
        <div class="flex items-center gap-4">
          <Input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageSelect"
            :disabled="loading || uploading"
            class="max-w-[300px]"
          />
          <Button
            v-if="selectedFile"
            type="button"
            @click="uploadImage"
            :disabled="loading || uploading"
            size="sm"
          >
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </Button>
        </div>
      </div>
      <p v-if="errors.image" class="text-sm text-red-500">{{ errors.image }}</p>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-2 pt-4 border-t">
      <Button 
        type="button" 
        variant="outline" 
        @click="$emit('cancel')"
        :disabled="loading"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        :disabled="loading || !isFormValid"
      >
        {{ loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { z } from 'zod'
import { Input, Button } from '@/components/ui'
import { useProductsStore } from '@/stores/products'
import { uploadProductImages } from '@/services/api'
import type { Product } from '@/types/supabase'
import { toast } from 'vue-sonner'

interface Props {
  product?: Product | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const productsStore = useProductsStore()

// Form schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  image_url: z.string().optional()
})

// Form data
const formData = ref({
  name: '',
  description: '',
  category: '',
  price: 0,
  quantity: 0,
  is_featured: false,
  is_active: true,
  image_url: ''
})

// Form state
const errors = ref<Record<string, string>>({})
const loading = computed(() => productsStore.loading)
const uploading = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()
const showCategorySuggestions = ref(false)

// Category suggestions
const categorySuggestions = computed(() => {
  if (!formData.value.category) return []
  
  const input = formData.value.category.toLowerCase()
  const existingCategories = [...new Set(
    productsStore.products.map(p => p.category.toLowerCase())
  )]
  
  return existingCategories
    .filter(cat => cat.includes(input) && cat !== input)
    .slice(0, 5)
})

// Form validation
const isFormValid = computed(() => {
  return formData.value.name && 
         formData.value.category && 
         formData.value.price > 0 && 
         formData.value.quantity >= 0 &&
         Object.keys(errors.value).length === 0
})

// Methods
function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }
    
    selectedFile.value = file
  }
}

async function uploadImage() {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    const result = await uploadProductImages([selectedFile.value])
    
    if (result.success && result.data.length > 0) {
      formData.value.image_url = result.data[0]
      selectedFile.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      toast.success('Image uploaded successfully')
    } else {
      throw new Error(!result.success ? result.error : 'Upload failed')
    }
  } catch (error) {
    console.error('Image upload error:', error)
    toast.error('Failed to upload image')
  } finally {
    uploading.value = false
  }
}

function removeImage() {
  formData.value.image_url = ''
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

function selectCategory(category: string) {
  formData.value.category = category
  showCategorySuggestions.value = false
}

function hideCategorySuggestions() {
  setTimeout(() => {
    showCategorySuggestions.value = false
  }, 200) // Delay to allow click on suggestion
}

async function handleSubmit() {
  // Validate form
  try {
    productSchema.parse(formData.value)
    errors.value = {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0] as string
        errors.value[field] = err.message
      })
      return
    }
  }

  // Submit form
  try {
    if (props.product) {
      // Update existing product
      await productsStore.updateProduct(props.product.id, {
        name: formData.value.name,
        description: formData.value.description || null,
        category: formData.value.category,
        price: formData.value.price,
        quantity: formData.value.quantity,
        is_featured: formData.value.is_featured,
        is_active: formData.value.is_active,
        image_url: formData.value.image_url || null
      })
    } else {
      // Create new product
      await productsStore.createProduct({
        name: formData.value.name,
        description: formData.value.description || null,
        category: formData.value.category,
        price: formData.value.price,
        quantity: formData.value.quantity,
        is_featured: formData.value.is_featured,
        is_active: formData.value.is_active,
        image_url: formData.value.image_url || null
      })
    }

    emit('success')
  } catch (error) {
    console.error('Form submission error:', error)
    toast.error(props.product ? 'Failed to update product' : 'Failed to create product')
  }
}

// Initialize form with product data if editing
onMounted(() => {
  if (props.product) {
    formData.value = {
      name: props.product.name,
      description: props.product.description || '',
      category: props.product.category,
      price: props.product.price,
      quantity: props.product.quantity,
      is_featured: props.product.is_featured,
      is_active: props.product.is_active,
      image_url: props.product.image_url || ''
    }
  }
})
</script>